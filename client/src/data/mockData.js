// Realistic production seed data for Apex Coaching Academy (Kanpur)
// Synchronized with Supabase Cloud PostgreSQL and offline client engine

export const INITIAL_INSTITUTE = {
  id: 'inst_apex_01',
  name: 'Apex Coaching Academy',
  type: 'coaching_center', // 'school' | 'coaching_center' | 'tutor'
  city: 'Kanpur',
  upi_id: 'apexacademy@upi',
  upi_name: 'Apex Academy Kanpur',
  phone: '+919876543210',
  enable_attendance: true,
  attendance_enabled: true,
  bank_details: 'A/C: 9876543210, IFSC: HDFC0001234, Branch: Civil Lines, Kanpur',
  reminder_template: 'Namaste {guardian_name}, fee of ₹{amount} for {student_name} is due by {due_date}. Please pay via UPI to {upi_id}.'
};

export const INITIAL_CLASSES_BATCHES = [
  { id: 'batch_class_10', name: 'Class 10th Board Booster', code: '10-BOOST', fee_amount: 2500 },
  { id: 'batch_jee_12', name: 'Class 12th JEE Target', code: '12-JEE', fee_amount: 3500 },
  { id: 'batch_found_09', name: 'Class 9th Foundation', code: '09-FND', fee_amount: 2000 }
];

export const INITIAL_STUDENTS = [
  {
    id: 's1',
    name: 'Aarav Sharma',
    roll_no: '1001',
    class_batch_id: 'batch_class_10',
    phone: '+919876500001',
    guardian_name: 'Rajesh Sharma',
    guardian_phone: '+919876500001',
    monthly_fee: 2500,
    attendance_rate: 96,
    status: 'active'
  },
  {
    id: 's2',
    name: 'Ananya Gupta',
    roll_no: '1002',
    class_batch_id: 'batch_class_10',
    phone: '+919876500002',
    guardian_name: 'Sanjay Gupta',
    guardian_phone: '+919876500002',
    monthly_fee: 2500,
    attendance_rate: 92,
    status: 'active'
  },
  {
    id: 's3',
    name: 'Rohan Verma',
    roll_no: '1003',
    class_batch_id: 'batch_class_10',
    phone: '+919876500003',
    guardian_name: 'Sunil Verma',
    guardian_phone: '+919876500003',
    monthly_fee: 2500,
    attendance_rate: 65,
    status: 'active'
  },
  {
    id: 's4',
    name: 'Priya Singh',
    roll_no: '1004',
    class_batch_id: 'batch_class_10',
    phone: '+919876500004',
    guardian_name: 'Alok Singh',
    guardian_phone: '+919876500004',
    monthly_fee: 2500,
    attendance_rate: 88,
    status: 'active'
  },
  {
    id: 's5',
    name: 'Kabir Patel',
    roll_no: '1201',
    class_batch_id: 'batch_jee_12',
    phone: '+919876500005',
    guardian_name: 'Mahesh Patel',
    guardian_phone: '+919876500005',
    monthly_fee: 3500,
    attendance_rate: 95,
    status: 'active'
  },
  {
    id: 's6',
    name: 'Sneha Yadav',
    roll_no: '1202',
    class_batch_id: 'batch_jee_12',
    phone: '+919876500006',
    guardian_name: 'Dinesh Yadav',
    guardian_phone: '+919876500006',
    monthly_fee: 3500,
    attendance_rate: 70,
    status: 'active'
  },
  {
    id: 's7',
    name: 'Aditya Tiwari',
    roll_no: '1203',
    class_batch_id: 'batch_jee_12',
    phone: '+919876500007',
    guardian_name: 'Ramesh Tiwari',
    guardian_phone: '+919876500007',
    monthly_fee: 3500,
    attendance_rate: 89,
    status: 'active'
  },
  {
    id: 's8',
    name: 'Diya Saxena',
    roll_no: '1204',
    class_batch_id: 'batch_jee_12',
    phone: '+919876500008',
    guardian_name: 'Vikas Saxena',
    guardian_phone: '+919876500008',
    monthly_fee: 3500,
    attendance_rate: 98,
    status: 'active'
  },
  {
    id: 's9',
    name: 'Vivaan Agarwal',
    roll_no: '0901',
    class_batch_id: 'batch_found_09',
    phone: '+919876500009',
    guardian_name: 'Pankaj Agarwal',
    guardian_phone: '+919876500009',
    monthly_fee: 2000,
    attendance_rate: 91,
    status: 'active'
  },
  {
    id: 's10',
    name: 'Ishita Pandey',
    roll_no: '0902',
    class_batch_id: 'batch_found_09',
    phone: '+919876500010',
    guardian_name: 'Vinod Pandey',
    guardian_phone: '+919876500010',
    monthly_fee: 2000,
    attendance_rate: 58,
    status: 'active'
  },
  {
    id: 's11',
    name: 'Devansh Shukla',
    roll_no: '0903',
    class_batch_id: 'batch_found_09',
    phone: '+919876500011',
    guardian_name: 'Anil Shukla',
    guardian_phone: '+919876500011',
    monthly_fee: 2000,
    attendance_rate: 94,
    status: 'active'
  },
  {
    id: 's12',
    name: 'Khushi Dubey',
    roll_no: '0904',
    class_batch_id: 'batch_found_09',
    phone: '+919876500012',
    guardian_name: 'Mukesh Dubey',
    guardian_phone: '+919876500012',
    monthly_fee: 2000,
    attendance_rate: 64,
    status: 'active'
  }
];

export const INITIAL_FEE_DUES = [
  // Class 10th
  {
    id: 'due_1',
    student_id: 's1',
    fee_head: 'October Tuition Fee',
    amount: 2500,
    due_date: '2026-10-10',
    status: 'paid',
    paid_at: '2026-10-06',
    payment_method: 'upi',
    reference_id: 'UPI98234827',
    month: 'October 2026'
  },
  {
    id: 'due_2',
    student_id: 's2',
    fee_head: 'October Tuition Fee',
    amount: 2500,
    due_date: '2026-10-10',
    status: 'pending',
    month: 'October 2026'
  },
  {
    id: 'due_3_sep',
    student_id: 's3',
    fee_head: 'September Tuition Fee',
    amount: 2500,
    due_date: '2026-09-10',
    status: 'overdue',
    month: 'September 2026'
  },
  {
    id: 'due_3_oct',
    student_id: 's3',
    fee_head: 'October Tuition Fee',
    amount: 2500,
    due_date: '2026-10-10',
    status: 'overdue',
    month: 'October 2026'
  },
  {
    id: 'due_4',
    student_id: 's4',
    fee_head: 'October Tuition Fee',
    amount: 2500,
    paid_amount: 1500,
    due_date: '2026-10-10',
    status: 'partial',
    paid_at: '2026-10-08',
    payment_method: 'cash',
    reference_id: 'REC-2026-004',
    month: 'October 2026'
  },

  // Class 12th JEE
  {
    id: 'due_5',
    student_id: 's5',
    fee_head: 'October JEE Batch Fee',
    amount: 3500,
    due_date: '2026-10-10',
    status: 'paid',
    paid_at: '2026-10-05',
    payment_method: 'upi',
    reference_id: 'UPI77218933',
    month: 'October 2026'
  },
  {
    id: 'due_6_sep',
    student_id: 's6',
    fee_head: 'September JEE Batch Fee',
    amount: 3500,
    due_date: '2026-09-10',
    status: 'overdue',
    month: 'September 2026'
  },
  {
    id: 'due_6_oct',
    student_id: 's6',
    fee_head: 'October JEE Batch Fee',
    amount: 3500,
    due_date: '2026-10-10',
    status: 'overdue',
    month: 'October 2026'
  },
  {
    id: 'due_7',
    student_id: 's7',
    fee_head: 'October JEE Batch Fee',
    amount: 3500,
    due_date: '2026-10-10',
    status: 'pending',
    month: 'October 2026'
  },
  {
    id: 'due_8',
    student_id: 's8',
    fee_head: 'October JEE Batch Fee',
    amount: 3500,
    due_date: '2026-10-10',
    status: 'paid',
    paid_at: '2026-10-04',
    payment_method: 'bank',
    reference_id: 'NEFT-AXIS-992',
    month: 'October 2026'
  },

  // Class 9th Foundation
  {
    id: 'due_9',
    student_id: 's9',
    fee_head: 'October Foundation Fee',
    amount: 2000,
    due_date: '2026-10-10',
    status: 'pending',
    month: 'October 2026'
  },
  {
    id: 'due_10_aug',
    student_id: 's10',
    fee_head: 'August Foundation Fee',
    amount: 2000,
    due_date: '2026-08-10',
    status: 'overdue',
    month: 'August 2026'
  },
  {
    id: 'due_10_sep',
    student_id: 's10',
    fee_head: 'September Foundation Fee',
    amount: 2000,
    due_date: '2026-09-10',
    status: 'overdue',
    month: 'September 2026'
  },
  {
    id: 'due_10_oct',
    student_id: 's10',
    fee_head: 'October Foundation Fee',
    amount: 2000,
    due_date: '2026-10-10',
    status: 'overdue',
    month: 'October 2026'
  },
  {
    id: 'due_11',
    student_id: 's11',
    fee_head: 'October Foundation Fee',
    amount: 2000,
    due_date: '2026-10-10',
    status: 'paid',
    paid_at: '2026-10-09',
    payment_method: 'cash',
    reference_id: 'REC-2026-011',
    month: 'October 2026'
  },
  {
    id: 'due_12_sep',
    student_id: 's12',
    fee_head: 'September Foundation Fee',
    amount: 2000,
    due_date: '2026-09-10',
    status: 'overdue',
    month: 'September 2026'
  },
  {
    id: 'due_12_oct',
    student_id: 's12',
    fee_head: 'October Foundation Fee',
    amount: 2000,
    due_date: '2026-10-10',
    status: 'overdue',
    month: 'October 2026'
  }
];

export const INITIAL_ATTENDANCE = {
  // Key format: `${date}_${class_batch_id}`: { student_id: 'present' | 'absent' | 'late' }
  '2026-10-07_batch_class_10': {
    's1': 'present',
    's2': 'present',
    's3': 'absent',
    's4': 'present'
  },
  '2026-10-07_batch_jee_12': {
    's5': 'present',
    's6': 'late',
    's7': 'present',
    's8': 'present'
  },
  '2026-10-07_batch_found_09': {
    's9': 'present',
    's10': 'absent',
    's11': 'present',
    's12': 'absent'
  }
};
