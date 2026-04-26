const request = require('supertest');
const app = require('../server');

describe('API Health Check', () => {
  it('should return 200 OK and success message from the root API endpoint', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('API is running');
  });
});
