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

/**
 * POST /api/fees/bulk-update
 * Update fee amounts in bulk for students matching criteria.
 * Body: {
 *   filterType: 'all' | 'tag' | 'status',
 *   tagValue?: string,
 *   statusValue?: string,
 *   actionType: 'add' | 'set',
 *   amountValue: number
 * }
 * Scoped strictly to req.tenantId.
 */
router.post('/bulk-update', (req, res) => {
  try {
    const { filterType = 'all', tagValue = '', statusValue = '', actionType, amountValue } = req.body;

    const numAmount = parseFloat(amountValue);
    if (isNaN(numAmount) || (actionType === 'set' && numAmount <= 0)) {
      return res.status(400).json({ error: 'Please provide a valid fee amount.' });
    }

    if (!['add', 'set'].includes(actionType)) {
      return res.status(400).json({ error: 'Invalid action type. Must be "add" or "set".' });
    }

    const db = getDb();

    // Find all matching fee records for this tenant
    let query = `
      SELECT f.id, f.amount, f.status, s.name as student_name, s.note
      FROM fees f
      JOIN students s ON f.student_id = s.id
      WHERE f.tenant_id = ?
    `;
    const params = [req.tenantId];

    if (filterType === 'tag' && tagValue.trim()) {
      query += ` AND s.note LIKE ?`;
      params.push(`%${tagValue.trim()}%`);
    } else if (filterType === 'status' && statusValue.trim()) {
      query += ` AND f.status = ?`;
      params.push(statusValue.trim());
    }

    const matchingFees = db.prepare(query).all(...params);

    if (matchingFees.length === 0) {
      return res.status(404).json({ error: 'No fee records found matching the specified filter.' });
    }

    // Perform atomic bulk update
    const updateStmt = db.prepare(`
      UPDATE fees
      SET amount = ?, updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ?
    `);

    let updatedCount = 0;

    const bulkUpdateTx = db.transaction(() => {
      for (const fee of matchingFees) {
        let newAmount = fee.amount;
        if (actionType === 'set') {
          newAmount = Math.max(1, numAmount);
        } else if (actionType === 'add') {
          newAmount = Math.max(1, fee.amount + numAmount);
        }

        updateStmt.run(newAmount, fee.id, req.tenantId);
        updatedCount++;
      }
    });

    bulkUpdateTx();

    res.json({
      message: `Successfully updated ${updatedCount} fee record(s).`,
      updatedCount,
    });
  } catch (err) {
    console.error('POST /api/fees/bulk-update error:', err);
    res.status(500).json({ error: 'Failed to perform bulk fee update.' });
  }
});

export default router;
