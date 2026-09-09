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

export default router;
