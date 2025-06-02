const request = require('supertest');
const app = require('../index');

describe('User API', () => {
  it('GET /users returns 200', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /users creates a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});