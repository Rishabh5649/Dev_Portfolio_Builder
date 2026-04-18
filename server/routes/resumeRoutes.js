const express = require('express');
const router = express.Router();
const {
  createResume,
  getUserResume,
  updateResume,
  deleteResume,
} = require('../controllers/resumeController');
const { exportPDF, exportDOCX } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createResume);
router.get('/user', protect, getUserResume);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);

// Exports
router.post('/export/pdf', protect, exportPDF);
router.post('/export/docx', protect, exportDOCX);

module.exports = router;
