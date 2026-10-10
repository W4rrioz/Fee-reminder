# EduManage v1.0 — Architecture & User Guide

**EduManage** is a mobile-first operations, fee management, and attendance platform built for coaching centers, schools, and independent tutors across Tier-2/3 India. It runs smoothly on budget devices (₹8,000 Android phones) and supports spotty 2G/3G connectivity with offline sync.

---

## 1. Quick Start

### Option A: Launch with Windows Batch File
Double-click [start.bat](file:///e:/Aman/Fee%20reminder/start.bat) in the project root. It starts both the Backend API and the Frontend client in dedicated command windows.

### Option B: Manual Command Line
- **Backend API (Node.js/Express + SQLite):**
  ```powershell
  cd "e:\Aman\Fee reminder\server"
  npm.cmd start
  ```
  *Runs on `http://localhost:5000`*

- **Frontend Client (Vite + React PWA):**
  ```powershell
  cd "e:\Aman\Fee reminder\client"
  npm.cmd run dev
  ```
  *Runs on `http://localhost:5173`*

---

## 2. Administrator & Demo Credentials

To check and inspect everything in the pre-configured demo institute (**Apex Coaching Academy, Kanpur**):

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@edumanage.in` | `Admin@12345` |
| **Institute Owner** | `aman@apexcoaching.in` | `Admin@12345` |

> **Quick Sign-In:** On the Sign In screen, you can also click the **"⚡ 1-Click Fill Demo Admin Credentials"** badge to auto-populate these credentials and log in instantly.

---

## 3. First-Time User Experience & Onboarding

When a new user visits the app for the first time, they go through this workflow:

1. **Welcome Landing Screen:**
   - Highlights the 3 core pillars:
     1. Zero-tap WhatsApp Fee Reminders with Direct UPI
     2. 1-Tap Attendance marked in seconds
     3. Offline tolerance on ₹8,000 Android phones
   - Primary action: **"Get Started — Free Institute Setup"**
   - Secondary action: **"Already have an account? Sign In"**

2. **Account Creation (Sign Up):**
   - Full Name, Mobile Number, Email Address, Password.
   - Automatically provisions a user account in the database.

3. **Institute Onboarding Wizard (4 Steps):**
   - **Step 1 — Institute Type:** Select whether you are a **School / College**, **Coaching Center / Institute**, or **Independent Tutor** (dynamically adapts all labels).
   - **Step 2 — Basic Details:** Institute Name and City.
   - **Step 3 — Direct UPI ID & Payee Name:** Direct payment routing (e.g. `yourinstitute@upi`). Parents pay directly into your account with 0% gateway commission.
   - **Step 4 — Initial Classes / Batches:** Add/remove initial batches with visual tags (e.g. "Batch 10A", "Batch 10B").

4. **Access Granted:**
   - Once onboarding is completed, the user is transitioned directly into the main app dashboard with their personalized setup.

---

## 4. Core Features & Capabilities

### 📱 1. Mobile-First & Dynamic Institute Terminology
- Adapts labels throughout the entire interface based on `institute_type`:
  - **School**: Displays **"Class & Section"**
  - **Coaching Center / Tutor**: Displays **"Batch"**
- Configurable instantly from the **Settings** screen.

### 📊 2. Owner Dashboard ("3 Key Numbers" Rule)
Visible immediately without scrolling on mobile:
1. **Collected vs. Due This Month** (e.g. `₹14,000 Collected • Due: ₹26,000`)
2. **Attendance Rate Today** (e.g. `83% Attendance Rate`)
3. **Defaulter Count** (e.g. `4 Defaulters`)
- **Quick Action Bar (minimum 48px touch targets):**
  - Mark Attendance
  - Record Payment
  - Send Reminders

### ✅ 3. Bulk Attendance Screen (Minimal Taps)
- **One-Tap "Mark All Present"** and **"All Absent"** action buttons.
- **Single-Tap Row Toggle:** Cycles state (*Present* → *Absent* → *Late*) with zero extraneous clicks.
- **Offline Tolerance:** Automatically records actions to `localStorage` when network connectivity drops, syncing immediately once back online.

### 💰 4. Direct UPI & Fee Management
- **0% Commission / Direct to Institute:** Generates NPCI-compliant UPI deep links (`upi://pay?pa=...&pn=...&am=...&tr=...`) pointing directly to the institute's own UPI VPA. No third-party gateway cut, no RBI PA/PG licensing hurdles.
- **One-Tap WhatsApp Reminders:** Formats and dispatches ready-to-send messages via `wa.me/{phone}?text=...` with the student's exact balance, due date, and dynamic payment link pre-filled.
- **Dynamic On-Screen UPI QR Code:** Generates dynamic QR codes for parents paying directly at the reception desk.
- **Offline & Manual Payment Recording:** Records cash, UPI, bank transfer, and cheque payments with receipt reference generation.

### 👥 5. Student Management & Bulk CSV Onboarding
- Student directory with batch filtering and search.
- Per-student cards displaying attendance percentages and outstanding balances.
- **CSV Bulk Import:** Upload or paste student lists (Name, Roll, Batch, Phone, Parent Name) with an included template download.

### 📶 6. Offline Queue & 2G Network Simulation
- Live network indicator banner in header.
- Features a **"Simulate 2G/Offline"** toggle button allowing you to verify that attendance marking and fee browsing continue functioning seamlessly when offline.

---

## 5. Verification & Testing

- **Backend Integration Test Suite:** Run `node test.js` inside `server/` to test all 12 key endpoints. All tests passed with 100% success.
- **Auth & Onboarding Test Suite:** Run `node test_auth.js` inside `server/` to test signup, login, and the onboarding wizard. All tests passed.
- **Frontend Production Build:** Run `npm.cmd run build` inside `client/` to verify zero compile or bundle errors.
