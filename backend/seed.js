require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { User } = require('./moduels/Authorization');
const { Business } = require('./moduels/founderListingManagement');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Seeding demo accounts and listings...');

    // Clear existing test users with demo emails
    await User.deleteMany({
      email: { $in: ['founder@startupmeu.demo', 'investor@startupmeu.demo'] }
    });

    const founderHash = await User.hashPassword('Founder123!');
    const investorHash = await User.hashPassword('Investor123!');

    const [founder, investor] = await User.create([
      {
        name: 'Alex Morgan',
        email: 'founder@startupmeu.demo',
        passwordHash: founderHash,
        role: 'founder'
      },
      {
        name: 'Sarah Chen (Apex Capital)',
        email: 'investor@startupmeu.demo',
        passwordHash: investorHash,
        role: 'investor'
      }
    ]);

    // Clear old listings owned by demo founder
    await Business.deleteMany({ owner: founder._id });

    // Seed listings for demo founder
    const demoListings = await Business.create([
      {
        owner: founder._id,
        businessName: 'FinNova Technologies',
        tagline: 'Automated treasury and liquidity forecasting for high-growth enterprises.',
        description:
          'FinNova eliminates fragmented corporate bank portals through unified real-time cash visibility, automated cross-border FX hedging, and predictive liquidity analytics. Currently servicing 18 enterprise accounts with $420k ARR.',
        industry: 'Fintech',
        stage: 'Early Revenue',
        location: 'San Francisco, US',
        fundingRequired: 750000,
        currency: 'USD',
        website: 'https://finnova.example.com',
        status: 'published'
      },
      {
        owner: founder._id,
        businessName: 'NeuralPulse Health',
        tagline: 'Continuous hemodynamic monitoring powered by passive acoustic sensors.',
        description:
          'NeuralPulse Health is developing non-invasive wearable acoustic sensor arrays that monitor central arterial blood pressure and cardiac output in outpatient cardiac recovery. Preliminary clinical trials underway.',
        industry: 'Healthtech',
        stage: 'Idea',
        location: 'Boston, US',
        fundingRequired: 500000,
        currency: 'USD',
        website: 'https://neuralpulse.example.com',
        status: 'draft'
      }
    ]);

    console.log('[Seed] Demo accounts & listings successfully created:');
    console.log(` - Founder: ${founder.email} (Password: Founder123!)`);
    console.log(` - Investor: ${investor.email} (Password: Investor123!)`);
    console.log(` - Listings Created: ${demoListings.length} (1 Published, 1 Draft)\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
