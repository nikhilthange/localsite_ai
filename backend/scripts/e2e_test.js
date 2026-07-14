const axios = require('axios');
const assert = require('assert');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';
const CSRF_URL = 'http://localhost:5000/api/csrf-token';

const client = axios.create({
  withCredentials: true
});

async function runTests() {
  console.log('--- Starting API E2E Tests ---');
  let token;
  let csrfToken;
  let cookie;
  
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
  };

  try {
    // 0. Get CSRF Token
    console.log(`[0] Fetching CSRF token`);
    const csrfRes = await client.get(CSRF_URL);
    csrfToken = csrfRes.data.csrfToken;
    cookie = csrfRes.headers['set-cookie'] ? csrfRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') : '';
    console.log('  -> Success:', csrfToken);

    const headers = {
      'X-CSRF-Token': csrfToken,
      'Cookie': cookie
    };

    // 1. Test Registration
    console.log(`[1] Registering user: ${testUser.email}`);
    const regRes = await client.post(`${API_URL}/auth/register`, testUser, { headers });
    assert.equal(regRes.status, 201);
    
    if (regRes.headers['set-cookie']) {
      cookie += '; ' + regRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      headers['Cookie'] = cookie;
    }
    console.log('  -> Success');

    // 1.5 Bypass Email Verification
    console.log(`[1.5] Verifying user email in DB`);
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    await db.collection('users').updateOne({ email: testUser.email }, { $set: { emailVerified: true } });
    await mongoose.disconnect();
    console.log('  -> Success');

    // 2. Test Login
    console.log(`[2] Logging in user: ${testUser.email}`);
    const loginRes = await client.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    }, { headers });
    assert.equal(loginRes.status, 200);
    token = loginRes.data.data.accessToken; 
    console.log('  -> Success');

    headers['Authorization'] = `Bearer ${token}`;

    // 3. Test Profile
    console.log(`[3] Fetching profile`);
    const profileRes = await client.get(`${API_URL}/auth/me`, { headers });
    assert.equal(profileRes.status, 200);
    console.log('  -> Success');

    // 4. Create Website (AI Generation Trigger)
    console.log(`[4] Triggering Website Generation (Gym)`);
    const genRes = await client.post(`${API_URL}/websites/generate-complete`, {
        businessName: 'Iron Gym',
        category: 'Gym',
        location: 'New York, NY',
        description: 'A hardcore gym for serious lifters.',
        theme: 'modern'
    }, { headers });
    
    assert.equal(genRes.status, 201); // Assuming it might be 201 Created or 202
    const websiteId = genRes.data.data.id || genRes.data.data._id;
    console.log(`  -> Success. Website generation queued: ${websiteId}`);
    
    console.log('All initial flow tests passed!');
  } catch (error) {
    console.error('Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runTests();
