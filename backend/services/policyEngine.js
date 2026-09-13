const prisma = require('../config/prisma');

/**
 * Evaluates the circulation policy for a given member and branch.
 */
async function getEffectivePolicy(memberTypeId, branchId = null) {
  // 1. Try branch-specific policy
  if (branchId) {
    const branchPolicy = await prisma.circulationPolicy.findFirst({
      where: { branchId, memberTypeId, isActive: true }
    });
    if (branchPolicy) return branchPolicy;
  }

  // 2. Try global policy (branchId: null)
  const globalPolicy = await prisma.circulationPolicy.findFirst({
    where: { branchId: null, memberTypeId, isActive: true }
  });
  if (globalPolicy) return globalPolicy;

  // 3. Fallback to MemberType defaults
  const memberType = await prisma.memberType.findUnique({
    where: { id: memberTypeId }
  });

  if (memberType) {
    return {
      loanPeriodDays: memberType.defaultLoanPeriodDays,
      maxLoans: memberType.maxBorrowLimit,
      finePerDayCents: memberType.finePerDayCents,
      maxFineCents: memberType.maxFineCapCents,
      maxRenewals: memberType.maxRenewals,
      gracePeriodDays: memberType.gracePeriodDays
    };
  }

  // Absolute safety defaults
  return {
    loanPeriodDays: 14,
    maxLoans: 5,
    finePerDayCents: 100,
    maxFineCents: 5000,
    maxRenewals: 2,
    gracePeriodDays: 1
  };
}

/**
 * Dynamic overdue fine calculation.
 * Returns { overdueDays, billableDays, fineCents, isOverdue }
 */
function calculateOverdueFine(dueAt, returnDate = new Date(), policy) {
  const dueTime = new Date(dueAt).getTime();
  const returnTime = new Date(returnDate).getTime();

  if (returnTime <= dueTime) {
    return { overdueDays: 0, billableDays: 0, fineCents: 0, isOverdue: false };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const overdueDays = Math.ceil((returnTime - dueTime) / msPerDay);

  const gracePeriod = policy.gracePeriodDays || 0;
  if (overdueDays <= gracePeriod) {
    return { overdueDays, billableDays: 0, fineCents: 0, isOverdue: true };
  }

  const billableDays = overdueDays;
  const rawFine = billableDays * (policy.finePerDayCents || 100);
  const maxFine = policy.maxFineCents || 5000;
  const fineCents = Math.min(rawFine, maxFine);

  return {
    overdueDays,
    billableDays,
    fineCents,
    isOverdue: true
  };
}

module.exports = {
  getEffectivePolicy,
  calculateOverdueFine
};
