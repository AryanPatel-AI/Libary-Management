const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Protect middleware: validates JWT and loads user with roles and permissions from PostgreSQL.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Fetch user from PostgreSQL along with roles & permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User belonging to this token no longer exists'
        }
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please contact library administration.`,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: `Account is ${user.status.toLowerCase()}. Please contact library administration.`
        }
      });
    }

    // Extract flat arrays of roles and permission codes
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissionSet = new Set();
    user.userRoles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissionSet.add(rp.permission.code);
      });
    });

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      roles,
      permissions: Array.from(permissionSet),
      member: user.memberProfile || null
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Not authorized, invalid token',
      error: {
        code: 'TOKEN_INVALID',
        message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid authentication token'
      }
    });
  }
};

/**
 * Middleware to enforce one or more required roles.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, authentication required',
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Action requires one of the following roles: [${allowedRoles.join(', ')}]`,
        error: {
          code: 'FORBIDDEN',
          message: `Action requires one of the following roles: [${allowedRoles.join(', ')}]`
        }
      });
    }

    next();
  };
};

/**
 * Middleware to enforce one or more required permissions.
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    // Super Admin bypasses individual permission checks
    if (req.user.roles.includes('SUPER_ADMIN')) {
      return next();
    }

    const hasAll = requiredPermissions.every((p) => req.user.permissions.includes(p));
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`
        }
      });
    }

    next();
  };
};

module.exports = {
  protect,
  requireRole,
  requirePermission
};
