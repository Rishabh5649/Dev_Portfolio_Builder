import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResume } from '../store/resumeSlice';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import Navbar from '../components/layout/Navbar';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';

const ResumeBuilder = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.resume);

  useEffect(() => {
    dispatch(fetchResume());
  }, [dispatch]);

  if (error && !data) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', flexDirection: 'column', gap: '24px'
      }}>
        <div style={{ color: 'var(--danger)', fontSize: '16px' }}>{error}</div>
        <Link to="/dashboard" style={{
          color: 'var(--accent)', textDecoration: 'none', fontWeight: 600
        }}>Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', paddingTop: '64px' }}>

        {/* Left Panel: Form */}
        <div style={{
          flex: '0 0 42%', minWidth: '340px', maxWidth: '560px',
          display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)',
          background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
          overflow: 'hidden'
        }} className="resume-form-panel">

          {/* Header */}
          <div style={{
            padding: '16px 24px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0
          }}>
            <Link to="/dashboard" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: 'var(--text-secondary)',
              padding: '6px', borderRadius: '6px', transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              title="Back to Dashboard">
              <ArrowLeft size={18} />
            </Link>
            <h1 style={{
              fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0
            }}>Resume Builder</h1>
          </div>

          {/* Scrollable Form Area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '24px'
          }}>
            {loading && !data ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...Array(5)].map((_, i) => <Skeleton key={i} height="56px" />)}
              </div>
            ) : data ? (
              <ResumeForm />
            ) : null}
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div style={{
          flex: 1, display: 'none', flexDirection: 'column', height: 'calc(100vh - 64px)',
          background: 'var(--bg-base)', overflow: 'hidden'
        }} className="resume-preview-panel">
          <div style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'
          }}>
            {data ? <ResumePreview /> : null}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 1024px) {
          .resume-preview-panel {
            display: flex !important;
          }
          .resume-form-panel {
            flex: 0 0 42% !important;
          }
        }
        @media (max-width: 1023px) {
          .resume-form-panel {
            flex: 0 0 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
