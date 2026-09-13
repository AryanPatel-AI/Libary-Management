const request = require('supertest');
const app = require('../server');
const prisma = require('../config/prisma');

describe('Enterprise LMS Circulation & RBAC Suite', () => {
  let adminToken;
  let staffToken;
  let studentToken;
  let testCopyBarcode;
  let studentMemberNumber;

  beforeAll(async () => {
    // 1. Authenticate Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@library.com', password: 'Admin@123' });
    
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    adminToken = adminRes.body.data.token;
    expect(adminRes.body.data.roles).toContain('SUPER_ADMIN');

    // 2. Authenticate Staff
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@library.com', password: 'Staff@123' });
    expect(staffRes.status).toBe(200);
    staffToken = staffRes.body.data.token;

    // 3. Authenticate Student
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@library.com', password: 'Student@123' });
    expect(studentRes.status).toBe(200);
    studentToken = studentRes.body.data.token;
    studentMemberNumber = studentRes.body.data.member.memberNumber;

    // Pick an available copy for test
    const copy = await prisma.bookCopy.findFirst({
      where: { status: 'AVAILABLE' }
    });
    testCopyBarcode = copy.barcode;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. RBAC & Access Control', () => {
    it('should reject unauthenticated request to circulation endpoints', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.status).toBe(401);
    });

    it('should forbid student from accessing staff circulation table', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow staff to access circulation records', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('2. Catalog & Physical Inventory Breakdown', () => {
    it('should fetch books with dynamic copy counts and branch breakdown', async () => {
      const res = await request(app).get('/api/books');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstBook = res.body.data[0];
      expect(firstBook).toHaveProperty('totalCopies');
      expect(firstBook).toHaveProperty('availableCopies');
      expect(firstBook).toHaveProperty('branchAvailability');
    });

    it('should lookup physical copy by barcode with shelf location', async () => {
      const res = await request(app)
        .get(`/api/copies/barcode/${testCopyBarcode}`)
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.barcode).toBe(testCopyBarcode);
      expect(res.body.data.branch).toBeDefined();
    });
  });

  describe('3. Circulation Lifecycle (Issue & Return)', () => {
    let activeLoanId;

    it('should issue a book copy to a student at the circulation desk', async () => {
      const res = await request(app)
        .post('/api/circulation/checkout')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          barcode: testCopyBarcode,
          memberNumber: studentMemberNumber
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('issued');
      activeLoanId = res.body.data.id;

      // Verify physical copy is now ON_LOAN
      const copy = await prisma.bookCopy.findUnique({ where: { barcode: testCopyBarcode } });
      expect(copy.status).toBe('ON_LOAN');
    });

    it('should fail checkout if the copy is already on loan', async () => {
      const res = await request(app)
        .post('/api/circulation/checkout')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          barcode: testCopyBarcode,
          memberNumber: studentMemberNumber
        });

      expect([400, 409, 500]).toContain(res.status);
    });

    it('should return the book copy and transition status back to AVAILABLE', async () => {
      const res = await request(app)
        .post('/api/circulation/checkin')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          barcode: testCopyBarcode
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('returned');

      const copy = await prisma.bookCopy.findUnique({ where: { barcode: testCopyBarcode } });
      expect(copy.status).toBe('AVAILABLE');
    });
  });

  describe('4. Concurrency Protection (Prevent Double Checkout Race Condition)', () => {
    it('should handle simultaneous checkout requests and grant loan to only one caller', async () => {
      // Find an available copy
      const availableCopy = await prisma.bookCopy.findFirst({
        where: { status: 'AVAILABLE' }
      });
      expect(availableCopy).toBeDefined();

      // Launch 2 simultaneous checkout requests for the exact same copy
      const [attempt1, attempt2] = await Promise.all([
        request(app)
          .post('/api/circulation/checkout')
          .set('Authorization', `Bearer ${staffToken}`)
          .send({ barcode: availableCopy.barcode, memberNumber: studentMemberNumber }),
        request(app)
          .post('/api/circulation/checkout')
          .set('Authorization', `Bearer ${staffToken}`)
          .send({ barcode: availableCopy.barcode, memberNumber: studentMemberNumber })
      ]);

      const successCount = [attempt1, attempt2].filter(r => r.status === 201).length;
      const failCount = [attempt1, attempt2].filter(r => r.status !== 201).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(1);

      // Clean up: return the copy
      await request(app)
        .post('/api/circulation/checkin')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ barcode: availableCopy.barcode });
    });
  });

  describe('5. Audit Logs Ledger', () => {
    it('should record immutable audit logs for circulation and copy actions', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.logs)).toBe(true);
      expect(res.body.data.logs.length).toBeGreaterThan(0);

      const actions = res.body.data.logs.map(l => l.action);
      expect(actions).toContain('BOOK_ISSUED');
      expect(actions).toContain('BOOK_RETURNED');
    });
  });
});
