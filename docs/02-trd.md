# Technical Requirements Document

## 1. Technical Overview
- Architecture summary: Single web application (mobile-first responsive UI) with a server backend and a relational database, plus one external integration in v1 (WhatsApp click-to-chat). A payment gateway integration is deferred to v2. Multi-tenant via a shared database with a `tenant_id` on every table.
- Platforms: Web only (mobile browsers primary, desktop secondary).
- Main technical constraints: Near-zero budget, 5-week solo build, must work on low-end Android devices and unreliable networks, must be simple enough for a solo/student developer to maintain and for Antigravity to generate reliably.

## 2. Technology Stack
- Frontend: React (mobile-first responsive layout) — reason: large ecosystem, works well with AI code-generation tools, easy to keep lightweight. Rejected alternative: heavier frameworks (Next.js full SSR) — unnecessary complexity for a v1 with modest traffic.
- Backend: Node.js with Express (or a lightweight framework) — reason: same language as frontend (JS/TS throughout), simplest for a solo developer. Rejected alternative: Python/Django — no strong reason to introduce a second language for this scope.
- Database: SQLite (local file-based database) for development and the YIIC build — reason: zero setup, no account/signup needed, no internet dependency, fully sufficient for a single-institute pilot demo. Rejected alternative: Supabase/Postgres — a fine choice for a real hosted deployment later, but adds account setup and network dependency that aren't needed to build and demo v1. Migration path: the schema (see Backend Schema) is designed to be portable to Postgres later with minimal changes, since SQLite and Postgres both speak standard SQL.
- Authentication: Simple email/password auth implemented directly against the SQLite database (e.g. using a lightweight library like `better-sqlite3` + `bcrypt` for password hashing, or a minimal auth package) — reason: no external auth provider account needed. Rejected alternative: Supabase Auth — good option later if migrating to a hosted Postgres setup, not needed for a local-only build.
- File storage: Not required in v1 (an optional QR-code image for UPI ID is the only possible exception, deferrable).
- Hosting: Frontend on Vercel/Netlify free tier; backend on Render/Railway free tier — used only once you're ready to demo beyond your own machine (local development is sufficient for most of the build). Rejected alternative: self-managed VPS — unnecessary ops overhead for this stage.
- Analytics: Skip dedicated analytics tooling in v1; rely on basic server logging.
- Testing: Manual testing + a small set of automated tests for tenant-isolation logic specifically (the highest-risk area in v1).

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
- Environments: Local development is sufficient for most of the build; a single hosted "demo" environment is added only when ready to show the pilot institute or for final YIIC submission (no separate staging needed at this scale).
- Environment variables: Path to the local SQLite database file, and a session/JWT signing secret for auth — all server-side only.
- CI checks: Lightweight — run tests on push if time allows; not a blocker for a 5-week solo timeline.
- Deployment approach (when needed): If moving beyond local use later, migrate the database to hosted Postgres (e.g. Supabase) and deploy frontend via Vercel/Netlify, backend via Render/Railway. Not required for the YIIC build itself.

## 9. Technical Risks and Open Questions
- Risk: wa.me links are not fully automated (admin must tap "send" manually) — acceptable for v1 given budget, but a known limitation worth stating clearly in the YIIC submission.
- Risk: Without a payment gateway confirming payment, "Mark as Paid" relies entirely on admin honesty/attentiveness — acceptable for a pilot with a trusted small institute, worth noting as a v1 limitation.
- Open question: Whether row-level security (database-enforced) or purely application-layer tenant checks are used — recommend using database-level constraints as a second line of defense in addition to application logic, given how costly a tenant-isolation bug would be.
