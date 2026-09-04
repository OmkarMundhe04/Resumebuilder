# ResumeBuilder — Truth-First Career Document Platform

> A production-grade, ATS-optimized Career Document SaaS platform built with React 18, Node.js, Express, and MongoDB.

---

## 🌟 Core Architecture & Key Pillars

1. **Canonical Document Engine**:
   - Single structured source of truth (`CareerProfile`) compiling into the canonical `Resume` model.
   - 100% data consistency across visual previews, ATS plain-text parsing, native Microsoft Word (`.docx`), PDF (`.pdf`), and plain-text (`.txt`) exports.
2. **Signature Truth Ledger & Provenance**:
   - Every bullet statement maps to verified facts (Role, Action, Tools, Measurable Outcome, Metric).
   - Provenance badges: `VERIFIED`, `IMPORTED`, `SUGGESTED`, `UNSUPPORTED`.
3. **Multi-Metric ATS Health Engine**:
   - 7 independent diagnostic categories: *Parser Safety, Job Alignment, Evidence Strength, Human Readability, WCAG Accessibility, Profile Completeness, Formatting Safety*.
   - Includes **One-Click Safe Repairs** to normalize punctuation and dates with before/after diff preview.
4. **8 Field-Tested ATS Templates**:
   - `ATS Classic`, `Modern Professional`, `Technical Arsenal`, `Student & Academic`, `Executive Leadership`, `Academic CV`, `Minimalist Clean`, `Creative Designer`.
   - Rendered using isolated scoped styles — eliminating runtime `<head>` style pollution.
5. **Untrusted Job Match & Gap Analysis**:
   - Paste job descriptions as raw data to extract confirmed skill matches, missing keywords, and 1-click tailored resume generation.
6. **Career Ecosystem**:
   - Grounded Cover Letter Builder, Applications Pipeline (Kanban), Responsive Career Portfolio, Tokenized Share Links with Password Protection, and GDPR Data Export / Erasure.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js `v18.0.0+` (Tested on Node `v22.14.0`)
- MongoDB `v6.0+` running locally or MongoDB Atlas URI

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
The backend starts on `http://localhost:5000` with health check at `http://localhost:5000/api/health`.

### 2. Frontend Setup
```bash
cd resume-builder-frontend
npm install
npm start
```
The React frontend starts on `http://localhost:3000`.

---

## 🧪 Automated Testing

### Backend Integration & Isolation Tests
```bash
cd backend
node tests/api.test.js
```
Runs 13 end-to-end integration assertions covering Health, Auth, Isolation, Career Profile, Canonical Resumes, ATS scoring, Job Match, Evidence Coach, Share Tokens, and GDPR export.

---

## 🔒 Security & Privacy Commitments
- **Zero Training**: Candidate resume data is never used for public model training.
- **Zero Data Selling**: Data is owned 100% by the candidate.
- **Multi-Tier Rate Limiting**: Dedicated rate limiters for auth, AI endpoints, public token viewers, and general API.
- **Cryptographic Share Tokens**: Tokenized URLs with configurable expiration, contact masking, and password authentication.

---

## 📄 License
MIT License. Built for world-class career document creation.
