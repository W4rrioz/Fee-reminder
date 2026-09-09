import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all import routes
router.use(requireAuth);

/**
 * Validate and normalize Indian mobile phone numbers.
 * Strictly validates 10 digits starting with 6-9.
 * Accepts prefixes: +91, 91, 0, or plain 10 digits.
 * Returns normalized E.164 string (+91XXXXXXXXXX) or null if invalid.
 */
function validateAndNormalizePhone(phone) {
  if (!phone) return null;
  const str = String(phone).trim();
  let cleaned = str.replace(/[\s\-()]/g, '');

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
 * Normalize and validate a single student record.
 */
function validateRow(row, rowIndex) {
  const errors = [];
  const rawName = row.name ?? row['Student Name'] ?? row['student_name'] ?? row['student name'] ?? '';
  const rawPhone = row.parent_phone ?? row.parentPhone ?? row.phone ?? row['Parent Phone'] ?? row['parent phone'] ?? row['Phone'] ?? row.mobile ?? '';
  const rawAmount = row.fee_amount ?? row.feeAmount ?? row.amount ?? row['Fee Amount'] ?? row['fee amount'] ?? row['Amount'] ?? row.fee ?? '';
  const rawDueDate = row.due_date ?? row.dueDate ?? row['Due Date'] ?? row['due date'] ?? row.date ?? '';
  const rawNote = row.note ?? row.notes ?? row['Note'] ?? row['note'] ?? row.remarks ?? '';

  const name = String(rawName).trim();
  if (!name) {
    errors.push('Student name is required.');
  }

  const normalizedPhone = validateAndNormalizePhone(rawPhone);
  if (!String(rawPhone).trim()) {
    errors.push('Parent WhatsApp number is required.');
  } else if (!normalizedPhone) {
    errors.push('Invalid phone number format (must be 10 digits starting with 6-9).');
  }

  const parsedAmount = parseFloat(String(rawAmount).replace(/[^0-9.-]+/g, ''));
  if (rawAmount === '' || rawAmount === null || rawAmount === undefined || isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.push('Fee amount must be a number greater than 0.');
  }

  let dueDate = String(rawDueDate).trim();
  if (!dueDate) {
    errors.push('Due date is required.');
  } else {
    // If given in DD/MM/YYYY or DD-MM-YYYY, convert to YYYY-MM-DD
    const ddmmyyyy = dueDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
      const day = ddmmyyyy[1].padStart(2, '0');
      const month = ddmmyyyy[2].padStart(2, '0');
      const year = ddmmyyyy[3];
      dueDate = `${year}-${month}-${day}`;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errors.push('Please provide a valid due date (YYYY-MM-DD).');
    }
  }

  const note = String(rawNote).trim() || null;

  return {
    rowIndex,
    raw: {
      name: rawName,
      parent_phone: rawPhone,
      amount: rawAmount,
      due_date: rawDueDate,
      note: rawNote,
    },
    data: {
      name,
      parent_phone: normalizedPhone,
      amount: parsedAmount,
      due_date: dueDate,
      note,
    },
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parse CSV text into array of object rows.
 */
function parseCsvText(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];

  // Simple CSV parser supporting quoted values
  function parseLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]+/g, '_'));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.every((v) => !v)) continue; // skip blank lines
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * POST /api/students/import-csv or POST /api/students/import
 * Accepts:
 *  - JSON with { rows: [...] }
 *  - JSON with { csvText: "..." }
 *  - Raw CSV body
 */
router.post(['/import-csv', '/import'], (req, res) => {
  try {
    let rawRows = [];

    if (Array.isArray(req.body)) {
      rawRows = req.body;
    } else if (Array.isArray(req.body?.rows)) {
      rawRows = req.body.rows;
    } else if (Array.isArray(req.body?.students)) {
      rawRows = req.body.students;
    } else if (typeof req.body?.csvText === 'string') {
      rawRows = parseCsvText(req.body.csvText);
    } else if (typeof req.body === 'string' && req.body.includes(',')) {
      rawRows = parseCsvText(req.body);
    }

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ error: 'No student records found to import.' });
    }

    // Validate all rows
    const validatedRows = rawRows.map((row, idx) => validateRow(row, idx + 1));
    const validRows = validatedRows.filter((r) => r.isValid);
    const invalidRows = validatedRows.filter((r) => !r.isValid);

    if (validRows.length === 0) {
      return res.status(400).json({
        error: 'All rows failed validation. No records were imported.',
        summary: {
          total: validatedRows.length,
          valid: 0,
          invalid: invalidRows.length,
        },
        invalidRows,
      });
    }

    const db = getDb();
    const insertStudent = db.prepare(`
      INSERT INTO students (id, tenant_id, name, parent_phone, note)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertFee = db.prepare(`
      INSERT INTO fees (id, tenant_id, student_id, amount, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const importedStudents = [];

    // Perform atomic transaction
    const importTransaction = db.transaction(() => {
      for (const rowItem of validRows) {
        const { name, parent_phone, amount, due_date, note } = rowItem.data;
        const studentId = uuidv4();
        const feeId = uuidv4();
        const status = calculateFeeStatus(due_date, 'pending');

        insertStudent.run(studentId, req.tenantId, name, parent_phone, note);
        insertFee.run(feeId, req.tenantId, studentId, amount, due_date, status);

        importedStudents.push({
          studentId,
          feeId,
          name,
          parent_phone,
          amount,
          due_date,
          status,
          note,
        });
      }
    });

    importTransaction();

    res.status(201).json({
      success: true,
      message: `Successfully imported ${validRows.length} student${validRows.length === 1 ? '' : 's'}.`,
      summary: {
        total: validatedRows.length,
        imported: validRows.length,
        failed: invalidRows.length,
      },
      imported: importedStudents,
      skipped: invalidRows,
    });
  } catch (err) {
    console.error('POST /api/students/import-csv error:', err);
    res.status(500).json({ error: 'Failed to import student records.' });
  }
});

export default router;
