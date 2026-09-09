import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb, getDb } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharva', 'Ananya', 'Diya', 'Gauri', 'Aditi', 'Isha', 'Kavya', 'Meera', 'Riya',
  'Saanvi', 'Pooja', 'Neha', 'Rohan', 'Rahul', 'Sneha', 'Tanvi', 'Aniket', 'Dhruv', 'Kabir',
  'Manish', 'Nikhil', 'Priya', 'Rishi', 'Sakshi', 'Tarun', 'Utkarsh', 'Varun', 'Yash', 'Zoya',
  'Ayush', 'Bhavya', 'Chirag', 'Dev', 'Esha', 'Farhan', 'Harsh', 'Jhanvi', 'Kunal', 'Lavanya'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Mishra', 'Joshi', 'Yadav', 'Reddy',
  'Nair', 'Chopra', 'Malhotra', 'Bhatia', 'Saxena', 'Mehta', 'Shah', 'Agarwal', 'Rao', 'Pandey'
];

const FEE_AMOUNTS = [800, 1000, 1200, 1500, 1800, 2000, 2200, 2500, 3000, 3500, 4000, 4500, 5000];

const SPECIAL_NOTES = [
  'Sibling discount (10%)',
  'Merit scholarship (20%)',
  'Quarterly installment plan',
  'Referred by Sharma family',
  'Early bird admission waiver',
  'Special concessions approved'
];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function runSeed() {
  console.log('--- FeeReminder Database Seeder ---');
  await initDb();
  const db = getDb();

  // 1. Ensure Tenant and Admin exist
  const ADMIN_EMAIL = 'admin@feereminder.local';
  const ADMIN_PASSWORD = 'admin123';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, salt);

  let admin = db.prepare("SELECT * FROM admins WHERE email = ? OR email = 'admin' OR email = 'admin@apex.com'").get(ADMIN_EMAIL);
  let tenantId;

  if (!admin) {
    tenantId = uuidv4();
    const adminId = uuidv4();

    db.prepare(`
      INSERT INTO tenants (id, name, upi_id, bank_details)
      VALUES (?, ?, ?, ?)
    `).run(tenantId, 'Apex Coaching Academy', 'apexacademy@okhdfcbank', 'HDFC Bank - A/C: 50100234918234, IFSC: HDFC0001234');

    db.prepare(`
      INSERT INTO admins (id, tenant_id, email, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(adminId, tenantId, ADMIN_EMAIL, passwordHash);

    console.log(`Created new Admin account: ${ADMIN_EMAIL} (Password: ${ADMIN_PASSWORD})`);
  } else {
    tenantId = admin.tenant_id;
    // Reset password hash to admin123 to guarantee it works
    db.prepare('UPDATE admins SET password_hash = ? WHERE tenant_id = ?').run(passwordHash, tenantId);
    
    // Also ensure admin@feereminder.local exists
    const exactLocalAdmin = db.prepare('SELECT * FROM admins WHERE email = ?').get(ADMIN_EMAIL);
    if (!exactLocalAdmin) {
      db.prepare('INSERT INTO admins (id, tenant_id, email, password_hash) VALUES (?, ?, ?, ?)').run(uuidv4(), tenantId, ADMIN_EMAIL, passwordHash);
    }
    
    console.log(`Using Admin account (Tenant ID: ${tenantId}), reset password to: ${ADMIN_PASSWORD}`);
    
    // Ensure tenant has payment details set for reminder testing
    db.prepare(`
      UPDATE tenants 
      SET upi_id = COALESCE(NULLIF(upi_id, ''), 'apexacademy@okhdfcbank'),
          bank_details = COALESCE(NULLIF(bank_details, ''), 'HDFC Bank - A/C: 50100234918234, IFSC: HDFC0001234')
      WHERE id = ?
    `).run(tenantId);
  }

  // 2. Clear existing demo data for this tenant
  console.log('Clearing previous student and fee records for this tenant...');
  db.prepare('DELETE FROM reminders WHERE tenant_id = ?').run(tenantId);
  db.prepare('DELETE FROM fees WHERE tenant_id = ?').run(tenantId);
  db.prepare('DELETE FROM students WHERE tenant_id = ?').run(tenantId);

  // 3. Generate 50 students
  // 15 Overdue, 15 Due Soon, 15 Paid, 5 Upcoming Pending
  const statusPlans = [
    ...Array(15).fill('overdue'),
    ...Array(15).fill('due_soon'),
    ...Array(15).fill('paid'),
    ...Array(5).fill('upcoming')
  ];

  const now = new Date();
  const studentsCreated = [];

  const seedTransaction = db.transaction(() => {
    statusPlans.forEach((plan, index) => {
      const studentId = uuidv4();
      const feeId = uuidv4();
      
      const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
      const studentName = `${firstName} ${lastName}`;
      
      // Valid Indian 10-digit mobile number (+9198XXXXXXXX)
      const phoneDigits = `98${String(10000000 + index * 13757).slice(-8)}`;
      const parentPhone = `+91${phoneDigits}`;

      // Notes on ~6 students
      let note = null;
      if (index % 8 === 0 && index / 8 < SPECIAL_NOTES.length) {
        note = SPECIAL_NOTES[index / 8];
      }

      // Insert Student
      db.prepare(`
        INSERT INTO students (id, tenant_id, name, parent_phone, note)
        VALUES (?, ?, ?, ?, ?)
      `).run(studentId, tenantId, studentName, parentPhone, note);

      // Fee details
      const amount = FEE_AMOUNTS[(index * 7) % FEE_AMOUNTS.length];
      let dueDate;
      let status;
      let paidAt = null;

      if (plan === 'overdue') {
        // 1 to 28 days in the past
        const daysPast = (index % 28) + 1;
        dueDate = formatDate(addDays(now, -daysPast));
        status = 'overdue';
      } else if (plan === 'due_soon') {
        // 1 to 14 days in the future
        const daysFuture = (index % 14) + 1;
        dueDate = formatDate(addDays(now, daysFuture));
        status = 'pending';
      } else if (plan === 'paid') {
        // Due 5 to 30 days ago, paid 1 to 3 days after due date
        const daysPast = (index % 25) + 5;
        const feeDueDate = addDays(now, -daysPast);
        dueDate = formatDate(feeDueDate);
        status = 'paid';
        paidAt = addDays(feeDueDate, 2).toISOString();
      } else {
        // Upcoming pending (15 to 45 days in future)
        const daysFuture = (index % 30) + 15;
        dueDate = formatDate(addDays(now, daysFuture));
        status = 'pending';
      }

      // Insert Fee
      db.prepare(`
        INSERT INTO fees (id, tenant_id, student_id, amount, due_date, status, paid_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(feeId, tenantId, studentId, amount, dueDate, status, paidAt);

      studentsCreated.push({
        name: studentName,
        parentPhone,
        amount,
        dueDate,
        status,
        note
      });
    });
  });

  seedTransaction();

  // Summary counts
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students WHERE tenant_id = ?').get(tenantId).count;
  const overdueCount = db.prepare("SELECT COUNT(*) as count FROM fees WHERE tenant_id = ? AND status = 'overdue'").get(tenantId).count;
  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM fees WHERE tenant_id = ? AND status = 'pending'").get(tenantId).count;
  const paidCount = db.prepare("SELECT COUNT(*) as count FROM fees WHERE tenant_id = ? AND status = 'paid'").get(tenantId).count;
  const notesCount = db.prepare("SELECT COUNT(*) as count FROM students WHERE tenant_id = ? AND note IS NOT NULL").get(tenantId).count;

  console.log('--- Seeding Successfully Completed ---');
  console.log(`Total Students Seeded: ${totalStudents}`);
  console.log(`- Overdue Dues: ${overdueCount}`);
  console.log(`- Pending Dues: ${pendingCount} (15 Due Soon within 14 days, 5 upcoming)`);
  console.log(`- Paid Dues: ${paidCount}`);
  console.log(`- Students with Special Notes: ${notesCount}`);
  console.log('Login credentials:');
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
}

runSeed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
