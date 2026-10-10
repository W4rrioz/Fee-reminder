const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { run, get, all, initDb } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Ensure uploads dir exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==========================================
// Calendar & Real-time Server Sync Endpoints
// ==========================================

const monthNamesList = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNamesList = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

function formatMonthYear(dateOrMonthStr) {
  if (!dateOrMonthStr) return '';
  const parts = dateOrMonthStr.split('-');
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const name = monthNamesList[monthNum - 1] || parts[1];
  return `${name} ${year}`;
}

async function computeUnpaidMonthsRecords({ institute_id, class_batch_id } = {}) {
  let studentQuery = `
    SELECT s.id as student_id,
           s.name as student_name,
           s.roll_number,
           s.institute_id,
           s.class_batch_id,
           cb.name as class_batch_name,
           g.name as guardian_name,
           g.phone as guardian_phone
    FROM students s
    LEFT JOIN classes_batches cb ON s.class_batch_id = cb.id
    LEFT JOIN guardians g ON s.id = g.student_id AND g.is_primary_contact = 1
    WHERE s.status = 'active'
  `;
  const studentParams = [];
  if (institute_id) {
    studentQuery += ` AND s.institute_id = ?`;
    studentParams.push(institute_id);
  }
  if (class_batch_id) {
    studentQuery += ` AND s.class_batch_id = ?`;
    studentParams.push(class_batch_id);
  }
  studentQuery += ` ORDER BY s.name ASC`;

  const students = await all(studentQuery, studentParams);
  if (!students || students.length === 0) return [];

  // Query all fee dues
  let duesQuery = `
    SELECT fd.id as due_id,
           fd.student_id,
           fd.amount,
           fd.due_date,
           fd.status,
           fh.name as fee_head_name,
           COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.fee_due_id = fd.id), 0) as paid_amount
    FROM fee_dues fd
    JOIN students s ON fd.student_id = s.id
    LEFT JOIN fee_heads fh ON fd.fee_head_id = fh.id
    WHERE 1=1
  `;
  const duesParams = [];
  if (institute_id) {
    duesQuery += ` AND s.institute_id = ?`;
    duesParams.push(institute_id);
  }
  if (class_batch_id) {
    duesQuery += ` AND s.class_batch_id = ?`;
    duesParams.push(class_batch_id);
  }
  duesQuery += ` ORDER BY fd.due_date ASC`;

  const allDues = await all(duesQuery, duesParams);

  const duesByStudent = {};
  for (const due of allDues) {
    if (!duesByStudent[due.student_id]) {
      duesByStudent[due.student_id] = [];
    }
    duesByStudent[due.student_id].push(due);
  }

  const records = students.map((s) => {
    const studentDues = duesByStudent[s.student_id] || [];

    // Filter unpaid dues: pending, overdue, or partial with remaining unpaid balance
    const unpaidDues = studentDues.filter((d) => {
      const remaining = Math.max(0, Number(d.amount) - Number(d.paid_amount));
      const isUnpaidStatus = d.status === 'pending' || d.status === 'overdue' || d.status === 'partial';
      return isUnpaidStatus && remaining > 0;
    });

    const monthKeySet = new Set();
    const breakdown = unpaidDues.map((d) => {
      const remaining = Math.max(0, Number(d.amount) - Number(d.paid_amount));
      const monthKey = d.due_date ? d.due_date.substring(0, 7) : '';
      if (monthKey) {
        monthKeySet.add(monthKey);
      }
      return {
        due_id: d.due_id,
        fee_head_name: d.fee_head_name || 'Tuition Fee',
        due_date: d.due_date,
        month: monthKey,
        month_name: formatMonthYear(monthKey),
        amount: Number(d.amount),
        paid_amount: Number(d.paid_amount),
        unpaid_amount: remaining,
        status: d.status
      };
    });

    const sortedMonthKeys = Array.from(monthKeySet).sort();
    const unpaidMonthsList = sortedMonthKeys.map((k) => formatMonthYear(k));
    const totalUnpaidAmount = breakdown.reduce((sum, item) => sum + item.unpaid_amount, 0);

    return {
      student_id: s.student_id,
      student_name: s.student_name,
      roll_number: s.roll_number || '',
      class_batch_name: s.class_batch_name || 'Unassigned',
      guardian_phone: s.guardian_phone || '',
      guardian_name: s.guardian_name || '',
      unpaid_months_count: unpaidMonthsList.length,
      unpaid_months_list: unpaidMonthsList,
      total_unpaid_amount: totalUnpaidAmount,
      breakdown: breakdown
    };
  });

  return records;
}

// GET /api/calendar/current-time
app.get('/api/calendar/current-time', (req, res) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const monthNum = pad(now.getMonth() + 1);
  const dayNum = pad(now.getDate());
  const dateStr = `${year}-${monthNum}-${dayNum}`;
  const monthStr = `${year}-${monthNum}`;
  const dayName = dayNamesList[now.getDay()];
  const monthName = monthNamesList[now.getMonth()];
  const formattedStr = `${dayName}, ${now.getDate()} ${monthName} ${year}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

  res.json({
    iso: now.toISOString(),
    date: dateStr,
    month: monthStr,
    year: year,
    day: now.getDate(),
    formatted: formattedStr,
    timezone: timezone,
    // Supplemental backwards-compatible fields
    timestamp: now.getTime(),
    day_name: dayName,
    month_name: monthName,
    serverTime: now.toISOString(),
    currentDate: dateStr,
    currentMonth: `${monthName} ${year}`,
    monthIndex: now.getMonth()
  });
});

// POST & GET /api/calendar/monthly-reset
const handleMonthlyReset = async (req, res) => {
  try {
    const institute_id = req.body?.institute_id || req.query?.institute_id;
    const force = req.body?.force === true || req.query?.force === 'true' || req.body?.force === 1;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const defaultMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

    let rawMonth = req.body?.month || req.body?.target_month || req.query?.month || req.query?.target_month;
    let targetMonth = defaultMonth;
    if (rawMonth) {
      if (/^\d{4}-\d{2}$/.test(rawMonth)) {
        targetMonth = rawMonth;
      } else {
        const parts = String(rawMonth).trim().split(' ');
        if (parts.length === 2 && monthNamesList.includes(parts[0])) {
          const mIdx = monthNamesList.indexOf(parts[0]) + 1;
          targetMonth = `${parts[1]}-${pad(mIdx)}`;
        }
      }
    }

    const targetDueDate = req.body?.due_date || req.query?.due_date || `${targetMonth}-10`;
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // 1. Mark existing past pending dues as overdue if due_date < today and unpaid
    let overdueMarkedCount = 0;
    try {
      const pastUnpaidDues = await all(
        `SELECT fd.id, fd.amount, COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.fee_due_id = fd.id), 0) as paid_amount
         FROM fee_dues fd
         JOIN students s ON fd.student_id = s.id
         WHERE fd.due_date < ? 
           AND fd.status IN ('pending', 'partial')
           ${institute_id ? 'AND s.institute_id = ?' : ''}`,
        institute_id ? [today, institute_id] : [today]
      );

      for (const due of pastUnpaidDues) {
        if (Number(due.amount) - Number(due.paid_amount) > 0) {
          await run(`UPDATE fee_dues SET status = 'overdue' WHERE id = ?`, [due.id]);
          overdueMarkedCount++;
        }
      }
    } catch (e) {
      console.warn('Overdue status update warning:', e.message);
    }

    // 2. Query active students
    let studentQuery = `SELECT s.id, s.name, s.institute_id, s.class_batch_id FROM students s WHERE s.status = 'active'`;
    let queryParams = [];
    if (institute_id) {
      studentQuery += ` AND s.institute_id = ?`;
      queryParams.push(institute_id);
    }
    const activeStudents = await all(studentQuery, queryParams);

    // 3. For each active student, record/generate monthly tuition dues for targetMonth if not already created
    let createdCount = 0;
    for (const student of activeStudents) {
      const existing = await get(
        `SELECT id FROM fee_dues WHERE student_id = ? AND (due_date LIKE ? OR SUBSTR(due_date, 1, 7) = ?)`,
        [student.id, `${targetMonth}%`, targetMonth]
      );

      if (!existing) {
        let feeHead = null;
        if (student.class_batch_id) {
          feeHead = await get(
            `SELECT * FROM fee_heads 
             WHERE institute_id = ? AND frequency = 'monthly' AND applicable_to = ?
             LIMIT 1`,
            [student.institute_id, student.class_batch_id]
          );
        }
        if (!feeHead) {
          feeHead = await get(
            `SELECT * FROM fee_heads 
             WHERE institute_id = ? AND frequency = 'monthly' AND (applicable_to = 'all' OR applicable_to IS NULL)
             LIMIT 1`,
            [student.institute_id]
          );
        }
        if (!feeHead) {
          feeHead = await get(
            `SELECT * FROM fee_heads WHERE institute_id = ? AND frequency = 'monthly' LIMIT 1`,
            [student.institute_id]
          );
        }

        let feeHeadId = feeHead?.id || null;
        let amount = feeHead?.default_amount ? Number(feeHead.default_amount) : 2500;

        if (!feeHeadId) {
          const prevDue = await get(
            `SELECT fee_head_id, amount FROM fee_dues WHERE student_id = ? ORDER BY due_date DESC LIMIT 1`,
            [student.id]
          );
          if (prevDue) {
            feeHeadId = prevDue.fee_head_id;
            amount = prevDue.amount || 2500;
          } else {
            feeHeadId = `fh_${student.institute_id}_tuition`;
            try {
              await run(
                `INSERT INTO fee_heads (id, institute_id, name, default_amount, frequency, applicable_to)
                 VALUES (?, ?, 'Monthly Tuition Fee', 2500, 'monthly', 'all')`,
                [feeHeadId, student.institute_id]
              );
            } catch (_) {}
          }
        }

        const dueId = `due_${uuidv4()}`;
        await run(
          `INSERT INTO fee_dues (id, student_id, fee_head_id, amount, due_date, status)
           VALUES (?, ?, ?, ?, ?, 'pending')`,
          [dueId, student.id, feeHeadId, amount, targetDueDate]
        );
        createdCount++;
      }
    }

    // 4. Compute record of how many months each student has not paid
    const unpaidRecords = await computeUnpaidMonthsRecords({ institute_id });

    res.json({
      success: true,
      message: `Monthly rollover processed successfully for ${formatMonthYear(targetMonth)}`,
      target_month: targetMonth,
      target_month_name: formatMonthYear(targetMonth),
      current_date: today,
      dues_created: createdCount,
      overdue_marked: overdueMarkedCount,
      total_students: unpaidRecords.length,
      students_with_unpaid_fees: unpaidRecords.filter(r => r.unpaid_months_count > 0).length,
      total_unpaid_amount: unpaidRecords.reduce((sum, r) => sum + r.total_unpaid_amount, 0),
      records: unpaidRecords,
      unpaid_records: unpaidRecords.filter(r => r.unpaid_months_count > 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/calendar/monthly-reset', handleMonthlyReset);
app.get('/api/calendar/monthly-reset', handleMonthlyReset);

// ==========================================
// 0. Authentication & Onboarding Endpoints
// ==========================================

const crypto = require('crypto');
const hashPassword = (pw) => crypto.createHash('sha256').update(pw).digest('hex');

// POST /api/auth/login
// Accepts { email, password }
// Validates against users table
// Returns user info, role, and joined institute info
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await get(
      'SELECT id, name, phone, email, password_hash, created_at FROM users WHERE LOWER(email) = ?',
      [trimmedEmail]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hashedPassword = hashPassword(password);
    // Validate password match
    const isPasswordValid = 
      user.password_hash === hashedPassword ||
      user.password_hash === password;

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch joined institutes and roles
    const memberships = await all(
      `SELECT im.id as membership_id, im.role, im.status,
              i.id as institute_id, i.name as institute_name, i.type as institute_type,
              i.city, i.upi_id, i.upi_name
       FROM institute_members im
       JOIN institutes i ON im.institute_id = i.id
       WHERE im.user_id = ?`,
      [user.id]
    );

    const primaryMembership = memberships[0] || null;
    const token = `token_${Buffer.from(`${user.id}:${Date.now()}`).toString('base64')}`;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: primaryMembership ? primaryMembership.role : 'owner',
        created_at: user.created_at
      },
      institute: primaryMembership ? {
        id: primaryMembership.institute_id,
        name: primaryMembership.institute_name,
        type: primaryMembership.institute_type,
        city: primaryMembership.city,
        upi_id: primaryMembership.upi_id,
        upi_name: primaryMembership.upi_name,
        role: primaryMembership.role
      } : null,
      memberships
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
// Accepts { name, email, phone, password }
// Creates a new user record in users (id = user_${Date.now()})
// Returns user object with token/session info
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await get('SELECT id FROM users WHERE LOWER(email) = ?', [trimmedEmail]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userId = `user_${Date.now()}`;
    const passwordHash = hashPassword(password);

    await run(
      `INSERT INTO users (id, name, phone, email, password_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name.trim(), phone ? phone.trim() : null, trimmedEmail, passwordHash]
    );

    const createdUser = await get(
      'SELECT id, name, phone, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    const token = `token_${Buffer.from(`${userId}:${Date.now()}`).toString('base64')}`;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        ...createdUser,
        role: 'owner'
      },
      institute: null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/onboarding
// Accepts { userId, instituteName, instituteType, city, upiId, upiName, initialBatches }
// 1. Creates new institute in institutes with unique id (inst_${Date.now()})
// 2. Creates institute_members record linking user to institute with role 'owner'
// 3. Creates standard initial classes/batches for this institute
// 4. Creates default fee heads (Tuition Fee, Admission Fee) for this institute
// 5. Returns the created institute and classes
app.post('/api/auth/onboarding', async (req, res) => {
  try {
    const {
      userId,
      instituteName,
      instituteType = 'coaching_center',
      city,
      upiId,
      upiName,
      initialBatches
    } = req.body;

    if (!userId || !instituteName) {
      return res.status(400).json({ error: 'userId and instituteName are required' });
    }

    const validTypes = ['school', 'coaching_center', 'tutor'];
    const resolvedType = validTypes.includes(instituteType) ? instituteType : 'coaching_center';

    const user = await get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const instituteId = `inst_${Date.now()}`;
    await run(
      `INSERT INTO institutes (id, name, type, city, upi_id, upi_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [instituteId, instituteName.trim(), resolvedType, city ? city.trim() : null, upiId ? upiId.trim() : null, upiName ? upiName.trim() : null]
    );

    // Link user to institute as owner
    const memberId = `member_${uuidv4()}`;
    await run(
      `INSERT INTO institute_members (id, institute_id, user_id, role, status)
       VALUES (?, ?, ?, 'owner', 'active')`,
      [memberId, instituteId, userId]
    );

    // Determine initial batches/classes
    let batchNames = [];
    if (Array.isArray(initialBatches) && initialBatches.length > 0) {
      batchNames = initialBatches
        .map(b => (typeof b === 'string' ? b.trim() : (b.name || '').trim()))
        .filter(Boolean);
    } else if (typeof initialBatches === 'string' && initialBatches.trim().length > 0) {
      batchNames = initialBatches.split(',').map(b => b.trim()).filter(Boolean);
    }

    // Default classes/batches based on instituteType if none provided
    if (batchNames.length === 0) {
      if (resolvedType === 'school') {
        batchNames = ['Class 1st', 'Class 5th', 'Class 8th', 'Class 10th'];
      } else if (resolvedType === 'tutor') {
        batchNames = ['Morning Batch', 'Evening Batch'];
      } else {
        batchNames = ['Class 9th Foundation', 'Class 10th Board Booster', 'Class 11th - Batch A', 'Class 12th JEE / NEET'];
      }
    }

    const createdClasses = [];
    const currentYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    for (let i = 0; i < batchNames.length; i++) {
      const bName = batchNames[i];
      const batchId = `cb_${Date.now()}_${i + 1}`;
      await run(
        `INSERT INTO classes_batches (id, institute_id, name, type, academic_year)
         VALUES (?, ?, ?, 'batch', ?)`,
        [batchId, instituteId, bName, currentYear]
      );
      createdClasses.push({
        id: batchId,
        institute_id: instituteId,
        name: bName,
        type: 'batch',
        academic_year: currentYear
      });
    }

    // Create default fee heads (Tuition Fee, Admission Fee)
    const tuitionFeeHeadId = `fh_${Date.now()}_tuition`;
    const admissionFeeHeadId = `fh_${Date.now()}_admission`;
    await run(
      `INSERT INTO fee_heads (id, institute_id, name, default_amount, frequency, applicable_to)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tuitionFeeHeadId, instituteId, 'Monthly Tuition Fee', 2000, 'monthly', 'all']
    );
    await run(
      `INSERT INTO fee_heads (id, institute_id, name, default_amount, frequency, applicable_to)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [admissionFeeHeadId, instituteId, 'Admission / Registration Fee', 1000, 'one-time', 'all']
    );

    const feeHeads = await all('SELECT * FROM fee_heads WHERE institute_id = ?', [instituteId]);
    const createdInstitute = await get('SELECT * FROM institutes WHERE id = ?', [instituteId]);

    res.status(201).json({
      message: 'Onboarding completed successfully',
      institute: createdInstitute,
      classes: createdClasses,
      fee_heads: feeHeads,
      membership: {
        id: memberId,
        user_id: userId,
        institute_id: instituteId,
        role: 'owner'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. Institutes Endpoints
// ==========================================

// GET /api/institutes/:id (settings, UPI ID, institute_type, attendance_enabled)
app.get('/api/institutes/:id', async (req, res) => {
  try {
    const institute = await get('SELECT * FROM institutes WHERE id = ?', [req.params.id]);
    if (!institute) {
      return res.status(404).json({ error: 'Institute not found' });
    }
    const attendanceEnabled = institute.attendance_enabled !== null && institute.attendance_enabled !== undefined
      ? Number(institute.attendance_enabled)
      : 1;

    res.json({
      ...institute,
      attendance_enabled: attendanceEnabled,
      enable_attendance: Boolean(attendanceEnabled)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/institutes/:id (update settings, UPI ID, institute_type, attendance_enabled, etc.)
app.put('/api/institutes/:id', async (req, res) => {
  try {
    const { name, type, city, upi_id, upi_name, attendance_enabled, enable_attendance } = req.body;
    const existing = await get('SELECT * FROM institutes WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Institute not found' });
    }

    const rawAttendance = attendance_enabled !== undefined ? attendance_enabled : enable_attendance;
    let attendanceVal = null;
    if (rawAttendance !== undefined) {
      attendanceVal = (rawAttendance === true || rawAttendance === 1 || rawAttendance === '1' || rawAttendance === 'true') ? 1 : 0;
    }

    try {
      await run(
        `UPDATE institutes 
         SET name = COALESCE(?, name),
             type = COALESCE(?, type),
             city = COALESCE(?, city),
             upi_id = COALESCE(?, upi_id),
             upi_name = COALESCE(?, upi_name),
             attendance_enabled = COALESCE(?, attendance_enabled)
         WHERE id = ?`,
        [name, type, city, upi_id, upi_name, attendanceVal, req.params.id]
      );
    } catch (colErr) {
      await run(
        `UPDATE institutes 
         SET name = COALESCE(?, name),
             type = COALESCE(?, type),
             city = COALESCE(?, city),
             upi_id = COALESCE(?, upi_id),
             upi_name = COALESCE(?, upi_name)
         WHERE id = ?`,
        [name, type, city, upi_id, upi_name, req.params.id]
      );
    }

    const updated = await get('SELECT * FROM institutes WHERE id = ?', [req.params.id]);
    const attendanceEnabled = updated.attendance_enabled !== null && updated.attendance_enabled !== undefined
      ? Number(updated.attendance_enabled)
      : 1;

    res.json({
      ...updated,
      attendance_enabled: attendanceEnabled,
      enable_attendance: Boolean(attendanceEnabled)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/institutes/:id/dashboard (collected vs due this month, attendance rate today, defaulters count, attendance_enabled)
app.get('/api/institutes/:id/dashboard', async (req, res) => {
  try {
    const instituteId = req.params.id;
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7); // YYYY-MM

    // 1. Fee collected this month
    const collectedRow = await get(
      `SELECT COALESCE(SUM(p.amount), 0) AS total_collected
       FROM payments p
       JOIN fee_dues fd ON p.fee_due_id = fd.id
       JOIN students s ON fd.student_id = s.id
       WHERE s.institute_id = ? AND strftime('%Y-%m', p.paid_at) = ?`,
      [instituteId, currentMonth]
    );

    // 2. Fee due this month
    const dueRow = await get(
      `SELECT COALESCE(SUM(fd.amount), 0) AS total_due
       FROM fee_dues fd
       JOIN students s ON fd.student_id = s.id
       WHERE s.institute_id = ? AND strftime('%Y-%m', fd.due_date) = ?`,
      [instituteId, currentMonth]
    );

    // 3. Fee defaulters count (overdue dues or pending past due date)
    const defaultersRow = await get(
      `SELECT COUNT(DISTINCT fd.student_id) AS defaulter_count
       FROM fee_dues fd
       JOIN students s ON fd.student_id = s.id
       WHERE s.institute_id = ? 
         AND (fd.status = 'overdue' OR (fd.status IN ('pending', 'partial') AND fd.due_date < ?))`,
      [instituteId, today]
    );

    // 4. Attendance rate today
    const attendanceRow = await get(
      `SELECT 
         COUNT(*) as total_records,
         SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count
       FROM attendance_records ar
       JOIN students s ON ar.student_id = s.id
       WHERE s.institute_id = ? AND ar.date = ?`,
      [instituteId, today]
    );

    const totalStudentsRow = await get(
      `SELECT COUNT(*) as total_students FROM students WHERE institute_id = ? AND status = 'active'`,
      [instituteId]
    );

    const instRow = await get(
      `SELECT attendance_enabled FROM institutes WHERE id = ?`,
      [instituteId]
    );
    const attendanceEnabled = instRow && instRow.attendance_enabled !== null && instRow.attendance_enabled !== undefined
      ? Number(instRow.attendance_enabled)
      : 1;

    const totalAttendanceMarked = attendanceRow?.total_records || 0;
    const presentCount = attendanceRow?.present_count || 0;
    const attendanceRate = totalAttendanceMarked > 0 
      ? Math.round((presentCount / totalAttendanceMarked) * 100) 
      : 0;

    res.json({
      collected_this_month: collectedRow?.total_collected || 0,
      due_this_month: dueRow?.total_due || 0,
      defaulter_count: defaultersRow?.defaulter_count || 0,
      attendance_rate_today: attendanceRate,
      attendance_marked_today: totalAttendanceMarked,
      present_today: presentCount,
      total_active_students: totalStudentsRow?.total_students || 0,
      attendance_enabled: attendanceEnabled,
      enable_attendance: Boolean(attendanceEnabled)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. Classes & Batches Endpoints
// ==========================================

// GET /api/classes-batches (filter by institute_id)
app.get('/api/classes-batches', async (req, res) => {
  try {
    const { institute_id } = req.query;
    let query = `
      SELECT cb.*, 
             (SELECT COUNT(*) FROM students s WHERE s.class_batch_id = cb.id AND s.status = 'active') as active_student_count
      FROM classes_batches cb
    `;
    const params = [];

    if (institute_id) {
      query += ' WHERE cb.institute_id = ?';
      params.push(institute_id);
    }
    query += ' ORDER BY cb.name ASC';

    const classes = await all(query, params);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/classes-batches
app.post('/api/classes-batches', async (req, res) => {
  try {
    const { institute_id, name, type, academic_year } = req.body;
    if (!institute_id || !name || !type) {
      return res.status(400).json({ error: 'institute_id, name, and type are required' });
    }

    const id = `cb_${uuidv4()}`;
    await run(
      `INSERT INTO classes_batches (id, institute_id, name, type, academic_year)
       VALUES (?, ?, ?, ?, ?)`,
      [id, institute_id, name, type, academic_year || null]
    );

    const created = await get('SELECT * FROM classes_batches WHERE id = ?', [id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. Students Endpoints
// ==========================================

// GET /api/students (filter by institute_id, class_batch_id, search query)
app.get('/api/students', async (req, res) => {
  try {
    const { institute_id, class_batch_id, search, status } = req.query;
    let query = `
      SELECT s.*, 
             cb.name as class_batch_name,
             g.name as guardian_name,
             g.phone as guardian_phone,
             g.relation as guardian_relation
      FROM students s
      LEFT JOIN classes_batches cb ON s.class_batch_id = cb.id
      LEFT JOIN guardians g ON s.id = g.student_id AND g.is_primary_contact = 1
      WHERE 1=1
    `;
    const params = [];

    if (institute_id) {
      query += ' AND s.institute_id = ?';
      params.push(institute_id);
    }

    if (class_batch_id) {
      query += ' AND s.class_batch_id = ?';
      params.push(class_batch_id);
    }

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (s.name LIKE ? OR s.roll_number LIKE ? OR g.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.name ASC';

    const students = await all(query, params);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students
app.post('/api/students', async (req, res) => {
  try {
    const {
      institute_id,
      class_batch_id,
      name,
      roll_number,
      photo_url,
      dob,
      admission_date,
      status,
      guardian_name,
      guardian_phone,
      guardian_relation
    } = req.body;

    if (!institute_id || !name) {
      return res.status(400).json({ error: 'institute_id and name are required' });
    }

    const studentId = `std_${uuidv4()}`;
    await run(
      `INSERT INTO students (id, institute_id, class_batch_id, name, roll_number, photo_url, dob, admission_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        institute_id,
        class_batch_id || null,
        name,
        roll_number || null,
        photo_url || null,
        dob || null,
        admission_date || new Date().toISOString().slice(0, 10),
        status || 'active'
      ]
    );

    if (guardian_name && guardian_phone) {
      await run(
        `INSERT INTO guardians (id, student_id, name, phone, relation, is_primary_contact)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), studentId, guardian_name, guardian_phone, guardian_relation || 'Parent', 1]
      );
    }

    const created = await get(
      `SELECT s.*, 
              cb.name as class_batch_name,
              g.name as guardian_name,
              g.phone as guardian_phone
       FROM students s
       LEFT JOIN classes_batches cb ON s.class_batch_id = cb.id
       LEFT JOIN guardians g ON s.id = g.student_id AND g.is_primary_contact = 1
       WHERE s.id = ?`,
      [studentId]
    );

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/bulk-import (CSV parsing with auto guardian creation)
app.post('/api/students/bulk-import', upload.single('file'), async (req, res) => {
  try {
    const institute_id = req.body.institute_id;
    if (!institute_id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'institute_id is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          fs.unlinkSync(req.file.path); // Clean up uploaded file
          const imported = [];
          const errors = [];

          for (let index = 0; index < results.length; index++) {
            const row = results[index];
            const name = row.name || row.Name || row['Student Name'];
            if (!name) {
              errors.push({ row: index + 1, error: 'Student name missing' });
              continue;
            }

            const roll_number = row.roll_number || row.RollNumber || row.Roll || null;
            const class_batch_id = row.class_batch_id || req.body.default_class_batch_id || null;
            const dob = row.dob || row.DOB || null;
            const admission_date = row.admission_date || new Date().toISOString().slice(0, 10);
            const guardian_name = row.guardian_name || row['Guardian Name'] || row.parent_name || null;
            const guardian_phone = row.guardian_phone || row['Guardian Phone'] || row.phone || null;
            const guardian_relation = row.guardian_relation || row['Relation'] || 'Parent';

            const studentId = `std_${uuidv4()}`;

            await run(
              `INSERT INTO students (id, institute_id, class_batch_id, name, roll_number, dob, admission_date, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [studentId, institute_id, class_batch_id, name, roll_number, dob, admission_date, 'active']
            );

            if (guardian_name || guardian_phone) {
              await run(
                `INSERT INTO guardians (id, student_id, name, phone, relation, is_primary_contact)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [uuidv4(), studentId, guardian_name || 'Guardian', guardian_phone || '', guardian_relation, 1]
              );
            }

            imported.push({ id: studentId, name, roll_number });
          }

          res.json({
            message: `Successfully processed ${results.length} rows`,
            imported_count: imported.length,
            error_count: errors.length,
            imported,
            errors
          });
        } catch (innerErr) {
          res.status(500).json({ error: innerErr.message });
        }
      })
      .on('error', (csvErr) => {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: 'Failed to parse CSV file: ' + csvErr.message });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. Fee Dues & Payments Endpoints
// ==========================================

// GET /api/fee-dues (filter by institute_id, status: pending/overdue/paid/partial, student_id, class_batch_id)
app.get('/api/fee-dues', async (req, res) => {
  try {
    const { institute_id, status, student_id, class_batch_id } = req.query;
    let query = `
      SELECT fd.*, 
             s.name as student_name,
             s.roll_number as student_roll,
             s.class_batch_id,
             cb.name as class_batch_name,
             fh.name as fee_head_name,
             g.name as guardian_name,
             g.phone as guardian_phone,
             COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.fee_due_id = fd.id), 0) as paid_amount,
             (SELECT p.paid_at FROM payments p WHERE p.fee_due_id = fd.id ORDER BY p.paid_at DESC LIMIT 1) as last_payment_date
      FROM fee_dues fd
      JOIN students s ON fd.student_id = s.id
      LEFT JOIN classes_batches cb ON s.class_batch_id = cb.id
      LEFT JOIN fee_heads fh ON fd.fee_head_id = fh.id
      LEFT JOIN guardians g ON s.id = g.student_id AND g.is_primary_contact = 1
      WHERE 1=1
    `;
    const params = [];

    if (institute_id) {
      query += ' AND s.institute_id = ?';
      params.push(institute_id);
    }

    if (status) {
      query += ' AND fd.status = ?';
      params.push(status);
    }

    if (student_id) {
      query += ' AND fd.student_id = ?';
      params.push(student_id);
    }

    if (class_batch_id) {
      query += ' AND s.class_batch_id = ?';
      params.push(class_batch_id);
    }

    query += ' ORDER BY fd.due_date ASC';

    const dues = await all(query, params);
    
    // Add computed remaining balance
    const enrichedDues = dues.map((due) => ({
      ...due,
      remaining_amount: Math.max(0, due.amount - due.paid_amount)
    }));

    res.json(enrichedDues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fee-dues (create fee due)
app.post('/api/fee-dues', async (req, res) => {
  try {
    const { student_id, fee_head_id, amount, due_date, status } = req.body;
    if (!student_id || amount === undefined || !due_date) {
      return res.status(400).json({ error: 'student_id, amount, and due_date are required' });
    }

    const id = `due_${uuidv4()}`;
    await run(
      `INSERT INTO fee_dues (id, student_id, fee_head_id, amount, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, student_id, fee_head_id || null, amount, due_date, status || 'pending']
    );

    const created = await get('SELECT * FROM fee_dues WHERE id = ?', [id]);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fee-dues/:id/payments (record payment, update due status to paid/partial)
app.post('/api/fee-dues/:id/payments', async (req, res) => {
  try {
    const fee_due_id = req.params.id;
    const { amount, method, reference_id, recorded_by } = req.body;

    if (amount === undefined || !method) {
      return res.status(400).json({ error: 'amount and method are required' });
    }

    const feeDue = await get('SELECT * FROM fee_dues WHERE id = ?', [fee_due_id]);
    if (!feeDue) {
      return res.status(404).json({ error: 'Fee due record not found' });
    }

    const paymentId = `pay_${uuidv4()}`;
    await run(
      `INSERT INTO payments (id, fee_due_id, amount, method, reference_id, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, fee_due_id, amount, method, reference_id || null, recorded_by || 'Admin']
    );

    // Calculate total payments so far
    const totalPaidRow = await get(
      `SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE fee_due_id = ?`,
      [fee_due_id]
    );
    const totalPaid = totalPaidRow?.total_paid || 0;

    let newStatus = 'partial';
    if (totalPaid >= feeDue.amount) {
      newStatus = 'paid';
    } else if (totalPaid === 0) {
      newStatus = feeDue.status;
    }

    await run('UPDATE fee_dues SET status = ? WHERE id = ?', [newStatus, fee_due_id]);

    const updatedDue = await get('SELECT * FROM fee_dues WHERE id = ?', [fee_due_id]);
    const recordedPayment = await get('SELECT * FROM payments WHERE id = ?', [paymentId]);

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: recordedPayment,
      fee_due: {
        ...updatedDue,
        total_paid: totalPaid,
        balance_due: Math.max(0, updatedDue.amount - totalPaid)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fee-dues/:id/remind (log WhatsApp reminder event & return formatted wa.me message link with dynamic UPI deep link)
app.post('/api/fee-dues/:id/remind', async (req, res) => {
  try {
    const fee_due_id = req.params.id;

    const dueInfo = await get(
      `SELECT fd.*, 
              s.name as student_name,
              i.id as institute_id,
              i.name as institute_name,
              i.upi_id,
              i.upi_name,
              g.name as guardian_name,
              g.phone as guardian_phone,
              COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.fee_due_id = fd.id), 0) as paid_amount
       FROM fee_dues fd
       JOIN students s ON fd.student_id = s.id
       JOIN institutes i ON s.institute_id = i.id
       LEFT JOIN guardians g ON s.id = g.student_id AND g.is_primary_contact = 1
       WHERE fd.id = ?`,
      [fee_due_id]
    );

    if (!dueInfo) {
      return res.status(404).json({ error: 'Fee due record not found' });
    }

    const remainingAmount = Math.max(0, dueInfo.amount - dueInfo.paid_amount);
    const upiId = dueInfo.upi_id || 'payment@upi';
    const upiName = dueInfo.upi_name || dueInfo.institute_name;
    const refId = `DUE-${dueInfo.id.slice(0, 8)}`;

    // Build standard NPCI UPI Deep Link
    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${remainingAmount}&tr=${refId}&cu=INR&tn=${encodeURIComponent(`Fee for ${dueInfo.student_name}`)}`;
    
    // Direct QR Code image URL for exact amount
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiDeepLink)}`;

    // Construct WhatsApp message text
    const messageText = 
`Dear ${dueInfo.guardian_name || 'Parent'},
This is a gentle reminder from ${dueInfo.institute_name} regarding the pending fee of ₹${remainingAmount} for ${dueInfo.student_name}.
Due Date: ${dueInfo.due_date}

🔗 Pay via UPI App (GPay / PhonePe / Paytm):
${upiDeepLink}

UPI ID: ${upiId} (${upiName})
Amount: ₹${remainingAmount}
Thank you!`;

    // Normalize phone number for wa.me link
    let phone = (dueInfo.guardian_phone || '').replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = '91' + phone;
    }

    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

    // Log reminder in database
    const reminderId = `rem_${uuidv4()}`;
    await run(
      `INSERT INTO reminder_log (id, fee_due_id, channel, status)
       VALUES (?, ?, 'whatsapp', 'sent')`,
      [reminderId, fee_due_id]
    );

    res.json({
      success: true,
      reminder_id: reminderId,
      guardian_phone: dueInfo.guardian_phone,
      remaining_amount: remainingAmount,
      upi_deep_link: upiDeepLink,
      qr_image_url: qrImageUrl,
      whatsapp_url: waLink,
      message_text: messageText
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. Attendance Endpoints
// ==========================================

// POST /api/attendance (bulk mark attendance for a class/batch & date)
app.post('/api/attendance', async (req, res) => {
  try {
    const { class_batch_id, date, records, marked_by } = req.body;
    // records: Array of { student_id, status: 'present' | 'absent' | 'late' }

    if (!class_batch_id || !date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'class_batch_id, date, and records array are required' });
    }

    const markedRecords = [];

    for (const record of records) {
      const { student_id, status } = record;
      if (!student_id || !status) continue;

      const recordId = `att_${uuidv4()}`;
      await run(
        `INSERT INTO attendance_records (id, student_id, class_batch_id, date, status, marked_by)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(student_id, date) DO UPDATE SET 
           status = excluded.status,
           marked_by = excluded.marked_by,
           created_at = CURRENT_TIMESTAMP`,
        [recordId, student_id, class_batch_id, date, status, marked_by || 'Staff']
      );
      markedRecords.push({ student_id, status });
    }

    res.json({
      message: `Successfully recorded attendance for ${markedRecords.length} students`,
      date,
      class_batch_id,
      count: markedRecords.length,
      records: markedRecords
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance (fetch attendance records by date & class_batch_id)
app.get('/api/attendance', async (req, res) => {
  try {
    const { date, class_batch_id, institute_id } = req.query;

    let query = `
      SELECT ar.*,
             s.name as student_name,
             s.roll_number,
             cb.name as class_batch_name
      FROM attendance_records ar
      JOIN students s ON ar.student_id = s.id
      JOIN classes_batches cb ON ar.class_batch_id = cb.id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ' AND ar.date = ?';
      params.push(date);
    }

    if (class_batch_id) {
      query += ' AND ar.class_batch_id = ?';
      params.push(class_batch_id);
    }

    if (institute_id) {
      query += ' AND s.institute_id = ?';
      params.push(institute_id);
    }

    query += ' ORDER BY s.name ASC';

    const records = await all(query, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id/attendance (per-student history & percentage)
app.get('/api/students/:id/attendance', async (req, res) => {
  try {
    const student_id = req.params.id;

    const student = await get('SELECT * FROM students WHERE id = ?', [student_id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const history = await all(
      `SELECT * FROM attendance_records 
       WHERE student_id = ? 
       ORDER BY date DESC`,
      [student_id]
    );

    const stats = await get(
      `SELECT 
         COUNT(*) as total_days,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
         SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
         SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
       FROM attendance_records
       WHERE student_id = ?`,
      [student_id]
    );

    const totalDays = stats?.total_days || 0;
    const presentDays = stats?.present_days || 0;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({
      student_id,
      student_name: student.name,
      total_days: totalDays,
      present_days: presentDays,
      absent_days: stats?.absent_days || 0,
      late_days: stats?.late_days || 0,
      attendance_percentage: percentage,
      history
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. Reports Endpoints
// ==========================================

// GET /api/reports/defaulters (exportable fee defaulters list)
app.get('/api/reports/defaulters', async (req, res) => {
  try {
    const { institute_id, class_batch_id, format } = req.query;
    const today = new Date().toISOString().slice(0, 10);

    let query = `
      SELECT fd.id as due_id,
             fd.amount as due_amount,
             fd.due_date,
             fd.status as due_status,
             s.id as student_id,
             s.name as student_name,
             s.roll_number,
             cb.id as class_batch_id,
             cb.name as class_batch_name,
             fh.name as fee_head_name,
             g.name as guardian_name,
             g.phone as guardian_phone,
             COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.fee_due_id = fd.id), 0) as paid_amount
      FROM fee_dues fd
      JOIN students s ON fd.student_id = s.id
      LEFT JOIN classes_batches cb ON s.class_batch_id = cb.id
      LEFT JOIN fee_heads fh ON fd.fee_head_id = fh.id
      LEFT JOIN guardians g ON s.id = g.student_id AND g.is_primary_contact = 1
      WHERE (fd.status = 'overdue' OR (fd.status IN ('pending', 'partial') AND fd.due_date < ?))
    `;
    const params = [today];

    if (institute_id) {
      query += ' AND s.institute_id = ?';
      params.push(institute_id);
    }

    if (class_batch_id) {
      query += ' AND s.class_batch_id = ?';
      params.push(class_batch_id);
    }

    query += ' ORDER BY fd.due_date ASC';

    const defaulters = await all(query, params);

    const enriched = defaulters.map((item) => ({
      ...item,
      pending_balance: item.due_amount - item.paid_amount,
      days_overdue: Math.max(0, Math.floor((new Date(today) - new Date(item.due_date)) / (1000 * 60 * 60 * 24)))
    }));

    // CSV format export support
    if (format === 'csv') {
      let csvContent = 'Student Name,Roll Number,Batch,Fee Head,Due Amount,Paid Amount,Pending Balance,Due Date,Days Overdue,Guardian Name,Guardian Phone\n';
      for (const d of enriched) {
        csvContent += `"${d.student_name}","${d.roll_number || ''}","${d.class_batch_name || ''}","${d.fee_head_name || ''}",${d.due_amount},${d.paid_amount},${d.pending_balance},"${d.due_date}",${d.days_overdue},"${d.guardian_name || ''}","${d.guardian_phone || ''}"\n`;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="fee_defaulters.csv"');
      return res.send(csvContent);
    }

    res.json({
      total_defaulters: enriched.length,
      total_overdue_amount: enriched.reduce((sum, item) => sum + item.pending_balance, 0),
      defaulters: enriched
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/unpaid-months-record (detailed record for all students of unpaid months)
app.get('/api/reports/unpaid-months-record', async (req, res) => {
  try {
    const { institute_id, class_batch_id, format, only_unpaid, min_unpaid_months } = req.query;

    let records = await computeUnpaidMonthsRecords({ institute_id, class_batch_id });

    if (only_unpaid === 'true' || only_unpaid === '1') {
      records = records.filter((r) => r.unpaid_months_count > 0);
    }
    if (min_unpaid_months) {
      const minMonths = parseInt(min_unpaid_months, 10);
      if (!isNaN(minMonths)) {
        records = records.filter((r) => r.unpaid_months_count >= minMonths);
      }
    }

    // CSV format export support
    if (format === 'csv') {
      let csvContent = 'Student ID,Student Name,Roll Number,Class/Batch,Guardian Name,Guardian Phone,Unpaid Months Count,Unpaid Months,Total Unpaid Amount\n';
      for (const r of records) {
        const monthsStr = (r.unpaid_months_list || []).join('; ');
        csvContent += `"${r.student_id}","${r.student_name}","${r.roll_number}","${r.class_batch_name}","${r.guardian_name}","${r.guardian_phone}",${r.unpaid_months_count},"${monthsStr}",${r.total_unpaid_amount}\n`;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="unpaid_months_record.csv"');
      return res.send(csvContent);
    }

    if (format === 'object' || format === 'summary') {
      return res.json({
        total_students: records.length,
        students_with_unpaid_fees: records.filter((r) => r.unpaid_months_count > 0).length,
        total_unpaid_amount: records.reduce((sum, r) => sum + r.total_unpaid_amount, 0),
        records: records,
        students: records
      });
    }

    // Returns array of student records with:
    // student_id, student_name, roll_number, class_batch_name, guardian_phone, guardian_name,
    // unpaid_months_count, unpaid_months_list, total_unpaid_amount, breakdown
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
if (require.main === module) {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`EduManage Server listening on port ${PORT}`);
    });
  });
}

module.exports = app;
