import jwt from 'jsonwebtoken';
import { getDb } from '../lib/db.js';

/**
 * Auth middleware — the single point where tenant_id is resolved.
 *
 * 1. Extract JWT from Authorization: Bearer <token>
 * 2. Verify the token with jsonwebtoken
 * 3. Look up the admin record in SQLite to get tenant_id
 * 4. Attach adminId, tenantId, adminEmail to the request
 *
 * tenant_id is NEVER trusted from client input or even the JWT payload
 * directly — it is always re-read from the admin's database row.
 */
export function requireAuth(req, res, next) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET is not set.' });
    }

    // 1. Extract token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please sign in.' });
    }

    // 2. Verify the JWT
    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    }

    // 3. Look up admin by ID from the JWT — get tenant_id from the DB row
    const db = getDb();
    const admin = db.prepare(
      'SELECT id, tenant_id, email FROM admins WHERE id = ?'
    ).get(payload.adminId);

    if (!admin) {
      return res.status(401).json({ error: 'Account not found. Please sign in again.' });
    }

    // 4. Attach to request — tenant_id from the DB, not from the JWT
    req.adminId = admin.id;
    req.tenantId = admin.tenant_id;
    req.adminEmail = admin.email;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
