const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { mongoIdValidation } = require('../middleware/validateRequest');

// All routes are admin-only
router.use(protect, admin);

router.get('/', getUsers);
router.get('/:id', mongoIdValidation, getUserById);
router.put('/:id', mongoIdValidation, updateUser);
router.delete('/:id', mongoIdValidation, deleteUser);

module.exports = router;
