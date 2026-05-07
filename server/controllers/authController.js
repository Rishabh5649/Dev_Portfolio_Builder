const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_portfolio_jwt_secret_change_me', {
    expiresIn: '30d',
  });
};

// ─── Register ──────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      githubUsername: user.githubUsername,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'This account uses social login. Please sign in with Google or GitHub.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      githubUsername: user.githubUsername,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      githubUsername: user.githubUsername,
      googleId: !!user.googleId,  // send bool only
      githubId: !!user.githubId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.file) {
      user.avatar = process.env.USE_CLOUDINARY === 'true'
        ? req.file.path
        : `/uploads/${req.file.filename}`;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      githubUsername: updatedUser.githubUsername,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── OAuth Callback ───────────────────────────────────────────────────────────
// Called after successful Google/GitHub authentication
// Passport has already populated req.user at this point
exports.oauthCallback = (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to frontend with token in query param — frontend will store it
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar || '')}&githubUsername=${encodeURIComponent(user.githubUsername || '')}`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
};

// ─── Connect GitHub (link existing account) ────────────────────────────────────
// @route   GET /api/auth/github/connect?token=<jwt>
exports.connectGitHub = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const token = req.query.token;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!token) {
    return res.redirect(`${frontendUrl}/portfolio-builder?github=failed&reason=no_token`);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_portfolio_jwt_secret_change_me');
    // Store userId in session before GitHub redirect
    req.session.linkUserId = decoded.id;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${frontendUrl}/portfolio-builder?github=failed&reason=session_error`);
      }
      // Now trigger GitHub OAuth
      const passport = require('passport');
      passport.authenticate('github-connect', {
        scope: ['user:email', 'read:user', 'public_repo'],
      })(req, res, next);
    });
  } catch (err) {
    console.error('Token verification error:', err);
    return res.redirect(`${frontendUrl}/portfolio-builder?github=failed&reason=invalid_token`);
  }
};

// ─── Connect GitHub Callback ──────────────────────────────────────────────────
// @route   GET /api/auth/github/connect/callback
exports.connectGitHubCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const linkUserId = req.session.linkUserId;
    if (!linkUserId) {
      console.error('No linkUserId in session');
      return res.redirect(`${frontendUrl}/portfolio-builder?github=failed&reason=no_session`);
    }

    // req.user contains the raw GitHub profile from passport github-connect strategy
    const githubProfile = req.user;

    // Find the original user and link
    const user = await User.findById(linkUserId);
    if (!user) {
      return res.redirect(`${frontendUrl}/portfolio-builder?github=failed&reason=user_not_found`);
    }

    user.githubId = githubProfile.githubId;
    user.githubUsername = githubProfile.githubUsername;
    if (!user.avatar && githubProfile.avatar) user.avatar = githubProfile.avatar;
    await user.save();

    delete req.session.linkUserId;

    const token = generateToken(user._id);
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}` +
      `&name=${encodeURIComponent(user.name)}` +
      `&avatar=${encodeURIComponent(user.avatar || '')}` +
      `&githubUsername=${encodeURIComponent(user.githubUsername || '')}` +
      `&source=github_connect`
    );
  } catch (err) {
    console.error('GitHub connect callback error:', err);
    res.redirect(`${frontendUrl}/portfolio-builder?github=failed&reason=server_error`);
  }
};
