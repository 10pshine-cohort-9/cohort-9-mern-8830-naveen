require('./setup');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
describe('Auth API', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });
  const user = {
    fullName: 'Naveen Fatima',
    email: 'naveenminhaj@gmail.com',
    password: 'Naveen@123',
  };
  describe('POST /api/auth/signup', () => {
    it('creates a new user and sets an auth cookie', async () => {
      const agent = request.agent(app);
      const res = await agent .post('/api/auth/signup') .send(user);
      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.user.email).to.equal(user.email);
      expect(res.body.user).to.not.have.property('passwordHash');
      const cookies = res.headers['set-cookie'];
      expect(cookies).to.be.an('array');
      expect(cookies.some(cookie => cookie.startsWith('notes_token='))).to.be.true;
    });
    it('rejects duplicate emails', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(user);
      expect(res.status).to.equal(409);
      expect(res.body.success).to.be.false;
    });

    it('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({email: 'x@x.com',});
      expect(res.status).to.equal(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials and sets an auth cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({email: user.email,password: user.password,
        });
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.user.email).to.equal(user.email);
      const cookies = res.headers['set-cookie'];
      expect(cookies).to.be.an('array');
      expect(cookies.some(cookie => cookie.startsWith('notes_token='))).to.be.true;
    });

    it('rejects incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({email: user.email,password: 'wrongpass',
        });
      expect(res.status).to.equal(401);
    });
    it('rejects unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({email: 'nobody@example.com',password: 'whatever',
        });
      expect(res.status).to.equal(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('rejects requests without a token', async () => {
      const res = await request(app) .get('/api/auth/me');
      expect(res.status).to.equal(401);
    });
    it('returns the current user profile with a valid auth cookie', async () => {
      const agent = request.agent(app);
      await agent .post('/api/auth/login') .send({email: user.email,password: user.password,});
      const res = await agent
        .get('/api/auth/me');
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.user.email).to.equal(user.email);
    });
  });
});