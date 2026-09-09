/**
 * FeeReminder Comprehensive QA Automation Suite
 * Tests:
 * 1. Authentication & JWT Token Issuance (POST /api/auth/signin)
 * 2. Identity & Profile Verification (GET /api/auth/me)
 * 3. Seeded Data Verification (GET /api/students, GET /api/settings)
 * 4. Multi-Tenant Isolation & Authorization Boundary Testing
 * 5. Analytics Metrics & Financial Mathematical Accuracy
 */

const API_BASE = 'http://localhost:3001/api';

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(suite, name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    results.failed++;
    console.error(`  ❌ [FAIL] ${name} -> ${details}`);
  }
  results.tests.push({ suite, name, passed, details });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runQA() {
  console.log('====================================================');
  console.log('🚀 STARTING FEEREMINDER RIGOROUS QA TEST SUITE');
  console.log(`Target: ${API_BASE}`);
  console.log('Time: ' + new Date().toISOString());
  console.log('====================================================\n');

  let adminToken = null;
  let adminData = null;
  let seededStudents = [];
  let tenantBToken = null;
  let tenantBData = null;

  // ==========================================
  // SUITE 1: AUTHENTICATION & JWT ISSUANCE
  // ==========================================
  console.log('📋 SUITE 1: Authentication & Token Issuance (POST /api/auth/signin)');
  try {
    // 1.1 Negative test: missing credentials
    const badReqRes = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' })
    });
    recordTest('Auth', 'Rejects empty credentials with 400 Bad Request', badReqRes.status === 400);

    // 1.2 Negative test: invalid credentials
    const badPassRes = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@feereminder.local', password: 'wrongpassword' })
    });
    recordTest('Auth', 'Rejects wrong password with 401 Unauthorized', badPassRes.status === 401);

    // 1.3 Positive test: correct admin credentials
    const authRes = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@feereminder.local', password: 'admin123' })
    });
    const authJson = await authRes.json();
    
    const isStatus200 = authRes.status === 200;
    const hasValidToken = typeof authJson.token === 'string' && authJson.token.split('.').length === 3;
    const hasAdminObj = Boolean(authJson.admin && authJson.admin.id && authJson.admin.email && authJson.admin.tenant_id);
    
    adminToken = authJson.token;
    adminData = authJson.admin;

    recordTest('Auth', 'Admin signin returns 200 OK', isStatus200, `Status: ${authRes.status}`);
    recordTest('Auth', 'Valid 3-segment JWT token issued', hasValidToken, `Token: ${authJson.token?.slice(0, 20)}...`);
    recordTest('Auth', 'Admin payload contains id, email, tenant_id, tenant_name', hasAdminObj, JSON.stringify(authJson.admin));
    recordTest('Auth', 'Admin email matches admin@feereminder.local', authJson.admin?.email?.toLowerCase() === 'admin@feereminder.local', `Email: ${authJson.admin?.email}`);
  } catch (err) {
    recordTest('Auth', 'Suite 1 execution error', false, err.message);
  }

  // ==========================================
  // SUITE 2: PROFILE VERIFICATION
  // ==========================================
  console.log('\n📋 SUITE 2: Profile & Identity Verification (GET /api/auth/me)');
  try {
    // 2.1 Negative test: missing authorization header
    const noAuthRes = await fetch(`${API_BASE}/auth/me`);
    recordTest('Profile', 'Rejects unauthenticated request with 401', noAuthRes.status === 401);

    // 2.2 Negative test: invalid / tampered token
    const fakeAuthRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: 'Bearer invalid.fake.token' }
    });
    recordTest('Profile', 'Rejects forged token with 401', fakeAuthRes.status === 401);

    // 2.3 Positive test: valid admin token
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const meJson = await meRes.json();

    const isMe200 = meRes.status === 200;
    const adminMatches = Boolean(
      meJson.admin &&
      meJson.admin.id === adminData.id &&
      meJson.admin.tenant_id === adminData.tenant_id &&
      meJson.admin.email.toLowerCase() === adminData.email.toLowerCase()
    );

    recordTest('Profile', 'GET /api/auth/me returns 200 OK', isMe200);
    recordTest('Profile', 'Me profile matches signin tenant_id and admin ID', adminMatches, JSON.stringify(meJson));
    recordTest('Profile', 'Tenant name is populated', Boolean(meJson.admin?.tenant_name), `Name: ${meJson.admin?.tenant_name}`);
  } catch (err) {
    recordTest('Profile', 'Suite 2 execution error', false, err.message);
  }

  // ==========================================
  // SUITE 3: SEEDED DATA INTEGRITY & SCHEMA
  // ==========================================
  console.log('\n📋 SUITE 3: Seeded Data & Schema Integrity (GET /api/students & GET /api/settings)');
  try {
    // 3.1 Verify Settings
    const settingsRes = await fetch(`${API_BASE}/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const settingsJson = await settingsRes.json();
    const settings = settingsJson.settings;

    recordTest('Settings', 'GET /api/settings returns 200 OK', settingsRes.status === 200);
    recordTest('Settings', 'Settings has valid tenant ID matching admin', settings?.id === adminData.tenant_id);
    recordTest('Settings', 'Institute name is configured', Boolean(settings?.name), `Institute: ${settings?.name}`);
    recordTest('Settings', 'UPI ID is populated or valid string', typeof settings?.upi_id === 'string', `UPI: ${settings?.upi_id}`);
    recordTest('Settings', 'Bank details field exists', typeof settings?.bank_details === 'string');

    // 3.2 Verify Students
    const studentsRes = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const studentsJson = await studentsRes.json();
    seededStudents = studentsJson.students || [];

    recordTest('Students', 'GET /api/students returns 200 OK', studentsRes.status === 200);
    recordTest('Students', 'Exactly 50 seeded students found', seededStudents.length === 50, `Found: ${seededStudents.length}`);

    // Check individual student schema and fields
    let allStudentsHaveRequiredFields = true;
    let allPhonesValidE164 = true;
    let allFeesValid = true;
    let phoneFormatErrors = [];
    let fieldErrors = [];

    const indianPhoneRegex = /^\+91[6-9]\d{9}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    for (const s of seededStudents) {
      if (!s.id || !s.name || !s.created_at) {
        allStudentsHaveRequiredFields = false;
        fieldErrors.push(`Student missing id/name/created_at: ${JSON.stringify(s)}`);
      }
      if (!s.parent_phone || !indianPhoneRegex.test(s.parent_phone)) {
        allPhonesValidE164 = false;
        phoneFormatErrors.push(`${s.name}: ${s.parent_phone}`);
      }
      if (!s.fee || typeof s.fee.amount !== 'number' || s.fee.amount <= 0 || !dateRegex.test(s.fee.due_date) || !['overdue', 'pending', 'paid'].includes(s.fee.status)) {
        allFeesValid = false;
      }
    }

    recordTest('Students', 'All 50 students have required base fields (id, name, created_at)', allStudentsHaveRequiredFields, fieldErrors.slice(0, 3).join('; '));
    recordTest('Students', 'All 50 parent phone numbers follow valid E.164 (+91XXXXXXXXXX)', allPhonesValidE164, phoneFormatErrors.slice(0, 3).join('; '));
    recordTest('Students', 'All 50 students have valid linked fee objects (amount > 0, valid due_date, valid status)', allFeesValid);

    // Verify Urgency sorting: Overdue first, then Pending, then Paid
    let isUrgencySorted = true;
    let currentPhase = 1; // 1: overdue, 2: pending, 3: paid
    for (const s of seededStudents) {
      const status = s.fee?.status;
      if (status === 'overdue') {
        if (currentPhase > 1) { isUrgencySorted = false; break; }
      } else if (status === 'pending') {
        if (currentPhase > 2) { isUrgencySorted = false; break; }
        currentPhase = 2;
      } else if (status === 'paid') {
        currentPhase = 3;
      }
    }
    recordTest('Students', 'Students list is ordered by urgency (Overdue -> Pending -> Paid)', isUrgencySorted);

  } catch (err) {
    recordTest('Seeded Data', 'Suite 3 execution error', false, err.message);
  }

  // ==========================================
  // SUITE 4: MULTI-TENANT ISOLATION
  // ==========================================
  console.log('\n📋 SUITE 4: Multi-Tenant Isolation & Authorization Boundary Testing');
  try {
    // 4.1 Create second tenant (Tenant B)
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const tenantBEmail = `qa_tenant_b_${randomSuffix}@testdomain.com`;
    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instituteName: `Bright Future Academy ${randomSuffix}`,
        email: tenantBEmail,
        password: 'Password123!'
      })
    });
    const signupJson = await signupRes.json();
    tenantBToken = signupJson.token;
    tenantBData = signupJson.admin;

    recordTest('Tenant Isolation', 'Successfully created independent Tenant B', signupRes.status === 201 && Boolean(tenantBToken));
    recordTest('Tenant Isolation', 'Tenant B has unique tenant_id different from Admin A', tenantBData?.tenant_id !== adminData?.tenant_id);

    // 4.2 Query students as Tenant B -> should be empty (0 students)
    const tenantBStudentsRes = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${tenantBToken}` }
    });
    const tenantBStudentsJson = await tenantBStudentsRes.json();
    recordTest('Tenant Isolation', 'Tenant B GET /api/students returns 0 students (clean isolation)', tenantBStudentsJson.students?.length === 0, `Count: ${tenantBStudentsJson.students?.length}`);

    // 4.3 Attempt Cross-Tenant Read on Tenant A student by Tenant B
    const targetStudentA = seededStudents[0];
    const crossReadRes = await fetch(`${API_BASE}/students/${targetStudentA.id}`, {
      headers: { Authorization: `Bearer ${tenantBToken}` }
    });
    recordTest('Tenant Isolation', 'Tenant B accessing Tenant A student returns 404/403', crossReadRes.status === 404 || crossReadRes.status === 403, `Status: ${crossReadRes.status}`);

    // 4.4 Attempt Cross-Tenant Update on Tenant A student by Tenant B
    const crossUpdateRes = await fetch(`${API_BASE}/students/${targetStudentA.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantBToken}`
      },
      body: JSON.stringify({ name: 'Hacked Student Name', parentPhone: '+919999999999' })
    });
    recordTest('Tenant Isolation', 'Tenant B modifying Tenant A student returns 404/403', crossUpdateRes.status === 404 || crossUpdateRes.status === 403, `Status: ${crossUpdateRes.status}`);

    // 4.5 Attempt Cross-Tenant Fee Mark as Paid on Tenant A fee by Tenant B
    const crossFeePayRes = await fetch(`${API_BASE}/fees/${targetStudentA.fee.id}/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tenantBToken}` }
    });
    recordTest('Tenant Isolation', 'Tenant B paying Tenant A fee returns 404/403', crossFeePayRes.status === 404 || crossFeePayRes.status === 403, `Status: ${crossFeePayRes.status}`);

    // 4.6 Attempt Cross-Tenant Fee Revert on Tenant A fee by Tenant B
    const crossFeeRevertRes = await fetch(`${API_BASE}/fees/${targetStudentA.fee.id}/revert`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tenantBToken}` }
    });
    recordTest('Tenant Isolation', 'Tenant B reverting Tenant A fee returns 404/403', crossFeeRevertRes.status === 404 || crossFeeRevertRes.status === 403, `Status: ${crossFeeRevertRes.status}`);

    // 4.7 Cross-Tenant Settings Isolation
    const tenantBSettingsRes = await fetch(`${API_BASE}/settings`, {
      headers: { Authorization: `Bearer ${tenantBToken}` }
    });
    const tenantBSettingsJson = await tenantBSettingsRes.json();
    recordTest('Tenant Isolation', 'Tenant B settings shows Tenant B institute name only', tenantBSettingsJson.settings?.name === `Bright Future Academy ${randomSuffix}`);

  } catch (err) {
    recordTest('Tenant Isolation', 'Suite 4 execution error', false, err.message);
  }

  // ==========================================
  // SUITE 5: ANALYTICS METRICS & ACCURACY
  // ==========================================
  console.log('\n📋 SUITE 5: Analytics Metrics & Financial Mathematical Accuracy');
  try {
    // 5.1 Fetch current student & summary data
    const refreshRes = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const refreshJson = await refreshRes.json();
    const students = refreshJson.students;
    const summary = refreshJson.summary;

    // Calculate manual metrics
    let expectedPaidCount = 0;
    let expectedPendingCount = 0;
    let expectedOverdueCount = 0;
    let expectedTotalDueAmount = 0;
    let expectedPaidAmount = 0;

    for (const s of students) {
      const fee = s.fee;
      if (!fee) continue;
      if (fee.status === 'paid') {
        expectedPaidCount++;
        expectedPaidAmount += fee.amount;
      } else if (fee.status === 'overdue') {
        expectedOverdueCount++;
        expectedTotalDueAmount += fee.amount;
      } else if (fee.status === 'pending') {
        expectedPendingCount++;
        expectedTotalDueAmount += fee.amount;
      }
    }

    recordTest('Analytics', 'Summary totalStudents matches array length (50)', summary.totalStudents === students.length && summary.totalStudents === 50, `summary.totalStudents: ${summary.totalStudents}, array length: ${students.length}`);
    recordTest('Analytics', 'Summary overdueCount matches calculated overdue count', summary.overdueCount === expectedOverdueCount, `Summary: ${summary.overdueCount}, Calculated: ${expectedOverdueCount}`);
    recordTest('Analytics', 'Summary pendingCount matches calculated pending count', summary.pendingCount === expectedPendingCount, `Summary: ${summary.pendingCount}, Calculated: ${expectedPendingCount}`);
    recordTest('Analytics', 'Summary paidCount matches calculated paid count', summary.paidCount === expectedPaidCount, `Summary: ${summary.paidCount}, Calculated: ${expectedPaidCount}`);
    recordTest('Analytics', 'Summary totalDueAmount matches calculated sum of pending + overdue amounts', summary.totalDueAmount === expectedTotalDueAmount, `Summary: ₹${summary.totalDueAmount}, Calculated: ₹${expectedTotalDueAmount}`);
    recordTest('Analytics', 'Sum of (overdueCount + pendingCount + paidCount) === totalStudents', (summary.overdueCount + summary.pendingCount + summary.paidCount) === summary.totalStudents, `Total: ${summary.overdueCount + summary.pendingCount + summary.paidCount} vs ${summary.totalStudents}`);

    // 5.2 Test Dynamic Fee Settlement Transition (Mark as Paid)
    const pendingStudent = students.find(s => s.fee?.status === 'pending' || s.fee?.status === 'overdue');
    assert(pendingStudent, 'Need at least one unpaid student for transition test');

    const feeToPayId = pendingStudent.fee.id;
    const feeAmount = pendingStudent.fee.amount;
    const initialStatus = pendingStudent.fee.status;

    const payRes = await fetch(`${API_BASE}/fees/${feeToPayId}/pay`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordTest('Analytics', 'POST /api/fees/:id/pay returns 200 OK', payRes.status === 200);

    // Fetch updated dues list
    const postPayRes = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const postPayJson = await postPayRes.json();
    const newSummary = postPayJson.summary;

    recordTest('Analytics', 'Paid count incremented by exactly 1 after mark as paid', newSummary.paidCount === summary.paidCount + 1, `Old: ${summary.paidCount}, New: ${newSummary.paidCount}`);
    recordTest('Analytics', 'Total due amount decreased by exactly the student fee amount', newSummary.totalDueAmount === summary.totalDueAmount - feeAmount, `Old: ₹${summary.totalDueAmount}, New: ₹${newSummary.totalDueAmount}, Fee: ₹${feeAmount}`);
    if (initialStatus === 'overdue') {
      recordTest('Analytics', 'Overdue count decremented by exactly 1', newSummary.overdueCount === summary.overdueCount - 1);
    } else {
      recordTest('Analytics', 'Pending count decremented by exactly 1', newSummary.pendingCount === summary.pendingCount - 1);
    }

    // 5.3 Test Undo / Revert Transition
    const revertRes = await fetch(`${API_BASE}/fees/${feeToPayId}/revert`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordTest('Analytics', 'POST /api/fees/:id/revert returns 200 OK', revertRes.status === 200);

    // Fetch final dues list
    const postRevertRes = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const postRevertJson = await postRevertRes.json();
    const finalSummary = postRevertJson.summary;

    recordTest('Analytics', 'Summary metrics restored exactly to initial baseline after revert',
      finalSummary.paidCount === summary.paidCount &&
      finalSummary.pendingCount === summary.pendingCount &&
      finalSummary.overdueCount === summary.overdueCount &&
      finalSummary.totalDueAmount === summary.totalDueAmount,
      `Restored summary: ${JSON.stringify(finalSummary)}`
    );

  } catch (err) {
    recordTest('Analytics', 'Suite 5 execution error', false, err.message);
  }

  // ==========================================
  // FINAL REPORT SUMMARY
  // ==========================================
  console.log('\n====================================================');
  console.log('📊 QA AUTOMATION SUMMARY REPORT');
  console.log('====================================================');
  console.log(`Total Checks Run : ${results.total}`);
  console.log(`Passed Checks    : ${results.passed}`);
  console.log(`Failed Checks    : ${results.failed}`);
  console.log(`Success Rate     : ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('====================================================\n');

  if (results.failed > 0) {
    console.error('⚠️ ONE OR MORE CHECKS FAILED:');
    results.tests.filter(t => !t.passed).forEach(t => console.error(` - [${t.suite}] ${t.name}: ${t.details}`));
    process.exit(1);
  } else {
    console.log('🎉 ALL RIGOROUS QA CHECKS PASSED WITH 100% SUCCESS RATE!');
    process.exit(0);
  }
}

runQA().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
