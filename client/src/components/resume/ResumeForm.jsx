import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setResumeData, updateResume } from '../../store/resumeSlice';
import ResumeTemplateSelector from './ResumeTemplateSelector';
import SectionReorder from './SectionReorder';
import EditableLabel from './EditableLabel';
import ExportButtons from './ExportButtons';
import { Save } from 'lucide-react';

const ResumeForm = () => {
  const dispatch = useDispatch();
  const { data, isDirty } = useSelector(state => state.resume);
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);

  // Sync prop changes to local form state (helpful for initial load)
  useEffect(() => {
    if (data && !isDirty) {
      setFormData(data);
    }
  }, [data, isDirty]);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    dispatch(setResumeData(newData)); // Dispatch optimistic update to redux for Live Preview!
  };

  const handleHeaderChange = (field, value) => {
    handleChange('header', { ...formData.header, [field]: value });
  };

  const handleLabelChange = (key, val) => {
    handleChange('sectionLabels', { ...formData.sectionLabels, [key]: val });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    await dispatch(updateResume({ id: formData._id, data: formData }));
    setIsSaving(false);
  };

  if (!formData) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Save & Export Controls */}
      <div style={{
        background: 'var(--bg-elevated)', padding: '16px',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 20
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '12px'
        }}>
          <h2 style={{
            fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0
          }}>Document Settings</h2>
          <button
            onClick={saveChanges}
            disabled={!isDirty || isSaving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: isDirty && !isSaving ? 'var(--accent)' : 'var(--bg-surface)',
              color: isDirty && !isSaving ? '#fff' : 'var(--text-muted)',
              cursor: isDirty && !isSaving ? 'pointer' : 'not-allowed',
              fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
              opacity: (!isDirty || isSaving) ? 0.5 : 1
            }}>
            <Save size={14} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        {/* Font size manual override */}
        <div style={{
          marginBottom: '12px', fontSize: '13px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'var(--text-secondary)'
        }}>
          <span>Font Size Override:</span>
          <select 
            value={formData.fontSizeOverride || ''} 
            onChange={(e) => handleChange('fontSizeOverride', e.target.value ? Number(e.target.value) : null)}
            style={{
              marginLeft: '12px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '6px 12px',
              background: 'var(--bg-surface)', color: 'var(--text-primary)',
              fontSize: '12px', cursor: 'pointer', outline: 'none'
            }}
          >
            <option value="">Auto-Fit (Smart)</option>
            <option value="9">9 pt</option>
            <option value="9.5">9.5 pt</option>
            <option value="10">10 pt</option>
            <option value="10.5">10.5 pt</option>
            <option value="11">11 pt</option>
            <option value="12">12 pt</option>
          </select>
        </div>

        <ResumeTemplateSelector
          currentTemplate={formData.template}
          onSelect={(t) => handleChange('template', t)}
        />
        
        <SectionReorder
          sections={formData.sectionOrder}
          sectionLabels={formData.sectionLabels}
          hiddenSections={formData.hiddenSections || []}
          onChangeOrder={(order) => handleChange('sectionOrder', order)}
          onChangeHidden={(hidden) => handleChange('hiddenSections', hidden)}
        />

        <ExportButtons />
      </div>

      {/* Editor Sections based on active layout order */}
      {formData.sectionOrder.map((section) => {
        
        const isHidden = formData.hiddenSections?.includes(section);
        
        return (
          <div key={section} style={{
            background: 'var(--bg-elevated)', padding: '16px',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
            opacity: isHidden ? 0.5 : 1, transition: 'opacity 0.2s'
          }}>
            
            <div style={{
              marginBottom: '16px', paddingBottom: '12px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <EditableLabel
                value={formData.sectionLabels[section] || section}
                onChange={(v) => handleLabelChange(section, v)}
                style={{
                  fontSize: '16px', fontWeight: 700,
                  color: 'var(--text-primary)', textTransform: 'capitalize'
                }}
              />
              {isHidden && <span style={{
                fontSize: '11px', background: 'var(--accent-dim)',
                color: 'var(--accent)', padding: '4px 10px', borderRadius: '4px',
                fontWeight: 600, textTransform: 'uppercase'
              }}>Hidden</span>}
            </div>

            {section === 'header' && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <input className="form-input" placeholder="Full Name" value={formData.header.fullName} onChange={(e) => handleHeaderChange('fullName', e.target.value)} />
                <input className="form-input" placeholder="Professional Title / Headline" value={formData.header.title} onChange={(e) => handleHeaderChange('title', e.target.value)} />
                <input className="form-input" placeholder="Email" value={formData.header.email} onChange={(e) => handleHeaderChange('email', e.target.value)} />
                <input className="form-input" placeholder="Phone" value={formData.header.phone} onChange={(e) => handleHeaderChange('phone', e.target.value)} />
                <input className="form-input" placeholder="Location" value={formData.header.location} onChange={(e) => handleHeaderChange('location', e.target.value)} />
                <input className="form-input" placeholder="LinkedIn URL" value={formData.header.linkedin} onChange={(e) => handleHeaderChange('linkedin', e.target.value)} />
                <input className="form-input" placeholder="GitHub URL" value={formData.header.github} onChange={(e) => handleHeaderChange('github', e.target.value)} />
                <input className="form-input" placeholder="Portfolio URL" value={formData.header.portfolio} onChange={(e) => handleHeaderChange('portfolio', e.target.value)} />
              </div>
            )}

            {section === 'summary' && (
              <div>
                <textarea
                  className="form-textarea"
                  placeholder="Professional Summary (keep it to 2-3 lines for best fit)"
                  value={formData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  maxLength={500}
                  style={{ minHeight: '100px' }}
                />
                <div style={{
                  textAlign: 'right', fontSize: '11px',
                  color: 'var(--text-muted)', marginTop: '6px'
                }}>
                  {formData.summary?.length || 0} / 300 recommended chars
                </div>
              </div>
            )}

            {section === 'experience' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <p style={{
                   fontSize: '12px', color: 'var(--text-muted)',
                   fontStyle: 'italic', margin: 0
                 }}>Hint: Edit list items directly in the form below. To add/remove items massively, update your main Portfolio.</p>
                 {formData.experience?.map((exp, idx) => (
                   <div key={idx} style={{
                     background: 'var(--bg-surface)', padding: '12px',
                     border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)'
                   }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                       <input className="form-input" placeholder="Company" value={exp.company} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, company: e.target.value}; handleChange('experience', newE);
                       }} style={{ fontWeight: 600 }} />
                       <input className="form-input" placeholder="Start Date - End Date" value={`${exp.startDate} - ${exp.endDate}`} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, endDate: e.target.value.split('-')[1]?.trim(), startDate: e.target.value.split('-')[0]?.trim()}; handleChange('experience', newE);
                       }} style={{ textAlign: 'right' }} />
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                       <input className="form-input" placeholder="Role" value={exp.role} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, role: e.target.value}; handleChange('experience', newE);
                       }} style={{ fontStyle: 'italic' }} />
                       <input className="form-input" placeholder="Location" value={exp.location} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, location: e.target.value}; handleChange('experience', newE);
                       }} style={{ fontStyle: 'italic', textAlign: 'right' }} />
                     </div>
                     <textarea className="form-textarea" placeholder="Bullets (one per line)" value={exp.bullets?.join('\n') || ''} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, bullets: e.target.value.split('\n')}; handleChange('experience', newE);
                     }} style={{ minHeight: '80px' }} />
                   </div>
                 ))}
               </div>
            )}

            {/* Auto-synced sections */}
            {section === 'education' && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Auto-synced from portfolio. Edit fields in Portfolio Builder.
              </div>
            )}
            {section === 'skills' && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Auto-synced from portfolio. Edit fields in Portfolio Builder.
              </div>
            )}
            {section === 'projects' && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Auto-synced from portfolio. Edit fields in Portfolio Builder.
              </div>
            )}
            {section === 'certifications' && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Auto-synced from portfolio. Edit fields in Portfolio Builder.
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default ResumeForm;
