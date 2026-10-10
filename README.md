# EduManage

A modern, mobile-first fee reminder, attendance tracking, and operations management platform designed for schools, coaching academies, and independent tutors.

Built with an offline-first architecture, EduManage runs seamlessly on budget mobile devices and handles low or intermittent network connectivity with local queuing and synchronization.

---

## Key Highlights

- **Direct UPI Payments (0% Commission)**: Generates NPCI-compliant UPI deep links and dynamic amount-specific QR codes. Payments route directly to the institute's bank account with zero middleman or gateway commissions.
- **WhatsApp Fee Reminders**: 1-click personalized reminders via WhatsApp with customizable message text, pre-calculated dues, and payment links.
- **Customizable Preview & Editor**: Preview reminders before sending with an inline editor to adjust payment messages or notes as needed.
- **Server Calendar & Automated Monthly Rollover**: Tracks real-time server time and automatically rolls over monthly tuition cycles, calculating multi-month unpaid fee records for overdue follow-ups.
- **Interactive Visual Analytics**: Interactive SVG pie charts and donut charts visualizing fee collection status, batch-wise distribution, and defaulter breakdowns without external charting bloat.
- **Minimal-Tap Attendance Tracking**: Fast bulk attendance marking (Mark All Present, 1-tap toggling) that can also be completely enabled or disabled via Settings to keep the UI strictly focused on fee collections.
- **Offline-First PWA**: Progressive Web App with local caching and background queue synchronization for spots with 2G/3G or no connectivity.
- **Guest Explore Mode**: Built-in guest exploration option to test and preview all workflows, charts, and registers with sample data without requiring administrative setup.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or above recommended)
- `npm`

### Quick Start (Windows)
Double-click `start.bat` in the project root to start both the server and client concurrently.

### Manual Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/W4rrioz/Fee-reminder.git
   cd Fee-reminder
   ```

2. **Start Backend API:**
   ```bash
   cd server
   npm install
   npm start
   ```
   *The backend API starts on `http://localhost:5000`.*

3. **Start Frontend Client:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   *The client will be accessible at `http://localhost:5173`.*

---

## Tech Stack

- **Client**: React 18, Vite, Tailwind CSS, Lucide React, HTML5 Canvas QR Generator
- **Server**: Node.js, Express, SQLite
- **Architecture**: Mobile-first Responsive PWA, Offline-First Sync Queue

---

## License

This project is licensed under the MIT License.
