import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Require auth for reminder routes
router.use(requireAuth);

/**
 * POST /api/reminders
 * Log that a WhatsApp reminder was sent for a fee.
 * Scoped to the logged-in admin's tenant.
 */
router.post('/', (req, res) => {
  try {
    const { feeId } = req.body;

    if (!feeId) {
      return res.status(400).json({ error: 'Fee ID is required to log a reminder.' });
    }

    const db = getDb();

    // Verify fee belongs to this tenant
    const fee = db.prepare(`
      SELECT id, student_id FROM fees WHERE id = ? AND tenant_id = ?
    `).get(feeId, req.tenantId);

    if (!fee) {
      return res.status(404).json({ error: 'Fee record not found.' });
    }

    const reminderId = uuidv4();
    const sentAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO reminders (id, tenant_id, fee_id, sent_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(reminderId, req.tenantId, feeId);

    res.status(201).json({
      reminder: {
        id: reminderId,
        fee_id: feeId,
        sent_at: sentAt,
      },
      message: 'Reminder logged successfully.',
    });
  } catch (err) {
    console.error('POST /api/reminders error:', err);
    res.status(500).json({ error: 'Failed to log reminder.' });
  }
});

/**
 * POST /api/reminders/bulk
 * Log multiple reminders sent in bulk.
 * Body: { feeIds: string[] }
 * Scoped to req.tenantId.
 */
router.post('/bulk', (req, res) => {
  try {
    const { feeIds } = req.body;

    if (!Array.isArray(feeIds) || feeIds.length === 0) {
      return res.status(400).json({ error: 'Array of fee IDs is required.' });
    }

    const db = getDb();
    const insertStmt = db.prepare(`
      INSERT INTO reminders (id, tenant_id, fee_id, sent_at)
      VALUES (?, ?, ?, datetime('now'))
    `);

    let loggedCount = 0;
    const bulkTx = db.transaction(() => {
      for (const feeId of feeIds) {
        // Validate fee belongs to tenant
        const fee = db.prepare('SELECT id FROM fees WHERE id = ? AND tenant_id = ?').get(feeId, req.tenantId);
        if (fee) {
          insertStmt.run(uuidv4(), req.tenantId, feeId);
          loggedCount++;
        }
      }
    });

    bulkTx();

    res.status(201).json({
      message: `Successfully logged ${loggedCount} reminder(s).`,
      loggedCount,
    });
  } catch (err) {
    console.error('POST /api/reminders/bulk error:', err);
    res.status(500).json({ error: 'Failed to log bulk reminders.' });
  }
});

export default router;
