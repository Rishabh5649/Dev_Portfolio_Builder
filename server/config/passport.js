const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// ─── Serialize / Deserialize ──────────────────────────────────────────────────
passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ─── Google Strategy ──────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already has a Google account linked
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // 2. Check if an account with the same email already exists
        const email = profile.emails?.[0]?.value;
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            // Link Google to existing account
            user.googleId = profile.id;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // 3. Create a brand new user
        user = await User.create({
          name: profile.displayName || 'Google User',
          email: email || `google_${profile.id}@devportfolio.local`,
          avatar: profile.photos?.[0]?.value || '',
          googleId: profile.id,
        });
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ─── GitHub Strategy (Login / Register) ──────────────────────────────────────
passport.use(
  'github-login',
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL, // /api/auth/github/callback
      scope: ['user:email', 'read:user', 'public_repo'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already has a GitHub account linked
        let user = await User.findOne({ githubId: profile.id });
        if (user) {
          user.githubUsername = profile.username;
          await user.save();
          return done(null, user);
        }

        // 2. Check if an account with the same email already exists
        const email =
          profile.emails?.find(e => e.primary)?.value ||
          profile.emails?.[0]?.value;

        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.githubId = profile.id;
            user.githubUsername = profile.username;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // 3. Create a brand new user
        user = await User.create({
          name: profile.displayName || profile.username || 'GitHub User',
          email: email || `github_${profile.id}@devportfolio.local`,
          avatar: profile.photos?.[0]?.value || '',
          githubId: profile.id,
          githubUsername: profile.username,
        });
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ─── GitHub Strategy (Connect existing account) ───────────────────────────────
// This strategy is used when a logged-in user wants to link their GitHub account.
// It always returns the GitHub profile; the controller handles the linking.
passport.use(
  'github-connect',
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CONNECT_CALLBACK_URL || 'http://localhost:5000/api/auth/github/connect/callback',
      scope: ['user:email', 'read:user', 'public_repo'],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      // Return the raw GitHub profile — the controller will do the linking
      return done(null, {
        githubId: profile.id,
        githubUsername: profile.username,
        avatar: profile.photos?.[0]?.value || '',
      });
    }
  )
);

module.exports = passport;
