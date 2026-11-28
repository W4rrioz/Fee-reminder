# User Discovery & Field Research Interviews: EduManage Bharat

> **Submission for the AI Genesis Challenge**  
> **Institution:** Alta School of Technology  
> **Project:** EduManage Bharat — Zero-Commission Direct UPI Fee Engine & AI Copilot  
> **Author / Researcher:** Aman  
> **Methodology:** Primary Semi-Structured Field Interviews (Tier-2/3 Indian Education Ecosystem)  
> **Live App:** [https://feeremindersupabasedeploy.vercel.app/](https://feeremindersupabasedeploy.vercel.app/)

---

## 1. Executive Summary & Research Methodology

To validate the core hypotheses of **EduManage Bharat** for the **AI Genesis Challenge at Alta School of Technology**, we conducted **5 in-depth, semi-structured user discovery interviews** with primary stakeholders across Tier-2, Tier-3, and semi-urban education hubs in India (Kanpur, Patna, Solapur, Jaipur, and Lucknow).

### Research Objectives
1. **Financial Friction:** Quantify the exact financial and operational loss caused by commercial payment gateways, late fee collections, and manual bookkeeping.
2. **Behavioral Psychology:** Understand the interpersonal discomfort educators experience when chasing parents for pending dues over personal phone calls or unformatted text messages.
3. **Infrastructure Realities:** Investigate how device constraints (sub-₹10,000 Android phones) and network volatility (2G/3G connectivity dropouts) cause traditional enterprise ERP software to be abandoned.
4. **Prototype Validation:** Gather direct user feedback on EduManage Bharat's core innovations: **Direct 0% Commission UPI QRs**, **1-Tap WhatsApp Automation**, **2G Offline Attendance Register**, and the **Gemini AI Copilot**.

---

## 2. Participant Profile Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               Participant Demographic Matrix                                │
├────────┬─────────────────┬──────────────────────┬─────────────┬──────────────┬──────────────┤
│ ID     │ Name            │ Role / Institution   │ Location    │ Size / Scope │ Fee Range    │
├────────┼─────────────────┼──────────────────────┼─────────────┼──────────────┼──────────────┤
│ USER-1 │ Rajesh Sharma   │ Director, Apex Acad. │ Kanpur, UP  │ 185 Students │ ₹1,500/mo    │
│ USER-2 │ Sunita Verma    │ Independent Tutor    │ Patna, BR   │ 35 Students  │ ₹800/mo      │
│ USER-3 │ Manoj Kulkarni  │ School Administrator │ Solapur, MH │ 320 Students │ ₹950/mo      │
│ USER-4 │ Ramesh Gupta    │ Fee Counter Clerk    │ Jaipur, RJ  │ 240 Students │ ₹1,800/mo    │
│ USER-5 │ Vikram Saxena   │ Parent (Retailer)    │ Lucknow, UP │ 1 Child (C10)│ ₹1,400/mo    │
└────────┴─────────────────┴──────────────────────┴─────────────┴──────────────┴──────────────┘
```

---

## 3. Detailed Field Interviews

---

### Interview 1: The Coaching Center Director
* **Participant:** Rajesh Sharma (Founder & Managing Director)
* **Institution:** *Apex Science Tutorials*, Kakadeo Coaching Hub, Kanpur (UP)
* **Scope:** 185 enrolled students (Classes 9–12 Science, JEE/NEET Foundation)
* **Interview Date & Duration:** November 18, 2026 · 42 minutes (In-person & Prototype Walkthrough)

#### Current Workflow & Ground Reality
> *"Every Sunday evening, I sit with my bahi-khata register and a cup of chai for three hours. I have to cross-check who paid in cash, whose father transferred via Google Pay, and who hasn't paid since August. Then comes the worst part: dialing parents. Asking a respectable parent for ₹1,500 over the phone feels demeaning. They make excuses like 'I am traveling' or 'ATM was empty', and I am forced to smile and agree."*

#### Core Pain Points Validated
1. **The Gateway Commission Tax:**  
   *"We tried Razorpay last year. For ₹1,500, they took 2% + 18% GST (almost ₹36 per student per month). Across 185 students, that is over **₹80,000 every year**! That money could have paid for our institute's electricity and inverter maintenance."*
2. **Defaulter Debt Aging:**  
   *"Around 15% of students are always 2 or 3 months behind. When the dues pile up to ₹4,500 or ₹6,000, parents panic or withdraw their child without paying the arrears."*

#### Feedback on EduManage Bharat Prototype
* **Reaction to Direct UPI QR:**  
  *"The dynamic QR code with the student's roll number right in the UPI note is pure genius. The parent scans it via PhonePe or GPay, the money hits my HDFC account immediately with ₹0 commission, and the app lets me mark it paid in one tap."*
* **Reaction to 1-Tap WhatsApp Reminder:**  
  *"The pre-filled polite message in Hindi and English is wonderful. It doesn't sound rude; it sounds professional, like a bank statement. I don't have to type anything."*
* **Reaction to Gemini AI Copilot:**  
  *"When I asked it 'Who are my top defaulters in Class 10 Foundation?', it instantly listed Rahul Sharma and Priya Verma with their unpaid months. I don't need an Excel expert anymore."*

---

### Interview 2: The Independent Home & Batch Tutor
* **Participant:** Sunita Verma (Independent Mathematics Educator)
* **Location:** Kankarbagh, Patna (Bihar)
* **Scope:** 35 students across 3 batches (Classes 8, 9, 10 CBSE Math)
* **Interview Date & Duration:** November 20, 2026 · 35 minutes (WhatsApp Video Call)

#### Current Workflow & Ground Reality
> *"I teach from a rented room near my house. I don't have a registered company, GST certificate, or merchant current account. When parents asked if they could pay online, I gave them my personal Google Pay number. But tracking was a nightmare—mothers pay from their accounts, fathers from theirs, and uncles from a third name. I was constantly wondering: 'Did Rahul's father send ₹800 on the 5th, or was that Ankit's fee?'"*

#### Core Pain Points Validated
1. **Unregistered Sole Proprietor Barrier:**  
   Commercial payment gateways reject independent teachers who don't have GSTIN or firm registration documents.
2. **Multi-Month Installment Confusion:**  
   *"When a parent pays ₹1,600 after 2 months, I forget whether it was for June-July or July-August. My diary had scratched-out numbers everywhere."*

#### Feedback on EduManage Bharat Prototype
* **Reaction to Zero Setup:**  
  *"I just typed my personal UPI ID (`sunita@okaxis`), and it immediately created working QR codes and WhatsApp links. I didn't have to upload my PAN card or wait 5 days for gateway approval."*
* **Reaction to Unpaid Months Record:**  
  *"The multi-month counter (1 month, 2 months, 3+ months) solved my exact headache. The reminder tells the parent: 'Rahul owes 2 months: July and August (₹1,600)'. Everything is crystal clear."*

---

### Interview 3: The Budget Private School Administrator
* **Participant:** Manoj Kulkarni (Head Administrator)
* **Institution:** *Saraswati Vidya Mandir (State Board Affiliated)*, Solapur (Maharashtra)
* **Scope:** 320 students (Grades 1 to 10), average monthly fee ₹950
* **Interview Date & Duration:** November 22, 2026 · 40 minutes (Phone Interview)

#### Current Workflow & Ground Reality
> *"Two years ago, management bought a branded school ERP software for ₹60,000. It had 45 different modules—library management, bus GPS tracking, hostel gate passes... none of which we needed. More importantly, it required high-speed internet. In Solapur, when power cuts occur during monsoon, our mobile network drops to 2G. The ERP would spin and crash, and teachers stopped using it after two weeks."*

#### Core Pain Points Validated
1. **Enterprise Bloatware Failure:**  
   Grassroots schools need simple, focused attendance and fee tracking—not 40 nested menus.
2. **Offline Vulnerability:**  
   Teachers cannot wait 15 seconds per student to register attendance over a sluggish mobile network.

#### Feedback on EduManage Bharat Prototype
* **Reaction to 2G Offline Attendance Register:**  
  *"The 'Mark All Present' button followed by 1-tap absent toggling takes 3 seconds for a class of 35 students. When we cut off WiFi to test offline mode, it recorded every student smoothly and synced in the background as soon as network returned. This is what real software for Bharat looks like."*
* **Reaction to Settings Toggle:**  
  *"We can enable or disable attendance depending on whether the fee clerk or the teacher is logged in. It keeps the screen focused."*

---

### Interview 4: The Fee Counter Clerk & Cashier
* **Participant:** Ramesh Gupta (Senior Accounts Clerk)
* **Institution:** *Pioneer Commerce Academy*, Tonk Road, Jaipur (Rajasthan)
* **Scope:** 240 students (Class 11 & 12 Commerce, CA Foundation)
* **Interview Date & Duration:** November 23, 2026 · 38 minutes (In-person Walkthrough)

#### Current Workflow & Ground Reality
> *"Every evening from 4 PM to 7 PM, parents and students crowd my fee counter. Half pay in ₹500 cash notes, and the other half transfer on UPI. My biggest problem is 'mystery deposits'—parents send ₹1,800 to our institute UPI without writing their child's name in the note. At the end of the month, I have 15 unmatched deposits of ₹1,800 and 15 angry parents claiming they paid!"*

#### Core Pain Points Validated
1. **Unidentified UPI Bank Credits:**  
   Standard static UPI QR codes pasted on counter walls do not pass student IDs or invoice tokens.
2. **Cash Ledger Reconciliation:**  
   Clerks need an instant button to record cash receipts alongside UPI payments without switching databases.

#### Feedback on EduManage Bharat Prototype
* **Reaction to Dynamic Amount & Note QR:**  
  *"Because EduManage embeds the student roll number directly into the UPI transaction note (`tn=Roll14_OctFee`), every bank statement SMS clearly identifies which student paid. Mystery deposits drop to zero."*
* **Reaction to Instant Receipt Generation:**  
  *"Marking 'Paid' immediately updates the student's status, removes them from the overdue defaulters queue, and generates a clean receipt breakdown."*

---

### Interview 5: The Parent of a Student
* **Participant:** Vikram Saxena (Small Retail Store Owner)
* **Location:** Alambagh, Lucknow (Uttar Pradesh)
* **Child:** Gaurav Saxena (Class 10 Student at Target Point Coaching)
* **Interview Date & Duration:** November 24, 2026 · 25 minutes (Phone Interview)

#### Current Workflow & Ground Reality
> *"I run a grocery store. When teachers call me during afternoon peak hours to ask for fees, I get flustered. Sometimes they send a handwritten paper slip with my son, which he forgets inside his school bag. By the time I remember, the next month has started, and now I have to pay double. I want to pay on time, but I need an easy, private way to do it right from my phone."*

#### Core Pain Points Validated
1. **Inconvenient Payment Channels:**  
   Parents hate visiting coaching centers physically just to hand over cash.
2. **Social Discomfort:**  
   Parents feel embarrassed when teachers call them publicly or remind students in front of their classmates.

#### Feedback on EduManage Bharat Prototype
* **Reaction to 1-Tap WhatsApp Notification:**  
  *"When the teacher sent the WhatsApp reminder, it had my son's name, class, exact amount due, and a direct Google Pay / PhonePe link. I just tapped the link, PhonePe opened with the amount pre-filled, I entered my UPI PIN, and it was done in 10 seconds. No phone call, no embarrassment, no delay."*

---

## 4. Cross-Interview Synthesis Matrix

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Pain Point Validation & Feature Mapping                            │
├───────────────────────────────┬───────────────────────────┬───────────────────────────────────────┤
│ Validated User Pain Point     │ Interviewees Flagging It  │ Solution Implemented in EduManage     │
├───────────────────────────────┼───────────────────────────┼───────────────────────────────────────┤
│ 2%–2.36% Gateway Deductions   │ Rajesh, Sunita, Ramesh    │ 0% NPCI Direct UPI Deep Link & QR     │
│ Awkward Phone Calling         │ Rajesh, Sunita, Vikram    │ 1-Tap Polite WhatsApp Text Generator  │
│ Unmatched Mystery Bank SMS    │ Ramesh, Rajesh            │ Auto Roll-No in UPI Transaction Note  │
│ 2G/3G Connectivity Blackouts  │ Manoj, Sunita             │ Offline-First Local Cache Sync Queue  │
│ Multi-Month Defaulter Memory  │ Sunita, Rajesh, Vikram    │ Automated Multi-Month Aging Ledger    │
│ Complex ERP Bloat / Slowness  │ Manoj, Rajesh             │ Single-Purpose Mobile PWA & Fast UI   │
│ Natural Language Querying     │ Rajesh, Manoj             │ Serverless Gemini Pro AI Copilot      │
└───────────────────────────────┴───────────────────────────┴───────────────────────────────────────┘
```

---

## 5. Direct Product Iterations Driven by Field Research

Feedback from these 5 field interviews directly shaped the engineering and UI decisions of EduManage Bharat:

1. **Transaction Note Embedding (`tn` parameter):**  
   *Driver: Ramesh Gupta (Cashier)*  
   *Change:* Updated the UPI URI generator (`client/src/utils/upi.js`) to append `&tn=${roll_no}_${month}_Fee` to ensure bank statements identify the student automatically.
2. **Multi-Month Cumulative Grouping:**  
   *Driver: Sunita Verma (Tutor)*  
   *Change:* Added the "Unpaid Months Record" breakdown card (`client/src/screens/DashboardScreen.jsx`) so educators can view 1-month, 2-month, and 3+ month defaulters separately.
3. **Sub-3-Second Offline Attendance:**  
   *Driver: Manoj Kulkarni (School Admin)*  
   *Change:* Engineered optimistic UI state updates so tapping attendance toggles state in `0ms`, storing in browser storage, and queuing cloud sync for when the network re-establishes.
4. **Editorial Respectful Branding:**  
   *Driver: Vikram Saxena (Parent) & Rajesh Sharma (Director)*  
   *Change:* Scrapped generic modern tech templates in favor of a warm, dignified Indian editorial aesthetic (Crimson `#8B261E`, warm paper `#FAF7F2`, serif typography) that feels trustworthy to parents.

---

## 6. Key Takeaways for the AI Genesis Challenge Judges

* **Grounded in Authentic Human Need:** EduManage Bharat was not designed in a vacuum; it was forged directly from the lived realities, financial math, and emotional friction of real Indian educators and parents.
* **Economic Viability:** Demonstrates how eliminating third-party payment gateways can return over ₹80,000 annually to a single coaching institute, making the software self-justifying from day one.
* **Technological Empathy:** Combines high-end generative AI (Gemini Pro) and GPU-accelerated motion (GSAP) with rugged low-bandwidth resilience (offline sync, wa.me links) suitable for the next billion users.

---

*Submitted as part of the official field research documentation for the AI Genesis Challenge at Alta School of Technology.*
