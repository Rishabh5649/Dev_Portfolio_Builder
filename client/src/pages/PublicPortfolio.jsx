import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import TemplateMinimal from '../components/portfolio/TemplateMinimal';
import TemplateDark from '../components/portfolio/TemplateDark';
import TemplateGradient from '../components/portfolio/TemplateGradient';
import AuroraTheme from '../components/portfolio/AuroraTheme';
import ObsidianTheme from '../components/portfolio/ObsidianTheme';
import PrismTheme from '../components/portfolio/PrismTheme';
import { Skeleton } from '../components/ui/Skeleton';

const TEMPLATES = {
  minimal:   TemplateMinimal,
  developer: TemplateDark,
  designer:  TemplateGradient,
  aurora:    AuroraTheme,
  obsidian:   ObsidianTheme,
  prism:     PrismTheme,
};

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.title = 'Loading Portfolio... | DevPortfolio';
    api.get(`/api/portfolio/public/${slug}`)
      .then(res => {
        setPortfolio(res.data);
        const name = res.data?.personalInfo?.fullName;
        document.title = name ? `${name}'s Portfolio | DevPortfolio` : 'Portfolio | DevPortfolio';
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Skeleton height="60px" width="40%" />
          <Skeleton height="20px" width="60%" />
          <Skeleton height="16px" />
          <Skeleton height="16px" width="80%" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} height="160px" />)}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !portfolio) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0F',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '24px', textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#F0F0FF', marginBottom: '12px' }}>
          Portfolio Not Found
        </h1>
        <p style={{ color: '#9999BB', fontSize: '16px', marginBottom: '32px', maxWidth: '360px', lineHeight: 1.6 }}>
          The portfolio at <strong style={{ color: '#6C63FF' }}>/p/{slug}</strong> doesn't exist or hasn't been published yet.
        </p>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
          color: '#fff', padding: '12px 24px', borderRadius: '10px',
          textDecoration: 'none', fontWeight: 600, fontSize: '14px',
        }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  const TemplateComponent = TEMPLATES[portfolio.template] || TemplateMinimal;

  return <TemplateComponent portfolio={portfolio} />;
}
