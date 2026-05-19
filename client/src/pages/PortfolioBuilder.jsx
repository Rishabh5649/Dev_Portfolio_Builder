import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchPortfolio, createPortfolio } from '../store/portfolioSlice';
import Navbar from '../components/layout/Navbar';
import PortfolioFormV2 from '../components/portfolio/PortfolioFormV2';
import PortfolioPreviewV2 from '../components/portfolio/PortfolioPreviewV2';
import GitHubImportModal from '../components/portfolio/GitHubImportModal';
import { usePortfolioSave } from '../hooks/usePortfolioSave';
import { Skeleton } from '../components/ui/Skeleton';
import { Save, ExternalLink, ChevronLeft, Download } from 'lucide-react';
import { generatePortfolioHTML } from '../components/portfolio/portfolioExporter';
import { useToast } from '../context/ToastContext';

const GitHubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
  </svg>
);

export default function PortfolioBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { data: portfolio, loading } = useSelector(s => s.portfolio);
  const { save, saving } = usePortfolioSave();
  const toast = useToast();
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('edit');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [savedAgo, setSavedAgo] = useState('');

  // Show toast for GitHub connect result
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const github = params.get('github');
    if (github === 'connected') {
      toast.success('GitHub connected! You can now import your repos.');
      window.history.replaceState({}, '', '/portfolio-builder');
    } else if (github === 'failed') {
      toast.error('GitHub connection failed. Please try again.');
      window.history.replaceState({}, '', '/portfolio-builder');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track last-save time from localStorage writes
  useEffect(() => {
    const check = setInterval(() => {
      const raw = localStorage.getItem('portfolioBuilder_v2_lastSaved');
      if (raw) setLastSavedAt(+raw);
    }, 1000);
    return () => clearInterval(check);
  }, []);

  useEffect(() => {
    if (!lastSavedAt) return;
    const update = () => {
      const sec = Math.round((Date.now() - lastSavedAt) / 1000);
      if (sec < 5) setSavedAgo('just now');
      else if (sec < 60) setSavedAgo(`${sec}s ago`);
      else setSavedAgo(`${Math.round(sec / 60)}m ago`);
    };
    update();
    const t = setInterval(update, 5000);
    return () => clearInterval(t);
  }, [lastSavedAt]);

  const handlePreviewNewTab = useCallback(() => {
    if (!portfolio) return;
    try {
      const html = generatePortfolioHTML(portfolio);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) { console.error('Preview failed:', e); }
  }, [portfolio]);

  const handleDownloadHTML = useCallback(() => {
    if (!portfolio) return;
    try {
      const html = generatePortfolioHTML(portfolio);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = portfolio?.personalInfo?.fullName
        ? portfolio.personalInfo.fullName.toLowerCase().replace(/\s+/g, '-')
        : 'portfolio';
      a.href = url;
      a.download = `portfolio-${name}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success('Portfolio HTML downloaded!');
    } catch (e) {
      console.error('Download failed:', e);
      toast.error('Download failed. Please try again.');
    }
  }, [portfolio, toast]);

  useEffect(() => {
    dispatch(fetchPortfolio()).then(res => {
      if (!res.payload) dispatch(createPortfolio());
    });
  }, [dispatch]);

  return (
    /* Full-height flex column — Navbar + top-bar + workspace stack naturally, no fixed overlap */
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>

      {/* ── 1. Sticky Navbar ─────────────────────────────────── */}
      <Navbar />

      {/* ── 2. Builder Action Bar ────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '52px',
        flexShrink: 0,
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        gap: '12px',
      }}>
        {/* Left: back + title + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: 'var(--text-secondary)',
              padding: '6px', borderRadius: '6px', transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            title="Back to Dashboard"
          >
            <ChevronLeft size={17} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border)', flexShrink: 0 }} />

          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Portfolio Builder
          </span>

          {/* Live dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            <span className="live-dot" style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--success)', display: 'inline-block',
              boxShadow: '0 0 6px var(--success)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 500 }}>Live</span>
          </div>

          {savedAgo && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Saved {savedAgo}
            </span>
          )}
        </div>

        {/* Right: action buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {/* GitHub button */}
          {user?.githubUsername ? (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setGithubModalOpen(true)}
            >
              <GitHubIcon size={13} /> Import GitHub
            </button>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const token = localStorage.getItem('token');
                window.location.href = `http://localhost:5000/api/auth/github/connect?token=${token}`;
              }}
              title="Connect GitHub to import repos"
            >
              <GitHubIcon size={13} /> Connect GitHub
            </button>
          )}

          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

          <button
            className="btn btn-ghost btn-sm"
            onClick={handlePreviewNewTab}
            disabled={loading || !portfolio}
            title="Open full preview in new tab"
          >
            <ExternalLink size={13} /> Preview
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDownloadHTML}
            disabled={loading || !portfolio}
            title="Download as standalone HTML file"
          >
            <Download size={13} /> Download HTML
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={save}
            disabled={saving || loading}
          >
            {saving
              ? <><div className="spinner" style={{ width: '13px', height: '13px', borderWidth: '2px' }} /> Saving…</>
              : <><Save size={13} /> Save Portfolio</>
            }
          </button>
        </div>
      </div>

      {/* ── 3. Workspace (Form + Preview side-by-side) ────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Left — Form Panel */}
        <div
          className={`portfolio-form-panel-builder ${mobileTab === 'edit' ? 'mobile-show' : 'mobile-hide'}`}
          style={{
            width: '42%',
            minWidth: '320px',
            maxWidth: '560px',
            flexShrink: 0,
            overflowY: 'auto',
            borderRight: '1px solid var(--border)',
            background: 'var(--bg-surface)',
          }}
        >
          {loading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} height="52px" />)}
            </div>
          ) : (
            <PortfolioFormV2 />
          )}
        </div>

        {/* Right — Preview Panel */}
        <div
          className={`portfolio-preview-panel-builder ${mobileTab === 'preview' ? 'mobile-show' : 'mobile-hide'}`}
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-base)',
            minWidth: 0,
          }}
        >
          <PortfolioPreviewV2 />
        </div>
      </div>

      {/* ── 4. Mobile Tab Bar (bottom, only on small screens) ── */}
      <div className="builder-mobile-tabs">
        {[
          { id: 'edit', label: 'Edit', icon: '✏️' },
          { id: 'preview', label: 'Preview', icon: '👁' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            style={{
              flex: 1, height: '100%', background: 'none', border: 'none',
              cursor: 'pointer',
              color: mobileTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 600,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '3px',
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* GitHub Import Modal */}
      <GitHubImportModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        githubUsername={user?.githubUsername}
      />

      <style>{`
        /* Mobile tab bar – hidden on desktop */
        .builder-mobile-tabs {
          display: none;
          height: 56px;
          background: var(--bg-elevated);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .builder-mobile-tabs { display: flex; }
          .portfolio-form-panel-builder  { width: 100% !important; max-width: 100% !important; }
          .portfolio-preview-panel-builder { flex: 0 0 100% !important; }
          .mobile-hide { display: none !important; }
          .mobile-show { display: block !important; }
        }
      `}</style>
    </div>
  );
}
