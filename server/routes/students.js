import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all student routes
router.use(requireAuth);

/**
 * Helper to validate and normalize Indian mobile phone numbers.
 * Strictly validates 10 digits starting with 6-9.
 * Accepts prefixes: +91, 91, 0, or plain 10 digits.
 * Returns normalized E.164 string (+91XXXXXXXXXX) or null if invalid.
 */
function validateAndNormalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;

  let cleaned = phone.trim().replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  return null;
}

/**
 * Determine fee status based on due date.
 * If due date has passed (yesterday or earlier) and not paid, it's overdue.
 */
function calculateFeeStatus(dueDate, status = 'pending') {
  if (status === 'paid') return 'paid';
  if (!dueDate) return status;

  const todayStr = new Date().toISOString().split('T')[0];
  if (dueDate < todayStr) {
    return 'overdue';
  }
  return 'pending';
}

/**
 * GET /api/students
 * List all students for the logged-in admin's tenant.
 * Sorted by urgency: most overdue first, then upcoming dues, then paid.
 */
router.get('/', (req, res) => {
  try {
    const db = getDb();

    // Fetch all students and their latest fee record for this tenant
    const rawStudents = db.prepare(`
      SELECT 
        s.id,
        s.name,
        s.parent_phone,
        s.note,
        s.created_at,
        s.updated_at,
        f.id AS fee_id,
        f.amount,
        f.due_date,
        f.status AS fee_status,
        f.paid_at
      FROM students s
      LEFT JOIN fees f ON f.id = (
        SELECT id FROM fees 
        WHERE student_id = s.id AND tenant_id = s.tenant_id 
        ORDER BY created_at DESC LIMIT 1
      )
      WHERE s.tenant_id = ?
    `).all(req.tenantId);

    // Enrich and calculate dynamic status
    const enriched = rawStudents.map((row) => {
      const activeStatus = row.fee_status 
        ? calculateFeeStatus(row.due_date, row.fee_status) 
        : null;

      return {
        id: row.id,
        name: row.name,
        parent_phone: row.parent_phone,
        note: row.note,
        created_at: row.created_at,
        updated_at: row.updated_at,
        fee: row.fee_id ? {
          id: row.fee_id,
          amount: row.amount,
          due_date: row.due_date,
          status: activeStatus,
          paid_at: row.paid_at,
        } : null,
      };
    });

    // Sort by Urgency:
    // 1. Overdue (due_date ASC -> oldest overdue first)
    // 2. Pending (due_date ASC -> soonest due first)
    // 3. Paid or No fee (created_at DESC)
    enriched.sort((a, b) => {
      const statusRank = (item) => {
        if (!item.fee) return 4;
        if (item.fee.status === 'overdue') return 1;
        if (item.fee.status === 'pending') return 2;
        if (item.fee.status === 'paid') return 3;
        return 4;
      };

      const rankA = statusRank(a);
      const rankB = statusRank(b);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // If both are overdue or pending, sort by due_date ascending
      if (rankA === 1 || rankA === 2) {
        return (a.fee?.due_date || '').localeCompare(b.fee?.due_date || '');
      }

      // Otherwise sort by created_at descending
      return b.created_at.localeCompare(a.created_at);
    });

    // Summary calculations
    let totalDueAmount = 0;
    let overdueCount = 0;
    let pendingCount = 0;
    let paidCount = 0;

    enriched.forEach((s) => {
      if (s.fee) {
        if (s.fee.status === 'overdue') {
          overdueCount++;
          totalDueAmount += s.fee.amount;
        } else if (s.fee.status === 'pending') {
          pendingCount++;
          totalDueAmount += s.fee.amount;
        } else if (s.fee.status === 'paid') {
          paidCount++;
        }
      }
    });

    res.json({
      students: enriched,
      summary: {
        totalStudents: enriched.length,
        overdueCount,
        pendingCount,
        paidCount,
        totalDueAmount,
      },
    });
  } catch (err) {
    console.error('GET /api/students error:', err);
    res.status(500).json({ error: 'Failed to load dues dashboard.' });
  }
});

/**
 * POST /api/students
 * Add a new student and create their initial fee obligation in a single transaction.
 */
router.post('/', (req, res) => {
  try {
    const { name, parentPhone, amount, dueDate, note } = req.body;
    const errors = {};

    if (!name?.trim()) {
      errors.name = 'Student name is required.';
    }

    const normalizedPhone = validateAndNormalizePhone(parentPhone);
    if (!parentPhone?.trim()) {
      errors.parentPhone = 'Parent WhatsApp number is required.';
    } else if (!normalizedPhone) {
      errors.parentPhone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    const parsedAmount = parseFloat(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = 'Fee amount must be a number greater than 0.';
    }

    if (!dueDate?.trim()) {
      errors.dueDate = 'Due date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      errors.dueDate = 'Please provide a valid due date (YYYY-MM-DD).';
    } else {
      const [year, month, day] = dueDate.trim().split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
      ) {
        errors.dueDate = 'Please provide a valid calendar due date (YYYY-MM-DD).';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed.', errors });
    }

    const db = getDb();
    const studentId = uuidv4();
    const feeId = uuidv4();
    const trimmedName = name.trim();
    const trimmedDueDate = dueDate.trim();
    const trimmedNote = note?.trim() || null;
    const initialStatus = calculateFeeStatus(trimmedDueDate, 'pending');

    const insertStudent = db.prepare(`
      INSERT INTO students (id, tenant_id, name, parent_phone, note)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertFee = db.prepare(`
      INSERT INTO fees (id, tenant_id, student_id, amount, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const createStudentWithFee = db.transaction(() => {
      insertStudent.run(studentId, req.tenantId, trimmedName, normalizedPhone, trimmedNote);
      insertFee.run(feeId, req.tenantId, studentId, parsedAmount, trimmedDueDate, initialStatus);
    });

    createStudentWithFee();

    res.status(201).json({
      student: {
        id: studentId,
        tenant_id: req.tenantId,
        name: trimmedName,
        parent_phone: normalizedPhone,
        note: trimmedNote,
      },
      fee: {
        id: feeId,
        student_id: studentId,
        amount: parsedAmount,
        due_date: trimmedDueDate,
        status: initialStatus,
      },
    });
  } catch (err) {
    console.error('POST /api/students error:', err);
    res.status(500).json({ error: 'Failed to create student record.' });
  }
});

/**
 * GET /api/students/:id
 * Retrieve a student's full detail, fee records, and reminder history.
 */
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const student = db.prepare(`
      SELECT id, tenant_id, name, parent_phone, note, created_at, updated_at
      FROM students
      WHERE id = ? AND tenant_id = ?
    `).get(req.params.id, req.tenantId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const fees = db.prepare(`
      SELECT id, student_id, amount, due_date, status, paid_at, created_at, updated_at
      FROM fees
      WHERE student_id = ? AND tenant_id = ?
      ORDER BY due_date DESC, created_at DESC
    `).all(student.id, req.tenantId);

    const enrichedFees = fees.map((fee) => ({
      ...fee,
      status: calculateFeeStatus(fee.due_date, fee.status),
    }));

    const reminders = db.prepare(`
      SELECT r.id, r.fee_id, r.sent_at
      FROM reminders r
      JOIN fees f ON r.fee_id = f.id
      WHERE f.student_id = ? AND r.tenant_id = ?
      ORDER BY r.sent_at DESC
    `).all(student.id, req.tenantId);

    res.json({
      student,
      fees: enrichedFees,
      reminders,
    });
  } catch (err) {
    console.error('GET /api/students/:id error:', err);
    res.status(500).json({ error: 'Failed to load student details.' });
  }
});

/**
 * PUT /api/students/:id
 * Update a student's details and/or active fee details.
 */
router.put('/:id', (req, res) => {
  try {
    const { name, parentPhone, note, amount, dueDate, feeStatus } = req.body;
    const errors = {};

    if (!name?.trim()) {
      errors.name = 'Student name is required.';
    }

    const normalizedPhone = validateAndNormalizePhone(parentPhone);
    if (!parentPhone?.trim()) {
      errors.parentPhone = 'Parent WhatsApp number is required.';
    } else if (!normalizedPhone) {
      errors.parentPhone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    let parsedAmount;
    if (amount !== undefined && amount !== null && amount !== '') {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        errors.amount = 'Fee amount must be a number greater than 0.';
      }
    }

    if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
        errors.dueDate = 'Please provide a valid due date (YYYY-MM-DD).';
      } else {
        const [year, month, day] = dueDate.trim().split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (
          parsedDate.getFullYear() !== year ||
          parsedDate.getMonth() !== month - 1 ||
          parsedDate.getDate() !== day
        ) {
          errors.dueDate = 'Please provide a valid calendar due date (YYYY-MM-DD).';
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed.', errors });
    }

    const db = getDb();
    const student = db.prepare(`
      SELECT id FROM students WHERE id = ? AND tenant_id = ?
    `).get(req.params.id, req.tenantId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const trimmedName = name.trim();
    const trimmedNote = note !== undefined ? (note?.trim() || null) : null;

    const updateStudent = db.prepare(`
      UPDATE students 
      SET name = ?, parent_phone = ?, note = ?, updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ?
    `);

    const updateFee = db.prepare(`
      UPDATE fees
      SET 
        amount = COALESCE(?, amount),
        due_date = COALESCE(?, due_date),
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = (
        SELECT id FROM fees WHERE student_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT 1
      )
    `);

    const runUpdate = db.transaction(() => {
      updateStudent.run(trimmedName, normalizedPhone, trimmedNote, req.params.id, req.tenantId);
      if (parsedAmount !== undefined || dueDate !== undefined || feeStatus !== undefined) {
        updateFee.run(
          parsedAmount !== undefined ? parsedAmount : null,
          dueDate ? dueDate.trim() : null,
          feeStatus || null,
          req.params.id,
          req.tenantId
        );
      }
    });

    runUpdate();

    res.json({ message: 'Student updated successfully.' });
  } catch (err) {
    console.error('PUT /api/students/:id error:', err);
    res.status(500).json({ error: 'Failed to update student.' });
  }
});

/**
 * DELETE /api/students/:id
 * Delete a student record (cascades to fees and reminders).
 */
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare(`
      DELETE FROM students WHERE id = ? AND tenant_id = ?
    `).run(req.params.id, req.tenantId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (err) {
    console.error('DELETE /api/students/:id error:', err);
    res.status(500).json({ error: 'Failed to delete student.' });
  }
});

export default router;
