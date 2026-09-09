# Product Requirements Document

## 1. Product Overview
- Product name: [TBD — working name "FeeReminder"]
- One-sentence description: A mobile-first web app that tracks student fee dues for small schools/coaching institutes and sends WhatsApp reminders; v1 uses manual payment marking, with automatic UPI payment links planned as a v2 addition.
- Problem being solved: Administrators at budget schools/coaching institutes waste hours every week manually tracking who owes fees and chasing parents by phone or typed WhatsApp messages, using error-prone paper registers or spreadsheets.
- Why this product should exist: Existing solutions are either manual (paper/Excel) or full-scale ERPs that are too expensive, too complex, and require training these institutes don't have time for. A single-purpose tool that "just handles fee reminders" fits how these admins actually work.

## 2. Target Users
- Primary user: Administrator or owner of a small private school / coaching institute (non-technical, manages on a personal Android smartphone).
- Their current problem: Manually tracking dues in a register or spreadsheet, and manually messaging/calling parents to remind them.
- Their desired outcome: Know at a glance who owes what, and send a clear reminder with minimal manual effort.
- Secondary users: Parents, who receive a WhatsApp reminder with payment info — they don't log into the app itself in v1.

## 3. Core User Outcome
An administrator can see which students have pending fees and, with one action, notify the parent via WhatsApp with the amount due and how to pay — without manually typing messages — and later mark the fee paid with one tap once received.

## 4. Core Features

### Feature: Student & Fee Management
- User need: Track which students owe what, and when it's due.
- What it does: Admin adds a student, assigns a fee amount and due schedule (one-time or recurring/installments).
- Inputs: Student name, parent contact (WhatsApp number), fee amount, due date(s), optional notes (e.g. sibling discount).
- Expected output: A student record with current due status (pending / overdue / paid).
- Acceptance criteria: Admin can add, edit, and view a student's fee record in under 3 taps/steps from the dashboard.
- Error/empty states: No students yet → prompt to add first student. Invalid phone number → inline validation error.

### Feature: Dues Dashboard
- User need: See who currently owes money without scanning a spreadsheet.
- What it does: Lists students with pending/overdue dues, sorted by urgency (most overdue first).
- Inputs: None (derived from student/fee data).
- Expected output: A scannable list/card view with name, amount due, due date, status badge.
- Acceptance criteria: Dashboard loads and is usable on a low-end Android device within a few seconds on slow network.
- Error/empty states: No pending dues → "All caught up" state. Network failure → cached last-known list with a retry indicator.

### Feature: WhatsApp Reminder Sending
- User need: Notify a parent about a due fee without typing a message by hand.
- What it does: Generates a pre-filled WhatsApp message (via wa.me link) containing the student's name, amount due, due date, and the institute's payment details (static UPI ID or bank info, set once in institute settings); admin taps to open WhatsApp and send.
- Inputs: Selected student's due record; institute's stored payment info.
- Expected output: WhatsApp opens with the message pre-filled, ready to send.
- Acceptance criteria: One tap from the dues dashboard opens WhatsApp with a correctly pre-filled message.
- Error/empty states: Missing/invalid parent phone number, or institute payment info not yet set → block send, prompt admin to fix first.

### Feature: Manual Payment Marking
- User need: Record that a fee has been paid once the admin has actually received it (by whatever method — cash, bank transfer, UPI outside the app).
- What it does: Admin taps "Mark as Paid" on a student's due record.
- Inputs: Admin confirmation action.
- Expected output: Due status flips from pending/overdue → paid.
- Acceptance criteria: One tap from Student Detail (or the dashboard card) updates status immediately.
- Error/empty states: Accidental mark → allow admin to undo/revert status within a short window.

### Feature: Multi-Tenant Institute Isolation
- User need: Each institute's data must be completely separate from every other institute using the app.
- What it does: All data is scoped to a tenant (institute); no cross-tenant visibility.
- Inputs: Tenant/institute context on every request.
- Expected output: An admin only ever sees their own institute's students and dues.
- Acceptance criteria: No query or screen can return another tenant's data, verified explicitly in testing.
- Error/empty states: Attempted cross-tenant access → hard denial, not a silent empty result.

### Feature (v2 — not in v1): UPI Payment Link Generation & Auto-Status-Update
- User need: Let a parent pay instantly via a trackable link, and have status update automatically without the admin marking it manually.
- What it does: Generates a unique payment link via a payment gateway; a webhook confirms payment and flips status automatically.
- Status: Deferred to v2. v1 ships with static payment info + manual marking instead. Revisit once the core reminder loop is validated with the pilot institute.

## 5. Scope

### Included in version one
- Student & fee management (manual entry)
- Dues dashboard
- WhatsApp reminder via wa.me pre-filled link (includes static UPI ID/bank info, not a dynamic gateway link)
- Manual "Mark as Paid" action
- Multi-tenant data isolation
- Single admin role per institute

### Explicitly excluded from version one
- Payment gateway integration (dynamic UPI links, webhooks, auto status update)
- Attendance tracking or any non-fee module
- Parent-facing login/portal
- Multiple staff roles/permissions within one institute
- Automated recurring/scheduled reminders (v1 is admin-triggered, one tap)
- SMS or email as a channel (WhatsApp only)
- Native mobile app (web only)

### Possible later additions
- Payment gateway integration with automatic status update (v2)
- Attendance module
- Scheduled/automatic recurring reminders
- Multiple admin/staff roles with permissions
- Parent-facing portal or WhatsApp bot for self-service
- Official WhatsApp Business API for full automation

## 6. User Stories
- As an admin, I want to add a student with their fee amount and due date, so that I can track what they owe.
- As an admin, I want to see all overdue students in one list, so that I know who to follow up with today.
- As an admin, I want to send a WhatsApp reminder with our payment info in one tap, so that I don't have to type the same message repeatedly.
- As an admin, I want to mark a fee as paid once I've received it, so that my dashboard stays accurate.
- As an admin, I want my institute's data kept separate from other institutes on the platform, so that student information stays private.

## 7. Functional Requirements
- System must support creating, reading, updating student and fee records scoped to a single tenant.
- System must generate a valid wa.me link with a pre-filled message containing the amount due and the institute's payment info.
- System must support manually updating a fee's status to paid, with the ability to revert.
- System must enforce tenant isolation on every data access path.
- System must support institute-level admin login (single role, v1).

## 8. Non-Functional Requirements
- Performance: Dashboard must load usably within a few seconds on a budget Android device over a 3G-equivalent connection.
- Accessibility: Large tap targets, high-contrast text, minimal reliance on fine motor precision — this is a non-technical user base.
- Privacy: Student names, parent phone numbers, and fee amounts are sensitive; stored data must be scoped per tenant and never exposed cross-tenant.
- Security: Auth secrets must never be exposed client-side; all admin actions server-side must verify the requester's tenant.
- Browser/device support: Modern mobile browsers on Android (primary); desktop browser support is secondary, not primary design target.

## 9. Success Criteria
- An admin at the pilot coaching center can add students, send a reminder, and mark a fee paid — end to end — without needing training or support.
- Time to send a batch of reminders for overdue students is meaningfully faster than the admin's current manual process.
- Zero cross-tenant data leakage in testing.

## 10. Assumptions and Open Questions
- Assumes wa.me click-to-chat is acceptable for v1 (no official WhatsApp Business API yet) — revisit if reminder volume grows.
- Assumes manual payment marking is acceptable for the pilot (no payment gateway) — revisit for v2 based on pilot feedback.
- Assumes a single admin per institute in v1 (no multi-staff permissions yet).
- Open question: recurring/installment fee structures (e.g. monthly tuition) — v1 assumed to support this at a basic level (multiple due dates per student), full recurring automation deferred.
