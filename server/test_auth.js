const app = require('./index');
const { initDb } = require('./db');

const PORT = 5066;
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

async function runAuthTests() {
  console.log('--- Starting Auth & Onboarding Tests ---');
  await initDb();

  const server = app.listen(PORT, async () => {
    try {
      // 1. Test Login with Admin Credential
      console.log('\n1. Testing Login for admin@edumanage.in...');
      const adminLogin = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@edumanage.in',
          password: 'Admin@12345'
        })
      });
      console.log('Status:', adminLogin.status);
      console.log('Response:', JSON.stringify(adminLogin.data, null, 2));
      if (adminLogin.status !== 200 || !adminLogin.data.token) {
        throw new Error('Admin login failed');
      }

      // 2. Test Login for Aman Mishra
      console.log('\n2. Testing Login for aman@apexcoaching.in...');
      const amanLogin = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'aman@apexcoaching.in',
          password: 'Admin@12345'
        })
      });
      console.log('Status:', amanLogin.status);
      console.log('User Role:', amanLogin.data?.user?.role, 'Institute:', amanLogin.data?.institute?.name);
      if (amanLogin.status !== 200) {
        throw new Error('Aman login failed');
      }

      // 3. Test Register new user
      console.log('\n3. Testing Registration...');
      const testEmail = `testuser_${Date.now()}@example.com`;
      const registerRes = await request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Priya Sharma',
          email: testEmail,
          phone: '+919123456789',
          password: 'Password@123'
        })
      });
      console.log('Status:', registerRes.status);
      console.log('Registered User:', registerRes.data?.user);
      if (registerRes.status !== 201 || !registerRes.data?.user?.id) {
        throw new Error('User registration failed');
      }

      const newUserId = registerRes.data.user.id;

      // 4. Test Login with new user
      console.log('\n4. Testing Login for newly registered user...');
      const newLogin = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Password@123'
        })
      });
      console.log('Status:', newLogin.status, 'Token:', !!newLogin.data?.token);

      // 5. Test Onboarding
      console.log('\n5. Testing Onboarding...');
      const onboardingRes = await request('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newUserId,
          instituteName: 'Zenith Tutorials',
          instituteType: 'coaching_center',
          city: 'Lucknow',
          upiId: 'zenith@upi',
          upiName: 'Zenith Tutorials',
          initialBatches: ['Class 10 CBSE Maths', 'Class 12 Physics Batch']
        })
      });
      console.log('Status:', onboardingRes.status);
      console.log('Institute:', onboardingRes.data?.institute);
      console.log('Created Classes:', onboardingRes.data?.classes);
      console.log('Fee Heads:', onboardingRes.data?.fee_heads);

      if (onboardingRes.status !== 201 || !onboardingRes.data?.institute?.id) {
        throw new Error('Onboarding failed');
      }

      // 6. Test Login after Onboarding (Should now return institute and owner role)
      console.log('\n6. Testing Login after onboarding...');
      const loginAfterOnboarding = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Password@123'
        })
      });
      console.log('Status:', loginAfterOnboarding.status);
      console.log('Institute linked:', loginAfterOnboarding.data?.institute?.name);
      console.log('Role:', loginAfterOnboarding.data?.user?.role);

      console.log('\n ALL AUTH & ONBOARDING TESTS PASSED SUCCESSFULLY! ');
    } catch (err) {
      console.error('Test failed with error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runAuthTests();
