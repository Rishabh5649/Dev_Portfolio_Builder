const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  getMe,
  updateProfile,
  oauthCallback,
  connectGitHub,
  connectGitHubCallback,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ─── Standard Auth ────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed`,
    session: true,
  }),
  oauthCallback
);

// ─── GitHub OAuth (Login / Register) ─────────────────────────────────────────
router.get(
  '/github',
  passport.authenticate('github-login', {
    scope: ['user:email', 'read:user', 'public_repo'],
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github-login', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=github_failed`,
    session: true,
  }),
  oauthCallback
);

// ─── GitHub Connect (link GitHub to an already-logged-in account) ─────────────
// Token is passed as query param since this is a browser-level redirect
router.get('/github/connect', connectGitHub);

router.get(
  '/github/connect/callback',
  passport.authenticate('github-connect', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portfolio-builder?github=failed`,
    session: false,
  }),
  connectGitHubCallback
);

module.exports = router;
