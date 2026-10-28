/**
 * Resume Ordering & Section Reordering Integration Tests
 * Validates backend persistence and security for sectionOrder, skills, certifications, and project bullets.
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
  console.log('RESUME ORDERING & DATA PIPELINE BACKEND INTEGRATION TESTS');
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
    const randA = Math.random().toString(36).substring(2, 8);
    const randB = Math.random().toString(36).substring(2, 8);
    const password = 'StrongPassword123!';

    // Step 1: Register User A
    const regResA = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Ordering User A', username: `ord_a_${randA}`, email: `ord_a_${randA}@example.com`, password }
    });
    record('User A registration succeeds', regResA.status === 201 && regResA.data.token);
    const tokenA = regResA.data.token;

    // Step 2: Register User B (for IDOR tests)
    const regResB = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Ordering User B', username: `ord_b_${randB}`, email: `ord_b_${randB}@example.com`, password }
    });
    record('User B registration succeeds', regResB.status === 201 && regResB.data.token);
    const tokenB = regResB.data.token;

    // Step 3: Create Resume for User A with custom sectionOrder, skills, certs, and project bullets
    const initialSectionOrder = ['skills', 'projects', 'certifications', 'experience', 'education', 'summary'];
    const initialSkills = [
      { name: 'Python', note: 'AI/ML' },
      { name: 'Java', note: 'Backend' },
      { name: 'SQL', note: 'Database' },
      { name: 'React', note: 'Frontend' },
      { name: 'FastAPI', note: 'APIs' }
    ];
    const initialCerts = [
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', issueDate: '2023' },
      { name: 'Certified Kubernetes Administrator', issuer: 'Linux Foundation', issueDate: '2024' }
    ];
    const initialProjects = [
      {
        name: 'High-Throughput Ingestion Engine',
        description: 'Engineered distributed streaming pipeline.',
        bullets: [
          { text: 'Processed 500k events/sec with sub-millisecond latency.' },
          { text: 'Integrated Raft cluster consensus for automatic failover.' }
        ]
      }
    ];

    const createRes = await request('/resume', {
      method: 'POST',
      token: tokenA,
      body: {
        title: 'Full Stack Specialist Resume',
        template: 'ats-classic',
        sectionOrder: initialSectionOrder,
        skills: initialSkills,
        certifications: initialCerts,
        projects: initialProjects
      }
    });
    record('Create resume with custom sectionOrder and ordered lists succeeds', createRes.status === 201 && createRes.data.success);
    const resumeId = createRes.data.resume._id;

    // Step 4: Fetch Resume and verify ordering integrity
    const fetchRes1 = await request(`/resume/${resumeId}`, {
      method: 'GET',
      token: tokenA
    });
    record('Fetch resume returns 200', fetchRes1.status === 200 && fetchRes1.data.success);
    const fetchedResume1 = fetchRes1.data.resume;

    record(
      'sectionOrder preserved exactly on creation',
      JSON.stringify(fetchedResume1.sectionOrder) === JSON.stringify(initialSectionOrder)
    );

    record(
      'skills array order preserved exactly on creation',
      fetchedResume1.skills.map(s => s.name).join(',') === 'Python,Java,SQL,React,FastAPI'
    );

    record(
      'certifications array order preserved exactly on creation',
      fetchedResume1.certifications.map(c => c.name).join(' | ') === 'AWS Certified Solutions Architect | Certified Kubernetes Administrator'
    );

    record(
      'projects bullets preserved on creation',
      fetchedResume1.projects[0]?.bullets?.length === 2 &&
      fetchedResume1.projects[0].bullets[0].text.includes('500k events/sec')
    );

    // Step 5: Update Resume with Reordered Skills (React moved to top, FastAPI moved to second)
    const reorderedSkills = [
      { name: 'React', note: 'Frontend' },
      { name: 'FastAPI', note: 'APIs' },
      { name: 'Python', note: 'AI/ML' },
      { name: 'Java', note: 'Backend' },
      { name: 'SQL', note: 'Database' }
    ];

    // Reorder certifications (CKA to top)
    const reorderedCerts = [
      { name: 'Certified Kubernetes Administrator', issuer: 'Linux Foundation', issueDate: '2024' },
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', issueDate: '2023' }
    ];

    // Reorder sectionOrder (experience to top)
    const reorderedSectionOrder = ['experience', 'projects', 'skills', 'certifications', 'education', 'summary'];

    // Add bullet points to project
    const reorderedProjects = [
      {
        ...fetchedResume1.projects[0],
        bullets: [
          { text: 'Optimized PostgreSQL connection pool, reducing p99 latency by 45%.' },
          { text: 'Processed 500k events/sec with sub-millisecond latency.' }
        ]
      }
    ];

    const updateRes = await request(`/resume/${resumeId}`, {
      method: 'PUT',
      token: tokenA,
      body: {
        sectionOrder: reorderedSectionOrder,
        skills: reorderedSkills,
        certifications: reorderedCerts,
        projects: reorderedProjects
      }
    });
    record('Update resume with reordered data succeeds', updateRes.status === 200 && updateRes.data.success);

    // Step 6: Fetch Resume again to confirm persistence
    const fetchRes2 = await request(`/resume/${resumeId}`, {
      method: 'GET',
      token: tokenA
    });
    const fetchedResume2 = fetchRes2.data.resume;

    record(
      'Reordered sectionOrder persisted in database',
      JSON.stringify(fetchedResume2.sectionOrder) === JSON.stringify(reorderedSectionOrder)
    );

    record(
      'Reordered skills order persisted in database',
      fetchedResume2.skills.map(s => s.name).join(',') === 'React,FastAPI,Python,Java,SQL'
    );

    record(
      'Reordered certifications order persisted in database',
      fetchedResume2.certifications.map(c => c.name).join(' | ') === 'Certified Kubernetes Administrator | AWS Certified Solutions Architect'
    );

    record(
      'Updated project bullets persisted in database',
      fetchedResume2.projects[0]?.bullets[0]?.text.includes('connection pool')
    );

    // Step 7: Security & IDOR Isolation - User B cannot read or modify User A's resume
    const idorRead = await request(`/resume/${resumeId}`, {
      method: 'GET',
      token: tokenB
    });
    record('IDOR Protection: User B cannot access User A resume', idorRead.status === 404 || idorRead.status === 403);

    const idorUpdate = await request(`/resume/${resumeId}`, {
      method: 'PUT',
      token: tokenB,
      body: { title: 'Hacked Title' }
    });
    record('IDOR Protection: User B cannot update User A resume', idorUpdate.status === 404 || idorUpdate.status === 403);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
