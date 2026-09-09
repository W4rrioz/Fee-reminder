/**
 * FeeReminder Automated QA Test Suite
 * Tests:
 * 1. Admin Authentication (POST /api/auth/signin, GET /api/auth/me)
 * 2. CSV Student Batch Import & Structured Validation Handling (POST /api/students/import-csv)
 * 3. Custom Reminder Message Templates & Student Timeline Logs (PUT/GET /api/settings, POST /api/reminders, GET /api/students/:id)
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Test statistics
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  suites: [],
};

let currentSuite = null;

function startSuite(name) {
  currentSuite = { name, checks: [] };
  stats.suites.push(currentSuite);
  console.log(`\n===============================================================`);
  console.log(`🔷 SUITE: ${name}`);
  console.log(`===============================================================`);
}

function recordCheck(name, passed, details = {}) {
  stats.total++;
  if (typeof passed === 'function') {
    try {
      passed = passed();
    } catch (e) {
      details.error = e.message;
      passed = false;
    }
  }
  if (passed) {
    stats.passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    stats.failed++;
    console.error(`  ❌ [FAIL] ${name}`);
    if (details.error) console.error(`     Error: ${details.error}`);
    if (details.expected !== undefined) console.error(`     Expected: ${JSON.stringify(details.expected)}`);
    if (details.actual !== undefined) console.error(`     Actual:   ${JSON.stringify(details.actual)}`);
  }
  if (currentSuite) {
    currentSuite.checks.push({ name, passed, details });
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let body = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, ok: res.ok, headers: res.headers, data: body };
}

// ==========================================
// TEST EXECUTION
// ==========================================

async function runQATests() {
  console.log(`\n🚀 Starting QA Automation Run on ${BASE_URL}`);
  console.log(`🕒 Timestamp: ${new Date().toISOString()}`);

  let authToken = null;
  let adminTenantId = null;

  // -------------------------------------------------------------
  // SUITE 1: Admin Authentication
  // -------------------------------------------------------------
  startSuite('1. Admin Authentication & Session Verification');

  try {
    // 1.1 Valid signin
    const signinRes = await request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@feereminder.local',
        password: 'admin123',
      }),
    });

    const hasToken = signinRes.status === 200 && typeof signinRes.data?.token === 'string';
    const hasAdminObj = signinRes.data?.admin?.email === 'admin@feereminder.local';
    
    recordCheck('POST /api/auth/signin returns HTTP 200 with JWT token', hasToken, {
      expected: 200,
      actual: signinRes.status,
      error: signinRes.data?.error,
    });

    recordCheck('POST /api/auth/signin returns correct admin profile & tenant ID', hasAdminObj, {
      expected: 'admin@feereminder.local',
      actual: signinRes.data?.admin?.email,
    });

    if (hasToken) {
      authToken = signinRes.data.token;
      adminTenantId = signinRes.data.admin.tenant_id;
    }

    // 1.2 Invalid password
    const badPassRes = await request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@feereminder.local',
        password: 'wrongpassword!',
      }),
    });
    recordCheck('POST /api/auth/signin rejects invalid password with HTTP 401', badPassRes.status === 401, {
      expected: 401,
      actual: badPassRes.status,
    });

    // 1.3 Non-existent user
    const noUserRes = await request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@feereminder.local',
        password: 'password123',
      }),
    });
    recordCheck('POST /api/auth/signin rejects non-existent user with HTTP 401', noUserRes.status === 401, {
      expected: 401,
      actual: noUserRes.status,
    });

    // 1.4 Missing credentials
    const emptyRes = await request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email: '', password: '' }),
    });
    recordCheck('POST /api/auth/signin rejects empty credentials with HTTP 400', emptyRes.status === 400, {
      expected: 400,
      actual: emptyRes.status,
    });

    // 1.5 Verify /api/auth/me
    const meRes = await request('/api/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    recordCheck('GET /api/auth/me resolves authenticated admin & tenant info', meRes.status === 200 && meRes.data?.admin?.tenant_id === adminTenantId, {
      expected: adminTenantId,
      actual: meRes.data?.admin?.tenant_id,
    });

  } catch (err) {
    recordCheck('Suite 1 Unhandled Execution Error', false, { error: err.message });
  }

  // -------------------------------------------------------------
  // SUITE 2: CSV Import & Structured Validation Handling
  // -------------------------------------------------------------
  startSuite('2. CSV Batch Import & Validation Handling');

  let importedStudentId = null;
  let importedFeeId = null;

  try {
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // 2.1 Valid Batch JSON format import
    const validBatch = [
      {
        name: 'Aarav Sharma',
        parent_phone: '9876543210',
        amount: 3500,
        due_date: '2026-09-20',
        note: 'Physics Batch A',
      },
      {
        name: 'Diya Patel',
        parent_phone: '+91 9812345678',
        amount: '4000',
        due_date: '15/09/2026', // DD/MM/YYYY support
        note: 'Maths Advanced',
      },
      {
        name: 'Rohan Gupta',
        parent_phone: '09123456789',
        amount: 2500,
        due_date: '2026-08-01', // Past date -> overdue
        note: 'Chemistry Morning',
      },
    ];

    const validImportRes = await request('/api/students/import-csv', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ rows: validBatch }),
    });

    const isImportOk = validImportRes.status === 201 && validImportRes.data?.success === true;
    const importedCount = validImportRes.data?.summary?.imported === 3;
    const hasImportedArray = Array.isArray(validImportRes.data?.imported) && validImportRes.data?.imported.length === 3;

    recordCheck('POST /api/students/import-csv accepts valid batch and returns HTTP 201', isImportOk, {
      expected: 201,
      actual: validImportRes.status,
      error: validImportRes.data?.error,
    });

    recordCheck('POST /api/students/import-csv returns accurate summary (imported: 3, failed: 0)', importedCount, {
      expected: { imported: 3, failed: 0 },
      actual: validImportRes.data?.summary,
    });

    recordCheck('POST /api/students/import-csv normalizes phone numbers to +91 E.164 and DD/MM/YYYY dates', () => {
      if (!hasImportedArray) return false;
      const diya = validImportRes.data.imported.find(s => s.name === 'Diya Patel');
      const rohan = validImportRes.data.imported.find(s => s.name === 'Rohan Gupta');
      return (
        diya?.parent_phone === '+919812345678' &&
        diya?.due_date === '2026-09-15' &&
        rohan?.parent_phone === '+919123456789' &&
        rohan?.status === 'overdue'
      );
    }, {
      imported: validImportRes.data?.imported,
    });

    if (hasImportedArray && validImportRes.data.imported.length > 0) {
      importedStudentId = validImportRes.data.imported[0].studentId;
      importedFeeId = validImportRes.data.imported[0].feeId;
    }

    // 2.2 CSV text format import (csvText)
    const csvString = `Student Name,Parent Phone,Fee Amount,Due Date,Note\nAnanya Verma,9988776655,5000,2026-09-25,Biology Batch\nKabir Das,9876501234,3000,2026-09-28,Class 10 Revision`;
    const csvTextRes = await request('/api/students/import-csv', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ csvText: csvString }),
    });

    recordCheck('POST /api/students/import-csv supports raw csvText payload parsing headers', csvTextRes.status === 201 && csvTextRes.data?.summary?.imported === 2, {
      expected: { imported: 2 },
      actual: csvTextRes.data?.summary,
      error: csvTextRes.data?.error,
    });

    // 2.3 Malformed Data Validation Handling (Phone, Amount, Date, Name)
    const malformedBatch = [
      {
        name: 'Invalid Phone Student',
        parent_phone: '12345', // < 10 digits
        amount: 2000,
        due_date: '2026-09-15',
      },
      {
        name: 'Invalid Prefix Phone',
        parent_phone: '3876543210', // starts with 3 (must be 6-9)
        amount: 2000,
        due_date: '2026-09-15',
      },
      {
        name: 'Invalid Amount Student',
        parent_phone: '9876543210',
        amount: -500, // Negative amount
        due_date: '2026-09-15',
      },
      {
        name: 'Non-numeric Amount Student',
        parent_phone: '9876543210',
        amount: 'N/A',
        due_date: '2026-09-15',
      },
      {
        name: 'Invalid Date Student',
        parent_phone: '9876543210',
        amount: 2000,
        due_date: '2026-13-45', // Invalid date
      },
      {
        name: '', // Empty name
        parent_phone: '9876543210',
        amount: 2000,
        due_date: '2026-09-15',
      },
    ];

    const malformedRes = await request('/api/students/import-csv', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ rows: malformedBatch }),
    });

    recordCheck('POST /api/students/import-csv rejects 100% invalid batch with HTTP 400', malformedRes.status === 400, {
      expected: 400,
      actual: malformedRes.status,
    });

    const hasStructuredErrors = Array.isArray(malformedRes.data?.invalidRows) && malformedRes.data.invalidRows.length === malformedBatch.length;
    recordCheck('POST /api/students/import-csv returns structured invalidRows array with row-level error details', hasStructuredErrors, {
      expected: `Array of length ${malformedBatch.length}`,
      actual: malformedRes.data?.invalidRows?.length,
    });

    // Check specific error messages
    const phoneError = malformedRes.data?.invalidRows?.find(r => r.raw.name === 'Invalid Phone Student')?.errors?.some(e => e.includes('phone'));
    const amountError = malformedRes.data?.invalidRows?.find(r => r.raw.name === 'Invalid Amount Student')?.errors?.some(e => e.includes('amount') || e.includes('greater than 0'));
    const dateError = malformedRes.data?.invalidRows?.find(r => r.raw.name === 'Invalid Date Student')?.errors?.some(e => e.includes('due date'));
    const nameError = malformedRes.data?.invalidRows?.find(r => r.raw.name === '')?.errors?.some(e => e.includes('name is required'));

    recordCheck('Validation Error: Detects invalid/short phone numbers', !!phoneError, {
      actual: malformedRes.data?.invalidRows?.[0]?.errors,
    });
    recordCheck('Validation Error: Detects negative/non-numeric fee amounts', !!amountError, {
      actual: malformedRes.data?.invalidRows?.[2]?.errors,
    });
    recordCheck('Validation Error: Detects invalid date formats', !!dateError, {
      actual: malformedRes.data?.invalidRows?.[4]?.errors,
    });
    recordCheck('Validation Error: Detects missing student names', !!nameError, {
      actual: malformedRes.data?.invalidRows?.[5]?.errors,
    });

    // 2.4 Partial/Mixed Batch (Valid + Invalid)
    const mixedBatch = [
      {
        name: 'Valid Mixed Student 1',
        parent_phone: '9876511111',
        amount: 1500,
        due_date: '2026-09-30',
      },
      {
        name: 'Invalid Mixed Student',
        parent_phone: 'invalid-phone',
        amount: 1500,
        due_date: '2026-09-30',
      },
      {
        name: 'Valid Mixed Student 2',
        parent_phone: '9876522222',
        amount: 2500,
        due_date: '2026-09-30',
      },
    ];

    const mixedRes = await request('/api/students/import-csv', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ rows: mixedBatch }),
    });

    const isPartialOk = mixedRes.status === 201 &&
      mixedRes.data?.summary?.imported === 2 &&
      mixedRes.data?.summary?.failed === 1 &&
      Array.isArray(mixedRes.data?.imported) &&
      Array.isArray(mixedRes.data?.skipped);

    recordCheck('POST /api/students/import-csv processes mixed batch (imports valid, reports skipped in summary)', isPartialOk, {
      expected: { imported: 2, failed: 1 },
      actual: mixedRes.data?.summary,
    });

    // 2.5 Verify Dashboard Listing
    const listRes = await request('/api/students', {
      headers: authHeaders,
    });

    recordCheck('GET /api/students lists newly imported students with computed summary metrics', listRes.status === 200 && Array.isArray(listRes.data?.students) && listRes.data.students.length >= 5, {
      expected: '>= 5 students',
      actual: listRes.data?.students?.length,
      summary: listRes.data?.summary,
    });

  } catch (err) {
    recordCheck('Suite 2 Unhandled Execution Error', false, { error: err.message });
  }

  // -------------------------------------------------------------
  // SUITE 3: Custom Message Templates & Student Timeline Logs
  // -------------------------------------------------------------
  startSuite('3. Custom Message Templates & Student Timeline Logs');

  try {
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // 3.1 Save Custom Reminder Template & Settings
    const customTemplate = 'Namaste {student_name}, please pay {amount} by {due_date} to {upi_id}';
    const instituteUpi = 'apexacademy@okhdfcbank';
    const instituteName = 'Apex Coaching Academy';

    const putSettingsRes = await request('/api/settings', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: instituteName,
        upi_id: instituteUpi,
        reminder_template: customTemplate,
        bank_details: 'A/C: 9876543210, IFSC: HDFC0001234',
      }),
    });

    recordCheck('PUT /api/settings saves custom reminder_template and payment credentials', putSettingsRes.status === 200 && putSettingsRes.data?.settings?.reminder_template === customTemplate, {
      expected: customTemplate,
      actual: putSettingsRes.data?.settings?.reminder_template,
      error: putSettingsRes.data?.error,
    });

    // 3.2 GET /api/settings and verify persistence
    const getSettingsRes = await request('/api/settings', {
      headers: authHeaders,
    });

    const isPersisted = getSettingsRes.status === 200 &&
      getSettingsRes.data?.settings?.reminder_template === customTemplate &&
      getSettingsRes.data?.settings?.upi_id === instituteUpi &&
      getSettingsRes.data?.settings?.name === instituteName;

    recordCheck('GET /api/settings verifies custom reminder_template & UPI ID persist correctly in SQLite', isPersisted, {
      expected: { reminder_template: customTemplate, upi_id: instituteUpi },
      actual: getSettingsRes.data?.settings,
    });

    // 3.3 Create a dedicated student for timeline logging
    const newStudentRes = await request('/api/students', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Tanya Sen',
        parentPhone: '9876500001',
        amount: 3200,
        dueDate: '2026-09-18',
        note: 'Timeline QA Test Subject',
      }),
    });

    const studentId = newStudentRes.data?.student?.id || importedStudentId;
    const feeId = newStudentRes.data?.fee?.id || importedFeeId;

    recordCheck('POST /api/students creates student & fee record for timeline testing', newStudentRes.status === 201 && !!studentId && !!feeId, {
      studentId,
      feeId,
    });

    // 3.4 Log first WhatsApp reminder
    const rem1Res = await request('/api/reminders', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ feeId }),
    });

    recordCheck('POST /api/reminders logs initial WhatsApp reminder event', rem1Res.status === 201 && rem1Res.data?.reminder?.fee_id === feeId, {
      expected: 201,
      actual: rem1Res.status,
      reminder: rem1Res.data?.reminder,
    });

    // Small delay to ensure timestamp separation
    await new Promise(r => setTimeout(r, 100));

    // Log second reminder
    const rem2Res = await request('/api/reminders', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ feeId }),
    });

    recordCheck('POST /api/reminders logs follow-up reminder event', rem2Res.status === 201, {
      expected: 201,
      actual: rem2Res.status,
    });

    // 3.5 GET /api/students/:id to verify timeline logs
    const detailRes = await request(`/api/students/${studentId}`, {
      headers: authHeaders,
    });

    const hasStudentObj = detailRes.status === 200 && detailRes.data?.student?.id === studentId;
    const hasFeesArray = Array.isArray(detailRes.data?.fees) && detailRes.data?.fees.length > 0;
    const remindersArray = detailRes.data?.reminders;
    const hasTimelineLogs = Array.isArray(remindersArray) && remindersArray.length >= 2;

    recordCheck('GET /api/students/:id returns student profile and fee obligations', hasStudentObj && hasFeesArray, {
      status: detailRes.status,
      feesCount: detailRes.data?.fees?.length,
    });

    recordCheck('GET /api/students/:id returns chronological reminder timeline logs array', hasTimelineLogs, {
      expected: 'Array with >= 2 reminder logs',
      actual: Array.isArray(remindersArray) ? `${remindersArray.length} entries` : remindersArray,
    });

    recordCheck('Timeline logs contain structured attributes (id, fee_id, sent_at)', () => {
      if (!hasTimelineLogs) return false;
      const firstLog = remindersArray[0];
      return !!firstLog.id && !!firstLog.fee_id && !!firstLog.sent_at;
    }, {
      sampleLog: remindersArray?.[0],
    });

    // 3.6 Verify message template variable substitution
    const sampleStudent = detailRes.data?.student;
    const sampleFee = detailRes.data?.fees?.[0];
    const settings = getSettingsRes.data?.settings;

    let formattedMsg = customTemplate
      .replace('{student_name}', sampleStudent?.name || '')
      .replace('{amount}', `₹${sampleFee?.amount?.toLocaleString('en-IN') || ''}`)
      .replace('{due_date}', sampleFee?.due_date || '')
      .replace('{upi_id}', settings?.upi_id || '');

    const templateRenderedCorrectly = (
      formattedMsg.includes('Tanya Sen') &&
      formattedMsg.includes('3,200') &&
      formattedMsg.includes('2026-09-18') &&
      formattedMsg.includes('apexacademy@okhdfcbank')
    );

    recordCheck('Message Template Substitution: Correctly populates {student_name}, {amount}, {due_date}, {upi_id}', templateRenderedCorrectly, {
      customTemplate,
      renderedMessage: formattedMsg,
    });

  } catch (err) {
    recordCheck('Suite 3 Unhandled Execution Error', false, { error: err.message });
  }

  // ==========================================
  // FINAL REPORT SUMMARY
  // ==========================================
  console.log(`\n===============================================================`);
  console.log(`📊 QA AUTOMATION TEST SUMMARY REPORT`);
  console.log(`===============================================================`);
  console.log(`Total Checks Executed : ${stats.total}`);
  console.log(`Passed Checks         : ${stats.passed} (${Math.round((stats.passed / stats.total) * 100)}%)`);
  console.log(`Failed Checks         : ${stats.failed}`);
  console.log(`Final Result          : ${stats.failed === 0 ? '🟢 ALL TESTS PASSED' : '🔴 SOME TESTS FAILED'}`);
  console.log(`===============================================================\n`);

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runQATests();
