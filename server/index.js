import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initDb, getDb } from './lib/db.js';
import routes from './routes/index.js';
import { runSeed } from './scripts/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, './.env') });
dotenv.config();

// Ensure JWT_SECRET is always present with a secure fallback for zero-config cloud deployments
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  process.env.JWT_SECRET = 'feereminder_prod_secret_fe183cea2347721919a7249f1baeccc6b030dcada74420ea';
}

// Initialize the database (creates tables on first run)
await initDb();

// Auto-seed demo admin and 50 dummy students if brand new database
try {
  const db = getDb();
  const studentCount = db.prepare('SELECT COUNT(*) as count FROM students').get()?.count || 0;
  if (studentCount === 0) {
    console.log('🔄 Initializing database with 50 demo students & fee records...');
    await runSeed();
    console.log('✅ Auto-seeded 50 demo students for Apex Coaching Academy.');
  }
} catch (e) {
  console.warn('Initial seed notice:', e.message);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mount all API routes
app.use('/api', routes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve static frontend files when built (for production unified deployment)
const clientDistPath = path.join(__dirname, '../client/dist');

app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // In dev mode when client/dist isn't built yet, return friendly message
      res.status(200).send('FeeReminder API Server is running. In dev mode, access the React UI on port 5173.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
