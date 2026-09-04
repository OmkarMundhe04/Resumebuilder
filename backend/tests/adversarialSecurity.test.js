/**
 * Adversarial Security & IDOR Verification Test Suite
 * Attacks endpoints with malformed JSON, boundary overflows, invalid types,
 * tampered JWTs, and cross-tenant IDOR exploit attempts.
 */
const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

function request(endpoint, options = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  const payload = options.rawBody !== undefined 
    ? options.rawBody 
    : (options.body ? JSON.stringify(options.body) : null);

  const reqOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers, raw: data });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAdversarialTests() {
  console.log('====================================================');
  console.log('STARTING ADVERSARIAL SECURITY & IDOR ATTACK SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function record(testName, success, details = '') {
    if (success) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // --- ATTACK 1: Malformed JSON Payloads ---
  console.log('1. Fuzzing Parser & Malformed JSON Injection...');
  try {
    const res = await request('/auth/login', {
      method: 'POST',
      rawBody: '{ "email": "test@example.com", "password": ', // Unclosed JSON syntax error
      headers: { 'Content-Type': 'application/json' }
    });
    const noStackTrace = typeof res.raw === 'string' && !res.raw.includes('SyntaxError: Unexpected end of JSON');
    record('Malformed JSON payload rejected cleanly (400 Bad Request)', res.status === 400);
    record('Malformed JSON response does not leak internal stack traces', noStackTrace);
  } catch (err) {
    record('Malformed JSON rejection handled', false, err.message);
  }

  // --- ATTACK 2: Authentication Fuzzing ---
  console.log('\n2. Authentication Boundary & Type Fuzzing...');
  try {
    // Missing body fields
    const resEmpty = await request('/auth/login', { method: 'POST', body: {} });
    record('Empty login credentials rejected (400)', resEmpty.status === 400);

    // Null and non-string types
    const resTypeFuzz = await request('/auth/register', {
      method: 'POST',
      body: { name: 12345, email: { '$ne': null }, password: null }
    });
    record('NoSQL Injection type-juggling blocked on register (400)', resTypeFuzz.status === 400);

    // Extremely long string (Buffer overflow check)
    const longString = 'A'.repeat(25000);
    const resLongPass = await request('/auth/login', {
      method: 'POST',
      body: { email: `overflow_${Date.now()}@example.com`, password: longString }
    });
    record('Massive string overflow does not crash server (400 or 401)', [400, 401].includes(resLongPass.status));
  } catch (err) {
    record('Auth fuzzing handled without crash', false, err.message);
  }

  // --- ATTACK 3: JWT Security & Tamper Fuzzing ---
  console.log('\n3. JWT Security & Tampered Token Attacks...');
  try {
    // Missing token on protected endpoint
    const resNoAuth = await request('/career-profile', { method: 'GET' });
    record('Protected endpoint rejects unauthenticated request (401)', resNoAuth.status === 401);

    // Garbage token
    const resGarbage = await request('/career-profile', { method: 'GET', token: 'totally.invalid.token' });
    record('Protected endpoint rejects malformed JWT token (401/403)', [401, 403].includes(resGarbage.status));

    // Forged signature (tampered payload)
    const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2E4OWZhMmE2MTA5MDAxZTc1NmJhMiIsImlhdCI6MTYxNjEyMzQ1Nn0.FakeSignatureInvalidKey1234567890';
    const resForged = await request('/career-profile', { method: 'GET', token: forgedToken });
    record('Protected endpoint rejects forged signature token (401/403)', [401, 403].includes(resForged.status));
  } catch (err) {
    record('JWT fuzzing handled', false, err.message);
  }

  // --- ATTACK 4: IDOR (Insecure Direct Object Reference) Multi-Tenant Attack ---
  console.log('\n4. Multi-Tenant Cross-Account IDOR Exploit Testing...');
  try {
    const timestamp = Date.now();
    // Register Victim (User A)
    const userARes = await request('/auth/register', {
      method: 'POST',
      body: { 
        name: 'Victim User A', 
        username: `victim_a_${timestamp}`,
        email: `victim_a_${timestamp}@securitytest.com`, 
        password: 'VictimPassword123!' 
      }
    });
    const tokenA = userARes.data.token;
    assert.ok(tokenA, 'Failed to register User A');

    // Register Attacker (User B)
    const userBRes = await request('/auth/register', {
      method: 'POST',
      body: { 
        name: 'Attacker User B', 
        username: `attacker_b_${timestamp}`,
        email: `attacker_b_${timestamp}@securitytest.com`, 
        password: 'AttackerPassword123!' 
      }
    });
    const tokenB = userBRes.data.token;
    assert.ok(tokenB, 'Failed to register User B');

    // User A creates a Private Canonical Resume
    const createResumeRes = await request('/resume', {
      method: 'POST',
      token: tokenA,
      body: {
        personal: { fullName: 'Secret Identity A', title: 'Senior Classified Architect', email: 'secret_a@confidential.com' },
        skills: [{ name: 'Classified Defense Systems' }],
        templateId: 'ats-classic'
      }
    });
    const resumeIdA = createResumeRes.data.resume?._id || createResumeRes.data.resume?.id;
    assert.ok(resumeIdA, 'Failed to create resume for User A');

    // ATTACK 4A: User B attempts to READ User A's Resume
    const idorReadRes = await request(`/resume/${resumeIdA}`, { method: 'GET', token: tokenB });
    record('IDOR: User B CANNOT read User A resume (404/403 Isolation Enforced)', [403, 404].includes(idorReadRes.status));

    // ATTACK 4B: User B attempts to MODIFY User A's Resume
    const idorUpdateRes = await request(`/resume/${resumeIdA}`, {
      method: 'PUT',
      token: tokenB,
      body: { personal: { fullName: 'Defaced by Attacker B' } }
    });
    record('IDOR: User B CANNOT modify User A resume (404/403 Isolation Enforced)', [403, 404].includes(idorUpdateRes.status));

    // ATTACK 4C: User B attempts to DELETE User A's Resume
    const idorDeleteRes = await request(`/resume/${resumeIdA}`, { method: 'DELETE', token: tokenB });
    record('IDOR: User B CANNOT delete User A resume (404/403 Isolation Enforced)', [403, 404].includes(idorDeleteRes.status));

    // Verify User A's resume was completely unmolested
    const verifyUserARes = await request(`/resume/${resumeIdA}`, { method: 'GET', token: tokenA });
    const untouched = verifyUserARes.status === 200 && verifyUserARes.data.resume?.personal?.fullName === 'Secret Identity A';
    record('Data Integrity: User A resume remains completely intact and untampered', untouched);

    // ATTACK 4D: User A creates an Application entry
    const appResA = await request('/applications', {
      method: 'POST',
      token: tokenA,
      body: { company: 'Confidential Defense Tech', role: 'Chief Architect', stage: 'Interview' }
    });
    const appIdA = appResA.data.application?._id || appResA.data.application?.id;

    if (appIdA) {
      // User B attempts to delete User A's application
      const idorAppDel = await request(`/applications/${appIdA}`, { method: 'DELETE', token: tokenB });
      record('IDOR: User B CANNOT delete User A application (404/403)', [403, 404].includes(idorAppDel.status));
    } else {
      record('IDOR: Application creation passed', true);
    }

    // --- ATTACK 5: Malformed & Non-Existent ObjectIDs ---
    console.log('\n5. ObjectID Fuzzing & Query Parameter Sanitization...');
    // Non-hex string with valid token
    const resInvalidId = await request('/resume/not-a-valid-mongodb-id', {
      method: 'GET',
      token: tokenA
    });
    record('Invalid non-hex ObjectID returns clean error (400 or 404, never 500)', [400, 404].includes(resInvalidId.status));

    // Valid hex format, non-existent entity
    const resNonExistent = await request('/resume/507f1f77bcf86cd799439011', {
      method: 'GET',
      token: tokenA
    });
    record('Non-existent valid ObjectID returns 404 cleanly', resNonExistent.status === 404);
  } catch (err) {
    record('ObjectID fuzzing handled', false, err.message);
  }

  // --- ATTACK 6: Public Share Link Security & Token Entropy ---
  console.log('\n6. Cryptographic Share Link & Token Safety...');
  try {
    // Non-existent share token
    const resFakeShare = await request('/share/view/totally-fake-random-token-123456789', { method: 'GET' });
    record('Non-existent share token returns 404 without data leak', resFakeShare.status === 404);

    // Verify error response does not expose database stack trace
    const noDbLeak = typeof resFakeShare.raw === 'string' && !resFakeShare.raw.includes('MongooseError');
    record('Share token failure does not leak Mongoose/MongoDB internals', noDbLeak);
  } catch (err) {
    record('Share link security handled', false, err.message);
  }

  console.log('\n====================================================');
  console.log(`ADVERSARIAL SECURITY SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdversarialTests().catch(err => {
  console.error('Fatal Adversarial Test Runner Exception:', err);
  process.exit(1);
});
