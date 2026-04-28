const express = require('express');
const router = express.Router();
const { getRecommendations, semanticSearch, chatAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recommendations', protect, getRecommendations);
router.get('/search', semanticSearch);
router.post('/chat', protect, chatAssistant);

module.exports = router;
