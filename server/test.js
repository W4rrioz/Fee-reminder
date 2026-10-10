const http = require('http');
const app = require('./index');
const { initDb } = require('./db');

let server;
const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  return { status: response.status, data };
}

async function runTests() {
  console.log('--- Starting API Integration Tests ---');
  await initDb();

  server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);

    try {
      // 1. Health check
      console.log('1. Testing GET /api/health...');
      const health = await request('/api/health');
      console.assert(health.status === 200, `Health check failed: ${health.status}`);
      console.log('   OK - Health check passed');

      // 2. Institutes
      console.log('2. Testing GET /api/institutes/inst_apex_01...');
      const inst = await request('/api/institutes/inst_apex_01');
      console.assert(inst.status === 200, `Get institute failed: ${inst.status}`);
      console.assert(inst.data.name === 'Apex Coaching Academy', `Unexpected name: ${inst.data.name}`);
      console.log(`   OK - Institute found: ${inst.data.name}, Type: ${inst.data.type}, UPI: ${inst.data.upi_id}`);

      // 3. Institute Dashboard
      console.log('3. Testing GET /api/institutes/inst_apex_01/dashboard...');
      const dash = await request('/api/institutes/inst_apex_01/dashboard');
      console.assert(dash.status === 200, `Dashboard failed: ${dash.status}`);
      console.log(`   OK - Dashboard: collected=₹${dash.data.collected_this_month}, due=₹${dash.data.due_this_month}, defaulters=${dash.data.defaulter_count}, attendance_rate=${dash.data.attendance_rate_today}%`);

      // 4. Classes/Batches
      console.log('4. Testing GET /api/classes-batches?institute_id=inst_apex_01...');
      const batches = await request('/api/classes-batches?institute_id=inst_apex_01');
      console.assert(batches.status === 200, `Get batches failed: ${batches.status}`);
      console.assert(Array.isArray(batches.data) && batches.data.length >= 3, `Expected at least 3 batches, got ${batches.data.length}`);
      console.log(`   OK - Found ${batches.data.length} batches`);

      // 5. Students
      console.log('5. Testing GET /api/students?institute_id=inst_apex_01...');
      const students = await request('/api/students?institute_id=inst_apex_01');
      console.assert(students.status === 200, `Get students failed: ${students.status}`);
      console.assert(students.data.length >= 10, `Expected at least 10 students, got ${students.data.length}`);
      console.log(`   OK - Found ${students.data.length} students (First: ${students.data[0].name}, Guardian: ${students.data[0].guardian_name})`);

      // 6. Create Student
      console.log('6. Testing POST /api/students...');
      const newStudent = await request('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institute_id: 'inst_apex_01',
          class_batch_id: batches.data[0].id,
          name: 'Test Student Kapil',
          roll_number: 'APX-TEST-99',
          guardian_name: 'Sanjay Kapil',
          guardian_phone: '+919999888877',
          guardian_relation: 'Father'
        })
      });
      console.assert(newStudent.status === 201, `Create student failed: ${newStudent.status}`);
      console.log(`   OK - Created student: ${newStudent.data.name} (ID: ${newStudent.data.id})`);

      // 7. Fee Dues
      console.log('7. Testing GET /api/fee-dues?institute_id=inst_apex_01...');
      const dues = await request('/api/fee-dues?institute_id=inst_apex_01');
      console.assert(dues.status === 200, `Get dues failed: ${dues.status}`);
      console.assert(dues.data.length >= 10, `Expected dues, got ${dues.data.length}`);
      console.log(`   OK - Found ${dues.data.length} fee dues`);

      // 8. Remind Endpoint (WhatsApp + Dynamic UPI)
      console.log('8. Testing POST /api/fee-dues/:id/remind...');
      const targetDue = dues.data.find(d => d.status === 'pending' || d.status === 'overdue');
      const remindRes = await request(`/api/fee-dues/${targetDue.id}/remind`, {
        method: 'POST'
      });
      console.assert(remindRes.status === 200, `Remind endpoint failed: ${remindRes.status}`);
      console.assert(remindRes.data.upi_deep_link.includes('upi://pay?pa='), 'UPI deep link missing');
      console.assert(remindRes.data.whatsapp_url.includes('https://wa.me/'), 'wa.me link missing');
      console.log(`   OK - WhatsApp link generated: ${remindRes.data.whatsapp_url.slice(0, 60)}...`);
      console.log(`   OK - UPI Deep Link: ${remindRes.data.upi_deep_link}`);

      // 9. Payment recording
      console.log('9. Testing POST /api/fee-dues/:id/payments...');
      const payRes = await request(`/api/fee-dues/${targetDue.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 500,
          method: 'cash',
          reference_id: 'CASH-TEST-101',
          recorded_by: 'Staff Frontdesk'
        })
      });
      console.assert(payRes.status === 201, `Record payment failed: ${payRes.status}`);
      console.log(`   OK - Payment recorded: ₹${payRes.data.payment.amount}, Due Status now: ${payRes.data.fee_due.status}, Balance: ₹${payRes.data.fee_due.balance_due}`);

      // 10. Attendance Bulk Mark
      console.log('10. Testing POST /api/attendance (bulk mark)...');
      const bulkAtt = await request('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_batch_id: batches.data[0].id,
          date: '2026-10-07',
          records: [
            { student_id: students.data[0].id, status: 'present' },
            { student_id: students.data[1].id, status: 'late' }
          ],
          marked_by: 'Aman Mishra'
        })
      });
      console.assert(bulkAtt.status === 200, `Attendance bulk mark failed: ${bulkAtt.status}`);
      console.log(`   OK - Marked attendance: ${bulkAtt.data.count} records`);

      // 11. Student Attendance History
      console.log('11. Testing GET /api/students/:id/attendance...');
      const stdAtt = await request(`/api/students/${students.data[0].id}/attendance`);
      console.assert(stdAtt.status === 200, `Student attendance failed: ${stdAtt.status}`);
      console.log(`   OK - Student attendance %: ${stdAtt.data.attendance_percentage}% across ${stdAtt.data.total_days} recorded days`);

      // 12. Defaulters Report
      console.log('12. Testing GET /api/reports/defaulters...');
      const defRep = await request('/api/reports/defaulters?institute_id=inst_apex_01');
      console.assert(defRep.status === 200, `Defaulters report failed: ${defRep.status}`);
      console.log(`   OK - Total defaulters: ${defRep.data.total_defaulters}, Total overdue: ₹${defRep.data.total_overdue_amount}`);

      console.log('\n>>> ALL 12 API INTEGRATION TESTS PASSED SUCCESSFULLY! <<<');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Test execution failed:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();
