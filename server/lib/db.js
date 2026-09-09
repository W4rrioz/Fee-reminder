import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.resolve(__dirname, '../data/feereminder.db');

let rawDb;
let dbPath;
let inTransaction = false;

function saveDb() {
  if (inTransaction) return;
  if (rawDb && dbPath) {
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

/**
 * Initialize the SQLite database.
 * Creates the data directory and database file if they don't exist,
 * and runs the schema migration.
 */
export async function initDb() {
  dbPath = process.env.DATABASE_PATH
    ? (path.isAbsolute(process.env.DATABASE_PATH)
        ? process.env.DATABASE_PATH
        : path.resolve(__dirname, '..', process.env.DATABASE_PATH))
    : DEFAULT_DB_PATH;

  // Ensure the directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const SQL = await initSqlJs();
  let fileBuffer = null;
  if (fs.existsSync(dbPath)) {
    try {
      fileBuffer = fs.readFileSync(dbPath);
    } catch {
      fileBuffer = null;
    }
  }

  rawDb = fileBuffer && fileBuffer.length > 0 ? new SQL.Database(fileBuffer) : new SQL.Database();

  // Run migration — creates tables if they don't exist
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL CHECK (name <> ''),
      upi_id       TEXT,
      bank_details TEXT,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admins (
      id            TEXT PRIMARY KEY,
      tenant_id     TEXT NOT NULL REFERENCES tenants(id),
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS students (
      id           TEXT PRIMARY KEY,
      tenant_id    TEXT NOT NULL REFERENCES tenants(id),
      name         TEXT NOT NULL CHECK (name <> ''),
      parent_phone TEXT NOT NULL,
      note         TEXT,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fees (
      id         TEXT PRIMARY KEY,
      tenant_id  TEXT NOT NULL REFERENCES tenants(id),
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      amount     REAL NOT NULL CHECK (amount > 0),
      due_date   TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
      paid_at    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id        TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      fee_id    TEXT NOT NULL REFERENCES fees(id) ON DELETE CASCADE,
      sent_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  saveDb();
  console.log(`Database initialized at ${dbPath}`);
}

/**
 * Get the database instance.
 * Must call initDb() first.
 */
export function getDb() {
  if (!rawDb) {
    throw new Error('Database not initialized. Call initDb() first.');
  }

  return {
    prepare(sql) {
      return {
        get(...params) {
          const stmt = rawDb.prepare(sql);
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          stmt.bind(flatParams);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        },
        all(...params) {
          const stmt = rawDb.prepare(sql);
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          stmt.bind(flatParams);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
        run(...params) {
          const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          rawDb.run(sql, flatParams);
          saveDb();
          return { changes: 1 };
        },
      };
    },
    exec(sql) {
      rawDb.exec(sql);
      saveDb();
    },
    transaction(fn) {
      return (...args) => {
        inTransaction = true;
        try {
          rawDb.exec('BEGIN TRANSACTION');
          const res = fn(...args);
          rawDb.exec('COMMIT');
          inTransaction = false;
          saveDb();
          return res;
        } catch (err) {
          inTransaction = false;
          try {
            rawDb.exec('ROLLBACK');
          } catch {
            // ignore if rollback failed
          }
          throw err;
        }
      };
    },
  };
}
