const request = require('supertest');
const app = require('../server');
const prisma = require('../config/prisma');

describe('Enterprise Policies, Audits & CSV Exports Suite', () => {
  let adminToken;
  let staffToken;
  let branchId;
  let memberTypeId;

  beforeAll(async () => {
    // Authenticate Super Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@library.com', password: 'Admin@123' });
    adminToken = adminLogin.body.data.accessToken;

    // Authenticate Circulation Staff
    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@library.com', password: 'Staff@123' });
    staffToken = staffLogin.body.data.accessToken;

    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    branchId = branch.id;

    const mType = await prisma.memberType.findFirst();
    memberTypeId = mType.id;
  });

  describe('1. Circulation Policies & Member Type Rules', () => {
    it('should fetch all circulation policies and member types', async () => {
      const res = await request(app)
        .get('/api/policies')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.policies)).toBe(true);
      expect(Array.isArray(res.body.data.memberTypes)).toBe(true);
      expect(Array.isArray(res.body.data.branches)).toBe(true);
    });

    it('should allow admin to update member type default loan period and fine cap', async () => {
      const res = await request(app)
        .put(`/api/policies/member-types/${memberTypeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          maxBorrowLimit: 7,
          defaultLoanPeriodDays: 21,
          finePerDayCents: 150
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maxBorrowLimit).toBe(7);
      expect(res.body.data.defaultLoanPeriodDays).toBe(21);
      expect(res.body.data.finePerDayCents).toBe(150);
    });

    it('should allow admin to upsert a branch circulation policy override', async () => {
      const res = await request(app)
        .post('/api/policies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          branchId,
          memberTypeId,
          loanPeriodDays: 30,
          maxLoans: 8,
          finePerDayCents: 200,
          maxFineCents: 6000,
          gracePeriodDays: 2,
          maxRenewals: 3
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.loanPeriodDays).toBe(30);
      expect(res.body.data.finePerDayCents).toBe(200);
    });
  });

  describe('2. Physical Stock Verification & Inventory Audit Workflow', () => {
    let auditSessionId;
    let sampleBarcode;

    it('should create an active inventory audit session', async () => {
      const res = await request(app)
        .post('/api/inventory/sessions')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          branchId,
          name: 'Automated CI Test Stock Audit',
          notes: 'Test audit session'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_PROGRESS');
      auditSessionId = res.body.data.id;
    });

    it('should scan physical copies and classify verification matches', async () => {
      const copy = await prisma.bookCopy.findFirst({ where: { branchId } });
      sampleBarcode = copy.barcode;

      const res = await request(app)
        .post(`/api/inventory/sessions/${auditSessionId}/scan`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          barcode: sampleBarcode,
          currentShelfId: copy.shelfId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('MATCH');
    });

    it('should detect duplicate scans in the same session', async () => {
      const res = await request(app)
        .post(`/api/inventory/sessions/${auditSessionId}/scan`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          barcode: sampleBarcode
        });

      expect(res.status).toBe(200);
      expect(res.body.alreadyScanned).toBe(true);
    });

    it('should finalize and reconcile the inventory session', async () => {
      const res = await request(app)
        .post(`/api/inventory/sessions/${auditSessionId}/reconcile`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('missingCount');
    });
  });

  describe('3. CSV Data Export Center', () => {
    it('should export overdue report in RFC-4180 CSV format', async () => {
      const res = await request(app)
        .get('/api/analytics/export/overdue')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Loan ID');
      expect(res.text).toContain('Book Title');
      expect(res.text).toContain('Barcode');
    });

    it('should export circulation history CSV', async () => {
      const res = await request(app)
        .get('/api/analytics/export/circulation')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Loan ID');
      expect(res.text).toContain('Member Name');
    });

    it('should export physical assets inventory CSV', async () => {
      const res = await request(app)
        .get('/api/analytics/export/inventory')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Barcode');
      expect(res.text).toContain('Accession Number');
    });

    it('should export fines ledger CSV', async () => {
      const res = await request(app)
        .get('/api/analytics/export/fines')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Fine ID');
      expect(res.text).toContain('Balance Due');
    });
  });
});
