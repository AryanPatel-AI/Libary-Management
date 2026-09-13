const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const { recordAuditLog } = require('../services/auditService');

// @desc    Get all circulation policies and member types
// @route   GET /api/policies
// @access  Private (Staff/Admin)
const getPolicies = asyncHandler(async (req, res) => {
  const [policies, memberTypes, branches] = await Promise.all([
    prisma.circulationPolicy.findMany({
      include: {
        memberType: true,
        branch: { select: { id: true, name: true, code: true } }
      },
      orderBy: [{ branchId: 'asc' }, { memberTypeId: 'asc' }]
    }),
    prisma.memberType.findMany({
      include: {
        _count: { select: { members: true } }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      policies,
      memberTypes,
      branches
    }
  });
});

// @desc    Create or update a circulation policy
// @route   POST /api/policies
// @access  Private (Admin/Librarian)
const upsertPolicy = asyncHandler(async (req, res) => {
  const {
    branchId,
    memberTypeId,
    loanPeriodDays,
    maxLoans,
    finePerDayCents,
    maxFineCents,
    gracePeriodDays,
    maxRenewals,
    isActive = true
  } = req.body;

  if (!memberTypeId) {
    res.status(400);
    throw new Error('Member Type ID is required');
  }

  const cleanBranchId = branchId || null;

  // Check if exists
  const existing = await prisma.circulationPolicy.findFirst({
    where: {
      branchId: cleanBranchId,
      memberTypeId
    }
  });

  let policy;
  if (existing) {
    policy = await prisma.circulationPolicy.update({
      where: { id: existing.id },
      data: {
        loanPeriodDays: parseInt(loanPeriodDays) || existing.loanPeriodDays,
        maxLoans: parseInt(maxLoans) || existing.maxLoans,
        finePerDayCents: parseInt(finePerDayCents) || existing.finePerDayCents,
        maxFineCents: parseInt(maxFineCents) || existing.maxFineCents,
        gracePeriodDays: parseInt(gracePeriodDays) !== undefined ? parseInt(gracePeriodDays) : existing.gracePeriodDays,
        maxRenewals: parseInt(maxRenewals) !== undefined ? parseInt(maxRenewals) : existing.maxRenewals,
        isActive: isActive !== undefined ? isActive : existing.isActive
      },
      include: { memberType: true, branch: true }
    });
  } else {
    policy = await prisma.circulationPolicy.create({
      data: {
        branchId: cleanBranchId,
        memberTypeId,
        loanPeriodDays: parseInt(loanPeriodDays) || 14,
        maxLoans: parseInt(maxLoans) || 5,
        finePerDayCents: parseInt(finePerDayCents) || 100,
        maxFineCents: parseInt(maxFineCents) || 5000,
        gracePeriodDays: parseInt(gracePeriodDays) || 0,
        maxRenewals: parseInt(maxRenewals) || 2,
        isActive
      },
      include: { memberType: true, branch: true }
    });
  }

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'CIRCULATION_POLICY',
    entityId: policy.id,
    action: existing ? 'POLICY_UPDATED' : 'POLICY_CREATED',
    beforeState: existing || null,
    afterState: policy,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(existing ? 200 : 201).json({
    success: true,
    message: existing ? 'Circulation policy updated' : 'Circulation policy created',
    data: policy
  });
});

// @desc    Update member type default parameters
// @route   PUT /api/policies/member-types/:id
// @access  Private (Admin/Librarian)
const updateMemberType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    maxBorrowLimit,
    defaultLoanPeriodDays,
    finePerDayCents,
    maxFineCapCents,
    maxRenewals,
    gracePeriodDays,
    membershipDurationDays
  } = req.body;

  const existing = await prisma.memberType.findUnique({ where: { id } });
  if (!existing) {
    res.status(404);
    throw new Error('Member type not found');
  }

  const updated = await prisma.memberType.update({
    where: { id },
    data: {
      maxBorrowLimit: maxBorrowLimit !== undefined ? parseInt(maxBorrowLimit) : undefined,
      defaultLoanPeriodDays: defaultLoanPeriodDays !== undefined ? parseInt(defaultLoanPeriodDays) : undefined,
      finePerDayCents: finePerDayCents !== undefined ? parseInt(finePerDayCents) : undefined,
      maxFineCapCents: maxFineCapCents !== undefined ? parseInt(maxFineCapCents) : undefined,
      maxRenewals: maxRenewals !== undefined ? parseInt(maxRenewals) : undefined,
      gracePeriodDays: gracePeriodDays !== undefined ? parseInt(gracePeriodDays) : undefined,
      membershipDurationDays: membershipDurationDays !== undefined ? parseInt(membershipDurationDays) : undefined
    }
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'MEMBER_TYPE',
    entityId: id,
    action: 'MEMBER_TYPE_UPDATED',
    beforeState: existing,
    afterState: updated,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `Default rules updated for ${updated.name}`,
    data: updated
  });
});

module.exports = {
  getPolicies,
  upsertPolicy,
  updateMemberType
};
