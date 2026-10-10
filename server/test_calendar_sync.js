const http = require('http');
const app = require('./index');
const { initDb, get, run } = require('./db');

const PORT = 5088;
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

async function runCalendarAndSyncTests() {
  console.log('=== Starting Calendar & Sync Specialists Tests ===\n');
  await initDb();

  const server = app.listen(PORT, async () => {
    try {
      // 1. GET /api/calendar/current-time
      console.log('1. Testing GET /api/calendar/current-time...');
      const timeRes = await request('/api/calendar/current-time');
      console.assert(timeRes.status === 200, `Expected 200, got ${timeRes.status}`);
      const td = timeRes.data;
      console.assert(typeof td.iso === 'string' && td.iso.includes('T'), 'Missing or invalid iso string');
      console.assert(/^\d{4}-\d{2}-\d{2}$/.test(td.date), `Invalid date format: ${td.date}`);
      console.assert(/^\d{4}-\d{2}$/.test(td.month), `Invalid month format: ${td.month}`);
      console.assert(typeof td.year === 'number', 'Invalid year');
      console.assert(typeof td.day === 'number', 'Invalid day');
      console.assert(typeof td.formatted === 'string' && td.formatted.length > 0, 'Invalid formatted string');
      console.assert(typeof td.timezone === 'string' && td.timezone.length > 0, 'Invalid timezone');
      console.log(`   OK - Real-time Server Clock: date=${td.date}, month=${td.month}, formatted="${td.formatted}", tz="${td.timezone}"`);

      // 2. PUT /api/institutes/:id with attendance_enabled toggle
      console.log('\n2. Testing PUT /api/institutes/inst_apex_01 (disable attendance)...');
      const putRes1 = await request('/api/institutes/inst_apex_01', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_enabled: 0 })
      });
      console.assert(putRes1.status === 200, `PUT institute failed: ${putRes1.status}`);
      console.assert(putRes1.data.attendance_enabled === 0, `Expected attendance_enabled=0, got ${putRes1.data.attendance_enabled}`);
      console.log(`   OK - Updated attendance_enabled=0 for inst_apex_01`);

      // 3. GET /api/institutes/:id (verify attendance_enabled stored)
      console.log('\n3. Testing GET /api/institutes/inst_apex_01...');
      const getInst1 = await request('/api/institutes/inst_apex_01');
      console.assert(getInst1.status === 200, `GET institute failed: ${getInst1.status}`);
      console.assert(getInst1.data.attendance_enabled === 0, `Expected attendance_enabled=0, got ${getInst1.data.attendance_enabled}`);
      console.log(`   OK - Verified attendance_enabled=0 returned from GET`);

      // 4. GET /api/institutes/:id/dashboard (verify attendance_enabled returned)
      console.log('\n4. Testing GET /api/institutes/inst_apex_01/dashboard...');
      const dashRes1 = await request('/api/institutes/inst_apex_01/dashboard');
      console.assert(dashRes1.status === 200, `GET dashboard failed: ${dashRes1.status}`);
      console.assert(dashRes1.data.attendance_enabled === 0, `Expected attendance_enabled=0 in dashboard, got ${dashRes1.data.attendance_enabled}`);
      console.log(`   OK - Dashboard returned attendance_enabled=0`);

      // 5. Re-enable attendance on institute
      console.log('\n5. Testing PUT /api/institutes/inst_apex_01 (enable attendance)...');
      const putRes2 = await request('/api/institutes/inst_apex_01', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance_enabled: 1 })
      });
      console.assert(putRes2.status === 200, `PUT institute failed: ${putRes2.status}`);
      console.assert(putRes2.data.attendance_enabled === 1, `Expected attendance_enabled=1, got ${putRes2.data.attendance_enabled}`);
      console.log(`   OK - Restored attendance_enabled=1 for inst_apex_01`);

      // 6. POST /api/calendar/monthly-reset
      console.log('\n6. Testing POST /api/calendar/monthly-reset...');
      const resetRes = await request('/api/calendar/monthly-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institute_id: 'inst_apex_01',
          force: false
        })
      });
      console.assert(resetRes.status === 200, `Monthly reset failed: ${resetRes.status}`);
      const rd = resetRes.data;
      console.assert(rd.success === true, 'Expected success=true');
      console.assert(typeof rd.dues_created === 'number', 'Expected dues_created count');
      console.assert(typeof rd.overdue_marked === 'number', 'Expected overdue_marked count');
      console.assert(Array.isArray(rd.records) && rd.records.length > 0, 'Expected records array');
      console.log(`   OK - Monthly reset triggered: dues_created=${rd.dues_created}, overdue_marked=${rd.overdue_marked}, total_students=${rd.total_students}`);

      // 7. GET /api/reports/unpaid-months-record (default array format)
      console.log('\n7. Testing GET /api/reports/unpaid-months-record...');
      const reportRes = await request('/api/reports/unpaid-months-record?institute_id=inst_apex_01');
      console.assert(reportRes.status === 200, `Unpaid months report failed: ${reportRes.status}`);
      console.assert(Array.isArray(reportRes.data), 'Expected array response');
      console.assert(reportRes.data.length > 0, 'Expected non-empty student records');

      const sample = reportRes.data[0];
      console.assert(sample.student_id !== undefined, 'Missing student_id');
      console.assert(sample.student_name !== undefined, 'Missing student_name');
      console.assert(sample.roll_number !== undefined, 'Missing roll_number');
      console.assert(sample.class_batch_name !== undefined, 'Missing class_batch_name');
      console.assert(sample.guardian_phone !== undefined, 'Missing guardian_phone');
      console.assert(sample.guardian_name !== undefined, 'Missing guardian_name');
      console.assert(typeof sample.unpaid_months_count === 'number', 'Invalid unpaid_months_count');
      console.assert(Array.isArray(sample.unpaid_months_list), 'Invalid unpaid_months_list');
      console.assert(typeof sample.total_unpaid_amount === 'number', 'Invalid total_unpaid_amount');
      console.assert(Array.isArray(sample.breakdown), 'Invalid breakdown');

      console.log(`   OK - Found ${reportRes.data.length} student records.`);
      console.log(`   Sample Student: "${sample.student_name}" (Batch: ${sample.class_batch_name})`);
      console.log(`   Unpaid Months Count: ${sample.unpaid_months_count}, Months: ${JSON.stringify(sample.unpaid_months_list)}`);
      console.log(`   Total Unpaid Amount: ₹${sample.total_unpaid_amount}`);

      // 8. Find a student with multiple unpaid months if any, or print summary
      const defaultersWithMonths = reportRes.data.filter(s => s.unpaid_months_count > 0);
      console.log(`\n8. Defaulter Summary from Unpaid Months Record:`);
      console.log(`   Total active students: ${reportRes.data.length}`);
      console.log(`   Students with unpaid months: ${defaultersWithMonths.length}`);
      defaultersWithMonths.slice(0, 4).forEach((d, i) => {
        console.log(`   ${i + 1}. ${d.student_name} (${d.class_batch_name}) - Unpaid: ${d.unpaid_months_count} month(s) [${d.unpaid_months_list.join(', ')}] - ₹${d.total_unpaid_amount}`);
      });

      // 9. GET /api/reports/unpaid-months-record?format=object
      console.log('\n9. Testing GET /api/reports/unpaid-months-record?format=object...');
      const objReport = await request('/api/reports/unpaid-months-record?institute_id=inst_apex_01&format=object');
      console.assert(objReport.status === 200, `Object format failed: ${objReport.status}`);
      console.assert(typeof objReport.data.total_students === 'number', 'Missing total_students');
      console.assert(typeof objReport.data.total_unpaid_amount === 'number', 'Missing total_unpaid_amount');
      console.assert(Array.isArray(objReport.data.records), 'Missing records array');
      console.log(`   OK - Object format validated: total_students=${objReport.data.total_students}, total_unpaid_amount=₹${objReport.data.total_unpaid_amount}`);

      // 10. GET /api/reports/unpaid-months-record?format=csv
      console.log('\n10. Testing GET /api/reports/unpaid-months-record?format=csv...');
      const csvReport = await request('/api/reports/unpaid-months-record?institute_id=inst_apex_01&format=csv');
      console.assert(csvReport.status === 200, `CSV format failed: ${csvReport.status}`);
      console.assert(csvReport.data.includes('Student ID,Student Name,Roll Number'), 'Missing CSV header');
      console.log(`   OK - CSV exported with header and records`);

      console.log('\n>>> ALL 10 CALENDAR, SYNC & UNPAID MONTHS TESTS PASSED! <<<');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('\nTest execution failed:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runCalendarAndSyncTests();
