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

const ClassicTemplate = ({ data }) => {
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
      // This is what makes the bottom margin slider actually work in the preview
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
    if (id === 'summary' && summary) return (
      <div key="summary" style={S.sectionWrap}>
        <SecTitle label={labels.summary} />
        <p style={{ margin: 0, lineHeight, color: '#333' }}>{summary}</p>
      </div>
    );

    // ── EDUCATION ─────────────────────────────────────────────────────────
    if (id === 'education' && education.some(e => !e.hidden)) return (
      <div key="education" style={S.sectionWrap}>
        <SecTitle label={labels.education} />
        {education.filter(e => !e.hidden).map((edu, i) => {
          // Split into label + value so the label can be bold
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
                  <span style={{ fontSize: '0.9em', color: '#333', fontStyle: 'italic' }}>
                    <span style={{ fontWeight: 700 }}>{scoreLabel}</span>
                    <span style={{ fontWeight: 700 }}>{scoreValue}</span>
                  </span>
                )}
              </div>
              {/* Row 2: Degree, Field italic | Year italic */}
              <div style={S.row}>
                <span style={{ color: '#333', fontSize: '0.92em', fontStyle: 'italic' }}>
                  {[edu.degree, edu.field].filter(Boolean).join(', ')}
                </span>
                <span style={{ color: '#555', fontSize: '0.88em', fontStyle: 'italic' }}>{dateStr}</span>
              </div>
              {edu.coursework && (
                <div style={{ fontSize: '0.85em', color: '#555', marginTop: '2px' }}>
                  Coursework: {edu.coursework}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    // ── SKILLS ────────────────────────────────────────────────────────────
    if (id === 'skills' && skillGroups.length > 0) return (
      <div key="skills" style={S.sectionWrap}>
        <SecTitle label={labels.skills} />
        {skillGroups.map((g, i) => (
          <div key={i} style={{ display: 'flex', marginBottom: `${paragraphGap - 1}px`, fontSize: '0.95em', lineHeight }}>
            <span style={{ fontWeight: 700, color: '#111', whiteSpace: 'nowrap', marginRight: '4px' }}>
              {g.category}:
            </span>
            <span style={{ color: '#333' }}>{g.skills.join(', ')}</span>
          </div>
        ))}
      </div>
    );

    // ── PUBLICATIONS ──────────────────────────────────────────────────────
    if (id === 'publications' && publications.some(p => !p.hidden)) return (
      <div key="publications" style={S.sectionWrap}>
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
            {pub.description && <div style={S.indent}>{pub.description}</div>}
          </div>
        ))}
      </div>
    );

    // ── PROJECTS ──────────────────────────────────────────────────────────
    if (id === 'projects' && projects.some(p => !p.hidden)) return (
      <div key="projects" style={S.sectionWrap}>
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
                – {proj.description}
              </div>
            )}
          </div>
        ))}
      </div>
    );

    // ── EXPERIENCE ────────────────────────────────────────────────────────
    if (id === 'experience' && experience.some(e => !e.hidden)) return (
      <div key="experience" style={S.sectionWrap}>
        <SecTitle label={labels.experience} />
        {experience.filter(e => !e.hidden).map((exp, i) => {
          const dateStr = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
          return (
            <div key={i} style={S.entry}>
              {/* • Role, Company  |  Date — no extra comma before role */}
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
                  – {b.replace(/^[•\-–]\s*/, '')}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );

    // ── CERTIFICATIONS ────────────────────────────────────────────────────
    if (id === 'certifications' && certifications.some(c => !c.hidden)) return (
      <div key="certifications" style={S.sectionWrap}>
        <SecTitle label={labels.certifications} />
        <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'disc' }}>
          {certifications.filter(c => !c.hidden).map((cert, i) => (
            <li key={i} style={{ marginBottom: `${paragraphGap - 1}px`, color: '#333', lineHeight }}>
              <span style={{ fontWeight: 600, color: '#111' }}>{cert.name}</span>
              {cert.issuer && <span style={{ color: '#555' }}> — {cert.issuer}</span>}
              {cert.year   && <span style={{ color: '#555' }}> ({cert.year})</span>}
            </li>
          ))}
        </ul>
      </div>
    );

    // ── ACHIEVEMENTS ──────────────────────────────────────────────────────
    if (id === 'achievements' && achievements.some(a => !a.hidden)) return (
      <div key="achievements" style={S.sectionWrap}>
        <SecTitle label={labels.achievements} />
        <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'disc' }}>
          {achievements.filter(a => !a.hidden).map((a, i) => (
            <li key={i} style={{ marginBottom: `${paragraphGap - 1}px`, color: '#333', lineHeight }}>
              {a.title && <span style={{ fontWeight: 600, color: '#111' }}>{a.title}: </span>}
              {a.description}
            </li>
          ))}
        </ul>
      </div>
    );

    // ── LEADERSHIP ────────────────────────────────────────────────────────
    if (id === 'leadership' && leadership.some(l => !l.hidden)) return (
      <div key="leadership" style={S.sectionWrap}>
        <SecTitle label={labels.leadership} />
        <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'disc' }}>
          {leadership.filter(l => !l.hidden).map((item, i) => (
            <li key={i} style={{ marginBottom: `${paragraphGap - 1}px`, color: '#333', lineHeight }}>
              {item.title && <span style={{ fontWeight: 600, color: '#111' }}>{item.title}</span>}
              {item.organization && <span style={{ color: '#555' }}>: {item.organization}</span>}
              {item.description  && <span style={{ color: '#444' }}>{item.description}</span>}
            </li>
          ))}
        </ul>
      </div>
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
