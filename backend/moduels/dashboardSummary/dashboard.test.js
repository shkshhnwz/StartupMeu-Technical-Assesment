const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const { User } = require('../Authorization');
const Business = require('../founderListingManagement/Business.model');
const Interest = require('../investorInterestWorkflow/Interest.model');

let mongoServer;
let founderCookie;
let investorCookie;
let founderUser;
let investorUser;
let publishedBiz;
let draftBiz;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Register Founder
  const fRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Diana Founder',
      email: 'diana@example.com',
      password: 'Password123!',
      role: 'founder'
    });
  founderCookie = fRes.headers['set-cookie'];
  founderUser = fRes.body.data.user;

  // Register Investor
  const invRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Edward Investor',
      email: 'edward@example.com',
      password: 'Password123!',
      role: 'investor'
    });
  investorCookie = invRes.headers['set-cookie'];
  investorUser = invRes.body.data.user;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Business.deleteMany({});
  await Interest.deleteMany({});

  publishedBiz = await Business.create({
    owner: founderUser._id,
    businessName: 'FinNova Technologies',
    tagline: 'Automated treasury and liquidity management.',
    description: 'Modern enterprise treasury platform automating cash sweeps and forecasts.',
    industry: 'Fintech',
    stage: 'Early Revenue',
    location: 'San Francisco, US',
    fundingRequired: 500000,
    currency: 'USD',
    status: 'published'
  });

  draftBiz = await Business.create({
    owner: founderUser._id,
    businessName: 'Stealth Diagnostics',
    tagline: 'Undercover medical diagnostics and testing suite.',
    description: 'Internal prototype listing for early stage medical diagnostics and testing suite.',
    industry: 'Healthtech',
    stage: 'Idea',
    location: 'Boston, US',
    fundingRequired: 250000,
    currency: 'USD',
    status: 'draft'
  });
});

describe('Feature 5: Dashboard Summary API', () => {
  describe('GET /api/dashboard/founder', () => {
    it('returns comprehensive metrics and recent inbound activity for authenticated founder', async () => {
      // Create an inbound interest request from investor
      await Interest.create({
        business: publishedBiz._id,
        investor: investorUser._id,
        message: 'Excited about your fintech product!',
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/dashboard/founder')
        .set('Cookie', founderCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();

      const { metrics, recentInterests } = res.body.data;
      expect(metrics.totalListings).toBe(2);
      expect(metrics.publishedListings).toBe(1);
      expect(metrics.draftListings).toBe(1);
      expect(metrics.totalInterests).toBe(1);
      expect(metrics.pendingInterests).toBe(1);
      expect(metrics.acceptedInterests).toBe(0);

      expect(recentInterests).toHaveLength(1);
      expect(recentInterests[0].investor.name).toBe('Edward Investor');
      expect(recentInterests[0].business.businessName).toBe('FinNova Technologies');
    });

    it('forbids an investor from accessing founder dashboard summary (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/dashboard/founder')
        .set('Cookie', investorCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated requests (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/dashboard/founder');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/dashboard/investor', () => {
    it('returns pipeline breakdown and recent submissions for authenticated investor', async () => {
      // Investor sends interest
      await Interest.create({
        business: publishedBiz._id,
        investor: investorUser._id,
        message: 'Looking forward to intro call',
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/dashboard/investor')
        .set('Cookie', investorCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { metrics, recentInterests } = res.body.data;
      expect(metrics.totalSent).toBe(1);
      expect(metrics.pendingCount).toBe(1);
      expect(metrics.acceptedCount).toBe(0);
      expect(recentInterests).toHaveLength(1);
      expect(recentInterests[0].business.businessName).toBe('FinNova Technologies');

      // Privacy check: Founder email is concealed because pending
      expect(recentInterests[0].business.owner.email).toBeUndefined();
    });

    it('forbids a founder from accessing investor dashboard summary (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/dashboard/investor')
        .set('Cookie', founderCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated requests (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/dashboard/investor');
      expect(res.status).toBe(401);
    });
  });
});
