const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser
} = require('../controllers/userController');
const { protect, admin, staffOrAdmin } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', staffOrAdmin, getUsers);
router.get('/:id', staffOrAdmin, getUserById);
router.put('/:id/role', admin, updateUserRole);
router.put('/:id/status', admin, updateUserStatus);
router.delete('/:id', admin, deleteUser);

module.exports = router;
