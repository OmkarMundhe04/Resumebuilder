/**
 * Unit & Integration Tests for Resume AI Assistant & Evidence-Grounded Engine
 */

const assert = require('assert');
const {
  analyzeProject,
  generateProjectDescription,
  suggestSkillsFromProfile,
  enhanceSectionText,
  analyzeResumeForRole,
  optimizeResumeForRole
} = require('../services/projectAnalyzerService');

async function runResumeAiTests() {
  console.log('🧪 Running Resume AI Assistant & Evidence-Grounded Engine tests...\n');

  // Test 1: Role-Aware Project Analyzer
  console.log('Test 1: Role-Aware Project Analyzer with Target Role');
  const projectAnalysis = await analyzeProject({
    projectName: 'Cloud Metrics Dashboard',
    existingTechnologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    context: 'Real-time telemetry and service health monitoring dashboard.',
    targetRole: 'Backend Engineer',
    jobDescription: 'Seeking a Backend Engineer proficient in Node.js, SQL database query tuning, and REST API services.'
  });

  assert.strictEqual(projectAnalysis.success, true, 'Analysis should succeed');
  assert.ok(projectAnalysis.analysis.descriptionVariants.roleTargeted, 'Should produce roleTargeted variant');
  assert.ok(projectAnalysis.analysis.descriptionVariants.concise, 'Should produce concise variant');
  assert.ok(projectAnalysis.analysis.descriptionVariants.technical, 'Should produce technical variant');
  assert.ok(projectAnalysis.analysis.descriptionVariants.portfolio, 'Should produce portfolio variant');
  assert.ok(Array.isArray(projectAnalysis.analysis.technologies), 'Should have technologies array');
  assert.ok(Array.isArray(projectAnalysis.analysis.suggestedSkills), 'Should have suggested skills array');

  // Anti-hallucination verification
  const allText = JSON.stringify(projectAnalysis.analysis);
  const fakeMetrics = allText.match(/\b(99\.99% uptime|reduced latency by 75%|served 10 million users|\$5M revenue)\b/i);
  assert.strictEqual(fakeMetrics, null, 'Must not hallucinate metrics not supplied by candidate');
  console.log('  ✅ Role-Aware Project Analyzer passed\n');

  // Test 2: Role-Targeted Project Description Generator
  console.log('Test 2: Project Description Generator with Target Role');
  const descResult = await generateProjectDescription({
    projectName: 'Inventory Management System',
    technologies: ['Python', 'FastAPI', 'MongoDB'],
    context: 'Warehouse catalog tracking with barcode scanning and low-stock alerts.',
    targetRole: 'Backend Developer'
  });

  assert.strictEqual(descResult.success, true, 'Should succeed');
  assert.ok(descResult.variants.roleTargeted, 'Should include roleTargeted variant');
  assert.ok(descResult.variants.concise, 'Should include concise variant');
  assert.ok(descResult.variants.technical, 'Should include technical variant');
  assert.ok(descResult.variants.portfolio, 'Should include portfolio variant');
  console.log('  ✅ Project Description Generator with role variants passed\n');

  // Test 3: Resume-Wide Skill Suggestions with Target Role & Job Context
  console.log('Test 3: Resume-Wide Skill Suggestions & Job Distinction');
  const mockResume = {
    targetRole: 'Full Stack Engineer',
    personal: { title: 'Full Stack Engineer' },
    skills: [{ id: 's1', name: 'JavaScript' }],
    projects: [
      {
        name: 'AI Document Reviewer',
        technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
        description: 'Document analysis tool with PDF parsing.'
      }
    ],
    experiences: [
      {
        role: 'Software Developer',
        company: 'InnovateCorp',
        bullets: [
          { text: 'Engineered REST endpoints', evidence: { technology: 'REST APIs, Docker' } }
        ]
      }
    ],
    education: [
      {
        degree: 'B.S. Software Engineering',
        institution: 'Tech University',
        coursework: ['Data Structures', 'Database Systems']
      }
    ],
    certifications: [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' }
    ]
  };

  const skillSuggestions = await suggestSkillsFromProfile(mockResume, {
    targetRole: 'Full Stack Engineer',
    jobDescription: 'Requires React, Node.js, Docker, AWS, and Kubernetes.'
  });

  assert.strictEqual(skillSuggestions.success, true, 'Skill suggestions should succeed');
  assert.ok(Array.isArray(skillSuggestions.suggestedSkills), 'Should return suggested skills');

  // User already has JavaScript, so JavaScript must not be recommended
  const suggestedNames = skillSuggestions.suggestedSkills.map(s => s.name.toLowerCase());
  assert.strictEqual(suggestedNames.includes('javascript'), false, 'Must not suggest skills already in resume');

  // Should have evidence for each suggested skill
  skillSuggestions.suggestedSkills.forEach(s => {
    assert.ok(s.name, 'Skill must have name');
    assert.ok(s.evidence, 'Skill must have evidence');
  });
  console.log('  ✅ Resume-Wide Skill Suggestions passed\n');

  // Test 4: Section Text Enhancement (Zero-Hallucination & Anti-Empty Guard)
  console.log('Test 4: Section Text Enhancement & Anti-Empty Guard');
  // Empty check
  const emptyRes = await enhanceSectionText({
    type: 'award',
    originalText: '',
    itemContext: {}
  });
  assert.strictEqual(emptyRes.success, false, 'Should reject completely empty input');

  // Meaningful text enhancement
  const eduRes = await enhanceSectionText({
    type: 'education',
    originalText: 'Completed capstone project on distributed cache invalidation',
    itemContext: { degree: 'B.S. in Computer Science', institution: 'MIT' },
    targetRole: 'Systems Engineer'
  });
  assert.strictEqual(eduRes.success, true, 'Should succeed on valid input');
  assert.ok(Array.isArray(eduRes.suggestions), 'Should return suggestions');
  assert.strictEqual(eduRes.suggestions.length, 3, 'Should return 3 variants');
  assert.ok(eduRes.suggestions.some(s => s.variant === 'roleTargeted'), 'Should have roleTargeted variant');

  // Verify no fabricated GPA or rank
  const eduText = JSON.stringify(eduRes.suggestions);
  assert.strictEqual(/GPA 4\.0|summa cum laude|ranked #1/i.test(eduText), false, 'Must not invent unverified honors');
  console.log('  ✅ Section Text Enhancement passed\n');

  // Test 5: Role-Specific Resume Analysis
  console.log('Test 5: Global Target Role Analysis');
  const roleAnalysis = await analyzeResumeForRole({
    resume: mockResume,
    targetRole: 'Full Stack Engineer',
    jobDescription: 'Looking for a Full Stack Engineer experienced in React, Node.js, AWS, and Kubernetes.'
  });

  assert.strictEqual(roleAnalysis.success, true, 'Role analysis should succeed');
  assert.ok(typeof roleAnalysis.analysis.matchScore === 'number', 'Should have numeric match score');
  assert.ok(roleAnalysis.analysis.matchScore >= 0 && roleAnalysis.analysis.matchScore <= 100, 'Score should be between 0 and 100');
  assert.ok(Array.isArray(roleAnalysis.analysis.strongMatches), 'Should return strong matches');
  assert.ok(Array.isArray(roleAnalysis.analysis.missingEvidence), 'Should return missing evidence list');
  assert.ok(Array.isArray(roleAnalysis.analysis.atsKeywordAlignment), 'Should return ATS keyword alignment');
  console.log('  ✅ Global Target Role Analysis passed\n');

  // Test 6: Role Optimization Proposals
  console.log('Test 6: Role Optimization Proposals (Non-Destructive)');
  const optResult = await optimizeResumeForRole({
    resume: mockResume,
    targetRole: 'Full Stack Engineer',
    jobDescription: 'Full Stack Engineer with React and Node.js.'
  });

  assert.strictEqual(optResult.success, true, 'Optimization proposals should succeed');
  assert.ok(optResult.proposals.summary, 'Should propose summary');
  assert.ok(optResult.proposals.summary.suggested, 'Should have suggested summary text');
  assert.ok(Array.isArray(optResult.proposals.experiences), 'Should propose experience updates');
  assert.ok(Array.isArray(optResult.proposals.projects), 'Should propose project updates');
  console.log('  ✅ Role Optimization Proposals passed\n');

  console.log('🎉 All 6 Resume AI Assistant tests PASSED!\n');
}

runResumeAiTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
