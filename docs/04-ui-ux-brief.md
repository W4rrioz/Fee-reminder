# UI/UX Design Brief

## 1. Experience Goal
- Desired feeling: Calm, trustworthy, effortless — like a to-do list, not like accounting software.
- Three visual adjectives: Clear, sturdy, unfussy.
- What the design must avoid: Dense data tables, small tap targets, jargon, anything that resembles a "complex ERP" (the exact thing this product is positioned against).

## 2. Users and Context
- Primary user: Non-technical school/coaching institute admin, likely 30s–50s, moderate smartphone fluency.
- Device and environment: Cheap Android phones, small screens, often outdoors or in a busy office, on inconsistent mobile data.
- Accessibility needs: Large, forgiving tap targets; high contrast for outdoor/bright-light visibility; minimal text density; no reliance on hover states (touch-only).

## 3. Visual Direction
- Colour palette and roles:
  - Primary (brand/action): Deep blue `#1E4FCB` — used for primary buttons, active states, links.
  - Success (paid): Green `#1E8E3E` — status badges, confirmations, "Mark as Paid" button.
  - Warning (due soon): Amber `#B7791F` — status badges.
  - Danger (overdue): Red `#C53030` — status badges, blocking errors.
  - Neutral background: Off-white `#F7F8FA`.
  - Neutral text: Near-black `#1A1A1A` for primary text, `#5B6270` for secondary text.
- Typography: A single clean system/sans-serif font stack (e.g. system-ui) for fast loading and native feel — avoid custom web fonts that slow loading on weak connections. Sizes: base 16px body text (never smaller, for readability); headings stepped at 20/24/28px.
- Icon direction: Simple line icons (not filled/decorative), used sparingly — an icon should clarify, not decorate.
- Image or illustration direction: Minimal to none in v1 — avoid anything that adds load weight without functional value.
- Surface and border treatment: Flat cards with a subtle 1px border or soft shadow for separation — avoid heavy shadows, gradients, or glassmorphism; this needs to render cleanly and fast on low-end devices.

## 4. Layout System
- Content width: Single-column, full-width on mobile (primary target); centered max-width ~600px on larger/desktop viewports.
- Grid: Simple vertical stack of cards/list items — no multi-column complexity in v1.
- Spacing scale: 4px base unit (4/8/12/16/24/32) for consistent rhythm.
- Section rhythm: Generous vertical spacing between cards (at least 12–16px) so tap targets don't feel cramped.
- Responsive breakpoints: Mobile-first (<600px) as the primary design target; a simple centered layout above that — no dedicated tablet/desktop redesign needed for v1.

## 5. Component Language
- Buttons: Full-width or large on mobile, high-contrast fill for primary actions (e.g. "Remind", "Mark as Paid"), min 44px tap height. States: default, pressed, disabled (e.g. no valid phone number, or payment info not set), loading (spinner replaces label).
- Inputs: Large text fields with visible labels above (not placeholder-only, for clarity), clear inline error text below in red. States: default, focus (blue outline), error, disabled.
- Navigation: Simple bottom or top bar, up to 4 items (Dashboard, Add Student, Settings, Sign Out/Profile).
- Cards: Used for student list items on the Dashboard — name, amount, due date, status badge, and both "Remind" and "Mark as Paid" quick-actions in one glanceable block.
- Modals or sheets: Lightweight confirmation sheets for both "Remind" ("Send ₹X reminder to [Parent]?") and "Mark as Paid" ("Mark [Student]'s fee as paid?") — bottom sheet style fits mobile better than a centered modal. Mark-as-Paid confirmation includes a brief "you can undo this" note.
- Tables or lists: Avoid literal data tables; use card-style list items even for what would traditionally be tabular data — better for small screens and non-technical users.
- Feedback and status components: Status badges (Paid/Due Soon/Overdue) using the color system above; toast/snackbar for save confirmations, errors, and a brief "Undo" toast after marking paid.

## 6. Screen Direction
- Institute Settings: Simple one-time (or rarely revisited) form — UPI ID field prominent, since reminders are blocked without it; a short one-line explanation of why it's needed.
- Dashboard: Status badge and amount are the visual anchor of each card — the admin should be able to scan urgency without reading full sentences. Both "Remind" and "Mark as Paid" actions are always visible, not hidden behind a menu.
- Add/Edit Student: Straightforward top-to-bottom form, one field per row, large touch targets, phone number field visually emphasized since it's critical to the product working.
- Student Detail: Status and next action (Remind or Mark as Paid, depending on current status) near the top; history further down, secondary to the current state.
- Send Reminder / Mark as Paid confirmations: Minimal, single clear question and two large buttons (Confirm / Cancel) — no room for accidental taps.

## 7. Interaction and Motion
- Purposeful transitions: Simple fade/slide for screen transitions — nothing elaborate; motion should never delay perceived responsiveness on a slow device.
- Feedback moments: Button loading spinners for any save action; success toast after saving, sending a reminder, or marking paid (with Undo affordance on the latter).
- Reduced-motion behaviour: Respect `prefers-reduced-motion` — fall back to instant state changes, no animation dependency for understanding the UI.

## 8. Accessibility
- Contrast: All text/background pairs meet WCAG AA contrast minimums, particularly given outdoor/bright-light usage.
- Keyboard use: Not a primary concern (touch-first), but forms should remain usable via keyboard for any desktop fallback use.
- Focus states: Visible focus outline on all interactive elements.
- Tap targets: Minimum 44x44px for all buttons/interactive elements.
- Text sizing: Body text never below 16px; respects system font-size settings where possible.

## 9. Consistency Rules

### Always use
- Card-based layout for lists of students/dues
- The defined status-color system (green/amber/red) consistently for Paid/Due Soon/Overdue
- Full-width, high-contrast primary buttons for the main action on any screen
- Plain, non-technical language in labels and messages (e.g. "Remind" and "Mark as Paid", not "Trigger Notification" or "Update Payment Status")
- A confirmation step before any state-changing action (Remind, Mark as Paid)

### Never use
- Dense multi-column data tables
- Small/low-contrast text for anything status-related
- Decorative gradients, glassmorphism, or heavy shadows
- Jargon or technical error messages exposed to the admin (translate any backend error into plain language)
