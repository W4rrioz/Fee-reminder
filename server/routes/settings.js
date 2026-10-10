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
    const name = req.body.name;
    const upiId = req.body.upiId !== undefined ? req.body.upiId : req.body.upi_id;
    const bankDetails = req.body.bankDetails !== undefined ? req.body.bankDetails : req.body.bank_details;
    const reminderTemplate = req.body.reminderTemplate !== undefined ? req.body.reminderTemplate : req.body.reminder_template;
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
    const current = db.prepare('SELECT id, name, upi_id, bank_details, reminder_template FROM tenants WHERE id = ?').get(req.tenantId);
    if (!current) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    const updatedName = name !== undefined ? (name?.trim() || current.name) : current.name;
    const updatedUpi = upiId !== undefined ? (trimmedUpi || null) : current.upi_id;
    const updatedBank = bankDetails !== undefined ? (bankDetails ? bankDetails.trim() : null) : current.bank_details;
    const updatedTemplate = reminderTemplate !== undefined ? (reminderTemplate ? reminderTemplate.trim() : null) : current.reminder_template;

    db.prepare(`
      UPDATE tenants
      SET 
        name = ?,
        upi_id = ?,
        bank_details = ?,
        reminder_template = ?
      WHERE id = ?
    `).run(
      updatedName,
      updatedUpi,
      updatedBank,
      updatedTemplate,
      req.tenantId
    );

    res.json({
      message: 'Settings updated successfully.',
      settings: {
        id: req.tenantId,
        name: updatedName,
        upi_id: updatedUpi || '',
        bank_details: updatedBank || '',
        reminder_template: updatedTemplate || '',
      },
    });
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    res.status(500).json({ error: 'Failed to update institute settings.' });
  }
});

export default router;
