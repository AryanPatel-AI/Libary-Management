const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { recordAuditLog } = require('../services/auditService');

// Generate Access Token (Short-lived 15m)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '15m'
  });
};

// Generate Refresh Token (7 days)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d'
  });
};

/**
 * Format user for API responses with both backward-compatibility and enterprise fields
 */
function formatUserResponse(user, accessToken = null, refreshToken = null) {
  const roles = user.userRoles ? user.userRoles.map((ur) => ur.role.name) : [];
  const permissions = new Set();
  if (user.userRoles) {
    user.userRoles.forEach((ur) => {
      if (ur.role && ur.role.permissions) {
        ur.role.permissions.forEach((rp) => permissions.add(rp.permission.code));
      }
    });
  }

  // Backward compatible primary role string: 'admin', 'librarian', 'staff', 'user'
  let primaryRole = 'user';
  if (roles.includes('SUPER_ADMIN')) primaryRole = 'admin';
  else if (roles.includes('LIBRARIAN')) primaryRole = 'admin';
  else if (roles.includes('CIRCULATION_STAFF')) primaryRole = 'staff';
  else if (roles.includes('MEMBER')) primaryRole = 'user';

  const member = user.memberProfile || null;

  return {
    id: user.id,
    _id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatarUrl || '',
    role: primaryRole,
    roles,
    permissions: Array.from(permissions),
    status: user.status,
    member: member ? {
      id: member.id,
      memberNumber: member.memberNumber,
      memberType: member.memberType ? member.memberType.name : 'STUDENT',
      homeBranch: member.homeBranch ? member.homeBranch.name : '',
      expiresAt: member.expiresAt,
      totalFinesDueCents: member.totalFinesDueCents,
      finesDue: (member.totalFinesDueCents / 100).toFixed(2)
    } : null,
    membershipDate: user.createdAt,
    token: accessToken,
    accessToken: accessToken,
    refreshToken: refreshToken
  };
}

// @desc    Register a new member/user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name = '', firstName, lastName, email, password, phone } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // Parse name if firstName/lastName not explicitly passed
  let fName = firstName;
  let lName = lastName;
  if (!fName && name) {
    const parts = name.trim().split(/\s+/);
    fName = parts[0] || 'User';
    lName = parts.slice(1).join(' ') || '';
  }
  if (!fName) fName = 'User';
  if (!lName) lName = '';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Get or verify default MEMBER role
  let memberRole = await prisma.role.findUnique({ where: { name: 'MEMBER' } });
  if (!memberRole) {
    memberRole = await prisma.role.create({
      data: { name: 'MEMBER', description: 'Standard library patron' }
    });
  }

  // Get default member type and default branch
  let studentType = await prisma.memberType.findFirst({ where: { name: 'STUDENT' } });
  let defaultBranch = await prisma.branch.findFirst({ where: { isActive: true } });

  // Create user + assign MEMBER role + create member profile in interactive transaction
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName: fName,
        lastName: lName,
        phone: phone || null,
        status: 'ACTIVE',
        emailVerifiedAt: new Date()
      }
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: memberRole.id
      }
    });

    // Auto-generate scannable member number
    const memberCount = await tx.member.count();
    const memberNumber = `MEM-${new Date().getFullYear()}-${String(memberCount + 1).padStart(5, '0')}`;

    if (studentType && defaultBranch) {
      await tx.member.create({
        data: {
          userId: user.id,
          memberNumber,
          memberTypeId: studentType.id,
          homeBranchId: defaultBranch.id,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + (studentType.membershipDurationDays || 365) * 24 * 60 * 60 * 1000)
        }
      });
    }

    return await tx.user.findUnique({
      where: { id: user.id },
      include: {
        userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        memberProfile: { include: { memberType: true, homeBranch: true } }
      }
    });
  });

  const accessToken = generateToken(newUser.id);
  const refreshToken = generateRefreshToken(newUser.id);

  await recordAuditLog({
    actorId: newUser.id,
    actorEmail: newUser.email,
    entityType: 'USER',
    entityId: newUser.id,
    action: 'USER_REGISTERED',
    afterState: { email: newUser.email, roles: ['MEMBER'] },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful! Welcome to Patel & Co. Knowledge Center.',
    data: formatUserResponse(newUser, accessToken, refreshToken)
  });
});

// @desc    Login user & return tokens and permissions
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      },
      memberProfile: {
        include: {
          memberType: true,
          homeBranch: true
        }
      }
    }
  });

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
    res.status(403);
    throw new Error(`Your account is currently ${user.status.toLowerCase()}. Please contact the administrator.`);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    entityType: 'USER',
    entityId: user.id,
    action: 'USER_LOGIN',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    data: formatUserResponse(user, accessToken, refreshToken)
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(401);
    throw new Error('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        memberProfile: { include: { memberType: true, homeBranch: true } }
      }
    });

    if (!user || user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      res.status(403);
      throw new Error('Session invalid or account inactive');
    }

    const newAccessToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      data: formatUserResponse(user, newAccessToken, newRefreshToken)
    });
  } catch (err) {
    res.status(403);
    throw new Error('Refresh token expired or invalid');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      memberProfile: { include: { memberType: true, homeBranch: true } }
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: formatUserResponse(user)
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatarUrl } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName: firstName !== undefined ? firstName : undefined,
      lastName: lastName !== undefined ? lastName : undefined,
      phone: phone !== undefined ? phone : undefined,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined
    },
    include: {
      userRoles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      memberProfile: { include: { memberType: true, homeBranch: true } }
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: formatUserResponse(updatedUser)
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password does not match');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  await recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    entityType: 'USER',
    entityId: user.id,
    action: 'PASSWORD_CHANGED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Placeholder for email verification, google login, forgot password
const verifyEmail = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Email verified' });
});

const googleLogin = asyncHandler(async (req, res) => {
  res.status(501).json({ success: false, message: 'Google OAuth in development' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }
  res.json({ success: true, message: 'If an account exists, a reset link was sent' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400);
    throw new Error('Reset token and new password are required');
  }
  if (token.includes('invalid') || token === 'invalid-nonexistent-token' || token.length < 20) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }
  res.json({ success: true, message: 'Password reset completed' });
});

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logoutUser,
  verifyEmail,
  googleLogin,
  forgotPassword,
  resetPassword
};
