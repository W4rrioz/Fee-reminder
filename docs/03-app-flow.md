# App Flow

## 1. Journey Summary (Plain English)
An institute admin signs up, sets their institute's payment info (UPI ID or bank details) once, and adds students with fee amounts and due dates. The dashboard shows who currently owes money, sorted by urgency. For any overdue student, the admin taps "Remind" — this opens WhatsApp with a pre-filled message containing the amount due and the institute's payment info, ready to send. Once the parent actually pays (by whatever method), the admin taps "Mark as Paid" and the status updates.

## 2. Entry Points
- First visit: Landing/login page → Sign Up flow (creates institute + admin account).
- Returning user: Login page → Dashboard.
- Shared or deep link: Not applicable in v1 (parents never log into the app; they only receive a WhatsApp message).

## 3. Authentication Flow
- Sign up: Admin enters institute name, their email, and a password (or requests a magic link) → institute (tenant) record created → admin lands on an empty Dashboard, prompted to set payment info and add their first student.
- Sign in: Email + password (or magic link) → Dashboard.
- Verification: Email verification link sent on signup (standard auth-provider flow).
- Password recovery: Standard "forgot password" email flow via auth provider.
- Sign out: Single tap from a profile/settings menu, returns to Login page.

## 4. Screen Inventory

### Screen: Sign Up
- Route: `/signup`
- Purpose: Create a new institute + admin account.
- Entry conditions: Not logged in.
- Main content: Institute name, email, password fields.
- Primary action: Create account.
- Secondary actions: Link to Sign In.
- Loading state: Button shows spinner while account is created.
- Empty state: N/A.
- Error state: Inline validation (invalid email, weak password).
- Success state: Redirect to Dashboard with a "set up your payment info, then add your first student" prompt.
- Next destination: Institute Settings, then Dashboard.

### Screen: Sign In
- Route: `/login`
- Purpose: Authenticate an existing admin.
- Entry conditions: Not logged in.
- Main content: Email, password fields.
- Primary action: Log in.
- Secondary actions: Forgot password, link to Sign Up.
- Loading state: Button spinner during auth check.
- Empty state: N/A.
- Error state: "Invalid email or password" inline message.
- Success state: Redirect to Dashboard.
- Next destination: Dashboard.

### Screen: Institute Settings
- Route: `/settings`
- Purpose: Set the institute's static payment info (UPI ID and/or bank details) included in every reminder message.
- Entry conditions: Logged in.
- Main content: UPI ID field, optional bank details field, optional QR code upload.
- Primary action: Save.
- Secondary actions: None.
- Loading state: Save button spinner.
- Empty state: Prompted on first login if not yet filled in.
- Error state: Inline validation on UPI ID format.
- Success state: Confirmation toast; reminders can now be sent.
- Next destination: Dashboard.

### Screen: Dashboard (Dues List)
- Route: `/dashboard`
- Purpose: Primary screen — shows students with pending/overdue fees, most urgent first.
- Entry conditions: Logged in.
- Main content: List/cards of students with name, amount due, due date, status badge (Overdue / Due Soon / Paid).
- Primary action: Tap a student card → Student Detail; "Remind" and "Mark as Paid" quick-actions per card.
- Secondary actions: Add Student (floating action button), Search/filter students, Institute Settings, Sign out (menu).
- Loading state: Skeleton list while fetching.
- Empty state: "No students yet — add your first student" with a prominent Add Student button.
- Error state: "Couldn't load dues — showing last known list" with a retry button (uses cached data).
- Success state: Fully populated, sorted list.
- Next destination: Student Detail, Add Student form, Reminder action, or Mark as Paid action.

### Screen: Add / Edit Student
- Route: `/students/new`, `/students/:id/edit`
- Purpose: Create or update a student's record and fee details.
- Entry conditions: Logged in, reached via Dashboard's Add Student button or a Student Detail's Edit action.
- Main content: Name, parent WhatsApp number, fee amount, due date(s)/schedule, optional note (e.g. sibling discount).
- Primary action: Save.
- Secondary actions: Cancel, Delete (edit mode only).
- Loading state: Save button spinner.
- Empty state: N/A (form).
- Error state: Inline validation — invalid/missing phone number blocks save with a clear message, since reminders depend on it.
- Success state: Returns to Dashboard (new mode) or Student Detail (edit mode) with confirmation.
- Next destination: Dashboard or Student Detail.

### Screen: Student Detail
- Route: `/students/:id`
- Purpose: Full view of one student's fee history and status.
- Entry conditions: Logged in, reached from Dashboard.
- Main content: Student info, fee amount/schedule, payment status, history of reminders sent and when marked paid.
- Primary action: Send Reminder / Mark as Paid (whichever applies to current status).
- Secondary actions: Edit student, Delete student.
- Loading state: Skeleton while fetching detail.
- Empty state: "No reminders sent yet" in history section.
- Error state: "Couldn't load student — retry" message.
- Success state: Full detail populated.
- Next destination: Reminder action (opens WhatsApp), Mark as Paid, Edit Student.

### Screen: Send Reminder (Action, not a full page)
- Route: N/A — triggered from Dashboard card or Student Detail.
- Purpose: Open WhatsApp with a pre-filled reminder message (amount, due date, institute payment info).
- Entry conditions: Student has a valid parent phone number and a pending due amount; institute has set payment info.
- Main content: Brief confirmation of amount/recipient before proceeding (avoids accidental sends).
- Primary action: Confirm & Open WhatsApp.
- Secondary actions: Cancel.
- Loading state: Brief spinner while the message/link is assembled (no network call required in v1 — purely local).
- Empty state: N/A.
- Error state: Blocked entirely if phone number is invalid or institute payment info isn't set (prompts admin to fix first).
- Success state: WhatsApp opens (via wa.me) with pre-filled message; app records that a reminder was sent (visible in Student Detail history).
- Next destination: Returns to Dashboard or Student Detail.

### Screen: Mark as Paid (Action, not a full page)
- Route: N/A — triggered from Dashboard card or Student Detail.
- Purpose: Record that a fee has actually been paid.
- Entry conditions: Fee status is pending or overdue.
- Main content: Simple confirmation ("Mark [Student]'s fee as paid?").
- Primary action: Confirm.
- Secondary actions: Cancel; Undo (available briefly after confirming, in case of a mistake).
- Loading state: Brief spinner during status update.
- Empty state: N/A.
- Error state: "Couldn't update — try again" on save failure.
- Success state: Status flips to Paid, dashboard/detail reflect it immediately.
- Next destination: Returns to Dashboard or Student Detail.

## 5. Primary User Journey
1. Admin logs in → lands on Dashboard.
2. Dashboard shows 3 students overdue, sorted most-overdue-first.
3. Admin taps "Remind" on the most overdue student.
4. App shows a brief confirmation ("Send reminder to Rohan's parent for ₹X?").
5. Admin confirms → WhatsApp opens with a pre-filled message containing the amount, due date, and institute's UPI ID → admin taps Send in WhatsApp.
6. Parent receives the message and pays via the institute's usual UPI ID or bank transfer.
7. Admin sees the payment arrive on their own phone (outside the app) and returns to the app.
8. Admin taps "Mark as Paid" on that student → status updates immediately.

## 6. Secondary Journeys
- New institute onboarding: Sign Up → set Institute Settings (payment info) → empty Dashboard → Add Student (repeated) → first reminders sent.
- Editing a mis-entered fee amount: Dashboard → Student Detail → Edit → Save → Dashboard reflects updated amount.
- Handling a sibling discount: Add/Edit Student → adjust fee amount manually with a note (v1 has no automatic discount logic).
- Correcting an accidental "Mark as Paid": Student Detail → Undo (if within the undo window) or Edit to revert status manually.

## 7. Decision Points
- User action: Admin taps "Remind" on a student with no valid phone number, or before institute payment info is set.
  - Condition: Phone number missing/invalid, or institute payment info empty.
  - Result: Action blocked.
  - Destination: Redirected to Edit Student or Institute Settings to fix the issue first.
- User action: Admin taps "Mark as Paid" by mistake.
  - Condition: Confirmed within the undo window.
  - Result: Status reverts to its prior value.
  - Destination: Stays on the same screen.

## 8. Edge Cases and Recovery
- Invalid input: Phone number or amount fails validation → inline error, save blocked.
- Failed request: Status update fails to save → clear error state with retry.
- Lost connection: Dashboard falls back to last cached list with a visible "offline/stale data" indicator.
- Missing permissions: N/A in v1 (single admin role); relevant again once multi-role is added later.
- Expired session: Redirect to Sign In with a "session expired, please log in again" message.
- Cancelled action: Admin cancels a reminder or mark-as-paid confirmation → no change made, no record created.

## 9. Navigation Rules
- Global navigation: Simple top or bottom bar — Dashboard, Add Student, Settings, Sign Out. Kept minimal given the non-technical user base.
- Back behaviour: Standard browser/mobile back returns to the previous screen (e.g. Student Detail → Dashboard).
- Protected routes: All routes except Sign Up/Sign In require an authenticated session; unauthenticated access redirects to Sign In.
- Deep links: Not required in v1 (no parent-facing routes, no shareable internal links).
