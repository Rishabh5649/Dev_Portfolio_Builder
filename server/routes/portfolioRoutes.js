const express = require('express');
const router = express.Router();
const {
  createPortfolio,
  getUserPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPublicPortfolio,
  publishPortfolio,
  uploadImage,
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/create', protect, createPortfolio);
router.get('/user', protect, getUserPortfolio);
router.put('/:id', protect, updatePortfolio);
router.delete('/:id', protect, deletePortfolio);
router.put('/:id/publish', protect, publishPortfolio);
router.post('/upload-image', protect, upload.single('image'), uploadImage);

// Public route (no protect middleware)
router.get('/public/:slug', getPublicPortfolio);

module.exports = router;
