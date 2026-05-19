const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

/**
 * GitHub Routes — all use the authenticated user's githubUsername
 * to call the public GitHub REST API.
 * 
 * Since we don't store a GitHub OAuth access token on the user model,
 * we use the public GitHub API (unauthenticated) which allows 60 req/hr per IP.
 * If a GITHUB_TOKEN env var is set, it is used to raise the rate limit to 5000/hr.
 */

const ghHeaders = () => {
  const h = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DevPortfolioBuilder/1.0',
  };
  if (process.env.GITHUB_TOKEN) {
    h['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }
  return h;
};

// GET /api/github/repos
// Returns the public repos for the logged-in user's linked GitHub account
const getRepos = async (req, res) => {
  try {
    const username = req.user?.githubUsername;
    if (!username) {
      return res.status(400).json({ message: 'No GitHub account linked. Please connect your GitHub first.' });
    }

    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: ghHeaders(),
        params: {
          type: 'owner',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
        },
        timeout: 10000,
      }
    );

    const repos = response.data.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      owner: username,
      description: r.description || '',
      html_url: r.html_url,
      homepage: r.homepage || '',
      language: r.language || '',
      stargazers_count: r.stargazers_count || 0,
      forks_count: r.forks_count || 0,
      topics: r.topics || [],
      private: r.private,
      updated_at: r.updated_at,
    }));

    res.json(repos);
  } catch (err) {
    console.error('GitHub repos fetch error:', err?.response?.data || err.message);
    if (err?.response?.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found' });
    }
    if (err?.response?.status === 403) {
      return res.status(429).json({ message: 'GitHub API rate limit exceeded. Please try again later.' });
    }
    res.status(500).json({ message: 'Failed to fetch GitHub repositories', error: err.message });
  }
};

// GET /api/github/repos/:owner/:repo/readme
// Returns the repo's README as plain text, and a short description extracted from it
const getReadme = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: { ...ghHeaders(), 'Accept': 'application/vnd.github.raw' },
        timeout: 8000,
      }
    );

    // Extract first non-heading paragraph as short description
    const content = response.data || '';
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const descLine = lines.find(l => !l.startsWith('#') && !l.startsWith('!') && l.length > 20);

    res.json({
      content: content.slice(0, 2000), // first 2000 chars
      description: descLine ? descLine.slice(0, 200) : '',
    });
  } catch (err) {
    // 404 is normal for repos without README — return empty
    res.json({ content: '', description: '' });
  }
};

// GET /api/github/repos/:owner/:repo/languages
// Returns list of languages used in the repo
const getLanguages = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: ghHeaders(),
        timeout: 8000,
      }
    );
    // Convert {JavaScript: 12345, Python: 5678} → ['JavaScript', 'Python']
    const languages = Object.keys(response.data || {});
    res.json({ languages });
  } catch (err) {
    res.json({ languages: [] });
  }
};

// GET /api/github/repos/:owner/:repo/package
// Returns dependencies from package.json if available
const getPackage = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      {
        headers: { ...ghHeaders(), 'Accept': 'application/vnd.github.raw' },
        timeout: 8000,
      }
    );

    let pkg = {};
    try {
      pkg = JSON.parse(response.data);
    } catch (_) { /* not valid JSON */ }

    const deps = Object.keys({
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    }).slice(0, 20); // top 20 deps only

    res.json({ dependencies: deps });
  } catch (err) {
    // 404 = no package.json, totally normal
    res.json({ dependencies: [] });
  }
};

module.exports = { getRepos, getReadme, getLanguages, getPackage };
