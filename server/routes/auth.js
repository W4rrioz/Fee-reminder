import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = 10;

// Token expires in 7 days — long enough for a pilot, short enough to be reasonable
const TOKEN_EXPIRY = '7d';

/**
 * POST /api/auth/signup
 * Create a new institute (tenant) + admin account.
 * Returns a JWT token and admin/tenant info.
 */
router.post('/signup', async (req, res) => {
  try {
    const { instituteName, email, password } = req.body;

    // --- Server-side validation ---
    const errors = {};
    if (!instituteName?.trim()) errors.instituteName = 'Institute name is required.';
    if (!email?.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed.', errors });
    }

    const db = getDb();
    const trimmedEmail = email.trim().toLowerCase();

    // Check for duplicate email
    const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(trimmedEmail);
    if (existing) {
      return res.status(409).json({
        error: 'An account with this email already exists. Try signing in instead.',
      });
    }

    // Hash the password — never store plain text
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create tenant + admin in a transaction (atomic)
    const tenantId = uuidv4();
    const adminId = uuidv4();

    const insertTenant = db.prepare(
      'INSERT INTO tenants (id, name) VALUES (?, ?)'
    );
    const insertAdmin = db.prepare(
      'INSERT INTO admins (id, tenant_id, email, password_hash) VALUES (?, ?, ?, ?)'
    );

    const createAccount = db.transaction(() => {
      insertTenant.run(tenantId, instituteName.trim());
      insertAdmin.run(adminId, tenantId, trimmedEmail, passwordHash);
    });

    createAccount();

    // Sign a JWT
    const token = jwt.sign({ adminId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.status(201).json({
      token,
      admin: {
        id: adminId,
        email: trimmedEmail,
        tenant_id: tenantId,
        tenant_name: instituteName.trim(),
      },
    });
  } catch (err) {
    console.error('POST /api/auth/signup error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

/**
 * POST /api/auth/signin
 * Authenticate an existing admin.
 * Returns a JWT token and admin/tenant info.
 */
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();
    const trimmedEmail = email.trim().toLowerCase();

    // Look up admin by email (joined with tenant for the name)
    const admin = db.prepare(`
      SELECT a.id, a.tenant_id, a.email, a.password_hash, t.name AS tenant_name
      FROM admins a
      JOIN tenants t ON a.tenant_id = t.id
      WHERE a.email = ?
    `).get(trimmedEmail);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password hash
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign a JWT
    const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        tenant_id: admin.tenant_id,
        tenant_name: admin.tenant_name,
      },
    });
  } catch (err) {
    console.error('POST /api/auth/signin error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 * Returns the authenticated admin's info and their tenant details.
 * Protected by requireAuth middleware — tenant_id resolved server-side.
 */
router.get('/me', requireAuth, (req, res) => {
  try {
    const db = getDb();
    const tenant = db.prepare('SELECT id, name FROM tenants WHERE id = ?').get(req.tenantId);

    if (!tenant) {
      return res.status(500).json({ error: 'Could not load tenant info.' });
    }

    res.json({
      admin: {
        id: req.adminId,
        email: req.adminEmail,
        tenant_id: tenant.id,
        tenant_name: tenant.name,
      },
    });
  } catch (err) {
    console.error('GET /api/auth/me error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
