const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || 'Amaniitk##2010');
const host = process.env.SUPABASE_DB_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com';
const projectRef = process.env.SUPABASE_PROJECT_REF || 'ubzzxbllkhlzapiwicsm';
const cs = `postgresql://postgres.${projectRef}:${password}@${host}:6543/postgres`;

async function migrate() {
  console.log(`Connecting to Supabase PostgreSQL at ${host}...`);
  const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase PostgreSQL successfully!');

  const sqlPath = path.join(__dirname, 'supabase_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log('Executing schema migration...');
  await client.query(sql);
  console.log('All 11 tables created successfully in Supabase!');

  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log('Public tables in Supabase:', res.rows.map(r => r.table_name));

  await client.end();
}

migrate().catch(e => {
  console.error('Migration error:', e);
  process.exit(1);
});
