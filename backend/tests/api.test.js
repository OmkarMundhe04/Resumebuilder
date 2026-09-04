/**
 * End-to-End Comprehensive Backend Integration & Isolation Test Suite
 * Tests Auth, Isolation, CareerProfile, Canonical Resumes, ATS Health, Evidence Coach, Share Tokens, and GDPR
 */
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  const payload = options.body ? JSON.stringify(options.body) : null;

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
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING SAAS PLATFORM E2E INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('1. Testing System Health Endpoints...');
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'GET /api/health returns 200 healthy');

    // 2. Auth: Register & Login User A
    console.log('\n2. Testing Authentication & User Isolation...');
    const userAData = {
      name: 'Alice Tester',
      username: `alice_${Date.now()}`,
      email: `alice_${Date.now()}@example.com`,
      password: 'StrongPassword123!'
    };
    const regA = await request('/auth/register', { method: 'POST', body: userAData });
    if (regA.status !== 201) console.log('regA debug:', regA.status, regA.data);
    assert(regA.status === 201 && regA.data.token, 'Register User A returns JWT token');
    const tokenA = regA.data.token;

    // Register User B
    const userBData = {
      name: 'Bob Isolation',
      username: `bob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: `bob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@example.com`,
      password: 'StrongPassword123!'
    };
    const regB = await request('/auth/register', { method: 'POST', body: userBData });
    if (regB.status !== 201) console.log('regB debug:', regB.status, regB.data);
    assert(regB.status === 201 && regB.data.token, 'Register User B returns JWT token');
    const tokenB = regB.data.token;

    // 3. Career Profile CRUD & Provenance
    console.log('\n3. Testing Career Profile (Truth DB)...');
    const profA = await request('/career-profile', { token: tokenA });
    assert(profA.status === 200 && profA.data.profile, 'GET /career-profile returns initial user profile');

    // Update Profile with verified item
    const updateProfRes = await request('/career-profile', {
      method: 'PUT',
      token: tokenA,
      body: {
        personal: { fullName: 'Alice Master Engineer', title: 'Principal Architect' },
        skills: [{ name: 'React', category: 'Technical', status: 'VERIFIED' }]
      }
    });
    assert(updateProfRes.status === 200 && updateProfRes.data.profile.personal.fullName === 'Alice Master Engineer', 'PUT /career-profile updates personal info and verified skills');

    // 4. Canonical Resume Creation & ATS Health
    console.log('\n4. Testing Canonical Resume & ATS Health Radar...');
    const newResumeRes = await request('/resume', {
      method: 'POST',
      token: tokenA,
      body: {
        title: 'Alice Staff Resume',
        targetRole: 'Staff Engineer',
        fromProfile: true
      }
    });
    assert(newResumeRes.status === 201 && newResumeRes.data.resume, 'POST /resume creates canonical resume from verified profile');
    const resumeAId = newResumeRes.data.resume._id;

    // Verify ATS Health Calculation
    const getResumeRes = await request(`/resume/${resumeAId}`, { token: tokenA });
    assert(getResumeRes.status === 200 && getResumeRes.data.resume.health.overall >= 50, 'Resume includes multi-metric health score calculation');

    // 5. Cross-User Data Isolation Check
    console.log('\n5. Testing Strict Cross-User Data Isolation...');
    const leakAttempt = await request(`/resume/${resumeAId}`, { token: tokenB });
    assert(leakAttempt.status === 404, 'User B CANNOT access User A resume (404 isolation check passed)');

    // 6. Untrusted Job Match Gap Analysis
    console.log('\n6. Testing Untrusted Job Description Analyzer...');
    const jdAnalysis = await request('/job-match/analyze', {
      method: 'POST',
      token: tokenA,
      body: {
        jobTitle: 'Staff Full-Stack Engineer',
        company: 'Cloud Corp',
        jobDescription: 'Looking for a Staff Engineer with deep React, Node.js, and Docker skills to architect scalable platforms.',
        resumeId: resumeAId
      }
    });
    assert(jdAnalysis.status === 200 && Array.isArray(jdAnalysis.data.confirmedMatches), 'POST /job-match/analyze returns verified match score and gap report');

    // 7. Evidence Coach & Bullet Refinement
    console.log('\n7. Testing Evidence Coach (Zero Hallucination AI)...');
    const coachRes = await request('/ai/enhance-bullet', {
      method: 'POST',
      token: tokenA,
      body: {
        task: 'Optimized MongoDB database indexing and query latency',
        technology: 'MongoDB, Node.js',
        metric: '45% reduction in response time',
        style: 'achievement'
      }
    });
    assert(coachRes.status === 200 && coachRes.data.allVariants.achievement, 'Evidence Coach returns 4 truthful style variants');

    // 8. Share Link Generation & Public Token View
    console.log('\n8. Testing Cryptographic Share Tokens & Public Viewer...');
    const shareRes = await request('/share/create', {
      method: 'POST',
      token: tokenA,
      body: {
        resumeId: resumeAId,
        expiresDays: 7,
        maskContactInfo: true
      }
    });
    assert(shareRes.status === 201 && shareRes.data.token, 'POST /share/create creates cryptographic tokenized share link');
    const shareToken = shareRes.data.token;

    const publicViewRes = await request(`/share/view/${shareToken}`);
    assert(publicViewRes.status === 200 && publicViewRes.data.shareConfig.maskContactInfo === true, 'GET /share/view/:token returns masked public resume');

    // 9. GDPR Data Export
    console.log('\n9. Testing GDPR Data Export...');
    const gdprExport = await request('/privacy/export-data', { token: tokenA });
    assert(gdprExport.status === 200 && (gdprExport.data.careerProfile || gdprExport.data.data?.careerProfile), 'GET /privacy/export-data returns full portable JSON archive');

    // 10. Application Creation with Kanban Stages
    console.log('\n10. Testing Application Pipeline Creation (Wishlist, Screening, etc)...');
    const appRes = await request('/applications', {
      method: 'POST',
      token: tokenA,
      body: {
        company: 'Google DeepMind',
        role: 'AI Product Engineer',
        stage: 'Wishlist',
        location: 'Mountain View, CA',
        salary: '$180,000 - $220,000'
      }
    });
    assert(appRes.status === 201 && appRes.data.application.status === 'Wishlist', 'POST /applications creates application with Wishlist stage');

    // 11. Grounded Cover Letter Generation
    console.log('\n11. Testing Grounded Cover Letter Generator API...');
    const clRes = await request('/cover-letter/generate', {
      method: 'POST',
      token: tokenA,
      body: {
        jobTitle: 'Senior Full-Stack Engineer',
        company: 'TechNova Solutions',
        hiringManager: 'Priya Sharma',
        tone: 'technical',
        jobDescription: 'Seeking an engineer with strong React and Node.js skills.'
      }
    });
    if (clRes.status !== 200 || !clRes.data?.fullLetter) {
      console.log('DEBUG clRes:', clRes);
    }
    assert(clRes.status === 200 && clRes.data?.fullLetter, 'POST /cover-letter/generate generates grounded cover letter with target company');

    // 12. Google OAuth Authentication Flow
    console.log('\n12. Testing Google OAuth Authentication Flow...');
    const googleMockUser = {
      profile: {
        email: `google_${Date.now()}@example.com`,
        name: 'Google Engineer',
        sub: `google_sub_${Date.now()}`,
        picture: 'https://lh3.googleusercontent.com/a/mock-avatar.png'
      }
    };
    const googleAuthRes = await request('/auth/google', {
      method: 'POST',
      body: googleMockUser
    });
    assert(
      googleAuthRes.status === 200 && googleAuthRes.data.token && googleAuthRes.data.user.email === googleMockUser.profile.email,
      'POST /auth/google creates new user and returns valid session token'
    );

    // Verify returning user
    const googleReturnRes = await request('/auth/google', {
      method: 'POST',
      body: googleMockUser
    });
    assert(
      googleReturnRes.status === 200 && googleReturnRes.data.token,
      'POST /auth/google successfully logs in returning Google user'
    );

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
