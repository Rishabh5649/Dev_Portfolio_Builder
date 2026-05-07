import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTilt } from '../hooks/useTilt';
import { ArrowRight, Sparkles, Zap, Globe, FileText, Download, Star } from 'lucide-react';

const GitHubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
  </svg>
);

const features = [
  {
    icon: <Globe size={24} />,
    title: 'Live Web Portfolio',
    desc: 'Choose from 3 premium themes — Aurora, Obsidian, Prism — and get a public shareable URL instantly.',
    accent: '#6C63FF',
  },
  {
    icon: <FileText size={24} />,
    title: 'AI-Ready Resume Builder',
    desc: 'Auto-fill from your portfolio, drag sections, 5 ATS-ready templates. Export PDF or DOCX.',
    accent: '#00D4FF',
  },
  {
    icon: <GitHubIcon size={24} />,
    title: 'GitHub Integration',
    desc: 'Connect GitHub and import repos as projects automatically. Show real contribution stats.',
    accent: '#00E5A0',
  },
  {
    icon: <Download size={24} />,
    title: 'One-Click Export',
    desc: 'Export your portfolio as a self-contained HTML file. Deploy anywhere — GitHub Pages, Vercel, Netlify.',
    accent: '#FFB830',
  },
  {
    icon: <Star size={24} />,
    title: '3 Premium Themes',
    desc: 'Aurora (editorial), Obsidian (dark terminal), Prism (creative) — all with full animations.',
    accent: '#FF4D6D',
  },
  {
    icon: <Zap size={24} />,
    title: 'Real-Time Preview',
    desc: 'See changes instantly with the split-panel editor. No refresh needed.',
    accent: '#6C63FF',
  },
];

function FeatureCard({ feature, index }) {
  const tiltRef = useTilt(6);
  return (
    <motion.div
      ref={tiltRef}
      className="card card-tilt"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
      style={{ cursor: 'default' }}
    >
      <div style={{
        width: 48, height: 48,
        borderRadius: '12px',
        background: `${feature.accent}20`,
        border: `1px solid ${feature.accent}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: feature.accent,
        marginBottom: 16,
      }}>
        {feature.icon}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{feature.title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{feature.desc}</p>
    </motion.div>
  );
}

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Orbs */}
      <div className="orb orb-purple" />
      <div className="orb orb-cyan" />
      <div className="orb orb-pink" />
      {/* Dot Grid */}
      <div className="dot-grid" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="navbar-logo">
              <div className="navbar-logo-mark">DP</div>
              <span>DevPortfolio</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ paddingTop: 120, paddingBottom: 100, textAlign: 'center', padding: '120px 24px 100px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 20,
              background: 'var(--accent-dim)',
              border: '1px solid rgba(108,99,255,0.3)',
              color: 'var(--accent)',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 32,
            }}>
              <Sparkles size={13} />
              Build your developer presence in minutes
            </div>

            <h1 style={{
              fontSize: 'clamp(42px, 7vw, 80px)',
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 24,
              letterSpacing: '-0.02em',
            }}>
              Your professional<br />
              <span className="gradient-text">developer presence</span>
            </h1>

            <p style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              maxWidth: 600,
              margin: '0 auto 48px',
              lineHeight: 1.8,
            }}>
              Build a stunning public portfolio with one of 3 premium themes. Generate ATS-ready resumes from the same data. Share everywhere — one platform, zero friction.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg pulse-glow">
                Build Your Portfolio <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 72, flexWrap: 'wrap' }}
          >
            {[
              { val: '3', label: 'Premium Themes' },
              { val: '5', label: 'Resume Templates' },
              { val: '∞', label: 'Free Forever' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent)' }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Features Grid */}
        <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <div className="section-label" style={{ marginBottom: 12 }}>Everything you need</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800 }}>
              One platform,<br />
              <span className="gradient-text">complete developer brand</span>
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {features.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section style={{ padding: '80px 24px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              maxWidth: 800,
              margin: '0 auto',
              background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.1))',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: 24,
              padding: '64px 48px',
              textAlign: 'center',
              backdropFilter: 'blur(20px)',
            }}
          >
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
              Ready to stand out?
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 36 }}>
              Join developers building their brand with DevPortfolio. Free to start, no credit card required.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Building — It's Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <div className="navbar-logo-mark" style={{ width: 24, height: 24, fontSize: 10 }}>DP</div>
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>DevPortfolio</span>
          </div>
          <p>© {new Date().getFullYear()} DevPortfolio. Built for developers.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
