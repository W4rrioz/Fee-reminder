# Technical Requirements Document

## 1. Technical Overview
- Architecture summary: Single web application (mobile-first responsive UI) with a server backend and a relational database, plus one external integration in v1 (WhatsApp click-to-chat). A payment gateway integration is deferred to v2. Multi-tenant via a shared database with a `tenant_id` on every table.
- Platforms: Web only (mobile browsers primary, desktop secondary).
- Main technical constraints: Near-zero budget, 5-week solo build, must work on low-end Android devices and unreliable networks, must be simple enough for a solo/student developer to maintain and for Antigravity to generate reliably.

## 2. Technology Stack
- Frontend: React (mobile-first responsive layout) — reason: large ecosystem, works well with AI code-generation tools, easy to keep lightweight. Rejected alternative: heavier frameworks (Next.js full SSR) — unnecessary complexity for a v1 with modest traffic.
- Backend: Node.js with Express (or a lightweight framework) — reason: same language as frontend (JS/TS throughout), simplest for a solo developer. Rejected alternative: Python/Django — no strong reason to introduce a second language for this scope.
- Database: SQLite (local file-based database) for development and offline execution; seamlessly portable to hosted Supabase/PostgreSQL for cloud deployment.
- Authentication: Simple email/password auth implemented directly against the database with secure password hashing and session tokens.
- File storage: Not required in v1 (dynamic client-side canvas QR generator eliminates external file storage).
- Hosting: Frontend and serverless API on Vercel (`https://feeremindersupabasedeploy.vercel.app/`). Node.js backend can also run locally or on Render/Railway.
- Analytics: Skip dedicated analytics tooling in v1; rely on basic server logging.
- Testing: Manual testing + automated tests for tenant-isolation logic specifically (the highest-risk area in v1).

## 3. System Architecture
- Client responsibilities: Render dashboard and forms, trigger wa.me links, display due/payment status, handle offline/slow-network gracefully (loading states, retries).
- Server responsibilities: Enforce tenant isolation on every request, manage student/fee CRUD, handle manual "mark as paid" status updates.
- Database responsibilities: Store tenants (including their static UPI ID/bank info), admins, students, fee records; enforce data integrity via foreign keys and constraints.
- External service responsibilities: WhatsApp (client-side wa.me link generation only, no server-side WhatsApp API in v1).

## 4. APIs and Integrations

### WhatsApp (wa.me click-to-chat)
- Purpose: Let admin send a pre-filled reminder message to a parent, containing the amount due and the institute's payment info.
- Data sent/received: Outbound only — a URL containing a phone number and pre-filled text; no API calls or data returned.
- Authentication method: None (public URL scheme).
- Rate/usage limits: None (client-triggered, not automated).
- Failure handling: If parent's number is missing/invalid, or institute payment info isn't set, block link generation client-side before opening WhatsApp.

### Payment Gateway — DEFERRED TO v2
- Not part of the v1 build. v1 uses a static UPI ID/bank info (entered once per institute in Settings, included in reminder messages) plus a manual "Mark as Paid" action — no gateway account, API key, or webhook needed to ship v1.
- When added in v2: Razorpay or Cashfree, generating a trackable UPI link per due amount and confirming payment via signed webhook, replacing manual marking with automatic status updates.

## 5. Security and Privacy
- Authentication and authorisation: Admins authenticate via email/password or magic link; every authenticated request is scoped to the admin's tenant_id server-side (never trust a client-supplied tenant ID).
- Input validation: Validate phone numbers, amounts, and dates server-side before persisting.
- Secrets management: Auth provider keys and database credentials stored as server-side environment variables, never shipped to the client. (No payment gateway secrets in v1.)
- Sensitive data handling: Student names, parent phone numbers, and fee amounts treated as sensitive; access restricted to the owning tenant's authenticated admin only.
- Abuse prevention: Basic rate-limiting on login endpoints to prevent abuse.

## 6. Performance Requirements
- Expected usage: Single pilot institute initially — dozens to low hundreds of student records, low request volume.
- Loading targets: Dashboard should render usable content within a few seconds on a throttled 3G-equivalent connection.
- Caching approach: Client-side caching of last-loaded dues list so the dashboard isn't blank on a dropped connection; simple in-memory or CDN caching for static assets.
- Media optimisation: Minimal — v1 has no significant images/media beyond basic UI icons.

## 7. Testing and Quality
- Unit tests: Cover due-status calculation logic (pending/overdue/paid).
- Integration tests: Cover tenant-isolation checks (an admin from Tenant A cannot fetch Tenant B's data) and the mark-as-paid status update.
- End-to-end tests: Manual pass through the core user journey (add student → send reminder → mark paid) before each milestone demo.
- Accessibility checks: Manual check of tap-target sizes, contrast, and readability on an actual low-end Android device.

## 8. Development and Deployment
- Environments: Dual-mode development: runs locally with `start.bat` (Express + SQLite) and deployed to production on Vercel with Serverless API functions for the AI Genesis Challenge submission.
- Environment variables: `GEMINI_API_KEY`, Supabase credentials, and JWT secrets held securely on the server-side, never exposed to client browsers.
- CI checks: Vite build verification, automated browser subagent tests, and linting.
- Deployment approach: Hosted frontend and serverless API functions on Vercel, Supabase PostgreSQL, and GitHub CI.

## 9. Technical Risks and Open Questions
- Risk: wa.me links are user-initiated via click-to-chat (admin taps "send" in WhatsApp) — highly effective because it avoids costly WhatsApp Business API fees and builds trust through direct teacher-parent communication.
- Risk: Without a payment gateway confirming payment, "Mark as Paid" relies on admin verification of incoming bank/UPI notifications — zero gateway commission is achieved at the expense of manual 1-tap confirmation.
- Open question: Row-level security vs application-layer tenant checks — multi-tenant isolation enforced both in application logic and database schemas.

<!-- EduManage Bharat · AI Genesis Challenge -->
