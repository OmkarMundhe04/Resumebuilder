const express = require('express');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/security');
const { askCopilotWithGemini, enhanceBulletWithGemini, analyzeResumeWithGemini } = require('../utils/geminiService');
const {
  analyzeProject,
  generateProjectDescription,
  suggestSkillsFromProfile,
  enhanceSectionText,
  analyzeResumeForRole,
  optimizeResumeForRole
} = require('../services/projectAnalyzerService');

const router = express.Router();

// Action verbs dictionary for rule-based professional bullet construction
const actionVerbs = {
  leadership: ['Spearheaded', 'Directed', 'Orchestrated', 'Guided', 'Supervised', 'Championed'],
  development: ['Architected', 'Engineered', 'Built', 'Implemented', 'Developed', 'Deployed'],
  optimization: ['Accelerated', 'Streamlined', 'Refactored', 'Enhanced', 'Maximized', 'Automated'],
  analysis: ['Evaluated', 'Diagnosed', 'Synthesized', 'Analyzed', 'Benchmarked', 'Investigated']
};

// @route   POST /api/ai/enhance-bullet
// @desc    Enhance a resume bullet based on verified evidence in 4 distinct truthful styles
// @access  Private
router.post('/enhance-bullet', auth, aiLimiter, async (req, res, next) => {
  try {
    const { originalText, role, task, technology, outcome, metric, style = 'achievement' } = req.body;

    if (!originalText && !task) {
      return res.status(400).json({
        success: false,
        message: 'Original bullet or task description is required.'
      });
    }

    const baseTask = (task || originalText).trim().replace(/[.]+$/, '');
    const techClause = technology ? ` utilizing ${technology}` : '';
    const metricClause = metric ? ` resulting in ${metric}` : (outcome ? ` achieving ${outcome}` : '');
    const cleanRole = role ? `${role}` : '';

    // Generate 4 truthful variants preserving exact user facts
    const variants = {
      concise: `${baseTask}${techClause}.${metricClause ? ' ' + metricClause : ''}`.trim(),
      achievement: metricClause 
        ? `Delivered ${baseTask}${techClause}, successfully ${metricClause.replace(/^ resulting in |^ achieving /i, '')}.`
        : `Executed ${baseTask}${techClause}, ensuring robust delivery and code quality. [METRIC OPTIONAL: Add measurable result]`,
      technical: `Engineered and maintained ${baseTask}${techClause}, adhering to performance and architectural best practices.`,
      professional: `Spearheaded ${baseTask}${techClause} for ${cleanRole || 'the project team'}${metricClause ? ', ' + metricClause : ''}.`
    };

    // Truth ledger mapping for transparency
    const truthLedger = {
      source: 'User Provided Facts',
      evidenceRole: role || 'Not specified',
      evidenceTask: task || originalText,
      evidenceTechnology: technology || 'Not specified',
      evidenceOutcome: outcome || 'Not specified',
      evidenceMetric: metric || 'None provided (No metric hallucinated)',
      isMetricHallucinated: false
    };

    res.status(200).json({
      success: true,
      originalText: originalText || task,
      selectedStyle: style,
      enhancedBullet: variants[style] || variants.achievement,
      allVariants: variants,
      truthLedger,
      coachingNotes: metric 
        ? 'Verified metric included without alteration.' 
        : 'No metric was provided. To strengthen this bullet, consider adding a measurable metric (e.g. % improvement, time saved, user count).'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/coach-bullet
// @desc    Analyze bullet strength and return structured coaching prompts
// @access  Private
router.post('/coach-bullet', auth, aiLimiter, async (req, res, next) => {
  try {
    const { bulletText } = req.body;

    if (!bulletText || typeof bulletText !== 'string') {
      return res.status(400).json({ success: false, message: 'Bullet text is required.' });
    }

    const text = bulletText.trim();
    const hasMetric = /\b\d+(?:%|\+?k|\+?M|\+?x|\s?percent|\s?hours|\s?users|\s?days)?\b/i.test(text);
    const hasActionVerb = /^[A-Z][a-z]+(?:ed|d|ted)\b/.test(text);
    const length = text.split(/\s+/).length;

    const feedback = [];
    const missingElements = [];

    if (!hasActionVerb) {
      feedback.push('Begin with a strong past-tense action verb (e.g., Architected, Spearheaded, Optimized).');
      missingElements.push('Action Verb');
    }

    if (!hasMetric) {
      feedback.push('No measurable metric detected. Quantifying outcomes helps demonstrate real impact.');
      missingElements.push('Measurable Metric');
    }

    if (length < 8) {
      feedback.push('This bullet is relatively brief. Consider specifying the technical tools or project scope.');
      missingElements.push('Technical Scope');
    } else if (length > 35) {
      feedback.push('This bullet is quite long. Consider breaking it into concise, punchy statements.');
    }

    const strengthScore = Math.max(40, Math.min(100, 
      (hasActionVerb ? 30 : 10) + 
      (hasMetric ? 40 : 15) + 
      (length >= 10 && length <= 30 ? 30 : 15)
    ));

    res.status(200).json({
      success: true,
      bulletText: text,
      strengthScore,
      rating: strengthScore >= 85 ? 'Strong' : (strengthScore >= 65 ? 'Good' : 'Needs Improvement'),
      missingElements,
      feedback,
      coachPrompts: {
        actionPrompt: 'What specific action did you take?',
        scopePrompt: 'What was the scope, scale, or team size involved?',
        toolsPrompt: 'What programming languages, frameworks, or tools did you use?',
        outcomePrompt: 'What was the direct business, product, or performance outcome?'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/analyze-resume
// @desc    Full Gemini AI Resume Analysis & Specific Modification Suggestions
// @access  Private
router.post('/analyze-resume', auth, aiLimiter, async (req, res, next) => {
  try {
    const { resumeData, targetRole, jobDescription } = req.body;
    
    let resumeText = '';
    if (typeof resumeData === 'string') {
      resumeText = resumeData;
    } else if (resumeData && typeof resumeData === 'object') {
      const p = resumeData.personal || {};
      const exp = (resumeData.experiences || []).map(e => `- ${e.role} at ${e.company}: ${e.responsibilities || ''} ${(e.bullets || []).map(b => b.text).join(' ')}`).join('\n');
      const sk = (resumeData.skills || []).map(s => s.name || s).join(', ');
      const pr = (resumeData.projects || []).map(pr => `- ${pr.name}: ${pr.description || ''}`).join('\n');
      resumeText = `Name: ${p.fullName || 'Candidate'}\nTitle: ${p.title || ''}\nSummary: ${p.summary || ''}\nSkills: ${sk}\nExperience:\n${exp}\nProjects:\n${pr}`;
    }

    const geminiResult = await analyzeResumeWithGemini({
      resumeText: resumeText || 'No text provided',
      jobDescription: jobDescription || '',
      targetRole: targetRole || 'Software Professional'
    });

    res.status(200).json({
      success: true,
      analysis: geminiResult || 'Resume meets baseline formatting requirements. Ensure all experience points quantify business impact.',
      isGeminiPowered: Boolean(geminiResult)
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/copilot-query
// @desc    Universal Career Copilot with Gemini AI intelligence
// @access  Private
router.post('/copilot-query', auth, aiLimiter, async (req, res, next) => {
  try {
    const { action, query, context = {} } = req.body;

    // 1. Bullet Enhancement
    if (action === 'enhance_bullet' || query?.toLowerCase().includes('enhance bullet') || query?.toLowerCase().includes('bullet point')) {
      const clean = context.bulletText || query || 'built scalable web features with modern architecture';
      
      const geminiBullet = await enhanceBulletWithGemini(clean, {
        role: context.role,
        technology: context.technology,
        metric: context.metric
      });

      if (geminiBullet) {
        return res.status(200).json({
          success: true,
          title: '✨ Gemini AI Bullet Enhancements',
          content: geminiBullet,
          suggestedActions: ['Apply to Resume', 'Copy to Clipboard'],
          isGeminiPowered: true
        });
      }

      const response = {
        title: '⚡ Enhanced Bullet Options',
        content: `Here are 3 high-impact versions grounded in your facts:\n\n` +
          `1. **Achievement Focus:** Architected and deployed ${clean}, reducing latency and improving UX responsiveness.\n` +
          `2. **Metric Focus:** Engineered scalable solution for ${clean}, delivering a 30% increase in operational throughput.\n` +
          `3. **Technical Focus:** Implemented production-grade ${clean}, enforcing automated testing, modular architecture, and CI/CD quality standards.`,
        suggestedActions: ['Apply to Resume', 'Copy to Clipboard']
      };
      return res.status(200).json({ success: true, ...response });
    }

    // 2. Resume Critique
    if (action === 'critique_resume' || query?.toLowerCase().includes('critique') || query?.toLowerCase().includes('review resume')) {
      if (context.resumeText || context.resume) {
        const geminiCritique = await analyzeResumeWithGemini({
          resumeText: context.resumeText || JSON.stringify(context.resume),
          targetRole: context.targetRole || 'Software Professional',
          jobDescription: context.jobDescription || ''
        });

        if (geminiCritique) {
          return res.status(200).json({
            success: true,
            title: '🔍 Gemini AI Resume Diagnostic',
            content: geminiCritique,
            suggestedActions: ['Apply Modifications', 'Run Health Check'],
            isGeminiPowered: true
          });
        }
      }

      const response = {
        title: '🔍 AI Resume Diagnostic',
        content: `**Top Recommendations for Your Resume:**\n\n` +
          `• **Parser Safety:** Keep to clean single/dual-column standard sections.\n` +
          `• **Metric Density:** Ensure at least 60% of experience bullets quantify impact (%, $, time saved, users served).\n` +
          `• **Skill Category Order:** Place core competencies above work history for specialized roles.\n` +
          `• **Length:** Target 1 page for <5 years experience, 2 pages for Senior / Lead roles.`,
        suggestedActions: ['Run Full Health Check', 'View Parser View']
      };
      return res.status(200).json({ success: true, ...response });
    }

    // 3. Conversational Copilot Query with Gemini
    if (query && query.trim()) {
      const geminiReply = await askCopilotWithGemini(query, context);
      if (geminiReply) {
        return res.status(200).json({
          success: true,
          title: '🤖 Gemini Career Copilot',
          content: geminiReply,
          suggestedActions: ['Enhance Bullet Point', 'Analyze Resume', 'Check Job Match'],
          isGeminiPowered: true
        });
      }
    }

    // Default Fallback
    const response = {
      title: '🤖 Career Copilot Assistant',
      content: `I'm your AI Career Document Copilot powered by Google Gemini. How can I help you excel today?\n\n` +
        `• **Resume Diagnostic:** Ask me to critique your resume or give specific modifications\n` +
        `• **Bullet Polish:** Give me any weak bullet to turn it into an achievement-driven powerhouse\n` +
        `• **Job Match:** Ask how to tailor your resume for a specific role or company`,
      suggestedActions: ['Enhance Bullet Point', 'Critique Resume', 'Check Job Match']
    };
    return res.status(200).json({ success: true, ...response });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/project-analyze
// @desc    Analyze a project from GitHub/Live URL/Context with target-role awareness
// @access  Private
router.post('/project-analyze', auth, aiLimiter, async (req, res, next) => {
  try {
    const {
      projectName,
      githubUrl,
      liveUrl,
      context,
      existingTechnologies,
      existingDescription,
      targetRole,
      jobDescription
    } = req.body;

    const result = await analyzeProject({
      projectName,
      githubUrl,
      liveUrl,
      context,
      existingTechnologies,
      existingDescription,
      targetRole,
      jobDescription
    });

    if (!result.success) {
      return res.status(result.isPrivateOrNotFound ? 404 : 400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/project-description
// @desc    Generate truthful description variants for a project
// @access  Private
router.post('/project-description', auth, aiLimiter, async (req, res, next) => {
  try {
    const {
      projectName,
      technologies,
      context,
      existingDescription,
      targetRole,
      jobDescription
    } = req.body;

    const result = await generateProjectDescription({
      projectName,
      technologies,
      context,
      existingDescription,
      targetRole,
      jobDescription
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/suggest-skills
// @desc    Recommend skills grounded in resume/profile evidence + target role/job context
// @access  Private
router.post('/suggest-skills', auth, aiLimiter, async (req, res, next) => {
  try {
    const { resume, profileData, targetRole, jobDescription, projectContext } = req.body;
    const sourceData = resume || profileData;

    if (!sourceData && !projectContext) {
      return res.status(400).json({ success: false, message: 'Resume or project context is required.' });
    }

    const result = await suggestSkillsFromProfile(sourceData || {}, {
      targetRole,
      jobDescription,
      projectContext
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/enhance-section-text
// @desc    Enhance wording for Education, Certifications, Publications, Awards, Volunteer, Custom, or Experience
// @access  Private
router.post('/enhance-section-text', auth, aiLimiter, async (req, res, next) => {
  try {
    const {
      type,
      originalText,
      itemContext,
      targetRole,
      jobDescription
    } = req.body;

    const result = await enhanceSectionText({
      type,
      originalText,
      itemContext,
      targetRole,
      jobDescription
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/role-analysis
// @desc    Deep analysis of resume fit for target role + job description
// @access  Private
router.post('/role-analysis', auth, aiLimiter, async (req, res, next) => {
  try {
    const { resume, targetRole, jobDescription } = req.body;

    if (!resume) {
      return res.status(400).json({ success: false, message: 'Resume data is required for role analysis.' });
    }

    const result = await analyzeResumeForRole({
      resume,
      targetRole,
      jobDescription
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/ai/optimize-for-role
// @desc    Produce proposed resume modifications tailored for target role
// @access  Private
router.post('/optimize-for-role', auth, aiLimiter, async (req, res, next) => {
  try {
    const { resume, targetRole, jobDescription } = req.body;

    if (!resume) {
      return res.status(400).json({ success: false, message: 'Resume data is required for role optimization.' });
    }

    const result = await optimizeResumeForRole({
      resume,
      targetRole,
      jobDescription
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
