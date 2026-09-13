const { protect, requireRole, requirePermission } = require('./rbacMiddleware');

// Backwards-compatible legacy helpers
const admin = requireRole('SUPER_ADMIN');
const librarian = requireRole('SUPER_ADMIN', 'LIBRARIAN');
const adminOrLibrarian = requireRole('SUPER_ADMIN', 'LIBRARIAN');
const staffOrAdmin = requireRole('SUPER_ADMIN', 'LIBRARIAN', 'CIRCULATION_STAFF');

module.exports = {
  protect,
  admin,
  librarian,
  adminOrLibrarian,
  staffOrAdmin,
  requireRole,
  requirePermission
};