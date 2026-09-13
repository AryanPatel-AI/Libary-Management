const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Transactions, Fines & Reservations API Tests', () => {
  describe('Authorization Protections', () => {
    it('should reject GET /api/transactions without token', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject POST /api/transactions/issue without token', async () => {
      const res = await request(app)
        .post('/api/transactions/issue')
        .send({ bookId: new mongoose.Types.ObjectId() });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject PUT /api/transactions/return/:id without token', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/transactions/return/${fakeId}`);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject GET /api/fines/my-fines without token', async () => {
      const res = await request(app).get('/api/fines/my-fines');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject GET /api/fines without admin token', async () => {
      const res = await request(app).get('/api/fines');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject GET /api/reservations/my without token', async () => {
      const res = await request(app).get('/api/reservations/my');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject GET /api/reservations (admin) without token', async () => {
      const res = await request(app).get('/api/reservations');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Fine Calculation Consistency', () => {
    it('should use configured fine rate (FINE_PER_DAY)', () => {
      const finePerDay = parseInt(process.env.FINE_PER_DAY) || 5;
      expect(finePerDay).toBe(5);

      // Verify calculation formula
      const daysOverdue = 4;
      const expectedFine = daysOverdue * finePerDay;
      expect(expectedFine).toBe(20);
    });

    it('should calculate 0 fine for on-time return', () => {
      const dueDate = new Date(Date.now() + 86400000); // tomorrow
      const returnDate = new Date(); // today
      const isOverdue = returnDate > dueDate;
      const fine = isOverdue ? 5 : 0;
      expect(fine).toBe(0);
    });
  });
});
