/**
 * Career Profile Autosave & User Preferences Backend Integration Tests
 */
const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';

function request(endpoint, options = {}) {
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
  console.log('CAREER PROFILE AUTOSAVE & PREFERENCES INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function record(testName, condition, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Register User A
    const randA = Math.random().toString(36).substring(2, 8);
    const userAData = {
      name: 'Autosave User A',
      username: `as_user_${randA}`,
      email: `as_user_${randA}@example.com`,
      password: 'StrongPassword123!'
    };
    const regA = await request('/auth/register', { method: 'POST', body: userAData });
    record('User A registration succeeds', regA.status === 201 && regA.data.token);
    const tokenA = regA.data.token;

    // 2. Default preference has careerProfileAutosave: true
    const meA1 = await request('/auth/me', { token: tokenA });
    record('User A has default careerProfileAutosave: true', meA1.status === 200 && meA1.data.user.preferences.careerProfileAutosave === true);

    // 3. Update preference to careerProfileAutosave: false
    const updatePrefRes = await request('/auth/preferences', {
      method: 'PUT',
      token: tokenA,
      body: { careerProfileAutosave: false }
    });
    record('PUT /auth/preferences updates careerProfileAutosave to false', updatePrefRes.status === 200 && updatePrefRes.data.preferences.careerProfileAutosave === false);

    // 4. Verify persistence via GET /auth/me
    const meA2 = await request('/auth/me', { token: tokenA });
    record('GET /auth/me reflects persisted careerProfileAutosave: false', meA2.status === 200 && meA2.data.user.preferences.careerProfileAutosave === false);

    // 5. Update preference back to true
    const updatePrefTrue = await request('/auth/preferences', {
      method: 'PUT',
      token: tokenA,
      body: { careerProfileAutosave: true }
    });
    record('PUT /auth/preferences toggles careerProfileAutosave back to true', updatePrefTrue.status === 200 && updatePrefTrue.data.preferences.careerProfileAutosave === true);

    // 6. Register User B and verify cross-user preference isolation
    const randB = Math.random().toString(36).substring(2, 8);
    const userBData = {
      name: 'Autosave User B',
      username: `as_user_${randB}`,
      email: `as_user_${randB}@example.com`,
      password: 'StrongPassword123!'
    };
    const regB = await request('/auth/register', { method: 'POST', body: userBData });
    const tokenB = regB.data.token;
    const meB = await request('/auth/me', { token: tokenB });
    record('User B retains independent default preferences', meB.status === 200 && meB.data.user.preferences.careerProfileAutosave === true);

    // 7. Full Career Profile PUT saves complete payload across all sections
    const fullProfilePayload = {
      personal: {
        fullName: 'Jane Autosave Engineer',
        title: 'Senior Distributed Systems Architect',
        email: 'jane.as@example.com',
        phone: '+1 555 987 6543',
        location: 'San Francisco, CA',
        website: 'https://janeas.dev',
        linkedin: 'https://linkedin.com/in/janeas',
        github: 'https://github.com/janeas',
        portfolio: 'https://portfolio.janeas.dev',
        summary: 'Architect specialized in distributed real-time data persistence.'
      },
      experiences: [
        {
          id: 'exp-1',
          company: 'Cloud Corp',
          role: 'Lead Engineer',
          startDate: '2022-01',
          endDate: 'Present',
          isCurrent: true,
          responsibilities: 'Lead architecture',
          bullets: [{ id: 'b-1', text: 'Scaled autosave database backend.', status: 'VERIFIED' }]
        }
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'MIT',
          degree: 'M.S. CS',
          fieldOfStudy: 'Computer Systems',
          startDate: '2018',
          endDate: '2020',
          gpa: '4.0'
        }
      ],
      skills: [
        { id: 'sk-1', name: 'Node.js', category: 'Backend', proficiency: 'Advanced', verified: true },
        { id: 'sk-2', name: 'React', category: 'Frontend', proficiency: 'Advanced', verified: true }
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'Realtime Sync Engine',
          description: 'High-speed debounce autosave synchronization service.',
          technologies: ['React', 'Express', 'MongoDB'],
          bullets: [{ id: 'pb-1', text: 'Zero data loss during rapid keystrokes.' }]
        }
      ],
      certifications: [
        { id: 'cert-1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services' }
      ],
      publications: [
        { id: 'pub-1', title: 'Fault-Tolerant Client Autosave Protocols', publisher: 'IEEE', date: '2024' }
      ],
      awards: [
        { id: 'aw-1', title: 'Top Engineering Innovation', issuer: 'Cloud Corp', date: '2023' }
      ],
      volunteer: [
        { id: 'vol-1', organization: 'Code For Kids', role: 'Mentor' }
      ],
      customSections: [
        { id: 'cs-1', title: 'Patents', content: 'Distributed Optimistic Locking Method' }
      ]
    };

    const putProfileRes = await request('/career-profile', {
      method: 'PUT',
      token: tokenA,
      body: fullProfilePayload
    });

    record('PUT /career-profile successfully persists complete profile', putProfileRes.status === 200 && putProfileRes.data.success);
    record('Saved profile contains all sections and updatedAt timestamp', 
      putProfileRes.data.profile.personal.fullName === 'Jane Autosave Engineer' &&
      putProfileRes.data.profile.experiences.length === 1 &&
      putProfileRes.data.profile.education.length === 1 &&
      putProfileRes.data.profile.skills.length === 2 &&
      putProfileRes.data.profile.projects.length === 1 &&
      putProfileRes.data.profile.certifications.length === 1 &&
      putProfileRes.data.profile.publications.length === 1 &&
      putProfileRes.data.profile.awards.length === 1 &&
      putProfileRes.data.profile.volunteer.length === 1 &&
      putProfileRes.data.profile.customSections.length === 1 &&
      Boolean(putProfileRes.data.profile.updatedAt)
    );

    // 8. IDOR Protection: User B cannot access or modify User A profile
    const getProfileB = await request('/career-profile', { token: tokenB });
    record('User B career profile is isolated from User A', 
      getProfileB.status === 200 && 
      getProfileB.data.profile.personal.fullName !== 'Jane Autosave Engineer'
    );

    // 9. Unauthorized request rejected
    const unauthPut = await request('/career-profile', {
      method: 'PUT',
      body: fullProfilePayload
    });
    record('Unauthenticated PUT /career-profile rejected with 401', unauthPut.status === 401);

  } catch (err) {
    console.error('Test execution failed with error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
