const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const User = require('./User.model');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authorization & Role-Based Access Control', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new founder successfully and set HTTP-only cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Founder',
          email: 'alice@example.com',
          password: 'Password123!',
          role: 'founder'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.name).toBe('Alice Founder');
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.role).toBe('founder');
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Check cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should register a new investor successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bob Investor',
          email: 'bob@example.com',
          password: 'Password123!',
          role: 'investor'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('investor');
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Founder',
          email: 'alice@example.com',
          password: 'Password123!',
          role: 'founder'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice Duplicate',
          email: 'ALICE@example.com', // Case insensitivity test
          password: 'Password123!',
          role: 'founder'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject registration with invalid or disallowed role (400 Validation Error)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker User',
          email: 'hacker@example.com',
          password: 'Password123!',
          role: 'admin' // Not in ['founder', 'investor']
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.fields.role).toBeDefined();
    });

    it('should reject registration with short password (400 Validation Error)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Password',
          email: 'short@example.com',
          password: '123',
          role: 'founder'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.fields.password).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
          role: 'founder'
        });
    });

    it('should log in existing user with correct credentials and set cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return generic error for incorrect password without leaking internals', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'WrongPassword999'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });

    it('should return generic error for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });
  });

  describe('GET /api/auth/me', () => {
    let authCookie;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Founder User',
          email: 'founder@example.com',
          password: 'Password123!',
          role: 'founder'
        });
      authCookie = reg.headers['set-cookie'];
    });

    it('should return current user when authenticated with cookie', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('founder@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should return 401 when no session cookie or token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Role-Based Access Control Middleware', () => {
    let founderCookie;
    let investorCookie;

    beforeEach(async () => {
      const founderRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Founder One',
          email: 'founder1@example.com',
          password: 'Password123!',
          role: 'founder'
        });
      founderCookie = founderRes.headers['set-cookie'];

      const investorRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Investor One',
          email: 'investor1@example.com',
          password: 'Password123!',
          role: 'investor'
        });
      investorCookie = investorRes.headers['set-cookie'];
    });

    it('should allow founder to access founder-only endpoint', async () => {
      const res = await request(app)
        .get('/api/auth/test/founder')
        .set('Cookie', founderCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny investor from accessing founder-only endpoint (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/auth/test/founder')
        .set('Cookie', investorCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/Forbidden/);
    });

    it('should allow investor to access investor-only endpoint', async () => {
      const res = await request(app)
        .get('/api/auth/test/investor')
        .set('Cookie', investorCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny founder from accessing investor-only endpoint (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/auth/test/investor')
        .set('Cookie', founderCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully log out and clear cookie', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Logout User',
          email: 'logout@example.com',
          password: 'Password123!',
          role: 'founder'
        });
      const cookie = reg.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully.');
    });
  });
});
