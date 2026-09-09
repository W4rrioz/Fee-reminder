import { Router } from 'express';
import { getDb } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all fee operations
router.use(requireAuth);

/**
 * Determine dynamic fee status when reverting
 */
function calculateFeeStatus(dueDate) {
  if (!dueDate) return 'pending';
  const todayStr = new Date().toISOString().split('T')[0];
  if (dueDate < todayStr) {
    return 'overdue';
  }
  return 'pending';
}

/**
 * POST /api/fees/:id/pay
 * Mark a fee obligation as paid.
 * Sets status = 'paid' and paid_at = now().
 * Scoped to req.tenantId.
 */
router.post('/:id/pay', (req, res) => {
  try {
    const db = getDb();
    const feeId = req.params.id;

    // Check fee exists and belongs to this tenant
    const fee = db.prepare(`
      SELECT id, student_id, amount, due_date, status, paid_at
      FROM fees
      WHERE id = ? AND tenant_id = ?
    `).get(feeId, req.tenantId);

    if (!fee) {
      return res.status(404).json({ error: 'Fee record not found.' });
    }

    const paidAt = new Date().toISOString();

    db.prepare(`
      UPDATE fees
      SET 
        status = 'paid',
        paid_at = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ?
    `).run(feeId, req.tenantId);

    res.json({
      message: 'Fee marked as paid successfully.',
      fee: {
        id: feeId,
        student_id: fee.student_id,
        amount: fee.amount,
        due_date: fee.due_date,
        status: 'paid',
        paid_at: paidAt,
      },
    });
  } catch (err) {
    console.error('POST /api/fees/:id/pay error:', err);
    res.status(500).json({ error: 'Failed to mark fee as paid.' });
  }
});

/**
 * POST /api/fees/:id/revert
 * Undo / revert a paid fee back to pending or overdue status.
 * Clears paid_at to NULL.
 * Scoped to req.tenantId.
 */
router.post('/:id/revert', (req, res) => {
  try {
    const db = getDb();
    const feeId = req.params.id;

    const fee = db.prepare(`
      SELECT id, student_id, amount, due_date, status, paid_at
      FROM fees
      WHERE id = ? AND tenant_id = ?
    `).get(feeId, req.tenantId);

    if (!fee) {
      return res.status(404).json({ error: 'Fee record not found.' });
    }

    const restoredStatus = calculateFeeStatus(fee.due_date);

    db.prepare(`
      UPDATE fees
      SET 
        status = ?,
        paid_at = NULL,
        updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ?
    `).run(restoredStatus, feeId, req.tenantId);

    res.json({
      message: 'Fee status reverted successfully.',
      fee: {
        id: feeId,
        student_id: fee.student_id,
        amount: fee.amount,
        due_date: fee.due_date,
        status: restoredStatus,
        paid_at: null,
      },
    });
  } catch (err) {
    console.error('POST /api/fees/:id/revert error:', err);
    res.status(500).json({ error: 'Failed to revert fee status.' });
  }
});

export default router;
