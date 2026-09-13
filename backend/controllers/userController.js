const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const { recordAuditLog } = require('../services/auditService');

function formatUser(user) {
  const roles = user.userRoles ? user.userRoles.map((ur) => ur.role.name) : [];
  let primaryRole = 'user';
  if (roles.includes('SUPER_ADMIN')) primaryRole = 'admin';
  else if (roles.includes('LIBRARIAN')) primaryRole = 'librarian';
  else if (roles.includes('CIRCULATION_STAFF')) primaryRole = 'staff';
  else if (roles.includes('MEMBER')) primaryRole = 'user';

  const member = user.memberProfile;

  return {
    _id: user.id,
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    role: primaryRole,
    roles,
    status: user.status,
    member: member ? {
      id: member.id,
      memberNumber: member.memberNumber,
      memberType: member.memberType ? member.memberType.name : 'STUDENT',
      homeBranch: member.homeBranch ? member.homeBranch.name : '',
      expiresAt: member.expiresAt,
      totalFinesDue: (member.totalFinesDueCents / 100).toFixed(2),
      totalFinesDueCents: member.totalFinesDueCents
    } : null,
    createdAt: user.createdAt
  };
}

// @desc    Get all users with search, pagination & role filter
// @route   GET /api/users
// @access  Private (Admin/Staff)
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const { search, role } = req.query;

  const where = {};
  if (search && search.trim()) {
    where.OR = [
      { firstName: { contains: search.trim(), mode: 'insensitive' } },
      { lastName: { contains: search.trim(), mode: 'insensitive' } },
      { email: { contains: search.trim(), mode: 'insensitive' } },
      { memberProfile: { memberNumber: { contains: search.trim(), mode: 'insensitive' } } }
    ];
  }

  if (role) {
    let targetRole = role.toUpperCase();
    if (role === 'admin') targetRole = 'SUPER_ADMIN';
    else if (role === 'user') targetRole = 'MEMBER';

    where.userRoles = {
      some: { role: { name: targetRole } }
    };
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        userRoles: { include: { role: true } },
        memberProfile: { include: { memberType: true, homeBranch: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  res.json({
    success: true,
    data: {
      users: users.map(formatUser),
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single user with active transactions and profile
// @route   GET /api/users/:id
// @access  Private (Admin/Staff)
const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      userRoles: { include: { role: true } },
      memberProfile: {
        include: {
          memberType: true,
          homeBranch: true,
          loans: {
            where: { status: 'ACTIVE' },
            include: { copy: { include: { book: true } } }
          },
          fines: {
            where: { status: { in: ['UNPAID', 'PARTIALLY_PAID'] } }
          }
        }
      }
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: formatUser(user)
  });
});

// @desc    Update user role & permissions
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role) {
    res.status(400);
    throw new Error('Role is required');
  }

  let targetRoleName = role.toUpperCase();
  if (role === 'admin') targetRoleName = 'SUPER_ADMIN';
  else if (role === 'user') targetRoleName = 'MEMBER';
  else if (role === 'librarian') targetRoleName = 'LIBRARIAN';
  else if (role === 'staff') targetRoleName = 'CIRCULATION_STAFF';

  const roleRecord = await prisma.role.findUnique({ where: { name: targetRoleName } });
  if (!roleRecord) {
    res.status(404);
    throw new Error(`Role ${targetRoleName} does not exist`);
  }

  await prisma.$transaction(async (tx) => {
    // Remove existing roles
    await tx.userRole.deleteMany({ where: { userId: req.params.id } });
    // Assign new role
    await tx.userRole.create({
      data: { userId: req.params.id, roleId: roleRecord.id }
    });
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'USER',
    entityId: req.params.id,
    action: 'USER_ROLE_UPDATED',
    afterState: { role: targetRoleName },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `User role updated to ${targetRoleName}`
  });
});

// @desc    Update user account status (e.g. SUSPENDED, ACTIVE)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: { status }
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'USER',
    entityId: req.params.id,
    action: 'USER_STATUS_UPDATED',
    afterState: { status },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `User account is now ${status}`
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  // Check if member has active loans
  const activeLoan = await prisma.loan.findFirst({
    where: { member: { userId: req.params.id }, status: 'ACTIVE' }
  });

  if (activeLoan) {
    res.status(400);
    throw new Error('Cannot delete user with active borrowed books');
  }

  await prisma.user.delete({ where: { id: req.params.id } });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser
};
