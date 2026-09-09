import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { initDb } from './lib/db.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, './.env') });
dotenv.config();

// Fail fast if JWT_SECRET is not set
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error('\n❌ FATAL ERROR: JWT_SECRET environment variable is not set.');
  console.error('The server cannot start securely without a JWT_SECRET.');
  console.error('Please set JWT_SECRET in your environment or .env file before starting the server.');
  console.error('You can generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');
  process.exit(1);
}

// Initialize the database (creates tables on first run)
await initDb();

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
