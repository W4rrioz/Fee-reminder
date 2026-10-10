const { Client } = require('pg');
require('dotenv').config();

const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || 'Amaniitk##2010');
const host = process.env.SUPABASE_DB_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com';
const projectRef = process.env.SUPABASE_PROJECT_REF || 'ubzzxbllkhlzapiwicsm';
const cs = `postgresql://postgres.${projectRef}:${password}@${host}:6543/postgres`;

async function seedSupabase() {
  console.log('Connecting to Supabase PostgreSQL for seeding...');
  const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Clearing existing records in Supabase...');
  await client.query('DELETE FROM attendance_records');
  await client.query('DELETE FROM reminder_log');
  await client.query('DELETE FROM payments');
  await client.query('DELETE FROM fee_dues');
  await client.query('DELETE FROM fee_heads');
  await client.query('DELETE FROM guardians');
  await client.query('DELETE FROM students');
  await client.query('DELETE FROM classes_batches');
  await client.query('DELETE FROM institute_members');
  await client.query('DELETE FROM users');
  await client.query('DELETE FROM institutes');

  console.log('Inserting Institute...');
  await client.query(`
    INSERT INTO institutes (id, name, type, city, upi_id, upi_name)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, ['inst_apex_01', 'Apex Coaching Academy', 'coaching_center', 'Kanpur', 'apexacademy@upi', 'Apex Academy Kanpur']);

  console.log('Inserting Users & Admin...');
  await client.query(`
    INSERT INTO users (id, name, phone, email, password_hash)
    VALUES 
      ($1, $2, $3, $4, $5),
      ($6, $7, $8, $9, $10)
  `, [
    'user_aman_01', 'Aman Mishra', '+919876543210', 'aman@apexcoaching.in', 'Admin@12345',
    'user_admin_01', 'Admin', '+919876543211', 'admin@edumanage.in', 'Admin@12345'
  ]);

  await client.query(`
    INSERT INTO institute_members (id, institute_id, user_id, role, status)
    VALUES 
      ($1, $2, $3, $4, $5),
      ($6, $7, $8, $9, $10)
  `, [
    'mem_01', 'inst_apex_01', 'user_aman_01', 'owner', 'active',
    'mem_02', 'inst_apex_01', 'user_admin_01', 'admin', 'active'
  ]);

  console.log('Inserting Batches...');
  await client.query(`
    INSERT INTO classes_batches (id, institute_id, name, type, academic_year)
    VALUES 
      ('batch_class_10', 'inst_apex_01', 'Class 10th Board Booster', 'batch', '2026-2027'),
      ('batch_jee_12', 'inst_apex_01', 'Class 12th JEE Target', 'batch', '2026-2027'),
      ('batch_found_09', 'inst_apex_01', 'Class 9th Foundation', 'batch', '2026-2027')
  `);

  console.log('Inserting Fee Heads...');
  await client.query(`
    INSERT INTO fee_heads (id, institute_id, name, default_amount, frequency, applicable_to)
    VALUES 
      ('fh_tuition_10', 'inst_apex_01', 'Monthly Tuition Fee', 2500, 'monthly', 'batch_class_10'),
      ('fh_tuition_12', 'inst_apex_01', 'Monthly Tuition Fee', 3500, 'monthly', 'batch_jee_12'),
      ('fh_tuition_09', 'inst_apex_01', 'Monthly Tuition Fee', 2000, 'monthly', 'batch_found_09'),
      ('fh_admission', 'inst_apex_01', 'Admission & Material Kit', 1500, 'one_time', 'all')
  `);

  console.log('Inserting Students & Guardians...');
  const students = [
    { id: 's1', name: 'Aarav Sharma', roll: '1001', batch: 'batch_class_10', parent: 'Rajesh Sharma', phone: '+919876500001' },
    { id: 's2', name: 'Ananya Gupta', roll: '1002', batch: 'batch_class_10', parent: 'Sanjay Gupta', phone: '+919876500002' },
    { id: 's3', name: 'Rohan Verma', roll: '1003', batch: 'batch_class_10', parent: 'Sunil Verma', phone: '+919876500003' },
    { id: 's4', name: 'Priya Singh', roll: '1004', batch: 'batch_class_10', parent: 'Alok Singh', phone: '+919876500004' },
    { id: 's5', name: 'Kabir Patel', roll: '1201', batch: 'batch_jee_12', parent: 'Mahesh Patel', phone: '+919876500005' },
    { id: 's6', name: 'Sneha Yadav', roll: '1202', batch: 'batch_jee_12', parent: 'Dinesh Yadav', phone: '+919876500006' },
    { id: 's7', name: 'Aditya Tiwari', roll: '1203', batch: 'batch_jee_12', parent: 'Ramesh Tiwari', phone: '+919876500007' },
    { id: 's8', name: 'Diya Saxena', roll: '1204', batch: 'batch_jee_12', parent: 'Vikas Saxena', phone: '+919876500008' },
    { id: 's9', name: 'Vivaan Agarwal', roll: '0901', batch: 'batch_found_09', parent: 'Pankaj Agarwal', phone: '+919876500009' },
    { id: 's10', name: 'Ishita Pandey', roll: '0902', batch: 'batch_found_09', parent: 'Vinod Pandey', phone: '+919876500010' },
    { id: 's11', name: 'Devansh Shukla', roll: '0903', batch: 'batch_found_09', parent: 'Anil Shukla', phone: '+919876500011' },
    { id: 's12', name: 'Khushi Dubey', roll: '0904', batch: 'batch_found_09', parent: 'Mukesh Dubey', phone: '+919876500012' }
  ];

  for (const s of students) {
    await client.query(`
      INSERT INTO students (id, institute_id, class_batch_id, name, roll_number, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
    `, [s.id, 'inst_apex_01', s.batch, s.name, s.roll]);

    await client.query(`
      INSERT INTO guardians (id, student_id, name, phone, relation, is_primary_contact)
      VALUES ($1, $2, $3, $4, 'Father', true)
    `, ['g_' + s.id, s.id, s.parent, s.phone]);
  }

  console.log('Inserting Fee Dues & Payments...');
  const dues = [
    { id: 'due_1', student_id: 's1', fee_head: 'fh_tuition_10', amount: 2500, due_date: '2026-10-10', status: 'paid' },
    { id: 'due_2', student_id: 's2', fee_head: 'fh_tuition_10', amount: 2500, due_date: '2026-10-10', status: 'pending' },
    { id: 'due_3', student_id: 's3', fee_head: 'fh_tuition_10', amount: 2500, due_date: '2026-09-10', status: 'overdue' },
    { id: 'due_4', student_id: 's4', fee_head: 'fh_tuition_10', amount: 2500, due_date: '2026-10-10', status: 'partial' },
    { id: 'due_5', student_id: 's5', fee_head: 'fh_tuition_12', amount: 3500, due_date: '2026-10-10', status: 'paid' },
    { id: 'due_6', student_id: 's6', fee_head: 'fh_tuition_12', amount: 3500, due_date: '2026-09-10', status: 'overdue' },
    { id: 'due_7', student_id: 's7', fee_head: 'fh_tuition_12', amount: 3500, due_date: '2026-10-10', status: 'pending' },
    { id: 'due_8', student_id: 's8', fee_head: 'fh_tuition_12', amount: 3500, due_date: '2026-10-10', status: 'paid' },
    { id: 'due_9', student_id: 's9', fee_head: 'fh_tuition_09', amount: 2000, due_date: '2026-10-10', status: 'pending' },
    { id: 'due_10', student_id: 's10', fee_head: 'fh_tuition_09', amount: 2000, due_date: '2026-09-10', status: 'overdue' },
    { id: 'due_11', student_id: 's11', fee_head: 'fh_tuition_09', amount: 2000, due_date: '2026-10-10', status: 'paid' },
    { id: 'due_12', student_id: 's12', fee_head: 'fh_tuition_09', amount: 2000, due_date: '2026-09-10', status: 'overdue' }
  ];

  for (const d of dues) {
    await client.query(`
      INSERT INTO fee_dues (id, student_id, fee_head_id, amount, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [d.id, d.student_id, d.fee_head, d.amount, d.due_date, d.status]);
  }

  // Payments for paid / partial dues
  await client.query(`
    INSERT INTO payments (id, fee_due_id, amount, method, reference_id, paid_at, recorded_by)
    VALUES 
      ('p1', 'due_1', 2500, 'upi', 'UPI98234827', NOW(), 'Admin'),
      ('p2', 'due_4', 1500, 'cash', 'REC-2026-004', NOW(), 'Admin'),
      ('p3', 'due_5', 3500, 'upi', 'UPI77218933', NOW(), 'Admin'),
      ('p4', 'due_8', 3500, 'bank', 'NEFT-AXIS-992', NOW(), 'Admin'),
      ('p5', 'due_11', 2000, 'cash', 'REC-2026-011', NOW(), 'Admin')
  `);

  console.log('Inserting Attendance Records for today...');
  const today = '2026-10-07';
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const status = (i === 2 || i === 9) ? 'absent' : (i === 5 ? 'late' : 'present');
    await client.query(`
      INSERT INTO attendance_records (id, student_id, class_batch_id, date, status, marked_by)
      VALUES ($1, $2, $3, $4, $5, 'Admin')
    `, ['att_' + s.id + '_' + today, s.id, s.batch, today, status]);
  }

  console.log('SUCCESS: All seed records successfully inserted into Supabase cloud database!');
  await client.end();
}

seedSupabase().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
