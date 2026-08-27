require('./setup');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const {Note} = require('../src/models');
describe('Notes API', () => {
  let token;

  before(async () => {
    await sequelize.sync({ force: true });
    const signupRes = await request(app).post('/api/auth/signup').send({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    token = signupRes.body.token;
  });

  const authHeader = () => ({ Authorization: `Bearer ${token}` });
  let noteId;

  it('rejects requests without auth', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).to.equal(401);
  });

  it('creates a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set(authHeader())
      .send({ title: 'Project Ideas', content: 'Some fresh ideas', category: 'Work' });
    expect(res.status).to.equal(201);
    expect(res.body.note.title).to.equal('Project Ideas');
    noteId = res.body.note.id;
  });
  it('returns 400 and does not create a note for a whitespace-only title', async()=>{
    const before = await Note.count();
    const res = await request(app)
      .post('/api/notes')
      .set(authHeader())
      .send({title: '  '});
    expect(res.status).to.equal(400);
    const after = await Note.count();
    expect(after).to.equal(before);
  });
  it('rejects a note without a title', async () => {
    const res = await request(app).post('/api/notes').set(authHeader()).send({ content: 'no title' });
    expect(res.status).to.equal(400);
  });

  it('lists notes for the authenticated user', async () => {
    const res = await request(app).get('/api/notes').set(authHeader());
    expect(res.status).to.equal(200);
    expect(res.body.notes).to.be.an('array').with.lengthOf(1);
  });

  it('fetches a single note by id', async () => {
    const res = await request(app).get(`/api/notes/${noteId}`).set(authHeader());
    expect(res.status).to.equal(200);
    expect(res.body.note.id).to.equal(noteId);
  });

  it('updates a note', async () => {
    const res = await request(app)
      .patch(`/api/notes/${noteId}`)
      .set(authHeader())
      .send({ title: 'Updated Title', isFavourite: true });
    expect(res.status).to.equal(200);
    expect(res.body.note.title).to.equal('Updated Title');
    expect(res.body.note.isFavourite).to.be.true;
  });

  it('returns 404 for a note belonging to another user or missing', async () => {
    const res = await request(app).get('/api/notes/9999').set(authHeader());
    expect(res.status).to.equal(404);
  });

  it('soft-deletes a note into Trash on first delete', async () => {
    const res = await request(app).delete(`/api/notes/${noteId}`).set(authHeader());
    expect(res.status).to.equal(200);
    expect(res.body.note.isDeleted).to.be.true;
  });

  it('permanently deletes a note on second delete (from Trash)', async () => {
    const res = await request(app).delete(`/api/notes/${noteId}`).set(authHeader());
    expect(res.status).to.equal(200);
    expect(res.body.message).to.match(/permanently deleted/i);
  });
});
