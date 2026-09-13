const express = require('express');
const router = express.Router();
const {
  createSession,
  scanItem,
  getSessionById,
  reconcileSession,
  listSessions
} = require('../controllers/inventoryController');
const { protect, staffOrAdmin, admin } = require('../middleware/authMiddleware');

router.route('/sessions')
  .get(protect, staffOrAdmin, listSessions)
  .post(protect, staffOrAdmin, createSession);

router.route('/sessions/:id')
  .get(protect, staffOrAdmin, getSessionById);

router.route('/sessions/:id/scan')
  .post(protect, staffOrAdmin, scanItem);

router.route('/sessions/:id/reconcile')
  .post(protect, admin, reconcileSession);

module.exports = router;
