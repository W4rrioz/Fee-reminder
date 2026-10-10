const { v4: uuidv4 } = require('uuid');
const { run, all, get, initDb, db } = require('./db');

async function seed() {
  console.log('Seeding database...');
  await initDb();

  // Clear existing tables in reverse dependency order
  await run('DELETE FROM attendance_records');
  await run('DELETE FROM reminder_log');
  await run('DELETE FROM payments');
  await run('DELETE FROM fee_dues');
  await run('DELETE FROM fee_heads');
  await run('DELETE FROM guardians');
  await run('DELETE FROM students');
  await run('DELETE FROM classes_batches');
  await run('DELETE FROM institute_members');
  await run('DELETE FROM users');
  await run('DELETE FROM institutes');

  // 1. Create Institute
  const instituteId = 'inst_apex_01';
  await run(
    `INSERT INTO institutes (id, name, type, city, upi_id, upi_name)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      instituteId,
      'Apex Coaching Academy',
      'coaching_center',
      'Kanpur',
      'apexacademy@upi',
      'Apex Academy Kanpur'
    ]
  );

  // 2. Create Users & Members
  const crypto = require('crypto');
  const hashPassword = (pw) => crypto.createHash('sha256').update(pw).digest('hex');
  const defaultPasswordHash = hashPassword('Admin@12345');

  const ownerUserId = 'user_aman_01';
  await run(
    `INSERT INTO users (id, name, phone, email, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [
      ownerUserId,
      'Aman Mishra',
      '+919876543210',
      'aman@apexcoaching.in',
      defaultPasswordHash
    ]
  );

  const adminUserId = 'user_admin_01';
  await run(
    `INSERT INTO users (id, name, phone, email, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [
      adminUserId,
      'Administrator',
      '+919876543211',
      'admin@edumanage.in',
      defaultPasswordHash
    ]
  );

  await run(
    `INSERT INTO institute_members (id, institute_id, user_id, role, status)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), instituteId, ownerUserId, 'owner', 'active']
  );

  await run(
    `INSERT INTO institute_members (id, institute_id, user_id, role, status)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), instituteId, adminUserId, 'admin', 'active']
  );

  // 3. Create Classes / Batches
  const batch10thId = 'batch_class_10';
  const batch12thId = 'batch_jee_12';
  const batchFoundationId = 'batch_found_09';

  await run(
    `INSERT INTO classes_batches (id, institute_id, name, type, academic_year)
     VALUES (?, ?, ?, ?, ?)`,
    [batch10thId, instituteId, 'Class 10th Board Booster', 'batch', '2026-2027']
  );
  await run(
    `INSERT INTO classes_batches (id, institute_id, name, type, academic_year)
     VALUES (?, ?, ?, ?, ?)`,
    [batch12thId, instituteId, 'Class 12th JEE Target', 'batch', '2026-2027']
  );
  await run(
    `INSERT INTO classes_batches (id, institute_id, name, type, academic_year)
     VALUES (?, ?, ?, ?, ?)`,
    [batchFoundationId, instituteId, 'Class 9th Foundation', 'batch', '2026-2027']
  );

  // 4. Create Fee Heads
  const tuitionFee10Id = 'fee_head_10th';
  const tuitionFee12Id = 'fee_head_12th';
  const examFeeId = 'fee_head_exam';

  await run(
    `INSERT INTO fee_heads (id, institute_id, name, default_amount, frequency, applicable_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tuitionFee10Id, instituteId, 'Class 10 Monthly Tuition Fee', 2500, 'monthly', 'batch_class_10']
  );
  await run(
    `INSERT INTO fee_heads (id, institute_id, name, default_amount, frequency, applicable_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tuitionFee12Id, instituteId, 'Class 12 JEE Monthly Tuition', 4000, 'monthly', 'batch_jee_12']
  );
  await run(
    `INSERT INTO fee_heads (id, institute_id, name, default_amount, frequency, applicable_to)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [examFeeId, instituteId, 'Test Series & Study Material', 1000, 'one-time', 'all']
  );

  // 5. Create 12 Students with Guardians
  const sampleStudents = [
    {
      name: 'Aarav Sharma',
      roll: 'APX-10-01',
      batch: batch10thId,
      dob: '2010-04-12',
      guardian: 'Rajesh Sharma',
      phone: '+919811122233',
      relation: 'Father',
      dueAmount: 2500,
      feeHead: tuitionFee10Id,
      dueStatus: 'pending',
      dueDate: '2026-10-10'
    },
    {
      name: 'Diya Patel',
      roll: 'APX-10-02',
      batch: batch10thId,
      dob: '2010-08-19',
      guardian: 'Kavita Patel',
      phone: '+919822233344',
      relation: 'Mother',
      dueAmount: 2500,
      feeHead: tuitionFee10Id,
      dueStatus: 'paid',
      dueDate: '2026-10-05',
      paidAmount: 2500,
      paidMethod: 'upi',
      paidRef: 'UPI/261005123456'
    },
    {
      name: 'Rohan Gupta',
      roll: 'APX-10-03',
      batch: batch10thId,
      dob: '2010-02-15',
      guardian: 'Sunil Gupta',
      phone: '+919833344455',
      relation: 'Father',
      dueAmount: 2500,
      feeHead: tuitionFee10Id,
      dueStatus: 'overdue',
      dueDate: '2026-09-10'
    },
    {
      name: 'Ananya Verma',
      roll: 'APX-10-04',
      batch: batch10thId,
      dob: '2010-11-23',
      guardian: 'Pradeep Verma',
      phone: '+919844455566',
      relation: 'Father',
      dueAmount: 2500,
      feeHead: tuitionFee10Id,
      dueStatus: 'partial',
      dueDate: '2026-10-05',
      paidAmount: 1500,
      paidMethod: 'cash',
      paidRef: 'REC-0921'
    },
    {
      name: 'Ishaan Singh',
      roll: 'APX-10-05',
      batch: batch10thId,
      dob: '2010-06-30',
      guardian: 'Virendra Singh',
      phone: '+919855566677',
      relation: 'Father',
      dueAmount: 2500,
      feeHead: tuitionFee10Id,
      dueStatus: 'pending',
      dueDate: '2026-10-15'
    },
    {
      name: 'Sneha Pandey',
      roll: 'APX-12-01',
      batch: batch12thId,
      dob: '2008-05-14',
      guardian: 'Ashok Pandey',
      phone: '+919866677788',
      relation: 'Father',
      dueAmount: 4000,
      feeHead: tuitionFee12Id,
      dueStatus: 'overdue',
      dueDate: '2026-09-25'
    },
    {
      name: 'Kabir Mehta',
      roll: 'APX-12-02',
      batch: batch12thId,
      dob: '2008-09-08',
      guardian: 'Alka Mehta',
      phone: '+919877788899',
      relation: 'Mother',
      dueAmount: 4000,
      feeHead: tuitionFee12Id,
      dueStatus: 'paid',
      dueDate: '2026-10-01',
      paidAmount: 4000,
      paidMethod: 'upi',
      paidRef: 'UPI/261001998877'
    },
    {
      name: 'Tanvi Joshi',
      roll: 'APX-12-03',
      batch: batch12thId,
      dob: '2008-12-03',
      guardian: 'Mukesh Joshi',
      phone: '+919888899900',
      relation: 'Father',
      dueAmount: 4000,
      feeHead: tuitionFee12Id,
      dueStatus: 'pending',
      dueDate: '2026-10-10'
    },
    {
      name: 'Aditya Srivastava',
      roll: 'APX-12-04',
      batch: batch12thId,
      dob: '2008-03-21',
      guardian: 'Naveen Srivastava',
      phone: '+919899900011',
      relation: 'Father',
      dueAmount: 4000,
      feeHead: tuitionFee12Id,
      dueStatus: 'overdue',
      dueDate: '2026-08-30'
    },
    {
      name: 'Pooja Tiwari',
      roll: 'APX-12-05',
      batch: batch12thId,
      dob: '2008-07-17',
      guardian: 'Ramesh Tiwari',
      phone: '+919811234567',
      relation: 'Father',
      dueAmount: 4000,
      feeHead: tuitionFee12Id,
      dueStatus: 'paid',
      dueDate: '2026-10-02',
      paidAmount: 4000,
      paidMethod: 'bank',
      paidRef: 'NEFT-54321'
    },
    {
      name: 'Devansh Saxena',
      roll: 'APX-09-01',
      batch: batchFoundationId,
      dob: '2011-01-25',
      guardian: 'Girish Saxena',
      phone: '+919822345678',
      relation: 'Father',
      dueAmount: 2000,
      feeHead: examFeeId,
      dueStatus: 'pending',
      dueDate: '2026-10-12'
    },
    {
      name: 'Riddhi Tripathi',
      roll: 'APX-09-02',
      batch: batchFoundationId,
      dob: '2011-10-10',
      guardian: 'Sadhna Tripathi',
      phone: '+919833456789',
      relation: 'Mother',
      dueAmount: 2000,
      feeHead: examFeeId,
      dueStatus: 'paid',
      dueDate: '2026-10-03',
      paidAmount: 2000,
      paidMethod: 'upi',
      paidRef: 'UPI/261003665544'
    }
  ];

  const studentIds = [];

  for (let i = 0; i < sampleStudents.length; i++) {
    const s = sampleStudents[i];
    const sId = `std_${(i + 1).toString().padStart(2, '0')}`;
    studentIds.push({ id: sId, batch: s.batch });

    await run(
      `INSERT INTO students (id, institute_id, class_batch_id, name, roll_number, dob, admission_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sId, instituteId, s.batch, s.name, s.roll, s.dob, '2026-04-01', 'active']
    );

    await run(
      `INSERT INTO guardians (id, student_id, name, phone, relation, is_primary_contact)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), sId, s.guardian, s.phone, s.relation, 1]
    );

    // Fee Due
    const dueId = `due_${(i + 1).toString().padStart(2, '0')}`;
    await run(
      `INSERT INTO fee_dues (id, student_id, fee_head_id, amount, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dueId, sId, s.feeHead, s.dueAmount, s.dueDate, s.dueStatus]
    );

    // Payments if any
    if (s.paidAmount) {
      await run(
        `INSERT INTO payments (id, fee_due_id, amount, method, reference_id, paid_at, recorded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), dueId, s.paidAmount, s.paidMethod, s.paidRef, s.dueDate + ' 11:30:00', 'Aman Mishra']
      );
    }
  }

  // 6. Seed Attendance for today and past 2 days
  const today = '2026-10-07';
  const yesterday = '2026-10-06';
  const dayBefore = '2026-10-05';

  const dates = [dayBefore, yesterday, today];

  for (const date of dates) {
    for (let i = 0; i < studentIds.length; i++) {
      const { id: sId, batch } = studentIds[i];
      // Mark mostly present, occasionally absent
      let status = 'present';
      if ((i === 2 || i === 8) && date === today) status = 'absent';
      if ((i === 5) && date === yesterday) status = 'absent';
      if (i === 4 && date === dayBefore) status = 'late';

      await run(
        `INSERT INTO attendance_records (id, student_id, class_batch_id, date, status, marked_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uuidv4(), sId, batch, date, status, 'Aman Mishra']
      );
    }
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
