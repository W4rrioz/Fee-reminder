// Mock seed data for instant offline-first experience & testing
export const INITIAL_INSTITUTE = {
  id: 'inst-1',
  name: 'Pratibha Coaching Institute',
  type: 'coaching_center', // 'school' | 'coaching_center' | 'tutor'
  city: 'Kanpur',
  upi_id: 'pratibha.edu@okaxis',
  upi_name: 'Pratibha Coaching Classes',
  phone: '9876543210',
  enable_attendance: true
};

export const INITIAL_CLASSES_BATCHES = [
  { id: 'cb-1', name: 'Batch 10th Science', code: '10-SCI', fee_amount: 1500 },
  { id: 'cb-2', name: 'Batch 12th Physics & Math', code: '12-PCM', fee_amount: 2200 },
  { id: 'cb-3', name: 'Batch 9th Foundation', code: '9-FND', fee_amount: 1200 },
  { id: 'cb-4', name: 'Batch JEE Crash Course', code: 'JEE-CR', fee_amount: 3500 },
];

export const INITIAL_STUDENTS = [
  {
    id: 'std-101',
    name: 'Aarav Sharma',
    roll_no: '01',
    class_batch_id: 'cb-1',
    phone: '9876511001',
    guardian_name: 'Rajesh Sharma',
    guardian_phone: '9876511001',
    monthly_fee: 1500,
    attendance_rate: 94,
    status: 'active'
  },
  {
    id: 'std-102',
    name: 'Priya Verma',
    roll_no: '02',
    class_batch_id: 'cb-1',
    phone: '9876511002',
    guardian_name: 'Sunil Verma',
    guardian_phone: '9876511002',
    monthly_fee: 1500,
    attendance_rate: 88,
    status: 'active'
  },
  {
    id: 'std-103',
    name: 'Rohan Gupta',
    roll_no: '03',
    class_batch_id: 'cb-1',
    phone: '9876511003',
    guardian_name: 'Manoj Gupta',
    guardian_phone: '9876511003',
    monthly_fee: 1500,
    attendance_rate: 68,
    status: 'active'
  },
  {
    id: 'std-104',
    name: 'Ananya Mishra',
    roll_no: '04',
    class_batch_id: 'cb-2',
    phone: '9876511004',
    guardian_name: 'Dev Mishra',
    guardian_phone: '9876511004',
    monthly_fee: 2200,
    attendance_rate: 96,
    status: 'active'
  },
  {
    id: 'std-105',
    name: 'Vivek Yadav',
    roll_no: '05',
    class_batch_id: 'cb-2',
    phone: '9876511005',
    guardian_name: 'Ram Yadav',
    guardian_phone: '9876511005',
    monthly_fee: 2000, // scholarship override
    attendance_rate: 72,
    status: 'active'
  },
  {
    id: 'std-106',
    name: 'Sneha Patel',
    roll_no: '06',
    class_batch_id: 'cb-3',
    phone: '9876511006',
    guardian_name: 'Ketan Patel',
    guardian_phone: '9876511006',
    monthly_fee: 1200,
    attendance_rate: 92,
    status: 'active'
  },
  {
    id: 'std-107',
    name: 'Aditya Singh',
    roll_no: '07',
    class_batch_id: 'cb-4',
    phone: '9876511007',
    guardian_name: 'Balwant Singh',
    guardian_phone: '9876511007',
    monthly_fee: 3500,
    attendance_rate: 85,
    status: 'active'
  }
];

export const INITIAL_FEE_DUES = [
  {
    id: 'due-201',
    student_id: 'std-101',
    fee_head: 'October Tuition Fee',
    amount: 1500,
    due_date: '2026-10-10',
    status: 'pending', // 'paid' | 'pending' | 'overdue'
    month: 'October 2026'
  },
  {
    id: 'due-202',
    student_id: 'std-102',
    fee_head: 'October Tuition Fee',
    amount: 1500,
    due_date: '2026-10-10',
    status: 'paid',
    paid_at: '2026-10-05',
    payment_method: 'upi',
    reference_id: 'UPI9823419024',
    month: 'October 2026'
  },
  {
    id: 'due-203',
    student_id: 'std-103',
    fee_head: 'September Tuition Fee',
    amount: 1500,
    due_date: '2026-09-10',
    status: 'overdue',
    month: 'September 2026'
  },
  {
    id: 'due-204',
    student_id: 'std-103',
    fee_head: 'October Tuition Fee',
    amount: 1500,
    due_date: '2026-10-10',
    status: 'overdue',
    month: 'October 2026'
  },
  {
    id: 'due-205',
    student_id: 'std-104',
    fee_head: 'October Tuition Fee',
    amount: 2200,
    due_date: '2026-10-10',
    status: 'paid',
    paid_at: '2026-10-06',
    payment_method: 'cash',
    reference_id: 'CASH-REC-441',
    month: 'October 2026'
  },
  {
    id: 'due-206',
    student_id: 'std-105',
    fee_head: 'October Tuition Fee',
    amount: 2000,
    due_date: '2026-10-05',
    status: 'overdue',
    month: 'October 2026'
  },
  {
    id: 'due-207',
    student_id: 'std-107',
    fee_head: 'October JEE Batch Fee',
    amount: 3500,
    due_date: '2026-10-10',
    status: 'pending',
    month: 'October 2026'
  },
  {
    id: 'due-208',
    student_id: 'std-106',
    fee_head: 'August Tuition Fee',
    amount: 1200,
    due_date: '2026-08-10',
    status: 'overdue',
    month: 'August 2026'
  },
  {
    id: 'due-209',
    student_id: 'std-106',
    fee_head: 'September Tuition Fee',
    amount: 1200,
    due_date: '2026-09-10',
    status: 'overdue',
    month: 'September 2026'
  },
  {
    id: 'due-210',
    student_id: 'std-106',
    fee_head: 'October Tuition Fee',
    amount: 1200,
    due_date: '2026-10-10',
    status: 'overdue',
    month: 'October 2026'
  }
];

export const INITIAL_ATTENDANCE = {
  // Key format: `${date}_${class_batch_id}`: { student_id: 'present' | 'absent' | 'late' }
  '2026-10-07_cb-1': {
    'std-101': 'present',
    'std-102': 'present',
    'std-103': 'absent'
  },
  '2026-10-07_cb-2': {
    'std-104': 'present',
    'std-105': 'late'
  },
  '2026-10-07_cb-3': {
    'std-106': 'absent'
  },
  '2026-10-07_cb-4': {
    'std-107': 'present'
  }
};
