import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all attendance routes
router.use(requireAuth);

/**
 * Helper to get today's date in YYYY-MM-DD format.
 */
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * GET /api/attendance/today
 * Query attendance status for all students on a specific date (defaults to today).
 * Query params: ?date=YYYY-MM-DD
 */
router.get('/today', (req, res) => {
  try {
    const db = getDb();
    const queryDate = (req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date.trim()))
      ? req.query.date.trim()
      : getTodayDateString();

    const rawRows = db.prepare(`
      SELECT 
        s.id AS student_id,
        s.name,
        s.parent_phone,
        s.note,
        a.id AS attendance_id,
        a.status AS attendance_status,
        a.created_at AS marked_at
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id AND a.tenant_id = s.tenant_id AND a.date = ?
      WHERE s.tenant_id = ?
      ORDER BY s.name COLLATE NOCASE ASC
    `).all(queryDate, req.tenantId);

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let markedCount = 0;

    const students = rawRows.map((row) => {
      const status = row.attendance_status || null;
      if (status === 'present') {
        presentCount++;
        markedCount++;
      } else if (status === 'absent') {
        absentCount++;
        markedCount++;
      } else if (status === 'late') {
        lateCount++;
        markedCount++;
      }

      return {
        id: row.student_id,
        name: row.name,
        parent_phone: row.parent_phone,
        note: row.note,
        attendance_id: row.attendance_id || null,
        status, // 'present' | 'absent' | 'late' | null
        marked_at: row.marked_at || null,
      };
    });

    const totalStudents = students.length;
    const unmarkedCount = totalStudents - markedCount;

    res.json({
      date: queryDate,
      students,
      summary: {
        totalStudents,
        markedCount,
        unmarkedCount,
        presentCount,
        absentCount,
        lateCount,
      },
    });
  } catch (err) {
    console.error('GET /api/attendance/today error:', err);
    res.status(500).json({ error: 'Failed to load attendance records.' });
  }
});

/**
 * POST /api/attendance/mark
 * Mark attendance for single student or batch of students.
 * Scoped strictly to the logged-in admin's tenant.
 *
 * Payload formats accepted:
 * 1. Single student:
 *    { "studentId": "uuid", "date": "YYYY-MM-DD", "status": "present"|"absent"|"late"|null }
 * 2. Bulk records:
 *    { "date": "YYYY-MM-DD", "records": [ { "studentId": "uuid", "status": "present" } ] }
 * 3. Mark All:
 *    { "date": "YYYY-MM-DD", "markAll": "present"|"absent"|"late" }
 */
router.post('/mark', (req, res) => {
  try {
    const { studentId, date, status, records, markAll } = req.body;
    const targetDate = (date && /^\d{4}-\d{2}-\d{2}$/.test(String(date).trim()))
      ? String(date).trim()
      : getTodayDateString();

    const db = getDb();
    const validStatuses = ['present', 'absent', 'late'];

    const upsertStmt = db.prepare(`
      INSERT INTO attendance (id, tenant_id, student_id, date, status)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(tenant_id, student_id, date) DO UPDATE SET
        status = excluded.status,
        created_at = datetime('now')
    `);

    const deleteStmt = db.prepare(`
      DELETE FROM attendance
      WHERE tenant_id = ? AND student_id = ? AND date = ?
    `);

    // Verify helper to ensure student belongs to tenant
    const verifyStudent = db.prepare(`
      SELECT id FROM students WHERE id = ? AND tenant_id = ?
    `);

    let affectedCount = 0;

    const performMark = db.transaction(() => {
      // 1. Mark All
      if (markAll) {
        if (!validStatuses.includes(markAll)) {
          throw new Error('Invalid status for markAll.');
        }
        const tenantStudents = db.prepare(`
          SELECT id FROM students WHERE tenant_id = ?
        `).all(req.tenantId);

        tenantStudents.forEach((st) => {
          upsertStmt.run(uuidv4(), req.tenantId, st.id, targetDate, markAll);
          affectedCount++;
        });
        return;
      }

      // 2. Bulk records
      if (Array.isArray(records)) {
        records.forEach((rec) => {
          if (!rec.studentId) return;
          const verified = verifyStudent.get(rec.studentId, req.tenantId);
          if (!verified) return;

          const recDate = (rec.date && /^\d{4}-\d{2}-\d{2}$/.test(String(rec.date).trim()))
            ? String(rec.date).trim()
            : targetDate;

          if (rec.status && validStatuses.includes(rec.status)) {
            upsertStmt.run(uuidv4(), req.tenantId, rec.studentId, recDate, rec.status);
            affectedCount++;
          } else if (rec.status === null || rec.status === '' || rec.status === 'unmarked') {
            deleteStmt.run(req.tenantId, rec.studentId, recDate);
            affectedCount++;
          }
        });
        return;
      }

      // 3. Single record
      if (studentId) {
        const verified = verifyStudent.get(studentId, req.tenantId);
        if (!verified) {
          throw new Error('Student not found in your institute.');
        }

        if (status && validStatuses.includes(status)) {
          upsertStmt.run(uuidv4(), req.tenantId, studentId, targetDate, status);
          affectedCount++;
        } else if (status === null || status === '' || status === 'unmarked') {
          deleteStmt.run(req.tenantId, studentId, targetDate);
          affectedCount++;
        } else {
          throw new Error('Invalid attendance status.');
        }
      }
    });

    performMark();

    res.json({
      success: true,
      date: targetDate,
      affectedCount,
      message: 'Attendance recorded successfully.',
    });
  } catch (err) {
    console.error('POST /api/attendance/mark error:', err);
    res.status(400).json({ error: err.message || 'Failed to record attendance.' });
  }
});

/**
 * GET /api/attendance/student/:studentId
 * Retrieve attendance records for a specific student, with monthly metrics.
 * Query params: ?month=YYYY-MM (defaults to current month)
 */
router.get('/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDb();

    // Verify student belongs to this tenant
    const student = db.prepare(`
      SELECT id, name, parent_phone, note, created_at
      FROM students
      WHERE id = ? AND tenant_id = ?
    `).get(studentId, req.tenantId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found in your institute.' });
    }

    const todayStr = getTodayDateString();
    const currentYearMonth = todayStr.slice(0, 7);
    const queryMonth = (req.query.month && /^\d{4}-\d{2}$/.test(req.query.month.trim()))
      ? req.query.month.trim()
      : currentYearMonth;

    // Fetch all attendance records for this student
    const allRecords = db.prepare(`
      SELECT id, date, status, created_at
      FROM attendance
      WHERE student_id = ? AND tenant_id = ?
      ORDER BY date ASC
    `).all(studentId, req.tenantId);

    // Filter for requested month
    const monthRecords = allRecords.filter((r) => r.date.startsWith(queryMonth));

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    monthRecords.forEach((r) => {
      if (r.status === 'present') presentCount++;
      else if (r.status === 'absent') absentCount++;
      else if (r.status === 'late') lateCount++;
    });

    const totalDaysMarked = monthRecords.length;
    // Calculate percentage based on present vs total marked days
    const presentPercentage = totalDaysMarked > 0
      ? Math.round((presentCount / totalDaysMarked) * 100)
      : 0;

    // Create a map of date -> status for convenience
    const recordMap = {};
    allRecords.forEach((r) => {
      recordMap[r.date] = r.status;
    });

    res.json({
      student,
      month: queryMonth,
      records: monthRecords,
      recordMap,
      summary: {
        totalDaysMarked,
        presentCount,
        absentCount,
        lateCount,
        presentPercentage,
      },
    });
  } catch (err) {
    console.error('GET /api/attendance/student/:studentId error:', err);
    res.status(500).json({ error: 'Failed to load student attendance.' });
  }
});

export default router;
