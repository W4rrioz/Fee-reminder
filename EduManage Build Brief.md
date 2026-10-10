# EduManage Build Brief
**Build brief for Antigravity v1.0**  
**EduManage — Fee, Attendance & Operations Platform**  
*A mobile-first management app for schools, coaching centers, and independent tutors across Tier-2/3 India — one adaptable core instead of three separate products.*

- **Prepared for:** Aman, Kanpur
- **Builder:** Antigravity (AI IDE)
- **Date:** 7 Oct 2026

---

## 01. Scope & Build Philosophy
This app serves three institute types — schools, coaching centers, and independent tutors — through one shared core (students, fees, attendance, communication) plus a single `institute_type` setting that adapts terminology and a few structural rules. It is not three separate products bundled together.

Build order matters more than scope. Build and wire up every module below, but bring them online in the phase order in Section 9 — Fees and Attendance first, fully working, before Exams/Results, Staff, and Communication layers. Do not let "all-in-one" become "everything half-working." A smaller set of modules that actually function on a ₹8,000 Android phone on a 2G connection is the real deliverable.

**Design constraints that override feature requests below if they conflict:**
- Mobile-first design.
- Accessible and dead-simple for non-technical users.
- Tolerates poor connectivity (queue-and-retry for anything sent over the network).
- Minimal taps to complete common actions (marking attendance, recording a payment).

---

## 02. Who Uses This
1. **Institute Owner / Principal (Decision-maker):** Cares about cash flow, overall attendance trends, staff performance. Checks dashboards weekly, not daily. Pays the subscription.
2. **Admin / Front-desk Staff (Daily user):** Records payments, marks attendance, sends reminders. Non-technical, cheap Android phone, spotty internet. The app must work for this person above all.
3. **Teacher / Tutor (Secondary user):** Marks attendance for their own class/batch, enters marks/results, views their own schedule.
4. **Parent / Student (External, no login required in v1):** Receives WhatsApp reminders and pays via UPI link. Optional read-only portal is a later phase, not v1.

---

## 03. Feature Modules

### 3.1 Student & Institute Management (Phase 1)
- **Multi-tenant from day one:** Every record scoped to an `institute_id`; one login can belong to multiple institutes (for tutors who freelance across centers).
- **`institute_type` field** (`school` / `coaching_center` / `tutor`) drives label changes only — e.g. "Class & Section" for schools, "Batch" for coaching centers — not separate codebases.
- **Student profile:** Name, photo, DOB, guardian name(s) and phone numbers, class/batch, admission date, status (active/inactive/alumni).
- **Bulk import students via CSV upload:** Critical for onboarding an existing center with 100+ students already on paper/Excel.
- **Class / Section / Batch / Subject structure:** Configurable per institute — schools need Class → Section → Subject; coaching centers need Batch → Subject, often with a student in multiple batches at once.

### 3.2 Fee Management (Phase 1 — Build & validate first)
- **Fee structure setup:** Fee heads (tuition, admission, exam, transport, etc.), amount, frequency (monthly/quarterly/annual/one-time), applicable to class/batch or individual student.
- **Per-student override:** For scholarships, sibling discounts, and custom negotiated amounts — supported from day one.
- **Auto-calculated due list:** Due dates; dashboard view of total due, total collected, overdue count — today, this week, this month.
- **Record a payment:** Cash, UPI, bank transfer, cheque — manual entry for cash/offline, auto-reconciliation for UPI.
- **One-tap WhatsApp reminder:** Guardian message with dynamic UPI deep link pre-filled with exact due amount and reference ID.
- **Configurable auto-reminder schedule:** (e.g. 3 days before due, on due date, 3/7 days overdue) + manual one-tap triggers.
- **Receipt generation:** Shareable receipts (PDF / WhatsApp) on payment recording.
- **Fee defaulter report:** Exportable, filterable by class/batch/date range.

### 3.3 Payments & UPI Integration (Phase 1)
- **Dynamic UPI link / QR generation per due:** Amount + reference baked in. Payment goes directly to the institute's own UPI ID (no aggregator cut / no RBI PA/PG licensing required).
- **Payment status reconciliation:** Manual "mark as paid" with transaction reference as solid fallback; webhook/polling where gateway supports it.
- **Payment history log:** Per student, per institute, exportable.

### 3.4 Attendance (Phase 1)
- **Daily attendance marking:** Per class/section/batch — single-screen, bulk "mark all present then flag absentees" flow (minimal taps).
- **Per-student attendance history & %:** Visible to staff.
- **Optional low-attendance WhatsApp alert:** To guardian (configurable threshold, e.g. below 75%).
- **Attendance summary report:** Filterable by class/batch/date range.

### 3.5 Communication (Phase 2)
- WhatsApp Business API integration (Meta Cloud API or compliant BSP) for automated messages: fee reminders, attendance alerts, announcements.
- Broadcast announcements to a class/batch or whole institute.
- Message delivery log (sent / delivered / failed).

### 3.6 Staff & Role Management (Phase 2)
- Add staff/teacher accounts; assign to class/batch/subject.
- Role-based permissions (Owner, Admin, Front-desk Staff, Teacher/Tutor).
- Basic staff login / activity log.

### 3.7 Academics — Exams & Results (Phase 3)
- Define exams/tests per subject/class; enter marks per student.
- Auto-generated report card (PDF), shareable via WhatsApp.
- Simple performance trend per student over multiple exams.

### 3.8 Dashboard & Reporting (Phase 1 basic → Phase 3 full)
- **Owner home screen:** Fee collected vs. due (this month), attendance rate today, defaulter count — three key numbers visible without scrolling.
- Exportable reports (CSV / PDF) for fees, attendance, and academics.

### 3.9 Parent / Student Portal (Phase 4 — Optional)
- Read-only web view via tokenized link sent on WhatsApp (dues, receipts, attendance %, results). No app install or login required.

---

## 04. Roles & Permissions

| Role | Students | Fees | Attendance | Staff | Reports | Settings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Owner / Admin** | Full | Full | Full | Full | Full | Full |
| **Front-desk Staff** | View/Edit | Record payments, send reminders | View | — | View | — |
| **Teacher / Tutor** | View own class | — | Mark for own class | — | View own class | — |
| **Parent (portal, Phase 4)** | View own child | View own dues | View own child | — | — | — |

---

## 05. Core Data Model

Every table below includes `institute_id` for multi-tenancy except `institutes` and `users` (users join institutes via a join table).

- `institutes`: `id`, `name`, `type` (`school`/`coaching_center`/`tutor`), `city`, `upi_id`, `created_at`
- `users`: `id`, `name`, `phone`, `email`, `password_hash`, `created_at`
- `institute_members`: `id`, `institute_id`, `user_id`, `role` (`owner`/`admin`/`staff`/`teacher`), `status`
- `classes_batches`: `id`, `institute_id`, `name`, `type` (`class`/`section`/`batch`), `academic_year`
- `students`: `id`, `institute_id`, `class_batch_id`, `name`, `photo_url`, `dob`, `admission_date`, `status`
- `guardians`: `id`, `student_id`, `name`, `phone`, `relation`, `is_primary_contact`
- `fee_heads`: `id`, `institute_id`, `name`, `default_amount`, `frequency`, `applicable_to`
- `fee_dues`: `id`, `student_id`, `fee_head_id`, `amount`, `due_date`, `status` (`pending`/`paid`/`overdue`/`partial`)
- `payments`: `id`, `fee_due_id`, `amount`, `method` (`cash`/`upi`/`bank`/`cheque`), `reference_id`, `paid_at`, `recorded_by`
- `reminder_log`: `id`, `fee_due_id`, `channel` (`whatsapp`), `status` (`sent`/`delivered`/`failed`), `sent_at`
- `attendance_records`: `id`, `student_id`, `class_batch_id`, `date`, `status` (`present`/`absent`/`late`), `marked_by`
- `exams`: `id`, `class_batch_id`, `subject`, `name`, `max_marks`, `date`
- `exam_results`: `id`, `exam_id`, `student_id`, `marks_obtained`
- `announcements`: `id`, `institute_id`, `class_batch_id` (nullable=all), `title`, `body`, `sent_at`

---

## 06. API Surface (Representative)

- `POST /auth/login` — Phone/OTP or email/password login
- `GET /institutes/:id/dashboard` — Collected vs. due, attendance rate, defaulter count
- `POST /students/bulk-import` — CSV upload for onboarding
- `GET /fee-dues?status=overdue` — Defaulter list, filterable
- `POST /fee-dues/:id/payments` — Record a payment (manual or gateway webhook)
- `POST /fee-dues/:id/remind` — Trigger one-tap WhatsApp reminder
- `POST /attendance` — Bulk mark attendance for a class/batch/date
- `GET /students/:id/attendance` — Per-student history and percentage
- `POST /webhooks/whatsapp-status` — Delivery status callback from WhatsApp BSP

---

## 07. Suggested Technical Stack
- **Frontend:** Mobile-first Progressive Web App (PWA), installable, offline-first sync queue for attendance/fees, lightweight responsive UI.
- **Backend:** Node.js / Express or Next.js / Fastify backend with REST API.
- **Database:** PostgreSQL or SQLite (relational schema with strict `institute_id` multi-tenancy).
- **WhatsApp:** Direct UPI payment link generation + WhatsApp Web/wa.me link generation for manual/direct dispatch in Phase 1; Meta Cloud API in Phase 2.
- **Payments:** Dynamic UPI Deep Link (`upi://pay?pa=...&pn=...&am=...&tr=...`) + QR code generator.

---

## 08. Non-Functional Requirements
- **Low-end device performance:** Fast execution on ₹8,000 Android phones on throttled 2G/3G connections.
- **Offline tolerance:** Attendance marking and fee view cached locally; syncs upon reconnecting.
- **Onboarding velocity:** New admin onboarded with 10 students and first attendance marked in under 10 minutes.
- **Multi-tenant data isolation:** Scoped queries by `institute_id`.
- **Language:** Clean English v1, extensible to Hindi.

---

## 09. Build Phases
- **Phase 1 (Core build now):** Institute & student management, fee management, UPI links (manual reconciliation), attendance, basic dashboard.
- **Phase 2:** WhatsApp Business API automation, staff accounts, role permissions, announcements.
- **Phase 3:** Academics (exams, results, report cards), Hindi localization, full reporting.
- **Phase 4:** Read-only tokenized parent portal, auto-reconciliation payment gateway.
