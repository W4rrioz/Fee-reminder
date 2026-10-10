# Backend Schema

## 1. Data Overview
- Database type: SQLite (local file-based relational database).
- Main data domains: Tenants (institutes), Admins, Students, Fees/Dues, Reminders. (A `payments` table is deferred to v2 — see Section 10.)
- Ownership model: Every table except `tenants` itself carries a `tenant_id` foreign key; all queries are scoped by the authenticated admin's tenant.

## 2. Authentication and Authorisation
- User identity: `admins` table, one row per institute admin, linked to a `tenant_id`.
- Sign-in methods: Email/password, implemented directly against the SQLite database (no external auth provider); passwords stored as salted hashes, never in plain text.
- Roles: Single role in v1 — `admin` (full access within their own tenant only).
- Permissions: Admin can fully manage students, fees, and reminders within their own tenant; no access to other tenants under any condition.
- Session handling: Standard session/JWT issued by auth provider, validated on every backend request; `tenant_id` derived server-side from the authenticated admin, never trusted from client input.

## 3. Tables or Collections

### Table: tenants
- Purpose: Represents one institute (school/coaching center) using the app, including its payment info shown in reminders.
| Column | Type | Required | Default | Validation | Unique | Notes |
|---|---|---|---|---|---|---|
| id | uuid | yes | generated | — | PK | |
| name | text | yes | — | non-empty | — | Institute display name |
| upi_id | text | no | null | basic UPI ID format check | — | Shown in reminder messages once set |
| bank_details | text | no | null | — | — | Optional free-text fallback (account no./IFSC etc.) |
| created_at | timestamptz | yes | now() | — | — | |

### Table: admins
- Purpose: One admin user belonging to a tenant.
| Column | Type | Required | Default | Validation | Unique | Notes |
|---|---|---|---|---|---|---|
| id | uuid | yes | generated | — | PK | |
| tenant_id | uuid | yes | — | must exist in tenants | FK → tenants.id | |
| password_hash | text | yes | — | — | — | Salted hash, never plain text |
| email | text | yes | — | valid email format | unique | |
| created_at | timestamptz | yes | now() | — | — | |

### Table: students
- Purpose: A student whose fees are tracked.
| Column | Type | Required | Default | Validation | Unique | Notes |
|---|---|---|---|---|---|---|
| id | uuid | yes | generated | — | PK | |
| tenant_id | uuid | yes | — | must exist in tenants | FK → tenants.id | |
| name | text | yes | — | non-empty | — | |
| parent_phone | text | yes | — | valid phone format (E.164 recommended) | — | Required — reminders depend on this |
| note | text | no | null | — | — | e.g. sibling discount note |
| created_at | timestamptz | yes | now() | — | — | |
| updated_at | timestamptz | yes | now() | — | — | |

### Table: fees
- Purpose: A fee obligation (one-time or installment) assigned to a student.
| Column | Type | Required | Default | Validation | Unique | Notes |
|---|---|---|---|---|---|---|
| id | uuid | yes | generated | — | PK | |
| tenant_id | uuid | yes | — | must exist in tenants | FK → tenants.id | Denormalized for query/isolation simplicity |
| student_id | uuid | yes | — | must exist in students | FK → students.id | |
| amount | numeric(10,2) | yes | — | > 0 | — | In INR |
| due_date | date | yes | — | — | — | |
| status | text | yes | 'pending' | one of: pending, paid, overdue | — | `overdue` derived when due_date passes unpaid; `paid` set manually by admin in v1 |
| paid_at | timestamptz | no | null | — | — | Set when admin marks paid |
| created_at | timestamptz | yes | now() | — | — | |
| updated_at | timestamptz | yes | now() | — | — | |

### Table: reminders
- Purpose: A log of WhatsApp reminders sent for a fee (for history/audit, per App Flow's Student Detail history).
| Column | Type | Required | Default | Validation | Unique | Notes |
|---|---|---|---|---|---|---|
| id | uuid | yes | generated | — | PK | |
| tenant_id | uuid | yes | — | must exist in tenants | FK → tenants.id | |
| fee_id | uuid | yes | — | must exist in fees | FK → fees.id | |
| sent_at | timestamptz | yes | now() | — | — | |

## 4. Relationships
- tenants (1) → admins (many)
- tenants (1) → students (many)
- students (1) → fees (many)
- fees (1) → reminders (many)
- Delete behaviour: Deleting a student cascades to delete their fees and reminders (a student record removal should not leave orphaned records). Deleting a tenant is not supported via the app (would require manual/administrative action, not exposed in v1 UI).

## 5. Access Rules
| Table | Create | Read | Update | Delete |
|---|---|---|---|---|
| tenants | System only (on signup) | Own tenant only | Own tenant's admin (payment info fields) | Not exposed |
| admins | System only (on signup) | Own tenant's admins | Own record only | Not exposed in v1 |
| students | Own tenant's admin | Own tenant only | Own tenant's admin | Own tenant's admin |
| fees | Own tenant's admin | Own tenant only | Own tenant's admin (including manual status change) | Own tenant's admin |
| reminders | System (on reminder send) | Own tenant only | Not applicable | Not exposed |

All access rules are enforced server-side using the authenticated admin's `tenant_id`; recommend also enforcing tenant scoping at the database level (e.g. PostgreSQL row-level security) as a second line of defense.

## 6. Core Data Operations
- Create student + initial fee (combined operation from the Add Student form).
- Set/update institute payment info (`tenants.upi_id` / `bank_details`) from Settings screen.
- Query dues dashboard: fetch all fees for the tenant with status `pending` or `overdue`, joined with student name/phone, sorted by `due_date` ascending.
- Send reminder: build a wa.me URL client-side from student phone + amount + due date + tenant payment info → insert a `reminders` row.
- Mark as paid: update `fees.status` to `paid` and set `paid_at`; allow a short-window revert (undo) back to its prior status.
- Nightly/periodic job: mark any `fees` past `due_date` and still `pending` as `overdue`.

## 7. File Storage
- Optional in v1: a QR code image for the institute's UPI ID could be stored (e.g. Supabase Storage) if the admin wants to attach a scannable QR rather than just a typed UPI ID — not required for launch.

## 8. Data Integrity and Security
- Validation: Phone number format, amount > 0, and due_date presence enforced both client-side (UX) and server-side (integrity) before writes.
- Transactions: Not heavily needed in v1 without a payment gateway; still wrap multi-field updates (e.g. mark-as-paid setting both `status` and `paid_at`) in a single statement/transaction for consistency.
- Sensitive data: `parent_phone` and fee amounts are the most sensitive fields — access strictly tenant-scoped; no field-level encryption planned for v1 given pilot scale.
- Audit requirements: `reminders` table functions as a lightweight audit log of contact attempts; `fees.paid_at` provides a simple payment-marking audit trail.

## 9. Migration and Seed Data
- Initial migration creates all tables above with foreign keys and constraints as specified.
- Seed data for development/demo: one sample tenant (with UPI ID set), one admin, a handful of sample students with a mix of paid/pending/overdue fees to demo the dashboard sorting and status logic.

## 10. Risks and Open Questions
- Deferred (v2): A `payments` table tied to a payment gateway (fields like `gateway_reference`, webhook-driven `status`) is intentionally not part of this schema yet. When added later, it will reference `fees.id` the same way `reminders` does now, and `fees.status` will start being set automatically instead of manually.
- Open question: Whether recurring/installment fees need a separate `fee_schedule` concept beyond one row per due date — v1 assumption is one `fees` row per due date, revisit once actual coaching-center fee structures are tested with the pilot.
