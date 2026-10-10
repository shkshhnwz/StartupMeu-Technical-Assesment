const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const { User } = require('../Authorization');
const Business = require('./Business.model');

let mongoServer;
let founderOneCookie;
let founderTwoCookie;
let investorCookie;

const sampleListing = {
  businessName: 'FinNova Technologies',
  tagline: 'AI-driven automated corporate treasury and cash management platform.',
  description:
    'FinNova provides modern enterprise teams with real-time liquidity forecasting, intelligent cross-border hedging, and automated payroll cash sweeps with zero manual spreadsheets.',
  industry: 'Fintech',
  stage: 'Early Revenue',
  location: 'San Francisco, CA',
  fundingRequired: 750000,
  currency: 'USD',
  website: 'https://finnova.example.com',
  status: 'published'
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const f1 = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Founder One',
      email: 'f1@example.com',
      password: 'Password123!',
      role: 'founder'
    });
  founderOneCookie = f1.headers['set-cookie'];

  const f2 = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Founder Two',
      email: 'f2@example.com',
      password: 'Password123!',
      role: 'founder'
    });
  founderTwoCookie = f2.headers['set-cookie'];

  const inv = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Investor User',
      email: 'inv@example.com',
      password: 'Password123!',
      role: 'investor'
    });
  investorCookie = inv.headers['set-cookie'];
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Business.deleteMany({});
});

describe('Feature 2: Founder Listing Management', () => {
  describe('POST /api/businesses (Create Listing)', () => {
    it('should allow founder to create a published business listing', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send(sampleListing);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.businessName).toBe('FinNova Technologies');
      expect(res.body.data.business.status).toBe('published');
      expect(res.body.data.business.owner).toBeDefined();
    });

    it('should allow founder to create a draft listing', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send({
          ...sampleListing,
          businessName: 'Draft Venture',
          status: 'draft'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.status).toBe('draft');
    });

    it('should reject unauthenticated listing creation (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .send(sampleListing);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject investor from creating a listing (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .set('Cookie', investorCookie)
        .send(sampleListing);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject invalid inputs with field-level errors (400 Validation Error)', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send({
          businessName: 'A',
          tagline: '',
          description: 'Too short description',
          industry: 'SpaceTravel',
          stage: 'UnknownStage',
          location: '',
          fundingRequired: -5000
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.fields.businessName).toBeDefined();
      expect(res.body.error.fields.tagline).toBeDefined();
      expect(res.body.error.fields.description).toBeDefined();
      expect(res.body.error.fields.fundingRequired).toBeDefined();
    });
  });

  describe('GET /api/businesses/mine (Founder Own Listings)', () => {
    it('should retrieve all listings owned by founder, including drafts', async () => {
      await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send(sampleListing);

      await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send({
          ...sampleListing,
          businessName: 'Second Business Draft',
          status: 'draft'
        });

      const res = await request(app)
        .get('/api/businesses/mine')
        .set('Cookie', founderOneCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businesses.length).toBe(2);
    });

    it('should not expose other founders listings in /mine', async () => {
      await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send(sampleListing);

      const res = await request(app)
        .get('/api/businesses/mine')
        .set('Cookie', founderTwoCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.businesses.length).toBe(0);
    });
  });

  describe('GET /api/businesses/:id (Listing Details & Draft Privacy)', () => {
    it('should allow public visitors to view published listing', async () => {
      const createRes = await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send(sampleListing);

      const businessId = createRes.body.data.business._id;

      const res = await request(app).get(`/api/businesses/${businessId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.businessName).toBe('FinNova Technologies');
    });

    it('should hide draft listing from public visitors (404 Not Found)', async () => {
      const createRes = await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send({
          ...sampleListing,
          businessName: 'Secret Stealth Draft',
          status: 'draft'
        });

      const businessId = createRes.body.data.business._id;

      const res = await request(app).get(`/api/businesses/${businessId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should allow owning founder to view their own draft listing', async () => {
      const createRes = await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send({
          ...sampleListing,
          businessName: 'My Secret Draft',
          status: 'draft'
        });

      const businessId = createRes.body.data.business._id;

      const res = await request(app)
        .get(`/api/businesses/${businessId}`)
        .set('Cookie', founderOneCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.businessName).toBe('My Secret Draft');
    });
  });

  describe('PATCH /api/businesses/:id (Update Listing & Ownership Enforced)', () => {
    let businessId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send(sampleListing);
      businessId = createRes.body.data.business._id;
    });

    it('should allow owner founder to update listing', async () => {
      const res = await request(app)
        .patch(`/api/businesses/${businessId}`)
        .set('Cookie', founderOneCookie)
        .send({
          fundingRequired: 1000000,
          stage: 'Growth'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business.fundingRequired).toBe(1000000);
      expect(res.body.data.business.stage).toBe('Growth');
    });

    it('should deny another founder from updating the listing (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/businesses/${businessId}`)
        .set('Cookie', founderTwoCookie)
        .send({
          businessName: 'Malicious Hijack'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should deny investor from updating listing (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/businesses/${businessId}`)
        .set('Cookie', investorCookie)
        .send({
          fundingRequired: 99999999
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/businesses/:id (Soft Deletion & Ownership Enforced)', () => {
    let businessId;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/businesses')
        .set('Cookie', founderOneCookie)
        .send(sampleListing);
      businessId = createRes.body.data.business._id;
    });

    it('should deny another founder from deleting the listing (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/businesses/${businessId}`)
        .set('Cookie', founderTwoCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow owner founder to delete (soft-delete) own listing', async () => {
      const res = await request(app)
        .delete(`/api/businesses/${businessId}`)
        .set('Cookie', founderOneCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const mineRes = await request(app)
        .get('/api/businesses/mine')
        .set('Cookie', founderOneCookie);

      expect(mineRes.body.data.businesses.length).toBe(0);

      const getRes = await request(app).get(`/api/businesses/${businessId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
