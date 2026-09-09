# Implementation Plan

## 1. Current Project State
- Existing code: None yet — greenfield project.
- Reusable parts: N/A.
- Missing foundations: Everything — auth, database, hosting, and the WhatsApp reminder flow need setup from scratch. No payment gateway integration is needed for v1.
- Risks: None outside your control block Phase 0 anymore now that the payment gateway is deferred to v2 — this makes the early timeline lower-risk.

## 2. Build Principles
- Preserve approved scope (PRD Section 5) — resist the urge to add attendance, multi-role, payment-gateway, or recurring-automation features before the core v1 loop (add student → remind → mark paid) works end to end.
- Work in small, verifiable phases — each phase should produce something demoable.
- Test after every phase, especially tenant isolation (the highest-risk area per the TRD).
- Do not begin a later phase while a required check in an earlier phase still fails.

## 3. Ordered Phases

### Phase 0: Project Foundation
- Goal: Get infrastructure in place before writing feature code.
- Requirements covered: Enables everything downstream (TRD Sections 2, 4).
- Components/systems involved: Local project scaffolding (frontend + backend), local SQLite database file.
- Files expected to change: Project scaffolding, environment config files (`.env` — never commit real secrets), initial SQLite schema/migration file.
- Data/API work: Create the local SQLite database file and run the initial migration (per Backend Schema Section 1).
- UI states: N/A.
- Tests/verification: Confirm a "hello world" runs locally end to end (frontend reachable, backend reachable, database file created and connected).
- Completion criteria: Local project runs, SQLite database is connected — no external account signups required.
- Dependencies: None.
- Risks: None significant — v1 has zero external account dependencies (no cloud database, no payment gateway) that could block this phase.

### Phase 1: Auth & Tenant Foundation
- Goal: Admin can sign up, creating a tenant, and log in.
- Requirements covered: PRD "Multi-Tenant Institute Isolation"; Backend Schema `tenants`/`admins` tables.
- Components/systems involved: Sign Up screen, Sign In screen (App Flow Section 4), auth provider integration.
- Files expected to change: Auth routes/pages, `tenants`/`admins` migrations.
- Data/API work: Create `tenants` and `admins` tables; wire signup to create both records together.
- UI states: Loading, error (validation), success (per App Flow Sign Up/Sign In screens).
- Tests/verification: Manually create two separate accounts, confirm each gets its own `tenant_id` and cannot see the other's (data will be empty at this stage, but the isolation mechanism must exist).
- Completion criteria: Can sign up, log in, log out; every authenticated request resolves a correct `tenant_id` server-side.
- Dependencies: Phase 0.
- Risks: Getting tenant scoping wrong here compounds into every later phase — worth extra care and a dedicated test before moving on.

### Phase 2: Student & Fee Management
- Goal: Admin can add, edit, and view students with fee details.
- Requirements covered: PRD "Student & Fee Management"; Backend Schema `students`/`fees` tables.
- Components/systems involved: Add/Edit Student screen, Student Detail screen (App Flow Section 4).
- Files expected to change: Student CRUD routes/forms, `students`/`fees` migrations.
- Data/API work: Create `students` and `fees` tables; implement create/read/update/delete scoped to `tenant_id`.
- UI states: Empty, loading, validation error (especially invalid phone number), success.
- Tests/verification: Add a student, confirm it appears only for the correct tenant's admin; edit and delete flows work.
- Completion criteria: Full CRUD for students/fees works and is tenant-isolated.
- Dependencies: Phase 1.
- Risks: Phone number validation must be strict here since the reminder flow (Phase 4) depends entirely on having a usable number.

### Phase 3: Dues Dashboard
- Goal: Admin sees a sorted list of pending/overdue students.
- Requirements covered: PRD "Dues Dashboard".
- Components/systems involved: Dashboard screen (App Flow Section 4).
- Files expected to change: Dashboard page/component, query for dues sorted by urgency.
- Data/API work: Query joining `fees` + `students`, filtered to `pending`/`overdue`, sorted by `due_date`.
- UI states: Empty ("no students yet"), loading (skeleton), error (cached fallback), populated.
- Tests/verification: Verify sort order is correct with a mix of overdue/due-soon/paid sample data (use seed data from Backend Schema Section 9).
- Completion criteria: Dashboard accurately reflects current due status for the logged-in tenant only.
- Dependencies: Phase 2.
- Risks: None significant — mostly a read-only view at this stage.

### Phase 4: WhatsApp Reminder Flow (v1 — static payment info, no gateway)
- Goal: Admin can trigger a one-tap WhatsApp reminder containing the amount due and the institute's payment details.
- Requirements covered: PRD "WhatsApp Reminder Sending"; Backend Schema `reminders` table.
- Components/systems involved: "Remind" action + confirmation sheet (App Flow Section 4), `reminders` table, a simple institute-settings field for a static UPI ID/QR or bank info.
- Files expected to change: Reminder action component/logic, `reminders` migration, institute settings field on `tenants`.
- Data/API work: Build wa.me URL from student phone, amount, due date, and institute's stored payment info; log a `reminders` row on send.
- UI states: Confirmation sheet, blocked state (invalid phone or missing payment info), success (WhatsApp opens).
- Tests/verification: Confirm the generated wa.me link opens WhatsApp with correct pre-filled text, on an actual Android device.
- Completion criteria: End-to-end reminder flow works from Dashboard and Student Detail — this is your first fully demoable core loop.
- Dependencies: Phase 3.
- Risks: wa.me formatting/encoding issues (special characters, phone number format) — test with real Indian phone number formats specifically.

### Phase 5: Manual "Mark as Paid"
- Goal: Admin can record that a fee has been paid, without a payment gateway.
- Requirements covered: PRD "Manual Payment Marking".
- Components/systems involved: "Mark as Paid" action on Dashboard card / Student Detail.
- Files expected to change: Status-update endpoint on `fees`.
- Data/API work: Update `fees.status` to `paid` on admin action; allow reverting if marked by mistake.
- UI states: Confirmation before marking, success toast, easy undo.
- Tests/verification: Mark a fee paid, confirm it disappears from the overdue dashboard view and reflects in Student Detail history.
- Completion criteria: Full v1 loop works end to end — add student, get reminded, send WhatsApp reminder, mark paid once received.
- Dependencies: Phase 2.
- Risks: None significant — this is the simplest phase in the plan, by design.

### Phase 6 (v2 — later, not required for YIIC submission): Payment Gateway & Auto-Status-Update
- Goal: Replace static payment info with a dynamic, trackable UPI link; replace manual marking with automatic webhook-driven status updates.
- Requirements covered: PRD's deferred "UPI Payment Link Generation" and "Payment Status Tracking" features.
- Status: Not part of the 5-week build. Revisit after the pilot institute has used the v1 reminder loop and you have real feedback on whether automatic payment tracking is worth the added complexity before your next milestone.

### Phase 7: Error States, Responsive & Accessibility Pass
- Goal: Harden the app for real-world conditions — the actual target environment (cheap Android, spotty network, non-technical users).
- Requirements covered: PRD Non-Functional Requirements; UI/UX Brief Sections 7–8.
- Components/systems involved: All screens.
- Files expected to change: Shared components (loading/error/empty states), responsive CSS pass.
- Data/API work: None new — hardening existing flows.
- UI states: Confirm every screen's loading/empty/error states from the App Flow are actually implemented, not just designed.
- Tests/verification: Manual test on a real low-end Android device with throttled network; check tap-target sizes and contrast.
- Completion criteria: App remains usable under simulated poor network conditions; no dead-end error states.
- Dependencies: Phases 1–5, 7 (Phase 6 is deferred v2 work and not required to reach this phase).
- Risks: Easy to skip under deadline pressure — but this is core to the product's actual value proposition (per App Brief target market realities), so don't cut it.

### Phase 8: Pilot Deployment Readiness
- Goal: Ready for real use at the pilot coaching center and for YIIC submission.
- Requirements covered: PRD Success Criteria.
- Components/systems involved: Deployment to free-tier hosting (Vercel + Render/Railway) — only needed once you're ready to demo beyond your own machine.
- Files expected to change: Environment configuration for the hosted deployment.
- Data/API work: Final data migration to the hosted database; remove/replace seed/demo data.
- UI states: N/A.
- Tests/verification: Full manual walkthrough of the primary user journey (App Flow Section 5) in the hosted environment.
- Completion criteria: A real admin at the pilot institute can complete the full journey unaided.
- Dependencies: All previous required phases (0–5, 7).
- Risks: None significant — v1 involves no live payment credentials, so this deployment step carries no financial risk.

## 4. Suggested Sequence
Project foundation (0) → Auth/tenant (1) → Core data model: students/fees (2) → Primary journey: dashboard (3) → WhatsApp reminders (4) → manual mark-as-paid (5) → [v2, not required: payment gateway (6)] → error/responsive/accessibility pass (7) → deployment readiness (8).

## 5. Requirement Traceability
| PRD Feature | Phase | Verification |
|---|---|---|
| Multi-Tenant Institute Isolation | 1 | Two-account isolation test |
| Student & Fee Management | 2 | CRUD + tenant-scoping test |
| Dues Dashboard | 3 | Sort-order test with seed data |
| WhatsApp Reminder Sending | 4 | Real-device wa.me test |
| Manual Payment Marking | 5 | Mark-paid updates dashboard test |
| Non-functional (performance/accessibility) | 7 | Throttled-network + real-device manual test |
| Payment Gateway (v2, deferred) | 6 | Not required for YIIC submission |

## 6. Final Verification
- Functional checks: Full primary user journey (App Flow Section 5) completed manually, start to finish.
- Responsive checks: Verified on an actual budget Android device, not just browser dev tools.
- Accessibility checks: Tap targets, contrast, and text sizing verified against UI/UX Brief Section 8.
- Security checks: Confirm tenant isolation holds under direct testing (attempt cross-tenant access explicitly, expect denial); confirm auth secrets are never exposed client-side.
- Production build: Deployed and reachable on free-tier hosting once you're ready to demo beyond localhost — no live payment credentials involved in v1.

---

## Recommended First Phase
**Phase 0: Project Foundation.** With the payment gateway deferred to v2, there's no external account bottleneck to kick off first — you can start building locally right away. Wait for your review of this plan before starting implementation.
