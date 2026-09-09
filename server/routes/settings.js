import { Router } from 'express';
import { getDb } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Require auth for all settings operations
router.use(requireAuth);

/**
 * Validate standard UPI ID format (e.g. name@okhdfcbank, institute@upi)
 */
function isValidUpiId(upiId) {
  if (!upiId) return true; // Optional field
  return /^[\w.\-]+@[\w.\-]+$/.test(upiId.trim());
}

/**
 * GET /api/settings
 * Fetch the current tenant's name, UPI ID, and bank details.
 */
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const tenant = db.prepare(`
      SELECT id, name, upi_id, bank_details, reminder_template, created_at
      FROM tenants
      WHERE id = ?
    `).get(req.tenantId);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    res.json({
      settings: {
        id: tenant.id,
        name: tenant.name,
        upi_id: tenant.upi_id || '',
        bank_details: tenant.bank_details || '',
        reminder_template: tenant.reminder_template || '',
      },
    });
  } catch (err) {
    console.error('GET /api/settings error:', err);
    res.status(500).json({ error: 'Failed to load institute settings.' });
  }
});

/**
 * PUT /api/settings
 * Update tenant institute name, UPI ID, bank details, and reminder message template.
 */
router.put('/', (req, res) => {
  try {
    const { name, upiId, bankDetails, reminderTemplate } = req.body;
    const errors = {};

    if (name !== undefined && !name?.trim()) {
      errors.name = 'Institute name cannot be empty.';
    }

    const trimmedUpi = upiId ? upiId.trim() : null;
    if (trimmedUpi && !isValidUpiId(trimmedUpi)) {
      errors.upiId = 'Please enter a valid UPI ID (e.g. yourname@upi or institute@okhdfcbank).';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed.', errors });
    }

    const db = getDb();
    const trimmedBank = bankDetails ? bankDetails.trim() : null;
    const trimmedTemplate = reminderTemplate !== undefined 
      ? (reminderTemplate ? reminderTemplate.trim() : '') 
      : null;

    db.prepare(`
      UPDATE tenants
      SET 
        name = COALESCE(?, name),
        upi_id = ?,
        bank_details = ?,
        reminder_template = COALESCE(?, reminder_template)
      WHERE id = ?
    `).run(
      name ? name.trim() : null,
      trimmedUpi,
      trimmedBank,
      trimmedTemplate,
      req.tenantId
    );

    res.json({
      message: 'Settings updated successfully.',
      settings: {
        id: req.tenantId,
        name: name ? name.trim() : undefined,
        upi_id: trimmedUpi || '',
        bank_details: trimmedBank || '',
        reminder_template: trimmedTemplate !== null ? trimmedTemplate : '',
      },
    });
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    res.status(500).json({ error: 'Failed to update institute settings.' });
  }
});

export default router;
