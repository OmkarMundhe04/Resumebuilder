/**
 * Environment Variable Validator
 * Ensures essential configuration variables are present on startup
 * and provides clear diagnostic messages without mysterious runtime crashes.
 */

const validateEnv = () => {
  const errors = [];
  const warnings = [];

  // Required Variables
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('JWT_SECRET is required in production.');
    } else {
      warnings.push('JWT_SECRET not set in development. Falling back to internal development secret.');
      process.env.JWT_SECRET = 'dev_secret_jwt_resumebuilder_platform_2026';
    }
  }

  if (!process.env.MONGO_URI) {
    warnings.push('MONGO_URI not set. Using local default: mongodb://127.0.0.1:27017/resumebuilder');
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/resumebuilder';
  }

  // Optional AI Provider Variables
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    warnings.push('AI API key (GEMINI_API_KEY) not detected. Platform running in offline deterministic rule-based NLP mode.');
  }

  if (errors.length > 0) {
    console.error('❌ FATAL STARTUP CONFIGURATION ERRORS:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('ℹ️ Environment Startup Notice:');
    warnings.forEach(w => console.log(`  • ${w}`));
  }

  console.log('✅ Environment configuration validated.');
};

module.exports = validateEnv;
