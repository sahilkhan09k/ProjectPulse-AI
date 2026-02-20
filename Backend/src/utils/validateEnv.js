const REQUIRED_ENV_VARS = [
  'PORT',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'FRONTEND_URL'
];

const OPTIONAL_ENV_VARS = [
  'GROQ_API_KEY', // Optional - will use fallback recommendations if not provided
  'GROQ_API_URL',
  'GROQ_MODEL',
  'LOG_LEVEL'
];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    console.error('See .env.example for reference.');
    process.exit(1);
  }
  
  // Warn about missing optional variables
  const missingOptional = OPTIONAL_ENV_VARS.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.warn('⚠️  Optional environment variables not set:');
    missingOptional.forEach(varName => console.warn(`   - ${varName}`));
    console.warn('Some features may use fallback behavior.\n');
  }
  
  console.log('✅ Environment variables validated successfully');
};

module.exports = { validateEnv };
