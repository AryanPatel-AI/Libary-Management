const express = require('express');
const router = express.Router();
const {
  getPolicies,
  upsertPolicy,
  updateMemberType
} = require('../controllers/policyController');
const { protect, librarian } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getPolicies)
  .post(librarian, upsertPolicy);

router.route('/member-types/:id')
  .put(librarian, updateMemberType);

module.exports = router;
