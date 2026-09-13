const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Books API Tests', () => {
  describe('GET /api/books', () => {
    it('should return 200 and a list of books with pagination metadata', async () => {
      const res = await request(app).get('/api/books');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.books)).toBe(true);
      expect(typeof res.body.data.page).toBe('number');
      expect(typeof res.body.data.pages).toBe('number');
      expect(typeof res.body.data.total).toBe('number');
    });

    it('should filter books by search query', async () => {
      const res = await request(app).get('/api/books?search=Clean');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.books)).toBe(true);
    });

    it('should support pagination params (page & limit)', async () => {
      const res = await request(app).get('/api/books?page=1&limit=2');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.books.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return 404 for a valid ObjectId that does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/books/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 or 500 for a malformed ObjectId', async () => {
      const res = await request(app).get('/api/books/not-a-valid-id');
      expect([400, 404, 500]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Admin Endpoints (Security)', () => {
    it('should reject POST /api/books without authorization token', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({
          title: 'Unauthorized Book',
          author: 'Hacker',
          category: 'Security',
          quantity: 1
        });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject PUT /api/books/:id without authorization token', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/books/${fakeId}`)
        .send({ title: 'Updated Title' });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject DELETE /api/books/:id without authorization token', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/books/${fakeId}`);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
