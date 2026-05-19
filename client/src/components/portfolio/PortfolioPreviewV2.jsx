import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTemplate } from '../../store/portfolioSlice';
import { generatePortfolioHTML } from './portfolioExporter';

const THEMES = [
  { id: 'aurora',   label: 'Aurora'   },
  { id: 'obsidian', label: 'Obsidian' },
  { id: 'prism',    label: 'Prism'    },
];

const PortfolioPreviewV2 = memo(function PortfolioPreviewV2() {
  const dispatch = useDispatch();
  const portfolio = useSelector(s => s.portfolio.data);
  const iframeRef = useRef(null);
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile'
  const currentTheme = portfolio?.template || 'aurora';

  // Generate HTML from real exporter whenever portfolio changes
  const html = portfolio ? generatePortfolioHTML(portfolio) : '';

  // Write HTML into iframe using srcdoc (avoids CORS issues with blob URLs)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    // Use srcdoc attribute for reliable cross-origin-safe rendering
    iframe.srcdoc = html;
  }, [html]);

  const handleThemeChange = useCallback((themeId) => {
    dispatch(setTemplate(themeId));
  }, [dispatch]);

  if (!portfolio) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        fontSize: '14px',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ fontSize: '32px' }}>⏳</div>
        <span>Loading portfolio preview...</span>
      </div>
    );
  }

  // Desktop preview: scale down to fit panel; mobile: natural mobile width
  const desktopScale = 0.46;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-surface)',
      overflow: 'hidden',
    }}>
      {/* Preview Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(10,10,15,0.95)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {/* Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            THEME:
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderColor: currentTheme === t.id ? 'var(--accent)' : 'var(--border)',
                  background: currentTheme === t.id ? 'var(--accent)' : 'transparent',
                  color: currentTheme === t.id ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport Toggle */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'mobile', icon: '📱', label: 'Mobile' },
            { id: 'desktop', icon: '🖥️', label: 'Desktop' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setViewport(v.id)}
              title={v.label}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderColor: viewport === v.id ? 'var(--accent)' : 'var(--border)',
                background: viewport === v.id ? 'rgba(var(--accent-rgb, 99,102,241),0.15)' : 'transparent',
                color: viewport === v.id ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <span style={{ fontSize: '13px' }}>{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Viewport */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
        background: viewport === 'mobile' ? '#0a0a14' : '#0d0d14',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: 0,
      }}>
        {viewport === 'desktop' ? (
          /* Desktop: transform-origin top-left so the iframe fills the full panel width */
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${100 / desktopScale}%`,
              transformOrigin: 'top left',
              transform: `scale(${desktopScale})`,
            }}>
              <iframe
                ref={iframeRef}
                title="Portfolio Preview"
                sandbox="allow-scripts"
                style={{
                  width: '100%',
                  height: `${Math.ceil(100 / desktopScale)}vh`,
                  border: 'none',
                  display: 'block',
                  minHeight: '1200px',
                }}
              />
            </div>
          </div>
        ) : (
          /* Mobile: 390px iPhone-sized centered preview */
          <div style={{
            width: '390px',
            maxWidth: '100%',
            height: '100%',
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <iframe
              ref={iframeRef}
              title="Portfolio Preview Mobile"
              sandbox="allow-scripts"
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
                display: 'block',
                minHeight: '600px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default PortfolioPreviewV2;