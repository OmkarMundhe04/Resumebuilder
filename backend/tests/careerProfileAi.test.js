/**
 * Unit & Integration Tests for Career Profile AI & Project Analyzer Service
 */

const assert = require('assert');
const {
  isSafePublicUrl,
  parseGitHubUrl,
  analyzeProject,
  suggestSkillsFromProfile,
  generateProjectDescription
} = require('../services/projectAnalyzerService');

async function runTests() {
  console.log('🧪 Running Career Profile AI & Project Analyzer tests...\n');

  // Test 1: SSRF Protection (isSafePublicUrl)
  console.log('Test 1: SSRF Protection on Live URLs');
  assert.strictEqual(isSafePublicUrl('http://localhost:3000'), false, 'Should block localhost');
  assert.strictEqual(isSafePublicUrl('http://127.0.0.1:8000/api'), false, 'Should block 127.0.0.1');
  assert.strictEqual(isSafePublicUrl('http://192.168.1.1/admin'), false, 'Should block private 192.168.x.x');
  assert.strictEqual(isSafePublicUrl('http://10.0.0.1'), false, 'Should block private 10.x.x.x');
  assert.strictEqual(isSafePublicUrl('ftp://example.com'), false, 'Should block non-http protocols');
  assert.strictEqual(isSafePublicUrl('https://my-cool-project.vercel.app'), true, 'Should allow public HTTPS');
  assert.strictEqual(isSafePublicUrl('https://github.com'), true, 'Should allow public domains');
  console.log('  ✅ SSRF Protection passed\n');

  // Test 2: GitHub URL parsing
  console.log('Test 2: GitHub URL Parser');
  const valid1 = parseGitHubUrl('https://github.com/facebook/react');
  assert.deepStrictEqual(valid1, { owner: 'facebook', repo: 'react' });

  const valid2 = parseGitHubUrl('https://github.com/expressjs/express.git');
  assert.deepStrictEqual(valid2, { owner: 'expressjs', repo: 'express' });

  const valid3 = parseGitHubUrl('https://www.github.com/torvalds/linux/tree/master');
  assert.deepStrictEqual(valid3, { owner: 'torvalds', repo: 'linux' });

  const invalid = parseGitHubUrl('https://gitlab.com/owner/repo');
  assert.strictEqual(invalid, null, 'Should return null for non-GitHub URLs');
  console.log('  ✅ GitHub URL parser passed\n');

  // Test 3: Project Analyzer with Manual Context (Deterministic / AI)
  console.log('Test 3: Project Analyzer with Context & Technologies');
  const projectAnalysis = await analyzeProject({
    projectName: 'Distributed File Indexer',
    existingTechnologies: ['Go', 'gRPC', 'PostgreSQL', 'Docker'],
    context: 'High-throughput file hashing and deduplication service designed for distributed nodes.'
  });

  assert.strictEqual(projectAnalysis.success, true, 'Analysis should succeed');
  assert.ok(projectAnalysis.analysis.projectSummary, 'Should have project summary');
  assert.ok(projectAnalysis.analysis.descriptionVariants.concise, 'Should have concise variant');
  assert.ok(projectAnalysis.analysis.descriptionVariants.technical, 'Should have technical variant');
  assert.ok(projectAnalysis.analysis.descriptionVariants.portfolio, 'Should have portfolio variant');
  assert.ok(Array.isArray(projectAnalysis.analysis.technologies), 'Should have technologies array');
  assert.ok(Array.isArray(projectAnalysis.analysis.resumeBullets), 'Should have resume bullets array');

  // Verify Zero-Hallucination: no fabricated percentage when none supplied
  const allBullets = projectAnalysis.analysis.resumeBullets.join(' ');
  const fakeMetrics = allBullets.match(/\b(40%|50%|99%|10000 users|\$1M)\b/);
  assert.strictEqual(fakeMetrics, null, 'AI must not hallucinate fake percentages or metrics');
  console.log('  ✅ Project Analyzer output passed\n');

  // Test 4: Suggest Skills from Profile Evidence
  console.log('Test 4: Skill Suggestions Grounded in Evidence');
  const mockProfile = {
    projects: [
      {
        name: 'Portfolio CMS',
        technologies: ['FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
        description: 'Headless CMS with JWT authentication and caching'
      }
    ],
    experiences: [
      {
        role: 'Full Stack Intern',
        company: 'TechCorp',
        bullets: [
          {
            text: 'Engineered REST endpoints utilizing Node.js and Express',
            evidence: { technology: 'Node.js, Express' }
          }
        ]
      }
    ],
    education: [
      {
        degree: 'B.S. Computer Science',
        institution: 'State University',
        coursework: ['Distributed Systems', 'Database Management']
      }
    ],
    certifications: [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' }
    ],
    skills: [
      { id: '1', name: 'FastAPI', note: '2 yrs' } // Already existing skill
    ]
  };

  const skillResult = await suggestSkillsFromProfile(mockProfile);
  assert.strictEqual(skillResult.success, true, 'Skill suggestion should succeed');
  assert.ok(Array.isArray(skillResult.suggestedSkills), 'Should return array of suggested skills');
  assert.ok(skillResult.suggestedSkills.length > 0, 'Should suggest supported skills');

  // Verify deduplication: 'FastAPI' should NOT be suggested because user already has it
  const suggestedNames = skillResult.suggestedSkills.map(s => s.name.toLowerCase());
  assert.strictEqual(suggestedNames.includes('fastapi'), false, 'Should not suggest skills already present in user profile');

  // Verify evidence exists for each suggested skill
  skillResult.suggestedSkills.forEach(s => {
    assert.ok(s.name, 'Skill must have a name');
    assert.ok(s.evidence, 'Skill must have explicit evidence reference');
  });
  console.log('  ✅ Skill suggestions verified and deduplicated\n');

  // Test 5: Generate Project Description
  console.log('Test 5: Project Description Generator');
  const descResult = await generateProjectDescription({
    projectName: 'ResumeBuilder Engine',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
    context: 'Production web application for building ATS-optimized career documents with live preview'
  });

  assert.strictEqual(descResult.success, true, 'Description generation should succeed');
  assert.ok(descResult.variants.concise, 'Must provide concise variant');
  assert.ok(descResult.variants.technical, 'Must provide technical variant');
  assert.ok(descResult.variants.portfolio, 'Must provide portfolio variant');
  console.log('  ✅ Project description variants generated successfully\n');

  console.log('🎉 All 5 Career Profile AI & Service tests PASSED!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
