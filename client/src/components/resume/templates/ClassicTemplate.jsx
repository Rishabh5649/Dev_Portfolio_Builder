/**
 * ClassicTemplate — pixel-accurate match to RIshabh_Singh_Resume (5).pdf reference.
 * 
 * Reference layout observed:
 * - Name: UPPERCASE, bold, center, larger serif font (Arial-like sans for heading)
 * - Contact: email • phone • location • linkedin • github on one line, smaller, centered
 * - Section headers: UPPERCASE bold, full-width bottom border line
 * - Education: Institution bold left + GPA/Percentage right-aligned; Degree italic left + Year right
 * - Skills: "Category:" bold inline + values on same line
 * - Publications: • Title bold; - Publisher — Year below, indented
 * - Projects: • Name bold + Tech Stack: values same line; – description below, indented
 * - Experience: • Role, Company  |  Date right; – bullets below, indented
 * - Leadership/Achievements: disc-list bullet items
 */

/* ── Google Fonts loader ─────────────────────────────────────────────────── */
const loadedFonts = new Set();
const ensureFont = (family) => {
  const webFonts = ['Inter', 'Lato', 'Merriweather', 'Poppins'];
  if (!webFonts.includes(family) || loadedFonts.has(family)) return;
  const link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g,'+')}:wght@400;600;700&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(family);
};

const FONT_STACKS = {
  'Georgia':          "'Georgia', 'Times New Roman', serif",
  'Times New Roman':  "'Times New Roman', Times, serif",
  'Garamond':         "Garamond, 'EB Garamond', serif",
  'Merriweather':     "'Merriweather', Georgia, serif",
  'Inter':            "'Inter', system-ui, sans-serif",
  'Calibri':          "Calibri, 'Gill Sans', sans-serif",
  'Helvetica':        "Helvetica, Arial, sans-serif",
  'Lato':             "'Lato', Arial, sans-serif",
  'Poppins':          "'Poppins', 'Helvetica Neue', sans-serif",
};

const ClassicTemplate = ({ data, activeAtsCategory }) => {
  if (!data) return null;

  const {
    header        = {},
    summary       = '',
    experience    = [],
    education     = [],
    skillGroups   = [],
    projects      = [],
    certifications= [],
    publications  = [],
    achievements  = [],
    leadership    = [],
    sectionOrder  = [],
    sectionLabels = {},
    hiddenSections= [],
    fontSizeOverride,
    fontFamily    = 'Georgia',
    spacing       = {},
  } = data;

  const sectionGap   = spacing.sectionGap   ?? 10;
  const lineHeight   = spacing.lineHeight   ?? 1.4;
  const paragraphGap = spacing.paragraphGap ?? 4;
  const pagePadding  = spacing.pagePadding  ?? 10;
  // bottomMargin: 0 = ultra-compact ATS, 4 = standard — controls bottom whitespace
  const bottomMargin = spacing.bottomMargin ?? 4;

  const fs        = fontSizeOverride || 11;   // pt value used for em calculations
  const baseSize  = `${fs}pt`;
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Georgia'];
  ensureFont(fontFamily);

  // ── LIVE ATS HIGHLIGHT UTILITIES ──
  const getHighlightedBullet = (text, category) => {
    if (!category) return text;
    const lower = text.toLowerCase();
    
    // 1. CONTENT QUALITY / SPECIFICITY
    if (category === 'content' || category === 'quality') {
      const quantPattern = /\b\d+(?:[\d,\.]*)*(?:%|\+|\s*(?:percent|x|k|M|m|B|b|million|billion|dollars|s|ms|fps))\b|\b\d+\b/;
      const vaguePhrases = ["worked on", "helped with", "assisted in", "responsible for", "handled", "tasks included", "participated in"];
      
      let isQuantified = quantPattern.test(text);
      let foundVague = vaguePhrases.find(vp => lower.includes(vp));
      
      if (foundVague) {
        const parts = text.split(new RegExp(`(${foundVague})`, 'i'));
        return (
          <span style={{ background: 'rgba(217, 83, 79, 0.08)', border: '1px dashed rgba(217, 83, 79, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            {parts.map((p, idx) => p.toLowerCase() === foundVague ? <strong key={idx} style={{ color: '#D9534F', textDecoration: 'underline' }}>{p}</strong> : p)}
            <span style={{ fontSize: '0.85em', color: '#D9534F', display: 'block', marginTop: '2px', fontWeight: 600 }}>✗ Recruiter Warning: Vague Phrasing</span>
          </span>
        );
      }
      
      if (isQuantified) {
        return (
          <span style={{ background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            {text}
            <span style={{ fontSize: '0.85em', color: '#2CA58D', display: 'block', marginTop: '2px', fontWeight: 600 }}>✓ Recruiter Approved: Quantified Achievement</span>
          </span>
        );
      }
      
      return (
        <span style={{ background: 'rgba(226, 185, 59, 0.08)', border: '1px dashed rgba(226, 185, 59, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
          {text}
          <span style={{ fontSize: '0.85em', color: '#D4AF37', display: 'block', marginTop: '2px', fontWeight: 600 }}>⚠ Recruiter Tip: Unquantified Bullet (Add real metrics)</span>
        </span>
      );
    }
    
    // 2. VERBS & IMPACT
    if (category === 'impact' || category === 'verbs') {
      const actionVerbs = new Set([
        'built', 'developed', 'optimized', 'designed', 'led', 'implemented', 'architected',
        'created', 'managed', 'formulated', 'secured', 'deployed', 'engineered', 'enhanced',
        'coordinated', 'accelerated', 'reduced', 'increased', 'formulated', 'spearheaded', 'automated', 'streamlined', 'leveraged'
      ]);
      const firstWord = text.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
      const startsWithAction = actionVerbs.has(firstWord);
      
      if (startsWithAction) {
        return (
          <span style={{ background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            <strong style={{ color: '#2CA58D' }}>{text.split(/\s+/)[0]}</strong> {text.substring(text.split(/\s+/)[0].length)}
            <span style={{ fontSize: '0.85em', color: '#2CA58D', display: 'block', marginTop: '2px', fontWeight: 600 }}>✓ Strong Leading Action Verb</span>
          </span>
        );
      } else {
        return (
          <span style={{ background: 'rgba(217, 83, 79, 0.08)', border: '1px dashed rgba(217, 83, 79, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            {text}
            <span style={{ fontSize: '0.85em', color: '#D9534F', display: 'block', marginTop: '2px', fontWeight: 600 }}>✗ Weak Verbs: Missing leading action verb</span>
          </span>
        );
      }
    }
    
    // 3. READABILITY & LAYOUT
    if (category === 'readability') {
      if (text.length > 200) {
        return (
          <span style={{ background: 'rgba(217, 83, 79, 0.08)', border: '1px dashed rgba(217, 83, 79, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            {text}
            <span style={{ fontSize: '0.85em', color: '#D9534F', display: 'block', marginTop: '2px', fontWeight: 600 }}>✗ Spacing Alert: Overly long bullet point (&gt;200 chars)</span>
          </span>
        );
      }
      if (text.length < 40) {
        return (
          <span style={{ background: 'rgba(226, 185, 59, 0.08)', border: '1px dashed rgba(226, 185, 59, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            {text}
            <span style={{ fontSize: '0.85em', color: '#D4AF37', display: 'block', marginTop: '2px', fontWeight: 600 }}>⚠ Content Warning: Short bullet point (&lt;40 chars)</span>
          </span>
        );
      }
    }
    
    // 4. TECHNICAL SPECIFICITY / DEPTH
    if (category === 'tech_depth' || category === 'depth') {
      const techPattern = /caching|redis|optimization|api|database|pipeline|latency|throughput|architecture|refactored|migration|cloud|microservices|docker|concurrency|concurrent|scalability|scalable|pytorch|tensorflow|cnn|lstm|mern/;
      if (techPattern.test(lower)) {
        return (
          <span style={{ background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            {text}
            <span style={{ fontSize: '0.85em', color: '#2CA58D', display: 'block', marginTop: '2px', fontWeight: 600 }}>✓ Engineering Audit Approved: High Technical Specificity</span>
          </span>
        );
      }
    }
    
    // 5. BIG-TECH READINESS
    if (category === 'big_tech') {
      const scaleKeywords = ['scale', 'user', 'qps', 'database', 'latency', 'throughput', 'concurrency', 'cloud', 'architecture', 'speedup', 'reduction', 'optimize', 'latency', 'million', 'billion'];
      const scaleMatch = scaleKeywords.find(kw => lower.includes(kw));
      if (scaleMatch) {
        return (
          <span style={{ background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '1px 4px', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
            {text}
            <span style={{ fontSize: '0.85em', color: '#2CA58D', display: 'block', marginTop: '2px', fontWeight: 600 }}>✓ High-Scale Architecture Metric Detected</span>
          </span>
        );
      }
    }

    return text;
  };

  const getHighlightedSkills = (skillsArray, category) => {
    if (category !== 'skills') return skillsArray.join(', ');
    
    const outdatedTech = ['jquery', 'svn', 'cvs', 'ftp', 'frontpage', 'flash'];
    const counts = {};
    skillsArray.forEach(s => {
      const norm = s.toLowerCase().trim();
      counts[norm] = (counts[norm] || 0) + 1;
    });
    
    return skillsArray.map((s, idx) => {
      const norm = s.toLowerCase().trim();
      const isOutdated = outdatedTech.includes(norm);
      const isDuplicate = counts[norm] > 1;
      
      if (isOutdated) {
        return (
          <span key={idx} style={{ background: 'rgba(217, 83, 79, 0.12)', color: '#D9534F', textDecoration: 'line-through', border: '1px dashed rgba(217, 83, 79, 0.35)', borderRadius: '4px', padding: '1px 4px', marginRight: '4px', display: 'inline-block' }}>
            {s} (Outdated)
          </span>
        );
      }
      if (isDuplicate) {
        return (
          <span key={idx} style={{ background: 'rgba(226, 185, 59, 0.12)', color: '#D4AF37', border: '1px dashed rgba(226, 185, 59, 0.35)', borderRadius: '4px', padding: '1px 4px', marginRight: '4px', display: 'inline-block' }}>
            {s} (Duplicate)
          </span>
        );
      }
      return <span key={idx} style={{ marginRight: '4px', color: '#333' }}>{s}{idx < skillsArray.length - 1 ? ',' : ''}</span>;
    });
  };

  const getHighlightedSummary = (text, category) => {
    if (category === 'readability' || category === 'summary') {
      if (text.length > 400) {
        return (
          <span style={{ background: 'rgba(217, 83, 79, 0.06)', border: '1px dashed rgba(217, 83, 79, 0.25)', borderRadius: '4px', padding: '6px', display: 'block' }}>
            {text}
            <span style={{ fontSize: '0.85em', color: '#D9534F', display: 'block', marginTop: '4px', fontWeight: 600 }}>✗ Verbose Profile Warning ({text.length} chars) - Exceeds recommended 400 character limit</span>
          </span>
        );
      } else if (category === 'summary') {
        return (
          <span style={{ background: 'rgba(44, 165, 141, 0.06)', border: '1px dashed rgba(44, 165, 141, 0.25)', borderRadius: '4px', padding: '6px', display: 'block' }}>
            {text}
            <span style={{ fontSize: '0.85em', color: '#2CA58D', display: 'block', marginTop: '4px', fontWeight: 600 }}>✓ Professional Summary Audit: Active & Structured Profile</span>
          </span>
        );
      }
    }
    return text;
  };

  const getHighlightedSectionWrap = (children, secId, category) => {
    const isSectionAudit = category === secId;
    
    if (category === 'formatting') {
      return (
        <div style={{ border: '1px dashed rgba(226, 185, 59, 0.3)', background: 'rgba(226, 185, 59, 0.015)', borderRadius: '6px', padding: '6px', marginBottom: `${sectionGap}px`, transition: 'all 0.2s' }}>
          {children}
          <div style={{ fontSize: '8px', color: '#D4AF37', textAlign: 'right', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Spacing Audit Margin Boundary</div>
        </div>
      );
    }
    
    if (isSectionAudit) {
      return (
        <div style={{ border: '2px dashed rgba(44, 165, 141, 0.45)', background: 'rgba(44, 165, 141, 0.02)', borderRadius: '8px', padding: '8px', marginBottom: `${sectionGap}px`, transition: 'all 0.2s' }}>
          {children}
          <div style={{ fontSize: '9px', color: '#2CA58D', textAlign: 'right', marginTop: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>✦ Currently Auditing Section</div>
        </div>
      );
    }
    
    return <div style={{ marginBottom: `${sectionGap}px` }}>{children}</div>;
  };

  const labels = {
    summary:        sectionLabels.summary        || 'Summary',
    education:      sectionLabels.education      || 'Education',
    skills:         sectionLabels.skills         || 'Skills',
    publications:   sectionLabels.publications   || 'Publications',
    projects:       sectionLabels.projects       || 'Projects',
    experience:     sectionLabels.experience     || 'Work Experience',
    certifications: sectionLabels.certifications || 'Certifications',
    achievements:   sectionLabels.achievements   || 'Achievements',
    leadership:     sectionLabels.leadership     || 'Leadership & Extracurriculars',
  };

  // ── Shared styles ──────────────────────────────────────────────────────
  const S = {
    page: {
      background: '#fff',
      fontFamily: fontStack,
      fontSize:   baseSize,
      color:      '#333',
      // 4-value padding: top/sides use pagePadding, bottom uses bottomMargin
      padding:    `${pagePadding}mm ${pagePadding + 2}mm ${bottomMargin}mm ${pagePadding + 2}mm`,
      boxSizing:  'border-box',
      lineHeight,
    },
    sectionWrap: { marginBottom: `${sectionGap}px` },
    secTitle: {
      fontSize: '1em', fontWeight: 700, textTransform: 'uppercase',
      borderBottom: '1.5px solid #111', paddingBottom: '2px',
      marginBottom: `${paragraphGap + 2}px`,
      letterSpacing: '0.05em', color: '#111',
    },
    entry:  { marginBottom: `${paragraphGap + 1}px` },
    row:    { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    bold:   { fontWeight: 700, color: '#111' },
    muted:  { color: '#555', fontSize: '0.9em' },
    indent: { paddingLeft: '14px', fontSize: '0.9em', color: '#444' },
    subIndent: { paddingLeft: '14px', fontSize: '0.9em', color: '#333' },
  };

  const SecTitle = ({ label }) => <h2 style={S.secTitle}>{label}</h2>;

  const renderSection = (id) => {
    if (hiddenSections?.includes(id)) return null;

    // ── SUMMARY ──────────────────────────────────────────────────────────
    if (id === 'summary' && summary) return getHighlightedSectionWrap(
      <div key="summary">
        <SecTitle label={labels.summary} />
        <p style={{ margin: 0, lineHeight, color: '#333' }}>{getHighlightedSummary(summary, activeAtsCategory)}</p>
      </div>,
      'summary',
      activeAtsCategory
    );

    // ── EDUCATION ─────────────────────────────────────────────────────────
    if (id === 'education' && education.some(e => !e.hidden)) return getHighlightedSectionWrap(
      <div key="education">
        <SecTitle label={labels.education} />
        {education.filter(e => !e.hidden).map((edu, i) => {
          let scoreLabel = '';
          let scoreValue = '';
          if (edu.showCgpa && edu.cgpa) {
            if (String(edu.cgpa).includes('%')) {
              scoreLabel = 'Percentage:';
              scoreValue = ` ${edu.cgpa}`;
            } else {
              scoreLabel = 'GPA:';
              scoreValue = ` ${edu.cgpa}`;
            }
          }
          const dateStr = [edu.startYear, edu.endYear].filter(Boolean).join(' – ');
          return (
            <div key={i} style={S.entry}>
              {/* Row 1: Institution bold | GPA: bold + value */}
              <div style={S.row}>
                <span style={S.bold}>{edu.institution}</span>
                {scoreLabel && (
                  <span style={{ fontSize: '0.9em', color: '#333', fontStyle: 'italic', ...(activeAtsCategory === 'education' ? { background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '1px 4px' } : {}) }}>
                    <span style={{ fontWeight: 700 }}>{scoreLabel}</span>
                    <span style={{ fontWeight: 700 }}>{scoreValue}</span>
                  </span>
                )}
              </div>
              {/* Row 2: Degree, Field italic | Year italic */}
              <div style={S.row}>
                <span style={{ color: '#333', fontSize: '0.92em', fontStyle: 'italic', ...(activeAtsCategory === 'education' ? { background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '1px 4px' } : {}) }}>
                  {[edu.degree, edu.field].filter(Boolean).join(', ')}
                </span>
                <span style={{ color: '#555', fontSize: '0.88em', fontStyle: 'italic' }}>{dateStr}</span>
              </div>
              {edu.coursework && (
                <div style={{ fontSize: '0.85em', color: '#555', marginTop: '2px', ...(activeAtsCategory === 'education' || activeAtsCategory === 'internship' ? { background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '1px 4px' } : {}) }}>
                  Coursework: {edu.coursework}
                </div>
              )}
            </div>
          );
        })}
      </div>,
      'education',
      activeAtsCategory
    );

    // ── SKILLS ────────────────────────────────────────────────────────────
    if (id === 'skills' && skillGroups.length > 0) return getHighlightedSectionWrap(
      <div key="skills">
        <SecTitle label={labels.skills} />
        {skillGroups.map((g, i) => (
          <div key={i} style={{ display: 'flex', marginBottom: `${paragraphGap - 1}px`, fontSize: '0.95em', lineHeight, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#111', whiteSpace: 'nowrap', marginRight: '4px' }}>
              {g.category}:
            </span>
            <span style={{ color: '#333', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px' }}>
              {getHighlightedSkills(g.skills, activeAtsCategory)}
            </span>
          </div>
        ))}
      </div>,
      'skills',
      activeAtsCategory
    );

    // ── PUBLICATIONS ──────────────────────────────────────────────────────
    if (id === 'publications' && publications.some(p => !p.hidden)) return getHighlightedSectionWrap(
      <div key="publications">
        <SecTitle label={labels.publications} />
        {publications.filter(p => !p.hidden).map((pub, i) => (
          <div key={i} style={S.entry}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={S.bullet}>•</span>
              <span style={{ fontWeight: 600, color: '#111' }}>{pub.title}</span>
            </div>
            {(pub.publisher || pub.year) && (
              <div style={{ ...S.indent, fontStyle: 'italic', color: '#555' }}>
                - {[pub.publisher, pub.year].filter(Boolean).join(' — ')}
              </div>
            )}
            {pub.description && <div style={S.indent}>{getHighlightedBullet(pub.description, activeAtsCategory)}</div>}
          </div>
        ))}
      </div>,
      'publications',
      activeAtsCategory
    );

    // ── PROJECTS ──────────────────────────────────────────────────────────
    if (id === 'projects' && projects.some(p => !p.hidden)) return getHighlightedSectionWrap(
      <div key="projects">
        <SecTitle label={labels.projects} />
        {projects.filter(p => !p.hidden).map((proj, i) => (
          <div key={i} style={S.entry}>
            {/* • Name bold */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ color: '#333', flexShrink: 0 }}>•</span>
              <span style={{ fontWeight: 700, color: '#111' }}>{proj.name}</span>
            </div>
            {/* Tech Stack: as sub-bullet on its own line */}
            {proj.techStack?.length > 0 && (
              <div style={{ ...S.subIndent, marginTop: '1px' }}>
                <span style={{ fontWeight: 700, color: '#111' }}>Tech Stack: </span>
                <span style={{ color: '#444' }}>{proj.techStack.join(', ')}</span>
              </div>
            )}
            {/* – description */}
            {proj.description && (
              <div style={{ ...S.indent, marginTop: '1px', lineHeight }}>
                – {getHighlightedBullet(proj.description, activeAtsCategory)}
              </div>
            )}
          </div>
        ))}
      </div>,
      'projects',
      activeAtsCategory
    );

    // ── EXPERIENCE ────────────────────────────────────────────────────────
    if (id === 'experience' && experience.some(e => !e.hidden)) return getHighlightedSectionWrap(
      <div key="experience">
        <SecTitle label={labels.experience} />
        {experience.filter(e => !e.hidden).map((exp, i) => {
          const dateStr = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
          return (
            <div key={i} style={S.entry}>
              {/* • Role, Company  |  Date */}
              <div style={S.row}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#333', flexShrink: 0 }}>•</span>
                  <span style={{ fontWeight: 700, color: '#111' }}>{exp.role}</span>
                  {exp.company && (
                    <span style={{ fontWeight: 700, color: '#111' }}>
                      {' '}{exp.company}
                    </span>
                  )}
                </span>
                <span style={{ color: '#555', fontSize: '0.88em', whiteSpace: 'nowrap', paddingLeft: '8px', fontStyle: 'italic' }}>
                  {dateStr}
                </span>
              </div>
              {/* – bullet points */}
              {(exp.bullets || []).filter(b => b?.trim()).map((b, bi) => (
                <div key={bi} style={{ ...S.indent, lineHeight, marginTop: '1px' }}>
                  – {getHighlightedBullet(b.replace(/^[•\-–]\s*/, ''), activeAtsCategory)}
                </div>
              ))}
            </div>
          );
        })}
      </div>,
      'experience',
      activeAtsCategory
    );

    // ── CERTIFICATIONS ────────────────────────────────────────────────────
    if (id === 'certifications' && certifications.some(c => !c.hidden)) return getHighlightedSectionWrap(
      <div key="certifications">
        <SecTitle label={labels.certifications} />
        <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'disc' }}>
          {certifications.filter(c => !c.hidden).map((cert, i) => (
            <li key={i} style={{ marginBottom: `${paragraphGap - 1}px`, color: '#333', lineHeight }}>
              <span style={{ fontWeight: 600, color: '#111', ...(activeAtsCategory === 'certifications' ? { background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '1px 4px' } : {}) }}>{cert.name}</span>
              {cert.issuer && <span style={{ color: '#555' }}> — {cert.issuer}</span>}
              {cert.year   && <span style={{ color: '#555' }}> ({cert.year})</span>}
            </li>
          ))}
        </ul>
      </div>,
      'certifications',
      activeAtsCategory
    );

    // ── ACHIEVEMENTS ──────────────────────────────────────────────────────
    if (id === 'achievements' && achievements.some(a => !a.hidden)) return getHighlightedSectionWrap(
      <div key="achievements">
        <SecTitle label={labels.achievements} />
        <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'disc' }}>
          {achievements.filter(a => !a.hidden).map((a, i) => (
            <li key={i} style={{ marginBottom: `${paragraphGap - 1}px`, color: '#333', lineHeight, ...(activeAtsCategory === 'achievements' ? { background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '2px 6px' } : {}) }}>
              {a.title && <span style={{ fontWeight: 600, color: '#111' }}>{a.title}: </span>}
              {a.description}
            </li>
          ))}
        </ul>
      </div>,
      'achievements',
      activeAtsCategory
    );

    // ── LEADERSHIP ────────────────────────────────────────────────────────
    if (id === 'leadership' && leadership.some(l => !l.hidden)) return getHighlightedSectionWrap(
      <div key="leadership">
        <SecTitle label={labels.leadership} />
        <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'disc' }}>
          {leadership.filter(l => !l.hidden).map((item, i) => (
            <li key={i} style={{ marginBottom: `${paragraphGap - 1}px`, color: '#333', lineHeight, ...(activeAtsCategory === 'leadership' ? { background: 'rgba(44, 165, 141, 0.08)', border: '1px dashed rgba(44, 165, 141, 0.3)', borderRadius: '4px', padding: '2px 6px' } : {}) }}>
              {item.title && <span style={{ fontWeight: 600, color: '#111' }}>{item.title}</span>}
              {item.organization && <span style={{ color: '#555' }}>: {item.organization}</span>}
              {item.description  && <span style={{ color: '#444' }}> — {item.description}</span>}
            </li>
          ))}
        </ul>
      </div>,
      'leadership',
      activeAtsCategory
    );

    return null;
  };

  // ── Contact line ────────────────────────────────────────────────────────
  const contacts = [
    header.email,
    header.phone,
    header.location,
    header.linkedin ? header.linkedin.replace(/^https?:\/\//, '') : '',
    header.github   ? header.github.replace(/^https?:\/\//, '')   : '',
    header.portfolio? header.portfolio.replace(/^https?:\/\//, ''): '',
  ].filter(Boolean);

  return (
    <div style={S.page}>
      {/* ── HEADER ──────────────────────────────────────────── */}
      {!hiddenSections?.includes('header') && (
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          {/* Name — inherits fontStack, no hardcoded Arial */}
          <h1 style={{
            fontSize: '1.8em', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: '#000', margin: '0 0 2px 0',
            fontFamily: fontStack,
          }}>
            {header.fullName}
          </h1>
          {header.title && (
            <div style={{ fontSize: '0.92em', color: '#555', marginBottom: '3px' }}>
              {header.title}
            </div>
          )}
          {/* Contact on one line with • separators */}
          <div style={{
            fontSize: '0.82em', color: '#444',
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', gap: '0 2px',
          }}>
            {contacts.map((c, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: '#999', margin: '0 4px' }}>•</span>}
                {c}
              </span>
            ))}
          </div>
          {/* Thick horizontal divider below header — matches reference PDF */}
          <div style={{
            borderBottom: '2px solid #111',
            marginTop: '8px',
            marginBottom: `${sectionGap}px`,
          }} />
        </div>
      )}

      {/* ── BODY SECTIONS ──────────────────────────────────── */}
      {sectionOrder.map(id => renderSection(id))}
    </div>
  );
};

export default ClassicTemplate;
