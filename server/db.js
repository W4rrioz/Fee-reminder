const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Determine whether to use Supabase PostgreSQL or local SQLite
const useSupabase = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_SECRET_KEY));

let run, get, all, initDb;

if (useSupabase) {
  const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || 'Amaniitk##2010');
  const host = process.env.SUPABASE_DB_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com';
  const projectRef = process.env.SUPABASE_PROJECT_REF || 'ubzzxbllkhlzapiwicsm';
  const connectionString = `postgresql://postgres.${projectRef}:${password}@${host}:6543/postgres`;

  console.log(`[Database] Connecting to Cloud Supabase PostgreSQL at ${host}...`);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('[Database Pool Error]:', err.message);
  });

  // Convert SQLite ? parameter placeholders to PostgreSQL $1, $2, etc.
  const convertPlaceholders = (sql) => {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  };

  run = async (sql, params = []) => {
    const pgSql = convertPlaceholders(sql);
    const res = await pool.query(pgSql, params);
    return { changes: res.rowCount, lastID: null };
  };

  get = async (sql, params = []) => {
    const pgSql = convertPlaceholders(sql);
    const res = await pool.query(pgSql, params);
    return res.rows[0] || null;
  };

  all = async (sql, params = []) => {
    const pgSql = convertPlaceholders(sql);
    const res = await pool.query(pgSql, params);
    return res.rows;
  };

  initDb = async () => {
    try {
      await pool.query(`
        ALTER TABLE institutes ADD COLUMN IF NOT EXISTS attendance_enabled INTEGER DEFAULT 1;
      `);
      console.log('[Database] Supabase PostgreSQL connected and schema verified.');
    } catch (err) {
      console.warn('[Database] Supabase migration notice:', err.message);
    }
  };

} else {
  // Local SQLite fallback
  const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'edumanage.db');
  console.log('[Database] Connecting to local SQLite database at:', DB_PATH);

  const db = new sqlite3.Database(DB_PATH);

  run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  };

  get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  };

  all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  initDb = async () => {
    return new Promise((resolve, reject) => {
      db.run('PRAGMA foreign_keys = ON;', (err) => {
        if (err) return reject(err);
        db.all('PRAGMA table_info(institutes)', (err, cols) => {
          if (err) return reject(err);
          const hasCol = cols && cols.some(c => c.name === 'attendance_enabled');
          if (!hasCol) {
            db.run('ALTER TABLE institutes ADD COLUMN attendance_enabled INTEGER DEFAULT 1', (alterErr) => {
              if (alterErr && !alterErr.message.includes('duplicate column')) {
                return reject(alterErr);
              }
              console.log('[Database] Migrated institutes table: added attendance_enabled column.');
              resolve();
            });
          } else {
            resolve();
          }
        });
      });
    });
  };
}

module.exports = {
  run,
  get,
  all,
  initDb
};
