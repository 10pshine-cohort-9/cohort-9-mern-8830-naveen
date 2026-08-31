require('./setup');

const { expect } = require('chai');
const request = require('supertest');
const app = require('../src/app');
const { sequelize, Note } = require('../src/models');

describe('Notes API', () => {
  let agent;
  let noteId;

  before(async () => {
    await sequelize.sync({ force: true });
    agent = request.agent(app);
    const signupRes = await agent
      .post('/api/auth/signup')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(signupRes.status).to.equal(201);
    const cookies = signupRes.headers['set-cookie'];
    expect(cookies).to.be.an('array');
    expect(cookies.some((cookie) => cookie.startsWith('notes_token='))).to.be.true;
  });

  it('rejects requests without auth', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).to.equal(401);
  });

  it('creates a note', async () => {
    const res = await agent .post('/api/notes') .send({title: 'Project Ideas',content: 'Some fresh ideas',category: 'Work',});
    expect(res.status).to.equal(201);
    expect(res.body.note.title).to.equal('Project Ideas');
    noteId = res.body.note.id;
  });

  it('returns 400 and does not create a note for a whitespace-only title', async () => {
    const before = await Note.count();
    const res = await agent
      .post('/api/notes')
      .send({title: '  ', });
    expect(res.status).to.equal(400);
    const after = await Note.count();
    expect(after).to.equal(before);
  });

  it('rejects a note without a title', async () => {
    const res = await agent
      .post('/api/notes')
      .send({content: 'no title',});
    expect(res.status).to.equal(400);
  });

  it('lists notes for the authenticated user', async () => {
    const res = await agent.get('/api/notes');
    expect(res.status).to.equal(200);
    expect(res.body.notes).to.be.an('array').with.lengthOf(1);});

  it('fetches a single note by id', async () => {
    const res = await agent.get(`/api/notes/${noteId}`);
    expect(res.status).to.equal(200);
    expect(res.body.note.id).to.equal(noteId);
  });

  it('updates a note', async () => {
    const res = await agent
      .patch(`/api/notes/${noteId}`)
      .send({ title: 'Updated Title', isFavourite: true,});
    expect(res.status).to.equal(200);
    expect(res.body.note.title).to.equal('Updated Title');
    expect(res.body.note.isFavourite).to.be.true;
  });

  it('returns 404 for a note belonging to another user or missing', async () => {
    const res = await agent.get('/api/notes/9999');
    expect(res.status).to.equal(404);
  });

  it('soft-deletes a note into Trash on first delete', async () => {
    const res = await agent.delete(`/api/notes/${noteId}`);
    expect(res.status).to.equal(200);
    expect(res.body.note.isDeleted).to.be.true;
  });

  it('permanently deletes a note on second delete (from Trash)', async () => {
    const res = await agent.delete(`/api/notes/${noteId}`);
    expect(res.status).to.equal(200);
    expect(res.body.message).to.match(/permanently deleted/i);
  });
});