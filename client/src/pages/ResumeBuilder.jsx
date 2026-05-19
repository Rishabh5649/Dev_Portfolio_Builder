import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchResume, updateResume } from '../store/resumeSlice';
import { Skeleton } from '../components/ui/Skeleton';
import Navbar from '../components/layout/Navbar';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';
import { Save, Download, FileText, Eye, ArrowLeft, Menu, X, GripVertical, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import axios from 'axios';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const SIDEBAR_MIN  = 260;   // px — editor never collapses below this
const SIDEBAR_MAX_RATIO = 0.65; // editor can take at most 65% of workspace
const PREVIEW_MIN  = 320;   // px — preview never collapses below this
const SIDEBAR_DEFAULT = 420; // px — default editor width

/* ─── A4 Badge ───────────────────────────────────────────────────────────── */
const A4Badge = ({ pageCount }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg-elevated)', padding:'6px 14px', borderRadius:'20px', border:'1px solid var(--border)' }}>
    <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:pageCount<=1?'#00C896':'#FF6B6B', boxShadow:`0 0 6px ${pageCount<=1?'#00C896':'#FF6B6B'}`, flexShrink:0 }} />
    <span style={{ fontSize:'12px', color:'var(--text-secondary)', fontWeight:600 }}>A4 PREVIEW</span>
    {pageCount > 1 && (
      <span style={{ fontSize:'11px', color:'var(--danger)', background:'rgba(255,107,107,0.12)', padding:'2px 8px', borderRadius:'10px', fontWeight:600 }}>
        {pageCount} pages
      </span>
    )}
  </div>
);

/* ─── Spinner ────────────────────────────────────────────────────────────── */
const Spinner = () => (
  <div style={{ width:'14px', height:'14px', borderRadius:'50%', border:'2px solid currentColor', borderTopColor:'transparent', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
);

/* ─── Hamburger Button ───────────────────────────────────────────────────── */
const HamburgerBtn = ({ open, onClick }) => (
  <button
    onClick={onClick}
    title={open ? 'Close sections list' : 'Open sections list'}
    style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      width:'40px', height:'40px', borderRadius:'8px',
      border:'1px solid var(--border)',
      background: open ? 'rgba(108,99,255,0.18)' : 'var(--bg-surface)',
      color: open ? 'var(--accent)' : 'var(--text-secondary)',
      cursor:'pointer', transition:'all 0.2s', flexShrink:0,
    }}
    onMouseEnter={e => { e.currentTarget.style.background='rgba(108,99,255,0.18)'; e.currentTarget.style.color='var(--accent)'; }}
    onMouseLeave={e => { e.currentTarget.style.background=open?'rgba(108,99,255,0.18)':'var(--bg-surface)'; e.currentTarget.style.color=open?'var(--accent)':'var(--text-secondary)'; }}
  >
    {open ? <X size={18} /> : <Menu size={18} />}
  </button>
);

/* ─── Resize Divider ─────────────────────────────────────────────────────── */
const ResizeDivider = ({ onMouseDown, isDragging }) => (
  <div
    onMouseDown={onMouseDown}
    title="Drag to resize panels"
    style={{
      width: '6px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDragging
        ? 'rgba(108,99,255,0.35)'
        : 'var(--border)',
      cursor: 'col-resize',
      zIndex: 30,
      position: 'relative',
      transition: 'background 0.15s',
      userSelect: 'none',
    }}
    onMouseEnter={e => { if (!isDragging) e.currentTarget.style.background = 'rgba(108,99,255,0.25)'; }}
    onMouseLeave={e => { if (!isDragging) e.currentTarget.style.background = 'var(--border)'; }}
  >
    {/* Grip dots */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      pointerEvents: 'none',
    }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          width: '3px', height: '3px', borderRadius: '50%',
          background: isDragging ? 'var(--accent)' : 'var(--text-muted)',
          opacity: 0.7,
          transition: 'background 0.15s',
        }} />
      ))}
    </div>
  </div>
);

/* ─── SVG Section Icons ──────────────────────────────────────────────────── */
const renderSectionSVG = (section, isActive) => {
  const color = isActive ? 'var(--accent)' : 'var(--text-muted)';
  const strokeWidth = isActive ? 2.2 : 1.8;

  switch (section) {
    case 'header': // Personal Info
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'summary':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case 'education':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      );
    case 'skills':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'publications':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'projects':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'experience':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'certifications':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'achievements':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
          <path d="M12 2a5 5 0 0 0-5 5v3.47a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
        </svg>
      );
    case 'leadership':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'settings':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
};

/* ────────────────────────────────────────────────────────────────────────── */
const ResumeBuilder = () => {
  const dispatch = useDispatch();
  const { data, loading, error, isDirty } = useSelector(s => s.resume);

  const [isSaving,        setIsSaving]     = useState(false);
  const [isExportingPDF,  setExPDF]        = useState(false);
  const [isExportingDOCX, setExDOCX]      = useState(false);
  const [pageCount,       setPageCount]    = useState(1);
  const [sidebarOpen,     setSidebarOpen]  = useState(true);
  const [sidebarWidth,    setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isDragging,      setIsDragging]   = useState(false);
  
  // Navigation & Zoom
  const [activeSection,   setActiveSection] = useState('header');
  const [zoomMultiplier,  setZoomMultiplier] = useState(1.0);

  const workspaceRef        = useRef(null);
  const contentHeightRef    = useRef(0);
  const dragStartX          = useRef(0);
  const dragStartWidth      = useRef(SIDEBAR_DEFAULT);
  const formScrollRef       = useRef(null);

  useEffect(() => { dispatch(fetchResume()); }, [dispatch]);

  /* ── Drag-to-resize logic ───────────────────────────────────────────────── */
  const handleDividerMouseDown = useCallback((e) => {
    e.preventDefault();
    dragStartX.current     = e.clientX;
    dragStartWidth.current = sidebarWidth;
    setIsDragging(true);
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => {
      if (!workspaceRef.current) return;
      const workspaceW   = workspaceRef.current.getBoundingClientRect().width;
      const delta        = e.clientX - dragStartX.current;
      const newWidth     = dragStartWidth.current + delta;
      const maxAllowed   = workspaceW * SIDEBAR_MAX_RATIO;
      const minPreview   = workspaceW - PREVIEW_MIN;
      const clamped      = Math.min(Math.max(newWidth, SIDEBAR_MIN), maxAllowed, minPreview);
      setSidebarWidth(clamped);
    };

    const onMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [isDragging]);

  /* ── Form scroll spying for Active Section highlight ─────────────────────── */
  const handleFormScroll = useCallback(() => {
    if (!sidebarOpen || !formScrollRef.current) return;
    
    const sections = [
      'header', 'summary', 'education', 'skills', 'publications',
      'projects', 'experience', 'certifications', 'achievements', 'leadership', 'settings'
    ];
    let currentActive = 'header';
    let minDistance = Infinity;

    for (const section of sections) {
      const el = document.getElementById(`rb-section-${section}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Distance from the upper section of form viewport
        const dist = Math.abs(rect.top - 140);
        if (dist < minDistance) {
          minDistance = dist;
          currentActive = section;
        }
      }
    }
    setActiveSection(currentActive);
  }, [sidebarOpen]);

  /* ── Smooth Scroll to Section ───────────────────────────────────────────── */
  const scrollToSection = useCallback((section) => {
    setActiveSection(section);
    const el = document.getElementById(`rb-section-${section}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  /* ── Save / Export ─────────────────────────────────────────────────────── */
  const handleSave = useCallback(async () => {
    if (!data?._id || isSaving) return;
    setIsSaving(true);
    await dispatch(updateResume({ id: data._id, data }));
    setIsSaving(false);
  }, [data, dispatch, isSaving]);

  const handleExport = useCallback(async (format) => {
    if (isDirty) { alert('Please save your changes before exporting.'); return; }
    const setExp = format === 'pdf' ? setExPDF : setExDOCX;
    setExp(true);
    try {
      const res  = await axios.post(`/api/resume/export/${format}`, {}, { responseType:'blob' });
      const name = data?.header?.fullName?.replace(/\s+/g,'_') || 'Resume';
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const a    = document.createElement('a');
      a.href = url; a.download = `${name}_Resume.${format}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 3000);
    } catch(e) { console.error(e); alert(`Failed to export ${format.toUpperCase()}.`); }
    finally { setExp(false); }
  }, [isDirty, data]);

  /* ── DOM-accurate Auto Fit ─────────────────────────────────────────────── */
  const handleAutoFit = useCallback((applyFn) => {
    if (!data || !contentHeightRef.current) return;
    const A4_H = 1123;
    const presets = [
      { fontSize:11,   sectionGap:12, lineHeight:1.5,  paragraphGap:5, pagePadding:12, bottomMargin:4 },
      { fontSize:10.5, sectionGap:10, lineHeight:1.4,  paragraphGap:4, pagePadding:10, bottomMargin:4 },
      { fontSize:10,   sectionGap:8,  lineHeight:1.35, paragraphGap:3, pagePadding:9,  bottomMargin:3 },
      { fontSize:9.5,  sectionGap:6,  lineHeight:1.3,  paragraphGap:3, pagePadding:8,  bottomMargin:2 },
      { fontSize:9.5,  sectionGap:5,  lineHeight:1.3,  paragraphGap:2, pagePadding:7,  bottomMargin:1 },
      { fontSize:9,    sectionGap:5,  lineHeight:1.25, paragraphGap:2, pagePadding:6,  bottomMargin:0 },
      { fontSize:9,    sectionGap:4,  lineHeight:1.2,  paragraphGap:1, pagePadding:5,  bottomMargin:0 },
    ];
    const currentH = contentHeightRef.current;
    let chosen = presets[presets.length - 1];
    for (const p of presets) {
      const currFont = data.fontSizeOverride || 11;
      const currLine = data.spacing?.lineHeight ?? 1.4;
      const estH = currentH * (p.fontSize / currFont) * (p.lineHeight / currLine);
      if (estH <= A4_H + 8) { chosen = p; break; }
    }
    applyFn(chosen.fontSize, {
      sectionGap: chosen.sectionGap, lineHeight: chosen.lineHeight,
      paragraphGap: chosen.paragraphGap, pagePadding: chosen.pagePadding,
      bottomMargin: chosen.bottomMargin,
    });
  }, [data]);

  if (error && !data) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', flexDirection:'column', gap:'24px' }}>
      <div style={{ color:'var(--danger)' }}>{error}</div>
      <Link to="/dashboard" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Return to Dashboard</Link>
    </div>
  );

  const isBusy = isExportingPDF || isExportingDOCX;

  // Sections navigation list (matching database order beautifully)
  const navSections = [
    { key: 'header',        label: 'Personal Info' },
    { key: 'summary',       label: 'Summary' },
    { key: 'education',     label: 'Education' },
    { key: 'experience',    label: 'Experience' },
    { key: 'projects',      label: 'Projects' },
    { key: 'skills',        label: 'Skills' },
    { key: 'certifications',label: 'Certifications' },
    { key: 'achievements',  label: 'Achievements' },
    { key: 'publications',  label: 'Publications' },
    { key: 'leadership',    label: 'Leadership' },
    { key: 'settings',      label: 'Settings' }
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg-base)' }}>
      <Navbar />

      {/* ══════════════ ACTION BAR ══════════════════════════════════════════ */}
      <div style={{
        display:'flex', alignItems:'center', gap:'10px',
        padding:'8px 16px', flexShrink:0,
        borderBottom:'1px solid var(--border)',
        background:'var(--bg-elevated)', zIndex:20,
      }}>
        {/* ☰ Hamburger - Acts as section list toggle */}
        <HamburgerBtn open={sidebarOpen} onClick={() => setSidebarOpen(o => !o)} />

        {/* ← Back */}
        <Link to="/dashboard" style={{
          display:'flex', alignItems:'center', gap:'5px',
          color:'var(--text-secondary)', textDecoration:'none',
          fontSize:'13px', padding:'6px 10px', borderRadius:'6px',
          border:'1px solid var(--border)', transition:'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background='var(--bg-surface)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 style={{ fontSize:'15px', fontWeight:700, color:'var(--text-primary)', margin:0, flex:1 }}>
          Resume Builder
        </h1>

        <A4Badge pageCount={pageCount} />

        {/* Save */}
        <button onClick={handleSave} disabled={!isDirty||isSaving} style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          padding:'8px 16px', border:'none', borderRadius:'8px',
          background: isDirty&&!isSaving ? 'var(--accent)' : 'rgba(108,99,255,0.15)',
          color:       isDirty&&!isSaving ? '#fff' : 'rgba(108,99,255,0.5)',
          fontSize:'13px', fontWeight:600,
          cursor: isDirty&&!isSaving ? 'pointer' : 'not-allowed', transition:'all 0.2s',
        }}>
          {isSaving ? <Spinner /> : <Save size={14} />}
          {isSaving ? 'Saving…' : 'Save'}
        </button>

        {/* Export PDF */}
        <button onClick={() => handleExport('pdf')} disabled={isBusy||isDirty} style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          padding:'8px 16px', border:'none', borderRadius:'8px',
          background: (isBusy||isDirty) ? 'rgba(255,77,109,0.1)' : 'rgba(255,77,109,0.15)',
          color:       (isBusy||isDirty) ? 'rgba(255,77,109,0.35)' : 'var(--danger)',
          fontSize:'13px', fontWeight:600,
          cursor: (isBusy||isDirty) ? 'not-allowed' : 'pointer', transition:'all 0.2s',
        }}
          onMouseEnter={e => { if(!(isBusy||isDirty)){e.currentTarget.style.background='var(--danger)';e.currentTarget.style.color='#fff';} }}
          onMouseLeave={e => { e.currentTarget.style.background=(isBusy||isDirty)?'rgba(255,77,109,0.1)':'rgba(255,77,109,0.15)'; e.currentTarget.style.color=(isBusy||isDirty)?'rgba(255,77,109,0.35)':'var(--danger)'; }}
        >
          {isExportingPDF ? <Spinner /> : <FileText size={14} />}
          {isExportingPDF ? 'Generating…' : 'Export PDF'}
        </button>

        {/* Export DOCX */}
        <button onClick={() => handleExport('docx')} disabled={isBusy||isDirty} style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          padding:'8px 16px', border:'1px solid var(--border)', borderRadius:'8px',
          background: (isBusy||isDirty) ? 'transparent' : 'var(--bg-surface)',
          color:       (isBusy||isDirty) ? 'var(--text-muted)' : 'var(--text-primary)',
          fontSize:'13px', fontWeight:600,
          cursor: (isBusy||isDirty) ? 'not-allowed' : 'pointer', transition:'all 0.2s',
        }}>
          {isExportingDOCX ? <Spinner /> : <Download size={14} />}
          {isExportingDOCX ? 'Generating…' : 'Export DOCX'}
        </button>
      </div>

      {/* ══════════════ MAIN WORKSPACE ══════════════════════════════════════ */}
      <div
        ref={workspaceRef}
        style={{ display:'flex', flex:1, overflow:'hidden', position:'relative' }}
      >
        {/* Mobile backdrop — closes sidebar on tap outside */}
        {sidebarOpen && (
          <div
            className="rb-backdrop"
            onClick={() => setSidebarOpen(false)}
            style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', zIndex:15, display:'none' }}
          />
        )}

        {/* ── FAR LEFT: Slim Section Navigation Sidebar ──────────────────── */}
        {sidebarOpen && (
          <div style={{
            width: '68px',
            flexShrink: 0,
            background: 'var(--bg-elevated)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0',
            gap: '10px',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 11,
            scrollbarWidth: 'none',
          }}>
            {navSections.map(sec => {
              const isActive = activeSection === sec.key;
              return (
                <button
                  key={sec.key}
                  onClick={() => scrollToSection(sec.key)}
                  title={sec.label}
                  className="rb-nav-item"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: isActive ? '12px' : '50%',
                    background: isActive ? 'var(--accent)' : 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 4px 12px rgba(108,99,255,0.35)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(108,99,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-surface)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {renderSectionSVG(sec.key, isActive)}
                </button>
              );
            })}
          </div>
        )}

        {/* ── LEFT: Resizable Sidebar ──────────────────────────────────────── */}
        <div style={{
          width:    sidebarOpen ? `${sidebarWidth}px` : '0',
          minWidth: '0',
          flexShrink: 0,
          display:'flex', flexDirection:'column',
          background:'var(--bg-base)',
          overflow:'hidden',
          // Only animate on open/close toggle, NOT while dragging
          transition: isDragging ? 'none' : 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
          zIndex:10,
          borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
        }}>
          {/* Sidebar title strip */}
          <div style={{
            padding:'11px 16px', borderBottom:'1px solid var(--border)',
            background:'var(--bg-elevated)', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            whiteSpace:'nowrap', overflow:'hidden',
            opacity: sidebarOpen ? 1 : 0, transition:'opacity 0.15s 0.05s',
          }}>
            <span style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
              ✦ Sections Editor
            </span>
            <button onClick={() => setSidebarOpen(false)} style={{
              background:'none', border:'none', color:'var(--text-muted)',
              cursor:'pointer', padding:'3px 5px', borderRadius:'4px',
              display:'flex', alignItems:'center', transition:'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
              title="Close sidebar"
            >
              <X size={14} />
            </button>
          </div>

          {/* Scrollable form content */}
          <div 
            ref={formScrollRef}
            onScroll={handleFormScroll}
            style={{
              flex:1,
              overflowY:'auto',
              overflowX:'hidden',
              paddingTop:'10px',
              opacity: sidebarOpen ? 1 : 0,
              transition:'opacity 0.12s',
              // Block mouse events on content during resize to prevent selection glitches
              pointerEvents: isDragging ? 'none' : 'auto',
            }}>
            {loading && !data ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', padding:'0 20px' }}>
                {[...Array(6)].map((_,i) => <Skeleton key={i} height="46px" />)}
              </div>
            ) : data ? (
              <ResumeForm onAutoFit={handleAutoFit} />
            ) : null}
          </div>
        </div>

        {/* ── DIVIDER — drag handle between panels ─────────────────────────── */}
        {sidebarOpen && (
          <ResizeDivider
            onMouseDown={handleDividerMouseDown}
            isDragging={isDragging}
          />
        )}

        {/* ── RIGHT: A4 Preview Panel ──────────────────────────────────────── */}
        <div style={{
          flex:1, display:'flex', flexDirection:'column',
          background:'#e0e0e0', overflow:'hidden', minWidth:0, position:'relative',
          // Block pointer events on preview during drag (prevents iframe/content stealing events)
          pointerEvents: isDragging ? 'none' : 'auto',
        }}>
          <div style={{
            flex:1, overflowY:'auto', overflowX:'hidden',
            padding:'28px 20px 80px', // Extra bottom spacing to accommodate zoom floating pill
            display:'flex', justifyContent:'center', alignItems:'flex-start',
          }}>
            {data ? (
              <ResumePreview 
                onPageCountChange={setPageCount} 
                contentHeightRef={contentHeightRef} 
                zoomMultiplier={zoomMultiplier}
              />
            ) : (
              <div style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'100px', textAlign:'center' }}>
                <div style={{ fontSize:'24px', marginBottom:'10px' }}>☰</div>
                Click the menu icon to open the sidebar and start editing
              </div>
            )}
          </div>

          {/* FLOATING ZOOM CONTROLS PILL */}
          {data && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              borderRadius: '30px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 30,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
              {/* Zoom Out */}
              <button 
                onClick={() => setZoomMultiplier(z => Math.max(z - 0.1, 0.4))}
                title="Zoom Out"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-primary)',
                  cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ZoomOut size={16} />
              </button>

              {/* Display Percent */}
              <span style={{
                fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)',
                minWidth: '45px', textAlign: 'center', userSelect: 'none',
              }}>
                {Math.round(zoomMultiplier * 100)}%
              </span>

              {/* Zoom In */}
              <button 
                onClick={() => setZoomMultiplier(z => Math.min(z + 0.1, 2.0))}
                title="Zoom In"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-primary)',
                  cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ZoomIn size={16} />
              </button>

              {/* Separator Line */}
              <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

              {/* Reset to fit */}
              <button 
                onClick={() => setZoomMultiplier(1.0)}
                title="Reset Fit"
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-primary)',
                  cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          )}

          {/* Width indicator shown only while dragging */}
          {isDragging && (
            <div style={{
              position:'absolute', top:'12px', left:'50%', transform:'translateX(-50%)',
              background:'rgba(108,99,255,0.9)', color:'#fff',
              padding:'4px 12px', borderRadius:'12px', fontSize:'11px',
              fontWeight:700, letterSpacing:'0.04em', pointerEvents:'none',
              backdropFilter:'blur(8px)',
            }}>
              Editor {Math.round(sidebarWidth)}px
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        /* On mobile: sidebar overlays instead of pushing content */
        @media (max-width: 860px) {
          .rb-backdrop { display: block !important; }
        }
        /* Hide scrollbars for vertical navigation bar */
        .rb-nav-item::-webkit-scrollbar { display: none; }
        /* Prevent text selection everywhere during resize drag */
        body.rb-resizing * { user-select: none !important; cursor: col-resize !important; }
      `}</style>

      {/* Apply resizing class to body during drag for global cursor lock */}
      {isDragging && (
        <style>{`body { cursor: col-resize !important; user-select: none !important; }`}</style>
      )}
    </div>
  );
};

export default ResumeBuilder;
