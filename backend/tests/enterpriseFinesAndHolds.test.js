const request = require('supertest');
const app = require('../server');
const prisma = require('../config/prisma');

describe('Enterprise Fines & Reservation Queues Suite', () => {
  let staffToken;
  let studentToken;
  let adminToken;
  let testBookId;
  let testCopyBarcode;
  let studentMemberId;

  beforeAll(async () => {
    // 1. Log in admin, staff, student
    const [adminRes, staffRes, studentRes] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: 'admin@library.com', password: 'Admin@123' }),
      request(app).post('/api/auth/login').send({ email: 'staff@library.com', password: 'Staff@123' }),
      request(app).post('/api/auth/login').send({ email: 'student@library.com', password: 'Student@123' })
    ]);

    adminToken = adminRes.body.data.token;
    staffToken = staffRes.body.data.token;
    studentToken = studentRes.body.data.token;
    studentMemberId = studentRes.body.data.member.id;

    // Pick book and available copy
    const copy = await prisma.bookCopy.findFirst({
      where: { status: 'AVAILABLE' },
      include: { book: true }
    });
    testCopyBarcode = copy.barcode;
    testBookId = copy.bookId;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Dynamic Fine Assessment on Late Return', () => {
    it('should assess overdue fine when book is returned past its due date', async () => {
      // Create an overdue loan artificially (due 5 days ago)
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 5);

      const copy = await prisma.bookCopy.findFirst({
        where: {
          status: 'AVAILABLE',
          loans: { none: { status: 'ACTIVE' } }
        }
      });
      expect(copy).toBeDefined();

      const loan = await prisma.loan.create({
        data: {
          copyId: copy.id,
          memberId: studentMemberId,
          issuedByUserId: (await prisma.user.findFirst()).id,
          dueAt: pastDueDate,
          status: 'ACTIVE'
        }
      });
      await prisma.bookCopy.update({ where: { id: copy.id }, data: { status: 'ON_LOAN' } });

      // Return the book copy
      const returnRes = await request(app)
        .post('/api/circulation/checkin')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ barcode: copy.barcode });

      expect(returnRes.status).toBe(200);
      expect(returnRes.body.success).toBe(true);
      expect(returnRes.body.fineAssessed).toBeGreaterThan(0);

      // Verify fine created in DB
      const fine = await prisma.fine.findFirst({
        where: { loanId: loan.id },
        orderBy: { createdAt: 'desc' }
      });
      expect(fine).toBeDefined();
      expect(fine.status).toBe('UNPAID');

      // Test Fine Payment
      const payRes = await request(app)
        .post(`/api/fines/${fine.id}/pay`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          amount: (fine.balanceCents / 100).toFixed(2),
          paymentMethod: 'CASH'
        });

      expect(payRes.status).toBe(200);
      expect(payRes.body.data.status).toBe('paid');
      expect(payRes.body.data.balance).toBe(0);
    });
  });

  describe('2. Fine Waiver with Mandatory Audit Justification', () => {
    it('should reject fine waiver without justification reason', async () => {
      const fine = await prisma.fine.create({
        data: {
          memberId: studentMemberId,
          amountCents: 500,
          balanceCents: 500,
          status: 'UNPAID',
          reason: 'MANUAL_FEE'
        }
      });

      const res = await request(app)
        .post(`/api/fines/${fine.id}/waive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should allow admin to waive fine with justification and log audit trail', async () => {
      const fine = await prisma.fine.create({
        data: {
          memberId: studentMemberId,
          amountCents: 500,
          balanceCents: 500,
          status: 'UNPAID',
          reason: 'MANUAL_FEE'
        }
      });

      const res = await request(app)
        .post(`/api/fines/${fine.id}/waive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Medical absence with doctor certificate' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('waived');
      expect(res.body.data.balance).toBe(0);

      // Check audit log
      const audit = await prisma.auditLog.findFirst({
        where: { entityType: 'FINE', action: 'FINE_WAIVED' },
        orderBy: { createdAt: 'desc' }
      });
      expect(audit).toBeDefined();
      expect(audit.afterState.reason).toContain('Medical absence');
    });
  });

  describe('3. FIFO Reservation Queue Placement & Cancellation', () => {
    it('should place a hold and assign queue position #1', async () => {
      // First ensure all copies of testBookId are ON_LOAN so hold can be placed
      await prisma.bookCopy.updateMany({
        where: { bookId: testBookId },
        data: { status: 'ON_LOAN' }
      });

      const res = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ bookId: testBookId });

      expect(res.status).toBe(201);
      expect(res.body.data.queuePosition).toBe(1);
      expect(res.body.data.status).toBe('pending');

      const reservationId = res.body.data.id;

      // Cancel reservation and verify cancellation
      const cancelRes = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(cancelRes.status).toBe(200);

      // Reset copies to AVAILABLE
      await prisma.bookCopy.updateMany({
        where: { bookId: testBookId },
        data: { status: 'AVAILABLE' }
      });
    });
  });
});
