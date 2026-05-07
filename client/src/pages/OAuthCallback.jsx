import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * This page handles the OAuth redirect callback.
 * After Google/GitHub OAuth, the server redirects here with:
 *   ?token=<jwt>&name=<name>&avatar=<url>&githubUsername=<username>
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    const source = params.get('source');

    if (error || !token) {
      navigate('/login?error=' + (error || 'oauth_failed'));
      return;
    }

    // Store token and set auth headers
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch fresh user data from /api/auth/me
    axios
      .get('/api/auth/me')
      .then((res) => {
        setUser(res.data);
        // If this was a GitHub connect (not full login), go back to builder
        if (source === 'github_connect') {
          navigate('/portfolio-builder?github=connected');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(() => {
        // If /me fails, build user from query params as fallback
        setUser({
          name: decodeURIComponent(params.get('name') || ''),
          avatar: decodeURIComponent(params.get('avatar') || ''),
          githubUsername: decodeURIComponent(params.get('githubUsername') || ''),
        });
        navigate('/dashboard');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base, #0a0a0f)',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(99,102,241,0.3)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: 'var(--text-secondary, #888)', fontSize: '15px' }}>
        Signing you in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OAuthCallback;
