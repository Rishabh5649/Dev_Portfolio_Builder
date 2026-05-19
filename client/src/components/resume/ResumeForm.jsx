import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setResumeData } from '../../store/resumeSlice';
import SectionReorder from './SectionReorder';
import EditableLabel from './EditableLabel';
import { ChevronDown, Plus, Trash2, Zap, Settings2 } from 'lucide-react';

const FONTS = ['Georgia','Times New Roman','Garamond','Merriweather','Inter','Calibri','Helvetica','Lato','Poppins'];

const SliderRow = ({ label, value, min, max, step = 0.1, unit = '', onChange }) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
  </div>
);

/* ─── Small helpers ──────────────────────────────────────────────────────── */
const Label = ({ children }) => (
  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
    {children}
  </label>
);

const Input = ({ value = '', onChange, placeholder, style }) => (
  <input
    className="form-input"
    value={value ?? ''}
    onChange={onChange}
    placeholder={placeholder}
    style={style}
  />
);

const Grid2 = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

const AddBtn = ({ onClick, label = 'Add Item' }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 14px', border: '1px dashed var(--border)',
      borderRadius: '6px', background: 'transparent',
      color: 'var(--accent)', cursor: 'pointer', fontSize: '12px',
      fontWeight: 600, transition: 'all 0.2s', marginTop: '8px',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.08)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    <Plus size={13} /> {label}
  </button>
);

const RemoveBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute', top: '10px', right: '10px',
      background: 'transparent', border: 'none',
      color: 'var(--text-muted)', cursor: 'pointer', padding: '2px',
      display: 'flex', alignItems: 'center',
    }}
    title="Remove"
  >
    <Trash2 size={14} />
  </button>
);

const Card = ({ children }) => (
  <div style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderLeft: '3px solid var(--accent)', borderRadius: '8px',
    padding: '14px', marginBottom: '10px', position: 'relative',
  }}>
    {children}
  </div>
);

/* ────────────────────────────────────────────────────────────────────────── */
const ResumeForm = ({ onAutoFit }) => {
  const dispatch = useDispatch();
  const { data, isDirty } = useSelector(s => s.resume);
  const [form, setForm] = useState(data);
  const [open, setOpen] = useState({ header: true, summary: true });

  // Sync from store on initial load (not while user is editing)
  useEffect(() => {
    if (data && !isDirty) setForm(data);
  }, [data, isDirty]);

  const update = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    dispatch(setResumeData(next));
  };

  const header = (f, v) => update('header', { ...form.header, [f]: v });
  const label  = (k, v) => update('sectionLabels', { ...form.sectionLabels, [k]: v });
  const toggle = (s) => setOpen(p => ({ ...p, [s]: !p[s] }));

  // Generic list helpers
  const addItem    = (field, item) => update(field, [...(form[field] || []), item]);
  const removeItem = (field, idx)  => update(field, (form[field] || []).filter((_, i) => i !== idx));
  const editItem   = (field, idx, patch) => {
    const list = [...(form[field] || [])];
    list[idx] = { ...list[idx], ...patch };
    update(field, list);
  };

  if (!form) return null;

  const sectionContent = (section) => {
    /* ── HEADER ─────────────────────────────────────────────────────────── */
    if (section === 'header') return (
      <div>
        <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>Contact Info</h4>
        <Grid2>
          <Field label="Full Name"><Input value={form.header?.fullName} onChange={e => header('fullName', e.target.value)} placeholder="Rishabh Singh" /></Field>
          <Field label="Professional Title"><Input value={form.header?.title} onChange={e => header('title', e.target.value)} placeholder="Full Stack Developer" /></Field>
          <Field label="Email"><Input value={form.header?.email} onChange={e => header('email', e.target.value)} placeholder="you@email.com" /></Field>
          <Field label="Phone"><Input value={form.header?.phone} onChange={e => header('phone', e.target.value)} placeholder="+91 8095767240" /></Field>
          <Field label="Location"><Input value={form.header?.location} onChange={e => header('location', e.target.value)} placeholder="Bangalore" /></Field>
        </Grid2>
        <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', marginTop: '14px', textTransform: 'uppercase' }}>Links</h4>
        <Grid2>
          <Field label="LinkedIn"><Input value={form.header?.linkedin} onChange={e => header('linkedin', e.target.value)} placeholder="linkedin.com/in/..." /></Field>
          <Field label="GitHub"><Input value={form.header?.github} onChange={e => header('github', e.target.value)} placeholder="github.com/..." /></Field>
          <Field label="Portfolio Website"><Input value={form.header?.portfolio} onChange={e => header('portfolio', e.target.value)} placeholder="yoursite.com" /></Field>
        </Grid2>
      </div>
    );

    /* ── SUMMARY ─────────────────────────────────────────────────────────── */
    if (section === 'summary') return (
      <div>
        <Label>Professional Summary</Label>
        <textarea
          className="form-textarea"
          value={form.summary ?? ''}
          onChange={e => update('summary', e.target.value)}
          placeholder="Information Science student with a strong foundation in software development and machine learning..."
          maxLength={500}
          style={{ minHeight: '100px' }}
        />
        <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {(form.summary?.length || 0)} / 500
        </div>
      </div>
    );

    /* ── EDUCATION ───────────────────────────────────────────────────────── */
    if (section === 'education') return (
      <div>
        {(form.education || []).map((edu, idx) => (
          <Card key={idx}>
            <RemoveBtn onClick={() => removeItem('education', idx)} />
            <Grid2>
              <Field label="Institution"><Input value={edu.institution} onChange={e => editItem('education', idx, { institution: e.target.value })} placeholder="RV Institute of Technology" /></Field>
              <Field label="Degree"><Input value={edu.degree} onChange={e => editItem('education', idx, { degree: e.target.value })} placeholder="BE" /></Field>
              <Field label="Field / Branch"><Input value={edu.field} onChange={e => editItem('education', idx, { field: e.target.value })} placeholder="Computer Science and Engineering" /></Field>
              <Field label="GPA / Percentage"><Input value={edu.cgpa} onChange={e => editItem('education', idx, { cgpa: e.target.value, showCgpa: true })} placeholder="9.00 / 97%" /></Field>
              <Field label="Start Year"><Input value={edu.startYear} onChange={e => editItem('education', idx, { startYear: e.target.value })} placeholder="2023" /></Field>
              <Field label="End Year"><Input value={edu.endYear} onChange={e => editItem('education', idx, { endYear: e.target.value })} placeholder="Expected 2027" /></Field>
            </Grid2>
          </Card>
        ))}
        <AddBtn onClick={() => addItem('education', { institution: '', degree: '', field: '', startYear: '', endYear: '', cgpa: '', showCgpa: true, hidden: false })} label="Add Education" />
      </div>
    );

    /* ── SKILLS ─────────────────────────────────────────────────────────── */
    if (section === 'skills') return (
      <div>
        {(form.skillGroups || []).map((grp, idx) => (
          <Card key={idx}>
            <RemoveBtn onClick={() => removeItem('skillGroups', idx)} />
            <Grid2>
              <Field label="Category">
                <Input value={grp.category} onChange={e => editItem('skillGroups', idx, { category: e.target.value })} placeholder="Programming Languages" />
              </Field>
              <Field label="Skills (comma-separated)">
                <Input
                  value={(grp.skills || []).join(', ')}
                  onChange={e => editItem('skillGroups', idx, { skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="Python, C++, Java"
                />
              </Field>
            </Grid2>
          </Card>
        ))}
        <AddBtn onClick={() => addItem('skillGroups', { category: '', skills: [] })} label="Add Skill Group" />
      </div>
    );

    /* ── PUBLICATIONS ────────────────────────────────────────────────────── */
    if (section === 'publications') return (
      <div>
        {(form.publications || []).map((pub, idx) => (
          <Card key={idx}>
            <RemoveBtn onClick={() => removeItem('publications', idx)} />
            <Field label="Publication Title">
              <Input value={pub.title} onChange={e => editItem('publications', idx, { title: e.target.value })} placeholder="Selective Motion Deblurring Using Adaptive Spatial Filtering..." style={{ marginBottom: '8px' }} />
            </Field>
            <Grid2>
              <Field label="Publisher / Journal"><Input value={pub.publisher} onChange={e => editItem('publications', idx, { publisher: e.target.value })} placeholder="IOSR Journal of Computer Engineering" /></Field>
              <Field label="Year"><Input value={pub.year} onChange={e => editItem('publications', idx, { year: e.target.value })} placeholder="2024" /></Field>
            </Grid2>
            <Field label="Description">
              <Input value={pub.description} onChange={e => editItem('publications', idx, { description: e.target.value })} placeholder="Published in Volume 27, Issue 02" />
            </Field>
          </Card>
        ))}
        <AddBtn onClick={() => addItem('publications', { title: '', publisher: '', year: '', description: '', hidden: false })} label="Add Publication" />
      </div>
    );

    /* ── PROJECTS ────────────────────────────────────────────────────────── */
    if (section === 'projects') return (
      <div>
        {(form.projects || []).map((proj, idx) => (
          <Card key={idx}>
            <RemoveBtn onClick={() => removeItem('projects', idx)} />
            <Field label="Project Name">
              <Input value={proj.name} onChange={e => editItem('projects', idx, { name: e.target.value })} placeholder="VIZURA: AI-Powered Business Process Automation" style={{ marginBottom: '8px' }} />
            </Field>
            <Field label="Tech Stack (comma-separated)">
              <Input
                value={(proj.techStack || []).join(', ')}
                onChange={e => editItem('projects', idx, { techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="Python, PyTorch, FastAPI, React"
                style={{ marginBottom: '8px' }}
              />
            </Field>
            <Grid2>
              <Field label="GitHub Link"><Input value={proj.githubLink} onChange={e => editItem('projects', idx, { githubLink: e.target.value })} placeholder="github.com/user/project" /></Field>
              <Field label="Live Demo Link"><Input value={proj.liveLink} onChange={e => editItem('projects', idx, { liveLink: e.target.value })} placeholder="yourproject.vercel.app" /></Field>
            </Grid2>
            <Field label="Description (bullet point)">
              <textarea
                className="form-textarea"
                value={proj.description ?? ''}
                onChange={e => editItem('projects', idx, { description: e.target.value })}
                placeholder="Built a system that... achieving 90.2% F1-score"
                style={{ minHeight: '70px' }}
              />
            </Field>
          </Card>
        ))}
        <AddBtn onClick={() => addItem('projects', { name: '', description: '', techStack: [], githubLink: '', liveLink: '', hidden: false })} label="Add Project" />
      </div>
    );

    /* ── EXPERIENCE ──────────────────────────────────────────────────────── */
    if (section === 'experience') return (
      <div>
        {(form.experience || []).map((exp, idx) => (
          <Card key={idx}>
            <RemoveBtn onClick={() => removeItem('experience', idx)} />
            <Grid2>
              <Field label="Company / Organization"><Input value={exp.company} onChange={e => editItem('experience', idx, { company: e.target.value })} placeholder="JITSIE, IITM" /></Field>
              <Field label="Role / Title"><Input value={exp.role} onChange={e => editItem('experience', idx, { role: e.target.value })} placeholder="Content Research & Team Lead Intern" /></Field>
              <Field label="Start Date"><Input value={exp.startDate} onChange={e => editItem('experience', idx, { startDate: e.target.value })} placeholder="Sept 2023" /></Field>
              <Field label="End Date"><Input value={exp.endDate} onChange={e => editItem('experience', idx, { endDate: e.target.value })} placeholder="Dec 2023 / Present" /></Field>
            </Grid2>
            <Field label="Location"><Input value={exp.location} onChange={e => editItem('experience', idx, { location: e.target.value })} placeholder="Bangalore, India" style={{ marginBottom: '8px' }} /></Field>
            <Field label="Key Achievements (one per line)">
              <textarea
                className="form-textarea"
                value={(exp.bullets || []).join('\n')}
                onChange={e => editItem('experience', idx, { bullets: e.target.value.split('\n') })}
                placeholder="Developed a startup incubation platform...&#10;Managed 2 teams of 6 researchers..."
                style={{ minHeight: '90px', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </Field>
          </Card>
        ))}
        <AddBtn onClick={() => addItem('experience', { company: '', role: '', startDate: '', endDate: '', current: false, location: '', bullets: [], hidden: false })} label="Add Experience" />
      </div>
    );

    /* ── CERTIFICATIONS ──────────────────────────────────────────────────── */
    if (section === 'certifications') return (
      <div>
        {(form.certifications || []).map((cert, idx) => (
          <Card key={idx}>
            <RemoveBtn onClick={() => removeItem('certifications', idx)} />
            <Grid2>
              <Field label="Certification Name"><Input value={cert.name} onChange={e => editItem('certifications', idx, { name: e.target.value })} placeholder="AWS Cloud Practitioner" /></Field>
              <Field label="Issuer"><Input value={cert.issuer} onChange={e => editItem('certifications', idx, { issuer: e.target.value })} placeholder="Amazon Web Services" /></Field>
              <Field label="Year"><Input value={cert.year} onChange={e => editItem('certifications', idx, { year: e.target.value })} placeholder="2024" /></Field>
              <Field label="Certificate Link"><Input value={cert.link} onChange={e => editItem('certifications', idx, { link: e.target.value })} placeholder="https://..." /></Field>
            </Grid2>
          </Card>
        ))}
        <AddBtn onClick={() => addItem('certifications', { name: '', issuer: '', year: '', link: '', hidden: false })} label="Add Certification" />
      </div>
    );

    /* ── ACHIEVEMENTS ────────────────────────────────────────────────────── */
    if (section === 'achievements') return (
      <div>
        {(form.achievements || []).map((ach, idx) => (
          <Card key={idx}>
            <RemoveBtn onClick={() => removeItem('achievements', idx)} />
            <Field label="Achievement Title"><Input value={ach.title} onChange={e => editItem('achievements', idx, { title: e.target.value })} placeholder="KVPY Scholar 2020" style={{ marginBottom: '8px' }} /></Field>
            <Field label="Description"><Input value={ach.description} onChange={e => editItem('achievements', idx, { description: e.target.value })} placeholder="National Science Fellowship..." /></Field>
          </Card>
        ))}
        <AddBtn onClick={() => addItem('achievements', { title: '', description: '', hidden: false })} label="Add Achievement" />
      </div>
    );

    /* ── LEADERSHIP ──────────────────────────────────────────────────────── */
    if (section === 'leadership') return (
      <div>
        {(form.leadership || []).map((item, idx) => (
          <Card key={idx}>
            <RemoveBtn onClick={() => removeItem('leadership', idx)} />
            <Grid2>
              <Field label="Role / Position"><Input value={item.title} onChange={e => editItem('leadership', idx, { title: e.target.value })} placeholder="Head of Algoholics" /></Field>
              <Field label="Organization"><Input value={item.organization} onChange={e => editItem('leadership', idx, { organization: e.target.value })} placeholder="Competitive Coding Club at RVITM" /></Field>
            </Grid2>
            <Field label="Description"><Input value={item.description} onChange={e => editItem('leadership', idx, { description: e.target.value })} placeholder="Organized weekly contests..." /></Field>
          </Card>
        ))}
        <AddBtn onClick={() => addItem('leadership', { title: '', organization: '', description: '', hidden: false })} label="Add Leadership Role" />
      </div>
    );

    /* ── SETTINGS ──────────────────────────────────────────────────────────── */
    if (section === 'settings') {
      const sp = form.spacing || {};
      const setSpacing = (k, v) => update('spacing', { ...form.spacing, [k]: v });

      // Auto Fit: delegate to builder which has DOM-accurate preview height
      const handleAutoFit = () => {
        if (onAutoFit) {
          // applyFn is called by the builder with the chosen fontSize + spacing
          onAutoFit((fontSize, spacing) => {
            const next = { ...form, fontSizeOverride: fontSize, spacing };
            setForm(next);
            dispatch(setResumeData(next));
          });
        } else {
          // Fallback heuristic if prop not provided
          const expCount  = (form.experience  || []).filter(e => !e.hidden).reduce((a, e) => a + 2 + (e.bullets?.length || 0), 0);
          const projCount = (form.projects    || []).filter(p => !p.hidden).length * 3;
          const eduCount  = (form.education   || []).filter(e => !e.hidden).length * 2;
          const sgCount   = (form.skillGroups || []).length;
          const total = 4 + Math.ceil((form.summary || '').length / 90) + expCount + projCount + eduCount + sgCount;
          let fontSize = 11, sectionGap = 10, lineHeight = 1.4, paragraphGap = 4, pagePadding = 10, bottomMargin = 4;
          if (total > 74) { fontSize=9;   sectionGap=4; lineHeight=1.2;  paragraphGap=1; pagePadding=5; bottomMargin=0; }
          else if (total > 62) { fontSize=9.5; sectionGap=6; lineHeight=1.3;  paragraphGap=2; pagePadding=7; bottomMargin=1; }
          else if (total > 52) { fontSize=10;  sectionGap=8; lineHeight=1.35; paragraphGap=3; pagePadding=9; bottomMargin=3; }
          const next = { ...form, fontSizeOverride: fontSize, spacing: { sectionGap, lineHeight, paragraphGap, pagePadding, bottomMargin } };
          setForm(next);
          dispatch(setResumeData(next));
        }
      };

      return (
        <div>
          {/* Template */}
          <div style={{ marginBottom: '14px' }}>
            <Label>Template Style</Label>
            <select value={form.template || 'classic'} onChange={e => update('template', e.target.value)} className="form-input" style={{ cursor: 'pointer' }}>
              <option value="classic">Classic Clean</option>
              <option value="modern">Modern Two-Column</option>
              <option value="minimal">Minimal Compact</option>
              <option value="developer">Creative Developer</option>
              <option value="executive">Executive Formal</option>
            </select>
          </div>

          {/* Font Style */}
          <div style={{ marginBottom: '14px' }}>
            <Label>Font Style</Label>
            <select value={form.fontFamily || 'Georgia'} onChange={e => update('fontFamily', e.target.value)} className="form-input" style={{ cursor: 'pointer' }}>
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Font Size + Auto Fit row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '14px', alignItems: 'flex-end' }}>
            <div>
              <Label>Font Size</Label>
              <select value={form.fontSizeOverride || ''} onChange={e => update('fontSizeOverride', e.target.value ? Number(e.target.value) : null)} className="form-input" style={{ cursor: 'pointer' }}>
                <option value="">Manual / Auto Fit</option>
                <option value="9">9 pt</option>
                <option value="9.5">9.5 pt</option>
                <option value="10">10 pt</option>
                <option value="10.5">10.5 pt</option>
                <option value="11">11 pt</option>
                <option value="12">12 pt</option>
              </select>
            </div>
            <button onClick={handleAutoFit} title="Intelligently fit all content onto one page" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', height: '36px' }}>
              <Zap size={13} /> Auto Fit
            </button>
          </div>

          {/* Spacing */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Spacing</div>
            <SliderRow label="Section Gap"   value={sp.sectionGap   ?? 10}  min={2}   max={24}  step={1}    unit="px" onChange={v => setSpacing('sectionGap',   v)} />
            <SliderRow label="Line Height"   value={sp.lineHeight   ?? 1.4}  min={1.0} max={2.0} step={0.05}          onChange={v => setSpacing('lineHeight',   v)} />
            <SliderRow label="Paragraph Gap" value={sp.paragraphGap ?? 4}    min={0}   max={16}  step={1}    unit="px" onChange={v => setSpacing('paragraphGap', v)} />
            <SliderRow label="Page Padding"  value={sp.pagePadding  ?? 10}   min={4}   max={20}  step={1}    unit="mm" onChange={v => setSpacing('pagePadding',  v)} />
            <SliderRow label="Bottom Margin" value={sp.bottomMargin ?? 4}    min={0}   max={10}  step={1}    unit="mm" onChange={v => setSpacing('bottomMargin', v)} />
          </div>

          {/* Manage Sections */}
          <div>
            <Label>Manage Sections</Label>
            <SectionReorder
              sections={form.sectionOrder.filter(s => s !== 'settings')}
              sectionLabels={form.sectionLabels}
              hiddenSections={form.hiddenSections || []}
              onChangeOrder={order => update('sectionOrder', [...order, 'settings'])}
              onChangeHidden={hidden => update('hiddenSections', hidden)}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  // All sections including settings at the end
  const allSections = [...(form.sectionOrder || []).filter(s => s !== 'settings'), 'settings'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '40px' }}>




      {/* ── All Sections (content + settings at bottom) ───────────────── */}
      <div style={{ padding: '0 20px' }}>
        {allSections.map(section => {
          const isSettings = section === 'settings';
          const isHidden   = !isSettings && form.hiddenSections?.includes(section);
          const isOpen     = open[section];

          return (
            <div
              key={section}
              id={`rb-section-${section}`}
              style={{
              marginBottom: '10px',
              background: isSettings
                ? 'var(--bg-elevated)'
                : isHidden ? 'rgba(108,99,255,0.06)' : 'var(--bg-elevated)',
              border: isSettings
                ? '1px solid rgba(108,99,255,0.35)'
                : `1px solid ${isHidden ? 'rgba(108,99,255,0.2)' : 'var(--border)'}`,
              borderRadius: '10px', overflow: 'hidden',
              opacity: isHidden ? 0.65 : 1,
            }}>
              {/* Section Header */}
              <div
                onClick={() => toggle(section)}
                style={{
                  padding: '12px 16px',
                  background: isSettings ? 'rgba(108,99,255,0.1)' : 'var(--bg-surface)',
                  borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={e => e.currentTarget.style.background = isSettings ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = isSettings ? 'rgba(108,99,255,0.1)' : 'var(--bg-surface)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSettings
                    ? <><Settings2 size={15} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>Settings</span></>
                    : <EditableLabel value={form.sectionLabels?.[section] || section} onChange={v => label(section, v)} style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }} />
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isHidden && (
                    <span style={{ fontSize: '10px', background: 'var(--danger)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>HIDDEN</span>
                  )}
                  <ChevronDown size={18} style={{ color: isSettings ? 'var(--accent)' : 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }} />
                </div>
              </div>

              {/* Section Content */}
              {isOpen && (
                <div style={{ padding: '16px' }}>
                  {sectionContent(section)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResumeForm;
