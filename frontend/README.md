# BloodBridge — React Frontend Application

Production-oriented, responsive React frontend for **BloodBridge**, a blood donation and request management system connecting voluntary donors, patients in need, and verified hospital blood banks.

Built with **React**, **Vite**, **React Router v6**, **TanStack Query v5**, **React Hook Form**, **Zod**, **Axios**, and **Tailwind CSS**.

---

## 1. Architecture & Design Principles

- **Pure JavaScript & JSX:** Strictly zero TypeScript files.
- **Contract-First Integration:** 100% compliant with the backend API contract (`/api/auth/**`, `/api/donors/**`, `/api/patients/**`, `/api/blood-requests/**`, `/api/inventory/**`, `/api/admin/**`, `/api/notifications/**`).
- **Zero Mock / Fake Data:** Direct API integration with optimistic cache invalidations via TanStack Query.
- **Role-Based Workspaces:**
  - `DONOR`: Personal profile, availability switch, and verification badge.
  - `PATIENT`: Blood request submissions, hospital inventory lookup, and request tracking/cancellation.
  - `HOSPITAL`: Live stock management across 8 blood groups (verified-gated), assigned requests lifecycle handling, and regional open requests acceptance.
  - `ADMIN`: Verification and rejection review of blood donors and hospital facilities, plus hospital account provisioning.
- **Deterministic State Transitions:** Strict client-side and server-side compliance with legal blood request state transitions:
  - `PENDING` ➔ `APPROVED` | `REJECTED` | `CANCELLED`
  - `APPROVED` ➔ `FULFILLED` | `CANCELLED`
  - Terminal states: `FULFILLED`, `REJECTED`, `CANCELLED` cannot transition further.
- **Healthcare Design System:** Crimson (`#dc2626` / `#991b1b`), Clean White, Charcoal Slate, accessible contrast, custom modal dialogues, toast notifications, skeleton loaders, and form field validation.

---

## 2. Directory Structure

```
frontend/
├── src/
│   ├── api/             # Axios instance with Bearer interceptor & API service modules
│   │   ├── client.js
│   │   ├── auth.api.js
│   │   ├── donor.api.js
│   │   ├── patient.api.js
│   │   ├── hospital.api.js
│   │   ├── bloodRequest.api.js
│   │   ├── inventory.api.js
│   │   ├── admin.api.js
│   │   └── notification.api.js
│   ├── app/             # Application entrypoint & React Router definitions
│   │   ├── App.jsx
│   │   └── router.jsx
│   ├── components/      # Design system primitives & layouts
│   │   ├── common/      # Button, Badge, Card, Modal, ConfirmDialog, Pagination, EmptyState, ProtectedRoute
│   │   ├── feedback/    # ErrorMessage, Skeleton
│   │   ├── forms/       # Input, Select, Textarea, FormField
│   │   └── layout/      # Navbar, Sidebar, DashboardLayout, Footer
│   ├── context/         # AuthContext (session restoration & 401 listener), ToastContext
│   ├── lib/             # Constants, blood group mappings, formatters, and Zod validation schemas
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validation.js
│   ├── pages/           # Public & Role-protected views
│   │   ├── auth/        # LoginPage, RegisterPage
│   │   ├── public/      # LandingPage, AboutPage, HowItWorksPage, NotFoundPage, UnauthorizedPage
│   │   ├── donor/       # DonorDashboardPage
│   │   ├── patient/     # PatientRequestsPage, CreateRequestPage, PatientProfilePage, InventorySearchPage
│   │   ├── hospital/    # HospitalInventoryPage, HospitalRequestsPage, OpenRequestsPage, HospitalProfilePage
│   │   ├── admin/       # AdminDonorsPage, AdminHospitalsPage, CreateHospitalPage
│   │   └── notifications/# NotificationsPage
│   ├── test/            # Vitest unit & component test suites
│   └── styles/          # Tailwind base directives
├── vercel.json          # Vercel SPA rewrite rule configuration
├── vite.config.js       # Vite build & test configuration
├── tailwind.config.js   # Crimson/Charcoal brand color scheme
└── package.json
```

---

## 3. Environment Variables

Create `.env` inside the `frontend/` directory (or use `.env.example` as a template):

```bash
# Backend Base API URL (Never hardcode in production builds)
VITE_API_URL=http://localhost:8080
```

*Note: In production on Vercel or Railway, point `VITE_API_URL` to your live Spring Boot backend domain (e.g. `https://bloodbridge-backend.up.railway.app`).*

---

## 4. Getting Started Locally

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### Run Automated Tests
```bash
npm test -- --run
```

### Production Build
```bash
npm run build
```
Generates a minified, tree-shaken static production bundle in `dist/`.

### Preview Production Build
```bash
npm run preview
```

---

## 5. Deployment Guide (Vercel)

The repository includes `vercel.json` configured with SPA fallback rewrites:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

1. Import your frontend repository root or `frontend` directory in the [Vercel Dashboard](https://vercel.com).
2. Configure **Root Directory**: `frontend` (if deploying from monorepo).
3. Set Environment Variable:
   - `VITE_API_URL`: `https://<YOUR_SPRING_BOOT_RAILWAY_URL>`
4. Deploy. All routes (`/patient`, `/donor`, `/hospital`, `/admin`, etc.) will route properly without 404s on reload.
