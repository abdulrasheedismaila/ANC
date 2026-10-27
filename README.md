# AFNAAN Nurses & Caregiver

A modern, compassionate, and secure web application for **AFNAAN Nurses & Caregiver**, a professional home-care, elderly assistance, and nursing support provider in Lagos, Nigeria.

---

## 🏥 Brand Identity

- **Official Business Name**: AFNAAN Nurses & Caregiver
- **CEO & Founder**: IMRAN MUTOLIB ADEIZA
- **Location**: No 7 Old Ota Road, Orile Bus Stop, Orile Agege, Lagos, Nigeria.
- **Official Email**: [abooafnaan28@gmail.com](mailto:abooafnaan28@gmail.com)
- **WhatsApp Contact**: [+234 916 228 5884](https://wa.me/2349162285884)
- **Official Logo**: `https://i.ibb.co/rKN0fndw/20261023-174736.png`

---

## 🌟 Key Features

1. **Animated Hero Section**: Circular moving image orbital animation featuring professional African nurses and caregivers with reduced-motion accessibility support.
2. **All 6 Core Pages**:
   - **Home**: Hero, trust highlights strip, "Care That Feels Personal", featured service cards, 4-step process, Why Choose AFNAAN, CEO profile, impact preview, testimonials, and final CTA.
   - **What We Do**: Detailed descriptions of care arrangements, clinical vs non-clinical care notices, and FAQs.
   - **Request a Caregiver**: Multi-section validated care enquiry form with LGA selection in Lagos, timing, validation, and auto-generated tracking codes (e.g., `AFN-REQ-2026-XXXX`). Direct submission routes to WhatsApp (+234 916 228 5884).
   - **Our Impact**: Media gallery with category filtering, image upload, YouTube & Google Drive video embeds, lightbox modal, and video preview.
   - **Become a Caregiver**: Career recruitment application with CV file upload, role selection, and reference codes.
   - **Contact Us**: Official Lagos address, Google Maps directions link, pre-filled mailto button, direct WhatsApp link, and message submission form.
3. **Legal & Trust Pages**:
   - Privacy Policy (`/privacy`)
   - Terms of Service (`/terms`)
   - Accessibility Statement (`/accessibility`)
   - Custom 404 Page
4. **Floating Quick Contacts**: High-contrast, mobile-friendly WhatsApp and Email floating buttons.
5. **Secure Administrative Dashboard**:
   - Private entry via hash URL (`/#admin` or `/#/admin`).
   - Server-side `crypto.scryptSync` password hashing with per-user cryptographic salts.
   - Stateless HMAC-SHA256 session tokens compatible with multi-instance serverless deployments (Vercel).
   - Rate limiting (5 attempts lock-out).
   - Real-time database metrics (Care Requests, Pending Applications, Published Gallery, Unread Messages).
   - Care Request Manager with status updates, internal staff notes, and CSV export.
   - Caregiver Application Manager with secure CV download.
   - Media Gallery Manager with direct image upload, YouTube/Google Drive link embeds, category tagging, and Supabase cloud sync.
   - Services Content Editor & Website Settings Editor.
   - Audit trail recording all admin actions.

---

## ☁️ Vercel Deployment Configuration

This project is configured to run seamlessly on both long-running Node servers (Google AI Studio) and serverless environments (Vercel):

### 1. How Vercel Routes Work
- **`vercel.json`**: Configures rewrites so `/api/(.*)` routes to `/api/index.ts` (the Express Serverless Function), and `/(.*)` rewrites to `/index.html` (Vite SPA history fallback).
- **`api/index.ts`**: The Vercel serverless entrypoint that handles all `/api/*` endpoints without needing a long-running Node process.
- **Read-Only Filesystem Handling**: Automatically falls back to `/tmp` storage when deployed in serverless environments where root directories are read-only.
- **Stateless Session Tokens**: Uses cryptographic HMAC signatures with `SESSION_SECRET` so admin authentication works consistently across any serverless Lambda instance.

### 2. Required Environment Variables on Vercel
Set these in **Vercel Dashboard -> Project -> Settings -> Environment Variables**:

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `ADMIN_INITIAL_EMAIL` | Admin login identifier | `AFNAAN` |
| `ADMIN_INITIAL_PASSWORD` | Admin login password | `AFNAAN2027` |
| `SESSION_SECRET` | Secret key used to sign admin session tokens | `afnaan-cares-jwt-secure-session-secret-2026-key` |
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (or anon key) | `your_supabase_service_role_key` |
| `SUPABASE_ANON_KEY` | Supabase public anonymous key | `your_supabase_anon_key` |
| `VITE_WHATSAPP_LINK` | WhatsApp direct contact link | `https://wa.me/09162285884` |
| `WHATSAPP_NUMBER` | Contact phone / WhatsApp number | `09162285884` |

---

## 🔐 Admin Access

To access the administrative portal on your live website:
1. Open your browser and navigate to:
   ```
   https://your-domain.vercel.app/#admin
   ```
2. Log in using your admin credentials:
   - **Username / Email**: `AFNAAN` (or `admin@afnaancare.ng`)
   - **Password**: `AFNAAN2027` (or `AfnaanCare2026!Lagos`)
3. Once logged in, you can manage care requests, job applications, gallery media, services, and website settings. All changes synchronize to your connected Supabase database.
