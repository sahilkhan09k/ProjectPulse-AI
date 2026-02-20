const dotenv = require('dotenv');
const connectDB = require('./index');
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Task = require('../models/task.model');
const RiskAlert = require('../models/riskAlert.model');

// Load environment variables
dotenv.config({ path: './.env' });

/**
 * Seed database with demo data
 * Target: 6 users, 1 project, 30 tasks
 * Target reliability score: 65-70
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if database is already seeded
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      console.log('   To re-seed, please clear the database first.');
      return;
    }

    // Create 6 users
    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Alice Johnson',
        email: 'alice@projectpulse.demo',
        passwordHash: await User.hashPassword('Demo123!')
      },
      {
        name: 'Bob Smith',
        email: 'bob@projectpulse.demo',
        passwordHash: await User.hashPassword('Demo123!')
      },
      {
        name: 'Carol Williams',
        email: 'carol@projectpulse.demo',
        passwordHash: await User.hashPassword('Demo123!')
      },
      {
        name: 'David Brown',
        email: 'david@projectpulse.demo',
        passwordHash: await User.hashPassword('Demo123!')
      },
      {
        name: 'Eve Davis',
        email: 'eve@projectpulse.demo',
        passwordHash: await User.hashPassword('Demo123!')
      },
      {
        name: 'Frank Miller',
        email: 'frank@projectpulse.demo',
        passwordHash: await User.hashPassword('Demo123!')
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create 1 project with deadline 21 days in future
    console.log('Creating project...');
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 21);

    const project = await Project.create({
      name: 'E-Commerce Platform Redesign',
      description: 'Complete redesign of the customer-facing e-commerce platform with improved UX and performance',
      deadline,
      reliabilityScore: 100, // Will be recalculated after tasks
      healthMetrics: {
        blockerFrequency: 0,
        stagnationRate: 0,
        overloadRatio: 0,
        velocityVariance: 0
      }
    });
    console.log(`✅ Created project: ${project.name}`);

    // Create 30 tasks with specific distribution to achieve target score 65-70
    console.log('Creating tasks...');
    
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const tasks = [];

    // 5 blocked tasks (16.7% blocker frequency)
    for (let i = 0; i < 5; i++) {
      tasks.push({
        projectId: project._id,
        title: `Blocked Task ${i + 1}`,
        description: 'This task is currently blocked',
        status: 'blocked',
        assigneeId: users[i % users.length]._id,
        dueDate: new Date(now.getTime() + (7 + i) * 24 * 60 * 60 * 1000),
        priority: 'high',
        estimatedHours: 8
      });
    }

    // 3 stale tasks (10% stagnation rate) - not updated in 72+ hours
    for (let i = 0; i < 3; i++) {
      tasks.push({
        projectId: project._id,
        title: `Stale Task ${i + 1}`,
        description: 'This task has not been updated recently',
        status: 'inprogress',
        assigneeId: users[i % users.length]._id,
        dueDate: new Date(now.getTime() + (5 + i) * 24 * 60 * 60 * 1000),
        priority: 'medium',
        estimatedHours: 6,
        updatedAt: threeDaysAgo,
        createdAt: oneWeekAgo
      });
    }

    // 8 active tasks for user 0 (Alice) - creates overload
    for (let i = 0; i < 8; i++) {
      tasks.push({
        projectId: project._id,
        title: `Alice's Task ${i + 1}`,
        description: 'Task assigned to Alice',
        status: i % 2 === 0 ? 'todo' : 'inprogress',
        assigneeId: users[0]._id,
        dueDate: new Date(now.getTime() + (3 + i) * 24 * 60 * 60 * 1000),
        priority: ['low', 'medium', 'high'][i % 3],
        estimatedHours: 4
      });
    }

    // 6 active tasks for user 1 (Bob) - creates overload
    for (let i = 0; i < 6; i++) {
      tasks.push({
        projectId: project._id,
        title: `Bob's Task ${i + 1}`,
        description: 'Task assigned to Bob',
        status: i % 2 === 0 ? 'todo' : 'inprogress',
        assigneeId: users[1]._id,
        dueDate: new Date(now.getTime() + (4 + i) * 24 * 60 * 60 * 1000),
        priority: ['medium', 'high'][i % 2],
        estimatedHours: 5
      });
    }

    // 8 completed tasks with varying completion dates (for velocity variance)
    // Week 1: 2 tasks
    for (let i = 0; i < 2; i++) {
      tasks.push({
        projectId: project._id,
        title: `Completed Task Week 1 - ${i + 1}`,
        description: 'Completed task from week 1',
        status: 'done',
        assigneeId: users[(i + 2) % users.length]._id,
        dueDate: twoWeeksAgo,
        priority: 'medium',
        estimatedHours: 6,
        actualHours: 7,
        updatedAt: twoWeeksAgo,
        createdAt: new Date(twoWeeksAgo.getTime() - 3 * 24 * 60 * 60 * 1000)
      });
    }

    // Week 2: 6 tasks (high variance)
    for (let i = 0; i < 6; i++) {
      tasks.push({
        projectId: project._id,
        title: `Completed Task Week 2 - ${i + 1}`,
        description: 'Completed task from week 2',
        status: 'done',
        assigneeId: users[(i + 3) % users.length]._id,
        dueDate: oneWeekAgo,
        priority: 'medium',
        estimatedHours: 5,
        actualHours: 6,
        updatedAt: oneWeekAgo,
        createdAt: new Date(oneWeekAgo.getTime() - 4 * 24 * 60 * 60 * 1000)
      });
    }

    // Create all tasks
    const createdTasks = await Task.create(tasks);
    console.log(`✅ Created ${createdTasks.length} tasks`);

    // Calculate reliability score
    console.log('Calculating reliability score...');
    const reliabilityService = require('../services/reliability.service');
    const finalScore = await reliabilityService.calculateReliabilityScore(project._id);
    
    console.log(`\n📊 Final Reliability Score: ${finalScore.toFixed(2)}`);
    
    // Verify score is in target range
    if (finalScore < 65 || finalScore > 70) {
      console.warn(`⚠️  Warning: Score ${finalScore.toFixed(2)} is outside target range (65-70)`);
    } else {
      console.log(`✅ Score is within target range (65-70)`);
    }

    // Display metrics
    const updatedProject = await Project.findById(project._id);
    console.log('\n📈 Health Metrics:');
    console.log(`   Blocker Frequency: ${(updatedProject.healthMetrics.blockerFrequency * 100).toFixed(1)}%`);
    console.log(`   Stagnation Rate: ${(updatedProject.healthMetrics.stagnationRate * 100).toFixed(1)}%`);
    console.log(`   Overload Ratio: ${(updatedProject.healthMetrics.overloadRatio * 100).toFixed(1)}%`);
    console.log(`   Velocity Variance: ${(updatedProject.healthMetrics.velocityVariance * 100).toFixed(1)}%`);

    // Check for risk alerts
    const alerts = await RiskAlert.find({ projectId: project._id, resolved: false });
    console.log(`\n🚨 Active Risk Alerts: ${alerts.length}`);
    if (alerts.length > 0) {
      alerts.forEach(alert => {
        console.log(`   - ${alert.type.toUpperCase()}: ${alert.reason}`);
      });
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Email: alice@projectpulse.demo (or any user above)');
    console.log('   Password: Demo123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeder
connectDB()
  .then(async () => {
    await seedDatabase();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
