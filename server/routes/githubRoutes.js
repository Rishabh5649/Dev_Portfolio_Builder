const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRepos, getReadme, getLanguages, getPackage } = require('../controllers/githubController');

// All GitHub routes require authentication (so we know which GitHub username to use)
router.get('/repos', protect, getRepos);
router.get('/repos/:owner/:repo/readme', protect, getReadme);
router.get('/repos/:owner/:repo/languages', protect, getLanguages);
router.get('/repos/:owner/:repo/package', protect, getPackage);

module.exports = router;
