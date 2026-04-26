const express = require('express');
const router = express.Router();
const { 
  addToWatchlist, 
  removeFromWatchlist, 
  getWatchlist 
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getWatchlist);

router.route('/:id')
  .post(addToWatchlist)
  .delete(removeFromWatchlist);

module.exports = router;
