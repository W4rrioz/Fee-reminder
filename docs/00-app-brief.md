# App Brief

App name: EduManage Bharat

One-line idea: A mobile-first web app that tracks student fee dues, generates zero-commission direct UPI payments, marks 2G offline attendance, and powers institutes with a Gemini AI Copilot.

Problem it solves: Budget private schools and coaching institutes in Tier-2/3 Indian cities currently track fees on paper or Excel and manually chase parents by phone/WhatsApp, wasting hours every week.

Who it is for: Administrators and teachers at small private schools and coaching institutes — not tech-savvy, primarily on Android smartphones.

The main action a user should complete: Admin adds/updates a student's fee status → system helps send a WhatsApp reminder with amount due and payment info in one tap → admin manually marks it paid once received.

Must-have features:
- Student & fee-structure management (add student, assign fee amount/schedule)
- Due-tracking (who owes what, by when)
- One-tap WhatsApp reminders (pre-filled message with amount, due date, and the institute's static UPI ID/QR or bank info)
- Manual "Mark as Paid" action
- Multi-tenant support (one institute's data isolated from another's)

Nice-to-have features (v2):
- Dynamic, trackable UPI payment links via a payment gateway
- Automatic payment status update via webhook (replacing manual marking)
- Sibling discount handling
- Mid-term admission handling

Platform:
- Web (mobile-first, must work well on cheap Android devices, spotty network)

Business model, if relevant: Free pilot for the AI Genesis Challenge submission and first coaching center deployment. No monetization logic in v1 — this is a proof-of-concept/learning phase, not a paid product yet.

Important constraints:
- Deadline: Submission for AI Genesis Challenge (Alta School of Technology) — Nov 2026
- Budget: Near-zero (student project) — favor free/low-cost tools and services; direct bank UPI without payment gateway account needed for v1
- Required tools or services: WhatsApp wa.me click-to-chat links (free, no approval process); Google Gemini AI API via serverless backend proxy
- Privacy or security requirements: App will store student names, parent phone numbers, and fee amounts — treat as sensitive personal data. Requires per-tenant data isolation, no cross-institute data leakage, and shielded AI API credentials

References or existing products: None specified — differentiator is deliberately narrow scope vs. full ERPs (Fedena, Entab, etc.)
