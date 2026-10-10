require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { User } = require('./moduels/Authorization');

const seedUsers = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Seeding demo accounts...');

    // Clear existing test users with demo emails
    await User.deleteMany({
      email: { $in: ['founder@startupmeu.demo', 'investor@startupmeu.demo'] }
    });

    const founderHash = await User.hashPassword('Founder123!');
    const investorHash = await User.hashPassword('Investor123!');

    const demoUsers = await User.create([
      {
        name: 'Demo Founder (TechFlow)',
        email: 'founder@startupmeu.demo',
        passwordHash: founderHash,
        role: 'founder'
      },
      {
        name: 'Demo Investor (Apex Capital)',
        email: 'investor@startupmeu.demo',
        passwordHash: investorHash,
        role: 'investor'
      }
    ]);

    console.log('[Seed] Demo accounts successfully created:');
    demoUsers.forEach(u => {
      console.log(` - Role: ${u.role.padEnd(8)} | Email: ${u.email} | Name: ${u.name}`);
    });
    console.log('Demo Password for both: Founder123! / Investor123!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedUsers();
