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
import { Save, ExternalLink, ChevronLeft } from 'lucide-react';
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
  const { success: toastSuccess, error: toastError } = useToast();
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('edit');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [savedAgo, setSavedAgo] = useState('');

  // Show toast for GitHub connect result
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const github = params.get('github');
    if (github === 'connected') {
      toastSuccess('GitHub connected! You can now import your repos.');
      // Clean up URL
      window.history.replaceState({}, '', '/portfolio-builder');
    } else if (github === 'failed') {
      toastError('GitHub connection failed. Please try again.');
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
      else setSavedAgo(`${Math.round(sec/60)}m ago`);
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

  useEffect(() => {
    dispatch(fetchPortfolio()).then(res => {
      if (!res.payload) dispatch(createPortfolio());
    });
  }, [dispatch]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingTop: '60px' }}>
      <Navbar />

      {/* Top Bar */}
      <div style={{
        position: 'fixed', top: '60px', left: 0, right: 0,
        height: '52px', background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)',
        zIndex: 90, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: 'var(--text-secondary)',
              padding: '6px', borderRadius: '6px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            title="Back to Dashboard"
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Portfolio Builder</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '11px', color: 'var(--accent-success)', fontWeight: 500 }}>Live Preview</span>
          </div>
          {savedAgo && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saved {savedAgo}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user?.githubUsername ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setGithubModalOpen(true)}>
              <GitHubIcon size={14} /> Import GitHub
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm"
              onClick={() => {
                const token = localStorage.getItem('token');
                window.location.href = `http://localhost:5000/api/auth/github/connect?token=${token}`;
              }}
              title="Connect GitHub to import repos">
              <GitHubIcon size={14} /> Connect GitHub
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handlePreviewNewTab}
            disabled={loading || !portfolio}
            title="Preview in new tab"
          >
            <ExternalLink size={14} /> Preview
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={save}
            disabled={saving || loading}
          >
            {saving
              ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Saving...</>
              : <><Save size={14} /> Save Portfolio</>
            }
          </button>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '56px', background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border)', zIndex: 90,
        display: 'none', alignItems: 'center', justifyContent: 'space-around',
      }} className="mobile-tab-bar">
        {[
          { id: 'edit', label: 'Edit', icon: '✏️' },
          { id: 'preview', label: 'Preview', icon: '👁' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setMobileTab(tab.id)}
            style={{
              flex: 1, height: '100%', background: 'none', border: 'none',
              cursor: 'pointer', color: mobileTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '3px',
            }}>
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main split layout */}
      <div style={{ paddingTop: '52px', display: 'flex', height: 'calc(100vh - 112px)' }}>

        {/* Left — Form */}
        <div style={{
          flex: '0 0 55%', overflowY: 'auto',
          borderRight: '1px solid var(--border)',
        }} className="portfolio-form-panel">
          {loading ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...Array(5)].map((_, i) => <Skeleton key={i} height="56px" />)}
            </div>
          ) : (
            <PortfolioFormV2 />
          )}
        </div>

        {/* Right — Preview */}
        <div style={{
          flex: '0 0 45%', overflowY: 'hidden',
          background: 'var(--bg-surface)',
        }} className="portfolio-preview-panel">
          <PortfolioPreviewV2 />
        </div>
      </div>

      {/* GitHub Import Modal */}
      <GitHubImportModal
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        githubUsername={user?.githubUsername}
      />

      <style>{`
        @media (max-width: 1024px) {
          .portfolio-form-panel { flex: 0 0 60% !important; }
          .portfolio-preview-panel { flex: 0 0 40% !important; }
        }
        @media (max-width: 768px) {
          .mobile-tab-bar { display: flex !important; }
          .portfolio-form-panel { display: ${mobileTab === 'edit' ? 'block' : 'none'} !important; flex: 0 0 100% !important; }
          .portfolio-preview-panel { display: ${mobileTab === 'preview' ? 'block' : 'none'} !important; flex: 0 0 100% !important; }
        }
      `}</style>
    </div>
  );
}
