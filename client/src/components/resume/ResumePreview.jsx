import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTwoColumnTemplate from './templates/ModernTwoColumnTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import DeveloperTemplate from './templates/DeveloperTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';

// A4 at 96 DPI = 794 × 1123 px
const A4_W = 794;
const A4_H = 1123;

/**
 * ResumePreview
 *
 * Props:
 *   onPageCountChange  – called whenever the rendered page count changes
 *   contentHeightRef   – ref populated with actual content scrollHeight (for Auto Fit)
 *   zoomMultiplier     – user-controlled zoom: 1.0 = auto-fit, >1 = zoom in, <1 = zoom out
 */
const ResumePreview = ({ onPageCountChange, contentHeightRef, zoomMultiplier = 1.0, activeAtsCategory }) => {
  const { data } = useSelector(s => s.resume);
  const containerRef = useRef(null);   // wraps template — accurate scrollHeight measurement
  const wrapperRef   = useRef(null);   // outer width-sensing wrapper
  const [pageCount, setPageCount] = useState(1);
  const [baseScale, setBaseScale] = useState(0.65);

  // ── Compute base scale so the A4 sheet fits the available container width ──
  const computeBaseScale = useCallback(() => {
    if (!wrapperRef.current) return;
    const available = wrapperRef.current.clientWidth - 32; // 16px padding each side
    const s = Math.min(Math.max(available / A4_W, 0.28), 1.0);
    setBaseScale(s);
  }, []);

  useEffect(() => {
    computeBaseScale();
    const ro = new ResizeObserver(computeBaseScale);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, [computeBaseScale]);

  // Effective display scale = auto-fit base × user zoom, clamped to [0.25, 1.5]
  const scale = Math.min(Math.max(baseScale * zoomMultiplier, 0.25), 1.5);

  // ── Measure content height → page count ───────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || !data) return;

    let rafId;
    const scheduleMeasure = () => {
      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        // containerRef wraps only the template (no minHeight) — accurate height
        const h = containerRef.current.scrollHeight;
        if (contentHeightRef) contentHeightRef.current = h;
        // 8px tolerance for sub-pixel font rendering variance
        const pages = h <= A4_H + 8 ? 1 : Math.ceil(h / A4_H);
        setPageCount(pages);
        onPageCountChange?.(pages);
      });
    };

    scheduleMeasure();
    const t  = setTimeout(scheduleMeasure, 300);
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(containerRef.current);
    return () => { cancelAnimationFrame(rafId); clearTimeout(t); ro.disconnect(); };
  }, [data, onPageCountChange, contentHeightRef]);

  if (!data) return null;

  const renderTemplate = () => {
    switch (data.template) {
      case 'modern':    return <ModernTwoColumnTemplate data={data} activeAtsCategory={activeAtsCategory} />;
      case 'minimal':   return <MinimalTemplate data={data} activeAtsCategory={activeAtsCategory} />;
      case 'developer': return <DeveloperTemplate data={data} activeAtsCategory={activeAtsCategory} />;
      case 'executive': return <ExecutiveTemplate data={data} activeAtsCategory={activeAtsCategory} />;
      case 'classic':
      default:          return <ClassicTemplate data={data} activeAtsCategory={activeAtsCategory} />;
    }
  };

  // Outer container always reserves full A4 height (even if content is shorter)
  // so the preview always looks like a proper A4 sheet, never a "half page".
  const displayW = A4_W * scale;
  const displayH = A4_H * scale;

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
    >
      {/* Outer box — always A4 proportions, clips the transform */}
      <div style={{
        width:    `${displayW}px`,
        height:   `${displayH}px`,
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',   // clip so the scaled sheet doesn't spill out
      }}>
        {/* White A4 sheet — scaled from top-left origin */}
        <div style={{
          width:           `${A4_W}px`,
          minHeight:       `${A4_H}px`,   // always fills A4 visually
          background:      '#ffffff',
          boxShadow:       '0 4px 24px rgba(0,0,0,0.22)',
          borderRadius:    '2px',
          position:        'absolute',
          top:             0,
          left:            0,
          transformOrigin: 'top left',
          transform:       `scale(${scale})`,
        }}>
          {/* containerRef wraps only template — NO minHeight so scrollHeight is accurate */}
          <div ref={containerRef}>
            {renderTemplate()}
          </div>

          {/* Page-break markers — only shown when content genuinely overflows */}
          {pageCount > 1 && Array.from({ length: pageCount - 1 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: 0, width: '100%',
              top: `${A4_H * (i + 1)}px`,
              borderTop: '2px dashed #ff6b6b', zIndex: 20, pointerEvents: 'none',
              display: 'flex', justifyContent: 'center',
            }}>
              <span style={{
                background: '#ff6b6b', color: '#fff',
                fontSize: '10px', padding: '2px 10px',
                borderRadius: '0 0 8px 8px', fontWeight: 700,
                marginTop: '-1px', letterSpacing: '0.05em',
              }}>
                Page {i + 2}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scale indicator */}
      <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.05em' }}>
        A4 · {Math.round(scale * 100)}%
        {zoomMultiplier !== 1.0 && (
          <span style={{ color: 'var(--accent)', marginLeft: '6px' }}>
            (zoom {zoomMultiplier > 1 ? '+' : ''}{Math.round((zoomMultiplier - 1) * 100)}%)
          </span>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
