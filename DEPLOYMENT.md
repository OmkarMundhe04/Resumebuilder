# Production Deployment & Infrastructure Guide

## 1. Architectural Overview

The **ResumeBuilder Career Document Platform** is architected as a high-performance, stateless tiered application:

```
┌────────────────────────────────────────────────────────┐
│               Global CDN / Nginx Proxy                 │
│          SSL / TLS 1.3 Termination, Gzip / Brotli       │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
   ┌───────────────────┐       ┌───────────────────┐
   │ React 18 Frontend │       │ Express.js API    │
   │ Static SPA Bundle │       │ Node v18+ Cluster │
   │ (Vercel / Nginx)  │       │ Rate Limited, JWT │
   └───────────────────┘       └─────────┬─────────┘
                                         │
                               ┌─────────┴─────────┐
                               ▼                   ▼
                     ┌───────────────────┐ ┌───────────────┐
                     │ MongoDB Replica   │ │ AI Fallback   │
                     │ Encrypted at Rest │ │ Deterministic │
                     └───────────────────┘ └───────────────┘
```

---

## 2. Environment Variables Specification

### Backend (`backend/.env`)

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP Port for Express Server | `5000` | No |
| `NODE_ENV` | Runtime Environment | `production` | **Yes** |
| `MONGO_URI` | MongoDB Connection String (with TLS/Replica) | `mongodb+srv://user:pass@cluster.mongodb.net/resumebuilder?retryWrites=true&w=majority` | **Yes** |
| `JWT_SECRET` | 256-bit Cryptographic Signing Key | `crypto.randomBytes(32).toString('hex')` | **Yes** |
| `JWT_EXPIRES_IN` | Token Validity Duration | `7d` | No |
| `CORS_ORIGIN` | Allowed Frontend Domain(s) | `https://resumebuilder.yourdomain.com` | **Yes** |
| `AI_PROVIDER` | AI Enhancement Engine | `local` (or `gemini` / `openai`) | No |
| `AI_API_KEY` | Optional AI Provider API Key | `AIzaSy...` | No (Falls back to deterministic) |

### Frontend (`resume-builder-frontend/.env.production`)

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `REACT_APP_API_URL` | Base API Endpoint URL | `https://api.yourdomain.com/api` | **Yes** |

---

## 3. Production Security Checklist

- [x] **Strict HTTP Security Headers**: Configured via `helmet` (CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff).
- [x] **Multi-Tier Rate Limiting**: Separate buckets for Auth (`authLimiter`: 10 req/15m), AI (`aiLimiter`: 20 req/m), Public Share (`publicShareLimiter`: 30 req/m), and General API (`generalLimiter`: 100 req/m).
- [x] **Safe Error Handler**: Stack traces and internal MongoDB schemas are never leaked to clients in production.
- [x] **No Session Memory Leaks**: Authentication is 100% stateless via cryptographically signed JWTs.
- [x] **Memory-Safe File Ingestion**: File uploads parsed entirely in memory with strict size limits (5MB) and MIME validation.
- [x] **Cryptographic Share Tokens**: Public share links use `crypto.randomBytes(24)` with optional BCrypt hashed passwords and time-based auto-expiration.

---

## 4. Docker Containerization Setup

### Multi-Stage Dockerfile for Frontend (`frontend.Dockerfile`)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Production Dockerfile for Backend (`backend.Dockerfile`)

```dockerfile
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
USER node
CMD ["node", "server.js"]
```

---

## 5. Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name resumebuilder.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name resumebuilder.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/resumebuilder.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/resumebuilder.yourdomain.com/privkey.pem;

    # Frontend SPA
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 6. Health Checks & Monitoring

- **Liveness Probe**: `GET /api/health` -> `200 OK` (`{ status: "healthy" }`)
- **Readiness Probe**: `GET /api/health/ready` -> `200 OK` (Verifies MongoDB database ping)
