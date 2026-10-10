const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const { User } = require('../Authorization');
const { Business } = require('../founderListingManagement');

let mongoServer;
let founderOne;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  founderOne = await User.create({
    name: 'Sarah Founder',
    email: 'sarah.founder@example.com',
    passwordHash: 'dummyhashedpassword123',
    role: 'founder'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Business.deleteMany({});

  // Seed sample businesses for testing
  await Business.create([
    {
      owner: founderOne._id,
      businessName: 'FinNova Technologies',
      tagline: 'Automated treasury and liquidity management.',
      description: 'FinNova provides modern enterprise cash visibility and predictive analytics across accounts.',
      industry: 'Fintech',
      stage: 'Early Revenue',
      location: 'San Francisco, US',
      fundingRequired: 500000,
      currency: 'USD',
      status: 'published'
    },
    {
      owner: founderOne._id,
      businessName: 'Apex Health Systems',
      tagline: 'Continuous remote patient hemodynamic monitoring.',
      description: 'Passive acoustic sensor arrays for post-operative cardiovascular patient recovery.',
      industry: 'Healthtech',
      stage: 'Growth',
      location: 'Boston, US',
      fundingRequired: 1200000,
      currency: 'USD',
      status: 'published'
    },
    {
      owner: founderOne._id,
      businessName: 'NeuralSynth AI',
      tagline: 'Foundational speech-to-code models for developers.',
      description: 'Voice programming interface allowing high-speed code generation and refactoring.',
      industry: 'AI',
      stage: 'Idea',
      location: 'New York, US',
      fundingRequired: 300000,
      currency: 'USD',
      status: 'published'
    },
    {
      owner: founderOne._id,
      businessName: 'Secret Stealth AI',
      tagline: 'Stealth project not yet public.',
      description: 'Confidential business description that must not leak to the public discovery feed.',
      industry: 'AI',
      stage: 'Idea',
      location: 'Seattle, US',
      fundingRequired: 250000,
      currency: 'USD',
      status: 'draft' // Should be excluded from discovery!
    },
    {
      owner: founderOne._id,
      businessName: 'Deleted Venture',
      tagline: 'Venture that was soft-deleted.',
      description: 'Deleted business description that must not appear in any public discovery view.',
      industry: 'Fintech',
      stage: 'Early Revenue',
      location: 'Austin, US',
      fundingRequired: 400000,
      currency: 'USD',
      status: 'published',
      deletedAt: new Date() // Should be excluded from discovery!
    }
  ]);
});

describe('Feature 3: Opportunity Discovery', () => {
  describe('GET /api/opportunities (Public Listings Feed)', () => {
    it('should return only published, non-deleted listings', async () => {
      const res = await request(app).get('/api/opportunities');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businesses.length).toBe(3); // 3 published, excluding draft and deleted

      const names = res.body.data.businesses.map((b) => b.businessName);
      expect(names).toContain('FinNova Technologies');
      expect(names).toContain('Apex Health Systems');
      expect(names).toContain('NeuralSynth AI');
      expect(names).not.toContain('Secret Stealth AI');
      expect(names).not.toContain('Deleted Venture');
    });

    it('should ensure owner privacy: only name is exposed (no email or passwordHash)', async () => {
      const res = await request(app).get('/api/opportunities');

      expect(res.status).toBe(200);
      const firstBiz = res.body.data.businesses[0];
      expect(firstBiz.owner).toBeDefined();
      expect(firstBiz.owner.name).toBe('Sarah Founder');
      expect(firstBiz.owner.email).toBeUndefined();
      expect(firstBiz.owner.passwordHash).toBeUndefined();
    });

    it('should filter listings by industry', async () => {
      const res = await request(app).get('/api/opportunities?industry=Fintech');

      expect(res.status).toBe(200);
      expect(res.body.data.businesses.length).toBe(1);
      expect(res.body.data.businesses[0].businessName).toBe('FinNova Technologies');
    });

    it('should filter listings by stage', async () => {
      const res = await request(app).get('/api/opportunities?stage=Growth');

      expect(res.status).toBe(200);
      expect(res.body.data.businesses.length).toBe(1);
      expect(res.body.data.businesses[0].businessName).toBe('Apex Health Systems');
    });

    it('should filter listings by location substring', async () => {
      const res = await request(app).get('/api/opportunities?location=boston');

      expect(res.status).toBe(200);
      expect(res.body.data.businesses.length).toBe(1);
      expect(res.body.data.businesses[0].businessName).toBe('Apex Health Systems');
    });

    it('should filter listings by funding required range', async () => {
      const res = await request(app).get('/api/opportunities?minFunding=400000&maxFunding=600000');

      expect(res.status).toBe(200);
      expect(res.body.data.businesses.length).toBe(1);
      expect(res.body.data.businesses[0].businessName).toBe('FinNova Technologies');
    });

    it('should combine multiple filters properly', async () => {
      const res = await request(app).get('/api/opportunities?industry=AI&stage=Idea');

      expect(res.status).toBe(200);
      expect(res.body.data.businesses.length).toBe(1);
      expect(res.body.data.businesses[0].businessName).toBe('NeuralSynth AI');
    });

    it('should search by keyword across businessName, tagline, and description', async () => {
      const res = await request(app).get('/api/opportunities?search=cardiovascular');

      expect(res.status).toBe(200);
      expect(res.body.data.businesses.length).toBe(1);
      expect(res.body.data.businesses[0].businessName).toBe('Apex Health Systems');
    });

    it('should safely handle search inputs with regex metacharacters without crashing (ReDoS protection)', async () => {
      const res = await request(app).get('/api/opportunities?search=[(AI+*?^$)]');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.businesses)).toBe(true);
    });

    it('should sort listings by funding required ascending and descending', async () => {
      const ascRes = await request(app).get('/api/opportunities?sort=fundingAsc');
      expect(ascRes.status).toBe(200);
      expect(ascRes.body.data.businesses[0].fundingRequired).toBe(300000);

      const descRes = await request(app).get('/api/opportunities?sort=fundingDesc');
      expect(descRes.status).toBe(200);
      expect(descRes.body.data.businesses[0].fundingRequired).toBe(1200000);
    });

    it('should return bounded pagination metadata', async () => {
      const res = await request(app).get('/api/opportunities?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.businesses.length).toBe(2);
      expect(res.body.data.pagination.total).toBe(3);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
      expect(res.body.data.pagination.totalPages).toBe(2);
      expect(res.body.data.pagination.hasNextPage).toBe(true);
      expect(res.body.data.pagination.hasPrevPage).toBe(false);
    });

    it('should also work identically via GET /api/businesses for PRD REST compatibility', async () => {
      const res = await request(app).get('/api/businesses');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businesses.length).toBe(3);
    });
  });

  describe('GET /api/opportunities/:id (Public Opportunity Details)', () => {
    let publishedId;
    let draftId;
    let deletedId;

    beforeEach(async () => {
      const pub = await Business.findOne({ businessName: 'FinNova Technologies' });
      const draft = await Business.findOne({ businessName: 'Secret Stealth AI' });
      const del = await Business.findOne({ businessName: 'Deleted Venture' });

      publishedId = pub._id;
      draftId = draft._id;
      deletedId = del._id;
    });

    it('should return published opportunity details for public visitor', async () => {
      const res = await request(app).get(`/api/opportunities/${publishedId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.businessName).toBe('FinNova Technologies');
      expect(res.body.data.business.owner.name).toBe('Sarah Founder');
      expect(res.body.data.business.owner.email).toBeUndefined();
    });

    it('should return 404 for draft opportunity in public endpoint', async () => {
      const res = await request(app).get(`/api/opportunities/${draftId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for deleted opportunity', async () => {
      const res = await request(app).get(`/api/opportunities/${deletedId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/opportunities/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
