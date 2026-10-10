# Feature Expansion — Antigravity Prompts (Phase 9 onward)

This continues numbering from `06-implementation-plan.md` (which ended at Phase 8: Deployment Readiness). Everything below is **optional expansion work**, not required for a working YIIC submission — the app is already demoable after Phase 5.

**How to use this file:** same discipline as before. Give Antigravity ONE phase's prompt at a time, verify its completion criteria, then move to the next. Do not paste the whole file into Antigravity at once — it will not sequence the work correctly and you won't be able to isolate bugs.

**Given your 5-week deadline**, consider treating Phases 9–11 (dummy data, bulk actions, dashboard analytics + attendance) as your real target, and everything after Phase 14 as "nice to have if time remains" or talking points for your pitch about the roadmap. Read every phase's goal before deciding what to actually build.

---

## Phase 9: Seed 50 Dummy Students

Do this first — every later feature (analytics, pie charts, attendance) is much easier to build and demo against realistic data instead of 2 sample students.

```
Read every file inside /docs before doing anything.

Goal: create a seed script that populates the local SQLite database with 50 dummy students under my existing tenant (or a fresh demo tenant if that's cleaner — ask me which).

For each student, generate realistic Indian names, valid-format Indian phone numbers (+91 followed by a 10-digit number, doesn't need to be a real number), and fee records with:
- A mix of statuses: roughly 15 overdue, 15 due soon (within the next 14 days), 15 paid, 5 with no due date issues yet
- Fee amounts varying realistically between ₹800 and ₹5,000
- Due dates spread across the past month and next month, not all identical
- A few students (5-6) with a "Sibling discount" or "Scholarship" note, to make the Note field look used

Make this a script I can re-run to reset demo data (e.g. npm run seed), not a one-time migration — I'll want to reset this multiple times while demoing.

Show me the script before running it, and confirm the count and status breakdown after running.
```

**Verify:** Dashboard shows a realistic, varied list — not all identical amounts/dates. Sorting still works correctly with this much data.

---

## Phase 10: Bulk Actions ("Remind All" + Bulk Fee Update)

```
Read every file inside /docs before doing anything.

Goal: add two bulk actions to the Dashboard.

1. "Remind All Overdue" button — appears above the student list when there's at least one overdue student. Tapping it shows a confirmation ("Send reminders to N overdue parents?"), then sequentially opens a wa.me link for each overdue student's reminder (the browser/OS will queue these as separate WhatsApp opens — don't try to send them silently in the background, since wa.me requires user-visible intent). Show a simple progress indicator ("Sending 3 of 12...").

2. Bulk fee update — from a new "Bulk Actions" area (e.g. accessible from Settings or a menu), let the admin select a filter (e.g. all students, or students with a specific note/tag) and apply a fee amount change (e.g. "+₹200" or "set to ₹1800") to all matching fee records at once. Require a confirmation showing exactly how many records will be affected before applying.

Both actions must remain scoped to the logged-in admin's tenant only.

Show me the files you plan to change before writing them.
```

**Verify:** Remind All only affects overdue students, bulk update confirmation shows the correct count before committing, tenant isolation still holds.

---

## Phase 11: Dashboard Analytics + Pie Charts

```
Read every file inside /docs before doing anything.

Goal: add a "Collections Overview" section to the Dashboard, using a lightweight charting library (e.g. Chart.js or Recharts — pick whichever is simpler to integrate with the existing React setup) to show:

1. A pie chart of fee status breakdown: Paid / Pending / Overdue, by count of students.
2. A second pie (or donut) chart of amount breakdown: ₹ collected vs ₹ outstanding this month.
3. Three small summary numbers above or beside the charts: Total Outstanding (₹), Collection Rate this month (%), Overdue Students (count).

All numbers must be computed from real data scoped to the tenant — no hardcoded/placeholder values. Keep the charts small and simple (this is a phone-first app, not a full BI dashboard) — no more than these two charts on the Dashboard.

Follow the existing color system in 04-ui-ux-brief.md for the chart segments (indigo/amber/green/red) so it feels consistent with the rest of the app, not like a bolted-on library default theme.

Show me the files you plan to change before writing them, and confirm the charts render correctly against the 50 dummy students from Phase 9.
```

**Verify:** Numbers match what you'd get by manually counting the dummy data. Charts render fast — don't let a charting library slow down the dashboard on a low-end device.

---

## Phase 12: Attendance Module (Calendar View)

This is the first step toward the "expand into other modules" plan from your original App Brief — a new module, not a change to the fee system.

```
Read every file inside /docs before doing anything.

Goal: add a new Attendance section to the app, as a separate module from fees (do not touch the students/fees tables or logic).

Data model: add an `attendance` table — id, tenant_id, student_id, date, status (present/absent/late), created_at. One row per student per day marked.

UI: a new "Attendance" nav item leading to a screen with:
1. A student selector or a "mark today" view showing all students with quick present/absent/late toggle buttons for the current date.
2. A calendar view (month grid) for a single selected student, showing colored dots or cell shading per day based on that student's attendance status that day (green = present, red = absent, amber = late, grey = unmarked). Tapping a day lets the admin mark/edit that specific date.
3. A simple per-student attendance percentage (e.g. "92% present this month") shown at the top of that student's calendar view.

Keep the same visual system as the rest of the app (colors from 04-ui-ux-brief.md, same card/button styling) — this should feel like part of the same product, not a bolted-on separate tool.

All attendance data must be scoped to the tenant, same as every other table.

Show me the files and the data model you plan to create before writing them.
```

**Verify:** Marking attendance for one student doesn't affect another. Calendar correctly reflects marked days. Tenant isolation holds for the new table too — test this explicitly, it's a new table and easy to forget scoping on.

---

## Phase 13: CSV Import for Existing Student Lists

```
Read every file inside /docs before doing anything.

Goal: add a "Import Students" option (e.g. from the Add Student screen or Dashboard) that accepts a CSV file with columns: name, parent_phone, fee_amount, due_date, note (note optional).

Flow:
1. Admin selects/uploads a CSV file.
2. Show a preview table of the parsed rows before committing anything, with clear inline flags on any row that fails validation (invalid phone format, missing name, non-numeric amount, bad date).
3. Let the admin either fix flagged rows manually in the preview or exclude them, then confirm import for the valid rows.
4. On confirm, create student + fee records for each valid row, scoped to the current tenant.

Do not silently skip bad rows without showing the admin what was skipped and why.

Show me the files you plan to change before writing them, and give me a sample CSV I can test with.
```

**Verify:** Malformed CSV doesn't crash the import — it shows clear per-row errors. Only valid rows get committed. Test with a CSV containing at least one deliberately broken row.

---

## Phase 14: Reminder History Timeline + Custom Message Templates

```
Read every file inside /docs before doing anything.

Goal, part 1: on Student Detail, show a proper timeline of all past reminders sent for that student (date/time sent), not just a count — pull this from the existing reminders table.

Goal, part 2: in Institute Settings, let the admin edit the reminder message template (currently hardcoded) with placeholders like {student_name}, {amount}, {due_date}, {upi_id}. Store this template on the tenant record. When generating a reminder wa.me link, use the tenant's custom template if set, falling back to the current default message if not.

Show me the files you plan to change before writing them, and confirm the placeholder substitution works correctly with a test message.
```

**Verify:** Editing the template actually changes the message sent. A missing/malformed placeholder doesn't break the reminder flow — fall back to the default template if the custom one has an error.

---

## Phase 15: Partial Payment Tracking

```
Read every file inside /docs before doing anything.

Goal: replace the current binary "Mark as Paid" with support for partial payments.

Change the fees table (or add a related table — your call, propose an approach and confirm with me before implementing) to track amount_paid against amount_due, rather than just a paid/pending status. A fee's status becomes: pending (amount_paid = 0), partially_paid (0 < amount_paid < amount_due), paid (amount_paid >= amount_due).

Update "Mark as Paid" to become "Record Payment" — admin enters an amount received (defaulting to the full remaining balance, but editable), and the record updates accordingly. Student Detail should show payment history (each partial payment recorded, with date and amount).

This changes existing behavior, so walk me through the migration approach for any existing seed/demo data before implementing, and confirm it doesn't break the Dashboard's status sorting logic.
```

**Verify:** A student with a ₹1,000 partial payment on a ₹2,500 due correctly shows as "partially paid," with the right remaining balance, and the Dashboard reflects it accurately.

---

## Phase 16: Monthly/Weekly Collection Report Export

```
Read every file inside /docs before doing anything.

Goal: add a "Download Report" option (e.g. in Settings or Dashboard) that generates a CSV (or simple PDF, your choice — propose one) summarizing, for a selected date range: total collected, total outstanding, list of students with their payment status, and collection rate.

Keep this simple — one summary section plus one per-student table, no complex formatting. Scoped to the tenant.

Show me the files you plan to change before writing them.
```

**Verify:** Numbers in the exported report match what the Dashboard shows for the same date range.

---

## Phase 17: "At Risk" List

```
Read every file inside /docs before doing anything.

Goal: add a simple "At Risk" filter/tab (alongside the existing Pending Dues / All Students / Paid tabs) that surfaces students who have missed 2 or more due dates in a row, or whose most recent reminder was sent more than 7 days ago with no payment recorded since.

This is meant to flag students worth a manual phone call, not another WhatsApp reminder — the UI for this tab can simply show the list with the reason flagged (e.g. "2 reminders sent, no payment") rather than adding a new action.

Show me the query logic and files you plan to change before writing them.
```

**Verify:** The logic correctly identifies students matching the criteria against your dummy data, and doesn't flag a student who just became overdue yesterday.

---

## Phase 18: Multi-Staff Logins + Permissions + Activity Log

```
Read every file inside /docs before doing anything.

Goal: extend the current single-admin-per-tenant model to support multiple staff accounts per institute with two roles: "owner" (full access, can invite/remove staff) and "staff" (can manage students/fees/attendance/reminders, cannot manage settings or other staff accounts).

Add an "activity_log" table — tenant_id, actor_admin_id, action (e.g. "marked_paid", "added_student", "sent_reminder"), target_id, created_at — and log the key actions listed above. Show a simple activity feed somewhere accessible (e.g. a new "Activity" screen) listing recent actions with who did what.

This is a significant change to the auth/permission model — walk me through your approach before implementing, especially how you'll handle existing single-admin accounts during migration.
```

**Verify:** A "staff" role account genuinely cannot reach the Settings screen or invite other staff. Activity log entries are accurate and scoped to the tenant.

---

## Phase 19: Institute Logo Upload

```
Read every file inside /docs before doing anything.

Goal: let the admin upload a small logo image in Institute Settings, stored locally (e.g. in a local uploads folder, referenced by path in the tenants table — no cloud storage needed for this local build). Show the logo in the Dashboard header next to the institute name.

Validate file type (image only) and size (keep it small, e.g. under 500KB) before accepting an upload.

Show me the files you plan to change before writing them.
```

**Verify:** Upload works, logo displays correctly, an oversized or wrong-type file is rejected with a clear message.

---

## Phase 20: Hindi/Regional Language Toggle

```
Read every file inside /docs before doing anything.

Goal: add a language toggle (English/Hindi) in Institute Settings. Translate: all UI labels, button text, and the default WhatsApp reminder message template. Use a simple key-based translation approach (e.g. a strings.json per language) rather than hardcoding Hindi text inline, so more languages could be added later.

Start with just these two languages — don't build a complex i18n framework, keep it simple given the timeline.

Show me the translation file structure and files you plan to change before writing them.
```

**Verify:** Switching the toggle actually changes visible text throughout the app, not just on one screen. The reminder message in Hindi still correctly substitutes the amount/date/name placeholders.

---

## Phase 21: Accessibility / Larger Text Mode

```
Read every file inside /docs before doing anything.

Goal: add a simple "Larger Text" toggle in Institute Settings that increases base font size app-wide (e.g. 16px → 19-20px) for admins who find the default size hard to read. Use a CSS approach (e.g. a root class that scales rem-based sizing) rather than rewriting every component's font size individually.

Show me your approach before implementing.
```

**Verify:** Toggling it doesn't break any layout — check the Dashboard cards and modals specifically, since larger text is the most likely thing to cause overflow/wrapping issues.

---

## Phase 22: Parent-Facing Read-Only View

```
Read every file inside /docs before doing anything.

Goal: generate a unique, unguessable read-only link per student (e.g. a long random token in the URL, not the student's database ID) that a parent can open without logging in, showing only that student's current due amount, due date, and the institute's payment info — nothing else, no other students, no admin functions.

Add this link to the reminder message as an alternative/addition to the current plain-text message, so parents have something to check back on rather than only a one-time WhatsApp text.

Security: the token must not be guessable or enumerable (e.g. sequential IDs would let someone view other students' data by changing a number in the URL) — use a proper random token, and don't expose any other tenant/institute data on this page.

Show me your approach to token generation and the route before implementing, given the security sensitivity here.
```

**Verify:** Try guessing/incrementing another student's token — it must fail. Confirm no admin-only data leaks onto this public page.

---

## Phase 23: Data Export (Full Institute Data)

```
Read every file inside /docs before doing anything.

Goal: add a "Download my data" option in Settings that exports all of the tenant's data (students, fees, reminders sent, attendance if built) as a single downloadable JSON or CSV bundle. This is a trust/transparency feature — the admin should be able to get all their own data out at any time.

Show me the files you plan to change before writing them.
```

**Verify:** Exported data is complete and correctly scoped — no other tenant's data included.

---

## Phase 24: Onboarding Checklist

```
Read every file inside /docs before doing anything.

Goal: on first login (or whenever an institute hasn't completed setup yet), show a simple checklist on the Dashboard: "1. Set your payment info ✓/○  2. Add your first student ✓/○  3. Send a test reminder ✓/○". Each item links to the relevant screen, and checks itself off automatically once that action is completed. Once all three are done, hide the checklist permanently for that tenant.

Show me the files you plan to change before writing them.
```

**Verify:** Checklist state persists correctly per tenant and doesn't reappear once completed.

---

## Phase 25: PWA / "Add to Home Screen"

```
Read every file inside /docs before doing anything.

Goal: make the app installable as a Progressive Web App — add a manifest.json (app name "FeeReminder", icons, theme color matching the indigo primary #3730A3), and a basic service worker for offline caching of the app shell (not full offline data sync, just so the app doesn't show a browser error if opened with no connection).

This should make Android Chrome show an "Add to Home Screen" prompt, so the admin can launch it like a native app.

Show me the files you plan to create before writing them, and confirm the install prompt appears when testing on an actual Android device.
```

**Verify:** Test the actual install prompt on a real Android phone, not just desktop dev tools — PWA install behavior differs meaningfully between the two.

---

## Suggested Priority for a 5-Week YIIC Timeline

If you're deciding what to actually build versus what to leave as roadmap talking points in your submission:

**Do (high demo value, reasonable effort):** Phase 9 (dummy data), Phase 10 (bulk remind), Phase 11 (analytics + pie charts), Phase 12 (attendance calendar).

**Consider if time allows:** Phase 13 (CSV import), Phase 14 (reminder history/templates), Phase 17 ("At risk" list).

**Mention as roadmap, don't build for YIIC:** Phase 15 (partial payments — real complexity, real migration risk), Phase 18 (multi-staff — significant auth rework), Phase 22 (parent portal — meaningful security surface to get right), Phase 6 from the original plan (payment gateway).

You know your actual remaining time better than I do — tell me where you are in the 5 weeks and I'll help you cut this list down further if needed.
