import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchPortfolio } from '../store/portfolioSlice';
import { fetchResume } from '../store/resumeSlice';
import { useTilt } from '../hooks/useTilt';
import {
  LayoutDashboard, Palette, FileText, Globe,
  Copy, ExternalLink, CheckCircle2, Clock,
  ArrowRight, User, Zap, Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const GitHubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
  </svg>
);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function StatCard({ icon, label, value, accent, to }) {
  const tiltRef = useTilt(8);
  const content = (
    <div ref={tiltRef} className="stat-card card-tilt" style={{ cursor: to ? 'pointer' : 'default' }}>
      <div style={{
        width: 40, height: 40,
        borderRadius: 10,
        background: `${accent}20`,
        border: `1px solid ${accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent, marginBottom: 16,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: accent, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

function ActionCard({ icon, title, desc, to, accent, cta }) {
  const tiltRef = useTilt(5);
  return (
    <motion.div variants={fadeUp}>
      <Link to={to} style={{ textDecoration: 'none' }}>
        <div ref={tiltRef} className="card card-tilt" style={{ cursor: 'pointer', height: '100%' }}>
          <div style={{
            width: 48, height: 48,
            borderRadius: 12,
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent, marginBottom: 16,
          }}>
            {icon}
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>{desc}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: accent, fontSize: 13, fontWeight: 600 }}>
            {cta} <ArrowRight size={14} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { data: portfolio, loading: pLoading } = useSelector(s => s.portfolio);
  const { data: resume, loading: rLoading } = useSelector(s => s.resume);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchResume());
  }, [dispatch]);

  const loading = pLoading || rLoading;

  const publicUrl = portfolio?.slug
    ? `${window.location.origin}/p/${portfolio.slug}`
    : null;

  const copyUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast('success', 'Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Completion stats
  const pFields = portfolio ? [
    portfolio.personalInfo?.fullName,
    portfolio.personalInfo?.title,
    portfolio.personalInfo?.bio,
    portfolio.skills?.length,
    portfolio.projects?.length,
    portfolio.contactInfo?.email,
  ].filter(Boolean).length : 0;
  const pCompletion = Math.round((pFields / 6) * 100);

  const rFields = resume ? [
    resume.header?.name,
    resume.summary,
    resume.experience?.length,
    resume.education?.length,
    resume.skillGroups?.length,
  ].filter(Boolean).length : 0;
  const rCompletion = Math.round((rFields / 5) * 100);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Navbar />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
          {/* Skeleton */}
          <div style={{ marginBottom: 32 }}>
            <div className="skeleton" style={{ width: 280, height: 32, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 200, height: 18 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="orb orb-purple" style={{ opacity: 0.15 }} />
      <div className="orb orb-cyan" style={{ opacity: 0.12 }} />
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} />
            {greeting}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Developer'}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Here's your developer hub at a glance.
          </p>
        </motion.div>

        {/* GitHub connect banner */}
        {user && !user.githubUsername && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(0,229,160,0.08)',
              border: '1px solid rgba(0,229,160,0.3)',
              borderRadius: 12,
              padding: '14px 20px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)' }}>
              <GitHubIcon size={16} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Connect GitHub to import repos & show contribution stats</span>
            </div>
            <Link to="/portfolio-builder" className="btn btn-success btn-sm">
              Connect GitHub <ArrowRight size={13} />
            </Link>
          </motion.div>
        )}
        {user?.githubUsername && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'var(--success-dim)',
              border: '1px solid rgba(0,229,160,0.3)',
              borderRadius: 12,
              padding: '12px 20px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--success)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={16} />
            <GitHubIcon size={14} />
            GitHub connected: <strong>@{user.githubUsername}</strong>
          </motion.div>
        )}

        {/* Stat Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}
        >
          <motion.div variants={fadeUp}>
            <StatCard
              icon={<Palette size={18} />}
              label="Portfolio Completion"
              value={`${pCompletion}%`}
              accent="#6C63FF"
              to="/portfolio-builder"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              icon={<FileText size={18} />}
              label="Resume Completion"
              value={`${rCompletion}%`}
              accent="#00D4FF"
              to="/resume-builder"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              icon={<Globe size={18} />}
              label="Portfolio Status"
              value={portfolio?.published ? 'Live' : 'Draft'}
              accent={portfolio?.published ? '#00E5A0' : '#FFB830'}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard
              icon={<User size={18} />}
              label="GitHub Repos"
              value={user?.githubUsername ? '∞' : '—'}
              accent="#00E5A0"
            />
          </motion.div>
        </motion.div>

        {/* Public Portfolio Link */}
        {publicUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Your public portfolio
              </div>
              <div style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>{publicUrl}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button id="copy-portfolio-url" className="btn btn-secondary btn-sm" onClick={copyUrl}>
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                <ExternalLink size={14} />
                Open
              </a>
            </div>
          </motion.div>
        )}

        {/* Action Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}
        >
          <ActionCard
            icon={<Palette size={22} />}
            title="Portfolio Builder"
            desc="Fill in your info, pick a theme, and generate a stunning public portfolio site. All 12 sections, 3 export-ready themes."
            to="/portfolio-builder"
            accent="#6C63FF"
            cta="Open builder"
          />
          <ActionCard
            icon={<FileText size={22} />}
            title="Resume Builder"
            desc="5 ATS-ready templates. Auto-fill from portfolio, drag sections, export PDF or DOCX in one click."
            to="/resume-builder"
            accent="#00D4FF"
            cta="Build resume"
          />
          <ActionCard
            icon={<Sparkles size={22} />}
            title="Global ATS Resume Analyzer"
            desc="Upload any PDF/DOCX resume or paste raw text to run a strict recruiter-grade parsing audit and generate a comprehensive diagnostics report."
            to="/ats-analyzer"
            accent="#00F5D4"
            cta="Launch Analyzer"
          />
          <ActionCard
            icon={<Zap size={22} />}
            title="Quick Tips"
            desc="Fill in the Portfolio Builder first — the Resume Builder can auto-import all your data with one click."
            to="/portfolio-builder"
            accent="#FFB830"
            cta="Start here"
          />
        </motion.div>
      </div>
    </div>
  );
}
