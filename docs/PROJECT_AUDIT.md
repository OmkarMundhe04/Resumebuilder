# Comprehensive Project Audit & Target Architecture

**Project:** ResumeBuilder → **Career Document Platform**  
**Repository:** `https://github.com/OmkarMundhe04/Resumebuilder`  
**Audit Date:** August 2026  
**Auditor:** Principal Full-Stack & Systems Architect  

---

## 1. Executive Summary

The existing repository is a prototype-level MERN application intended as a basic resume builder with simple forms, local/session authentication, and unstyled or basic CSS templates. While the initial repository established the foundational concept of a React frontend and Express/MongoDB backend, it lacks the architectural robustness, security rigor, data integrity, ATS document engineering, accessibility (WCAG 2.2 AA), and evidence-based AI capabilities required of a world-class SaaS Career Document Platform.

This document establishes the audit baseline, analyzes structural and functional problems, outlines the remediation plan, and details the target production architecture.

---

## 2. Current State Inventory

### 2.1 Directory Structure & File Organization
```
Resumebuilder/
├── .env                              # Root env (deprecated/redundant)
├── assets/                           # Legacy static assets from static template
├── backend/
│   ├── .env                          # Backend env configuration
│   ├── middleware/auth.js            # JWT header extraction middleware
│   ├── models/User.js                # Minimal user schema (name, username, email, password)
│   ├── models/Resume.js              # Minimal single-document resume schema
│   ├── routes/auth.js                # Auth routes (/register, /login)
│   ├── routes/resume.js              # Resume routes (/save, /my)
│   ├── package.json                  # Express backend dependencies
│   └── server.js                     # Express app setup and MongoDB connection
├── index.html                        # Legacy static home page (Vanilla JS remnant)
├── resume.html                       # Legacy static resume page (Vanilla JS remnant)
├── resume-builder-frontend/
│   ├── package.json                  # CRA React 18 frontend
│   ├── public/index.html             # CRA HTML template
│   └── src/
│       ├── App.js                    # State-based page switcher (Home, Login, Register, ResumeBuilder)
│       ├── index.js                  # React DOM root and AOS initialization
│       ├── components/
│       │   ├── SaveResume.js         # Hardcoded mock resume payload poster
│       │   └── ResumeBuilder/        # Disconnected template prototypes with CSS leaks
│       └── pages/
│           ├── Home.js               # Landing page with static marketing copy
│           ├── Login.js              # Basic login form with alert() popups
│           ├── Register.js           # Basic registration form
│           └── ResumeBuilder.js      # Monolithic form with basic preview
└── src/                              # Root empty dummy files (App.js, api.js, index.js)
```

---

## 3. Detailed Technical Problems & Vulnerability Analysis

### 3.1 Architectural & Structural Flaws
1. **Multi-Root Confusion:** Static HTML files (`index.html`, `resume.html`), root `src/` (empty 0-byte files), and `resume-builder-frontend/` create architectural fragmentation.
2. **State-Based Navigation:** `App.js` manages routing via `useState("login")` rather than a standard client router or semantic routing system. Browser back/forward navigation, deep linking, and bookmarking are broken.
3. **Template CSS Pollution:** `ResumeBuilder.js` dynamically imports CSS files (`Classic.css`, `Modern.css`, `Minimal.css`) at runtime into `<head>`. In Webpack/browser environments, injected styles are never removed when switching templates, resulting in severe cascading style contamination.
4. **Mocked / Disconnected Components:** `SaveResume.js` hardcodes a dummy payload for "John Doe", bypassing user-entered data. `ResumeTemplateClassic.js` has its own isolated form state completely detached from `ResumeBuilder.js`.

### 3.2 Security & Data Integrity Vulnerabilities
1. **Lack of Rate Limiting & DoS Protection:** No rate limiting on `/api/auth/login`, `/api/auth/register`, or resume endpoints, making the backend vulnerable to brute-force credential stuffing.
2. **Missing HTTP Security Headers:** No Helmet integration; missing CSP, HSTS, X-Frame-Options, and X-Content-Type-Options.
3. **Insecure Direct Object Reference (IDOR) Risks:** `/api/resume/my` only retrieves all user resumes, but no granular CRUD endpoints (`GET /:id`, `PUT /:id`, `DELETE /:id`) exist with strict ownership validation.
4. **Session / JWT Hybrid Confusion:** `server.js` initializes `express-session` with a memory store and a default fallback secret while authentication simultaneously uses bearer JWTs in headers.
5. **No Input Sanitization or Schema Validation:** Requests are directly unpacked (`req.body`) without schema validation (e.g. Zod or Joi) or HTML/XSS sanitization.
6. **Plain Text Error Leaks:** Server errors catch blocks leak stack traces and raw error messages (`error.message`) in JSON responses.

### 3.3 Database & Data Model Deficiencies
1. **Flat, Non-Versioned Resume Schema:** `Resume.js` only stores basic fields without support for resume versioning, tailoring histories, job targets, or custom section order.
2. **Missing Career Profile (Source of Truth):** No model exists for the master Career Profile with provenance/truth tracking (`VERIFIED`, `SUGGESTED`, `IMPORTED`, `UNSUPPORTED`).
3. **Missing Critical Entities:** No models for Job Matching, Applications (Kanban tracking), Cover Letters, Share Links (cryptographic tokens), or Truth Ledger audits.
4. **Deprecated MongoDB Driver Flags:** `server.js` passes deprecated `useNewUrlParser: true` and `useUnifiedTopology: true` causing console warnings on Node v22.

### 3.4 ATS, Document Engineering & Export Limitations
1. **No Real Document Generation:** The current export relies solely on `window.print()`, which cannot produce structured PDF binaries with selectable text, correct reading orders, metadata, or standalone DOCX files.
2. **Zero ATS Compatibility Checks:** No validation for machine parsing, section header recognition, contact info extraction, or formatting risk detection.
3. **No Parser Preview:** Users cannot inspect the raw text stream that an ATS machine parser actually receives.

### 3.5 Accessibility & UI/UX Deficiencies
1. **WCAG Violations:** Missing semantic ARIA attributes, missing skip navigation links, inaccessible alert popups (`alert()`), improper form label associations, and focus traps.
2. **Missing Dark Mode Design System:** Dark mode is a naive global background toggle without a tokenized color palette or print-safe style isolation.
3. **Lack of Responsive Reflow:** Layout breaks on small mobile viewports (<375px) due to rigid CSS grid/flex declarations.

---

## 4. Target Architecture & Modernization Plan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CAREER DOCUMENT PLATFORM ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────────┘

                  ┌─────────────────────────────────────────┐
                  │          React 18 Modern SPA            │
                  │   - Design System Tokens (Light/Dark)   │
                  │   - Semantic Accessible Navigation      │
                  │   - Split-Pane Live Resume Engine       │
                  │   - ATS Parser Preview & Quality Radar  │
                  │   - Truth Ledger & Evidence Inspector   │
                  │   - Client-Side PDF/DOCX/TXT Generators │
                  └────────────────────┬────────────────────┘
                                       │ REST / JSON (JWT Authenticated)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Express.js Secure REST API        │
                  │   - Helmet, CORS, Rate Limiters         │
                  │   - Centralized Error Handling & Logs   │
                  │   - Input Validation & Sanitization     │
                  │   - Strict User Ownership Middleware    │
                  │   - Cryptographic Share Token Engine    │
                  │   - Evidence-Based AI Assistant Rules   │
                  └────────────────────┬────────────────────┘
                                       │ Mongoose ODM
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │             MongoDB Engine              │
                  │   - Users & Account Security            │
                  │   - CareerProfile (Source of Truth)     │
                  │   - Resumes & Version Histories         │
                  │   - Applications Tracker & Metrics      │
                  │   - Cover Letters & Job Matches         │
                  │   - Truth Ledger Evidence Links         │
                  │   - Share Links with Expiration         │
                  └─────────────────────────────────────────┘
```

### 4.1 Key Subsystems to Implement

1. **Design System & Accessible Shell:**
   - Universal CSS variables (surfaces, typography, accents, semantic feedback, borders, elevations).
   - Responsive Navigation (Desktop sidebar/header, Mobile drawer/bottom bar).
   - Light/Dark mode with automatic print-media override (ensures printed resumes are always clean dark-on-white).

2. **Career Profile (Master Truth Record):**
   - Personal info, verified work experiences with granular bullet evidence, education, projects, categorized skills (technical, tools, soft skills, languages), certifications, awards, volunteer work, publications.
   - Status indicators per item: `VERIFIED`, `IMPORTED`, `SUGGESTED`, `UNSUPPORTED`.

3. **Multi-Template Resume Engine:**
   - 8 ATS-Compliant Templates:
     1. ATS Classic (Default, single column, maximum parser reliability)
     2. Modern Professional (Subtle header accents, structured two-column layout)
     3. Technical (Skill-dense, project-focused hierarchy)
     4. Student / Graduate (Education & coursework-forward)
     5. Executive (Leadership summary, scope & impact metrics)
     6. Academic (CV format, publications & research emphasis)
     7. Minimal (Typography-first, clean whitespace)
     8. Creative (Contemporary typography, portfolio showcase)
   - Scoped template rendering avoiding CSS head pollution.
   - Reordering via Up/Down controls and drag-and-drop.
   - Undo/Redo history stack and debounced autosave.

4. **ATS Diagnostic Engine & Parser Preview:**
   - Multi-metric Quality Radar:
     - Parser Confidence (0-100%)
     - Job Relevance (0-100%)
     - Evidence Quality (0-100%)
     - Human Readability (0-100%)
     - Formatting Safety (0-100%)
     - Accessibility Score (0-100%)
   - Parser Text Extraction viewer showing visual vs raw machine-read text stream.
   - Contextual diagnostic advice explaining *why* an issue matters.

5. **Truth Ledger & AI Assistant:**
   - Evidence verification modal for every bullet point.
   - AI bullet assistant with 4 styles: Concise, Achievement-Focused, Technical, Professional.
   - Responsible AI constraints: No hallucinated metrics, no fabricated employers or credentials, prompt injection protection.

6. **Job Match & Tailoring System:**
   - Parse job descriptions to extract required skills, keywords, responsibilities.
   - Match against Career Profile: Confirmed Matches, Missing Skills, Unsupported Terms.
   - 1-click tailored resume version generation without fact mutation.

7. **Application Tracker (Kanban / Table):**
   - Track applications across stages: Saved, Applied, Assessment, Interview, Offer, Rejected, Withdrawn.
   - Link resumes, cover letters, notes, interview dates, and response rate analytics.

8. **Cover Letter Builder:**
   - Generate tailored cover letters using verified experience and target job context.
   - Tone, length, and formality controls.

9. **Export & Validation Suite:**
   - Pre-flight Export Validator (checks for overflow, missing fields, broken links).
   - High-fidelity PDF generation with selectable text.
   - Native DOCX document generation.
   - Clean Plain Text (.txt) export.
   - Formatted Print output.

10. **Privacy, Security & Shareable Resumes:**
    - Privacy dashboard: full JSON data export, account deletion, share link revocation, zero AI training guarantee.
    - Tokenized public share links with optional password and contact info redaction.
    - Strict cross-user isolation and ownership checks on every API endpoint.

---

## 5. Implementation Roadmap

- [x] Phase 1: Audit & Baseline Analysis
- [ ] Phase 2: Backend Architecture Modernization (Security, Models, Controllers, Validation, Tests)
- [ ] Phase 3: Frontend Design System, Shell & State Architecture
- [ ] Phase 4: Career Profile, Truth Ledger & Resume Builder Engine
- [ ] Phase 5: 8 ATS Templates, ATS Engine & Parser Preview
- [ ] Phase 6: Job Match, Cover Letter & Application Tracker
- [ ] Phase 7: Document Export System (PDF, DOCX, TXT, Print) & Pre-Flight Validator
- [ ] Phase 8: Learning Center, Privacy Center, Settings & Dark Mode
- [ ] Phase 9: Comprehensive Automated Test Suite (Unit, Integration, Security, Boundaries)
- [ ] Phase 10: Full End-to-End Verification & Production Readiness Audit
