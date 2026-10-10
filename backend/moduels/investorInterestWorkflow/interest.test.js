const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const { User } = require('../Authorization');
const Business = require('../founderListingManagement/Business.model');
const Interest = require('./Interest.model');

let mongoServer;
let founderOneCookie;
let founderTwoCookie;
let investorOneCookie;
let investorTwoCookie;
let founderOneUser;
let publishedBusiness;
let draftBusiness;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // 1. Founder One
  const f1Res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Alice Founder',
      email: 'alice@example.com',
      password: 'Password123!',
      role: 'founder'
    });
  founderOneCookie = f1Res.headers['set-cookie'];
  founderOneUser = f1Res.body.data.user;

  // 2. Founder Two
  const f2Res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Bob Founder',
      email: 'bob@example.com',
      password: 'Password123!',
      role: 'founder'
    });
  founderTwoCookie = f2Res.headers['set-cookie'];

  // 3. Investor One
  const inv1Res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Carol Investor',
      email: 'carol@example.com',
      password: 'Password123!',
      role: 'investor'
    });
  investorOneCookie = inv1Res.headers['set-cookie'];

  // 4. Investor Two
  const inv2Res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Dave Investor',
      email: 'dave@example.com',
      password: 'Password123!',
      role: 'investor'
    });
  investorTwoCookie = inv2Res.headers['set-cookie'];
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Business.deleteMany({});
  await Interest.deleteMany({});

  // Seed sample businesses owned by founderOne
  publishedBusiness = await Business.create({
    owner: founderOneUser._id,
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

  draftBusiness = await Business.create({
    owner: founderOneUser._id,
    businessName: 'Stealth Health',
    tagline: 'Undercover medical diagnostics.',
    description: 'Internal prototype listing for early stage medical diagnostics and clinical test suites.',
    industry: 'Healthtech',
    stage: 'Idea',
    location: 'Boston, US',
    fundingRequired: 250000,
    currency: 'USD',
    status: 'draft'
  });
});

describe('Feature 4: Investor Interest Workflow API', () => {
  describe('POST /api/interests (Submit Interest)', () => {
    it('allows an authenticated investor to submit interest in a published business', async () => {
      const res = await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({
          businessId: publishedBusiness._id,
          message: 'Very interested in your round. We lead early-stage fintech investments.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.interest).toBeDefined();
      expect(res.body.data.interest.status).toBe('pending');
      expect(res.body.data.interest.message).toBe(
        'Very interested in your round. We lead early-stage fintech investments.'
      );
    });

    it('rejects duplicate interest submissions from the same investor (409 Conflict)', async () => {
      // First submission
      await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({
          businessId: publishedBusiness._id,
          message: 'Initial pitch message'
        });

      // Second duplicate submission
      const res = await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({
          businessId: publishedBusiness._id,
          message: 'Another duplicate attempt'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects interest submission for a draft business (404 Not Found)', async () => {
      const res = await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({
          businessId: draftBusiness._id,
          message: 'Want to invest'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('rejects interest submission for a soft-deleted business (404 Not Found)', async () => {
      publishedBusiness.deletedAt = new Date();
      await publishedBusiness.save();

      const res = await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({
          businessId: publishedBusiness._id,
          message: 'Want to invest'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('rejects submissions if the user is a founder (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/interests')
        .set('Cookie', founderTwoCookie)
        .send({
          businessId: publishedBusiness._id,
          message: 'Founder trying to invest'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('rejects unauthenticated requests (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/interests')
        .send({
          businessId: publishedBusiness._id,
          message: 'Anonymous user'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects requests with invalid or missing businessId (400 Validation Error)', async () => {
      const res = await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({
          businessId: 'invalid-mongodb-id',
          message: 'Test'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects message exceeding 500 characters (400 Validation Error)', async () => {
      const res = await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({
          businessId: publishedBusiness._id,
          message: 'a'.repeat(501)
        });

      expect(res.status).toBe(400);
      expect(res.body.error.fields.message).toBeDefined();
    });
  });

  describe('GET /api/interests/sent (Investor Sent Interests)', () => {
    it('returns only the sent interests for the authenticated investor', async () => {
      // Investor One submits
      await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({ businessId: publishedBusiness._id, message: 'From investor one' });

      // Investor Two submits
      await request(app)
        .post('/api/interests')
        .set('Cookie', investorTwoCookie)
        .send({ businessId: publishedBusiness._id, message: 'From investor two' });

      const res = await request(app)
        .get('/api/interests/sent')
        .set('Cookie', investorOneCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(1);
      expect(res.body.data.interests[0].message).toBe('From investor one');
    });

    it('protects founder privacy: conceals founder email when status is pending or declined', async () => {
      await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({ businessId: publishedBusiness._id, message: 'Pending request' });

      const res = await request(app)
        .get('/api/interests/sent')
        .set('Cookie', investorOneCookie);

      expect(res.status).toBe(200);
      const interestItem = res.body.data.interests[0];
      expect(interestItem.business.owner.name).toBe('Alice Founder');
      expect(interestItem.business.owner.email).toBeUndefined();
    });

    it('reveals founder email once the request has been accepted', async () => {
      const submitRes = await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({ businessId: publishedBusiness._id, message: 'Will be accepted' });

      const interestId = submitRes.body.data.interest._id;

      // Founder accepts
      await request(app)
        .patch(`/api/interests/${interestId}/status`)
        .set('Cookie', founderOneCookie)
        .send({ status: 'accepted' });

      // Investor checks sent
      const res = await request(app)
        .get('/api/interests/sent')
        .set('Cookie', investorOneCookie);

      expect(res.status).toBe(200);
      const interestItem = res.body.data.interests[0];
      expect(interestItem.status).toBe('accepted');
      expect(interestItem.business.owner.email).toBe('alice@example.com');
    });
  });

  describe('GET /api/interests/received (Founder Received Interests)', () => {
    it('returns interest requests for listings owned by the founder', async () => {
      await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({ businessId: publishedBusiness._id, message: 'Hi Alice!' });

      const res = await request(app)
        .get('/api/interests/received')
        .set('Cookie', founderOneCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(1);
      expect(res.body.data.interests[0].investor.name).toBe('Carol Investor');
      expect(res.body.data.interests[0].investor.email).toBe('carol@example.com');
    });

    it('does not return interest requests to unrelated founders', async () => {
      await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({ businessId: publishedBusiness._id, message: 'Hi Alice!' });

      const res = await request(app)
        .get('/api/interests/received')
        .set('Cookie', founderTwoCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(0);
    });
  });

  describe('PATCH /api/interests/:id/status (Accept / Decline Interest)', () => {
    let interestId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/interests')
        .set('Cookie', investorOneCookie)
        .send({ businessId: publishedBusiness._id, message: 'Ready to connect' });
      interestId = res.body.data.interest._id;
    });

    it('allows the business owner founder to accept an interest request', async () => {
      const res = await request(app)
        .patch(`/api/interests/${interestId}/status`)
        .set('Cookie', founderOneCookie)
        .send({ status: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.interest.status).toBe('accepted');
      expect(res.body.data.interest.reviewedAt).toBeDefined();
    });

    it('allows the business owner founder to decline an interest request', async () => {
      const res = await request(app)
        .patch(`/api/interests/${interestId}/status`)
        .set('Cookie', founderOneCookie)
        .send({ status: 'declined' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.interest.status).toBe('declined');
      expect(res.body.data.interest.reviewedAt).toBeDefined();
    });

    it('forbids another founder from updating the status (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/interests/${interestId}/status`)
        .set('Cookie', founderTwoCookie)
        .send({ status: 'accepted' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('prevents modifying an interest request that is already accepted or declined (400 INVALID_TRANSITION)', async () => {
      // First accept
      await request(app)
        .patch(`/api/interests/${interestId}/status`)
        .set('Cookie', founderOneCookie)
        .send({ status: 'accepted' });

      // Attempt to decline after acceptance
      const res = await request(app)
        .patch(`/api/interests/${interestId}/status`)
        .set('Cookie', founderOneCookie)
        .send({ status: 'declined' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_TRANSITION');
    });

    it('validates status input values (400 Validation Error)', async () => {
      const res = await request(app)
        .patch(`/api/interests/${interestId}/status`)
        .set('Cookie', founderOneCookie)
        .send({ status: 'maybe' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
