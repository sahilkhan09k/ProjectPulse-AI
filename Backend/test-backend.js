/**
 * Backend Testing Script
 * Tests core functionality without starting the server
 */

const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

console.log('🧪 Testing ProjectPulse AI Backend\n');

// Test 1: Environment Variables
console.log('1️⃣  Testing Environment Variables...');
const requiredVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'FRONTEND_URL'
];

let envTestPassed = true;
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`   ❌ Missing: ${varName}`);
    envTestPassed = false;
  } else {
    console.log(`   ✅ ${varName}: ${varName.includes('SECRET') ? '***' : process.env[varName]}`);
  }
});

if (envTestPassed) {
  console.log('   ✅ All required environment variables present\n');
} else {
  console.log('   ❌ Some environment variables missing\n');
  process.exit(1);
}

// Test 2: Module Imports
console.log('2️⃣  Testing Module Imports...');
try {
  const User = require('./src/models/user.model');
  console.log('   ✅ User model loaded');
  
  const Project = require('./src/models/project.model');
  console.log('   ✅ Project model loaded');
  
  const Task = require('./src/models/task.model');
  console.log('   ✅ Task model loaded');
  
  const RiskAlert = require('./src/models/riskAlert.model');
  console.log('   ✅ RiskAlert model loaded');
  
  const authService = require('./src/services/auth.service');
  console.log('   ✅ Auth service loaded');
  
  const reliabilityService = require('./src/services/reliability.service');
  console.log('   ✅ Reliability service loaded');
  
  const riskService = require('./src/services/risk.service');
  console.log('   ✅ Risk service loaded');
  
  const simulationService = require('./src/services/simulation.service');
  console.log('   ✅ Simulation service loaded');
  
  const aiService = require('./src/services/ai.service');
  console.log('   ✅ AI service loaded');
  
  const socketService = require('./src/services/socket.service');
  console.log('   ✅ Socket service loaded');
  
  const { app } = require('./src/app');
  console.log('   ✅ Express app loaded');
  
  console.log('   ✅ All modules imported successfully\n');
} catch (error) {
  console.log(`   ❌ Module import failed: ${error.message}\n`);
  process.exit(1);
}

// Test 3: Database Connection
console.log('3️⃣  Testing Database Connection...');
const connectDB = require('./src/db/index');

connectDB()
  .then(() => {
    console.log('   ✅ Database connection successful\n');
    
    // Test 4: Model Operations
    console.log('4️⃣  Testing Model Operations...');
    const User = require('./src/models/user.model');
    
    return User.countDocuments();
  })
  .then((count) => {
    console.log(`   ✅ User model query successful (${count} users in database)\n`);
    
    // Test 5: Service Functions
    console.log('5️⃣  Testing Service Functions...');
    const reliabilityService = require('./src/services/reliability.service');
    
    // Test metric calculations with sample data
    const sampleTasks = [
      { status: 'blocked', updatedAt: new Date() },
      { status: 'todo', updatedAt: new Date() },
      { status: 'inprogress', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { status: 'done', updatedAt: new Date() }
    ];
    
    const blockerFreq = reliabilityService.calculateBlockerFrequency(sampleTasks);
    console.log(`   ✅ Blocker frequency calculation: ${(blockerFreq * 100).toFixed(1)}%`);
    
    const stagnationRate = reliabilityService.calculateStagnationRate(sampleTasks);
    console.log(`   ✅ Stagnation rate calculation: ${(stagnationRate * 100).toFixed(1)}%`);
    
    console.log('   ✅ Service functions working correctly\n');
    
    // Test 6: AI Service
    console.log('6️⃣  Testing AI Service...');
    const aiService = require('./src/services/ai.service');
    
    return aiService.getRecoveryRecommendations({
      reliabilityScore: 60,
      blockerCount: 5,
      stagnationCount: 3,
      overloadMembers: 2,
      daysRemaining: 10
    });
  })
  .then((recommendations) => {
    console.log('   ✅ AI service response received');
    console.log(`   📝 Summary: ${recommendations.summary.substring(0, 60)}...`);
    console.log(`   📝 Action items: ${recommendations.actionItems.length} recommendations\n`);
    
    // All tests passed
    console.log('✅ All Backend Tests Passed!\n');
    console.log('📊 Test Summary:');
    console.log('   ✅ Environment variables configured');
    console.log('   ✅ All modules load correctly');
    console.log('   ✅ Database connection working');
    console.log('   ✅ Model operations functional');
    console.log('   ✅ Service functions operational');
    console.log('   ✅ AI integration working\n');
    
    console.log('🚀 Backend is ready to run!');
    console.log('\nNext steps:');
    console.log('   1. Run: npm run seed (if database is empty)');
    console.log('   2. Run: npm run dev');
    console.log('   3. Test endpoints with Postman or curl\n');
    
    process.exit(0);
  })
  .catch((error) => {
    console.log(`   ❌ Test failed: ${error.message}\n`);
    console.error('Error details:', error);
    process.exit(1);
  });
