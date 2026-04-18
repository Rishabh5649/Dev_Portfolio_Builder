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
    <div className="space-y-8 pb-10">
      
      {/* Save & Export Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Document Settings</h2>
          <button
            onClick={saveChanges}
            disabled={!isDirty || isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        
        {/* Font size manual override */}
        <div className="mb-2 text-sm text-gray-700 flex items-center justify-between">
          <span>Font Size Override:</span>
          <select 
            value={formData.fontSizeOverride || ''} 
            onChange={(e) => handleChange('fontSizeOverride', e.target.value ? Number(e.target.value) : null)}
            className="ml-2 border border-gray-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
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
        
        // Hide from form editor visually if user hid it entirely? 
        // No, we should let them edit it, but maybe style it faded.
        const isHidden = formData.hiddenSections?.includes(section);
        
        return (
          <div key={section} className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-opacity ${isHidden ? 'opacity-50' : ''}`}>
            
            <div className="mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              <EditableLabel
                value={formData.sectionLabels[section] || section}
                onChange={(v) => handleLabelChange(section, v)}
                className="text-xl font-bold text-gray-900 capitalize"
              />
              {isHidden && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-medium">HIDDEN</span>}
            </div>

            {section === 'header' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input-field" placeholder="Full Name" value={formData.header.fullName} onChange={(e) => handleHeaderChange('fullName', e.target.value)} />
                <input className="input-field" placeholder="Professional Title / Headline" value={formData.header.title} onChange={(e) => handleHeaderChange('title', e.target.value)} />
                <input className="input-field" placeholder="Email" value={formData.header.email} onChange={(e) => handleHeaderChange('email', e.target.value)} />
                <input className="input-field" placeholder="Phone" value={formData.header.phone} onChange={(e) => handleHeaderChange('phone', e.target.value)} />
                <input className="input-field" placeholder="Location" value={formData.header.location} onChange={(e) => handleHeaderChange('location', e.target.value)} />
                <input className="input-field" placeholder="LinkedIn URL" value={formData.header.linkedin} onChange={(e) => handleHeaderChange('linkedin', e.target.value)} />
                <input className="input-field" placeholder="GitHub URL" value={formData.header.github} onChange={(e) => handleHeaderChange('github', e.target.value)} />
                <input className="input-field" placeholder="Portfolio URL" value={formData.header.portfolio} onChange={(e) => handleHeaderChange('portfolio', e.target.value)} />
              </div>
            )}

            {section === 'summary' && (
              <div>
                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Professional Summary (keep it to 2-3 lines for best fit)"
                  value={formData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.summary?.length || 0} / 300 recommended chars
                </div>
              </div>
            )}

            {section === 'experience' && (
               <div className="space-y-4">
                 <p className="text-sm text-gray-500 italic block">Hint: Edit list items directly in the form below. To add/remove items massively, update your main Portfolio.</p>
                 {formData.experience?.map((exp, idx) => (
                   <div key={idx} className="bg-gray-50 p-4 border rounded">
                     <div className="grid grid-cols-2 gap-2 mb-2">
                       <input className="input-field font-semibold" placeholder="Company" value={exp.company} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, company: e.target.value}; handleChange('experience', newE);
                       }} />
                       <input className="input-field text-right" placeholder="Start Date - End Date" value={`${exp.startDate} - ${exp.endDate}`} onChange={e => {
                         // Simple merge for UX sake in editor
                         const newE = [...formData.experience]; newE[idx] = {...exp, endDate: e.target.value.split('-')[1]?.trim(), startDate: e.target.value.split('-')[0]?.trim()}; handleChange('experience', newE);
                       }} />
                     </div>
                     <div className="grid grid-cols-2 gap-2 mb-2">
                       <input className="input-field italic" placeholder="Role" value={exp.role} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, role: e.target.value}; handleChange('experience', newE);
                       }} />
                       <input className="input-field text-right italic" placeholder="Location" value={exp.location} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, location: e.target.value}; handleChange('experience', newE);
                       }} />
                     </div>
                     <textarea className="input-field min-h-[80px]" placeholder="Bullets (one per line)" value={exp.bullets?.join('\n') || ''} onChange={e => {
                         const newE = [...formData.experience]; newE[idx] = {...exp, bullets: e.target.value.split('\n')}; handleChange('experience', newE);
                     }} />
                   </div>
                 ))}
               </div>
            )}

            {/* Keeping education/skills/projects simple for brevity in the form UI */}
            {section === 'education' && (
              <div className="text-sm text-gray-500 italic">Auto-synced from portfolio. Edit fields in Portfolio Builder.</div>
            )}
            {section === 'skills' && (
              <div className="text-sm text-gray-500 italic">Auto-synced from portfolio. Edit fields in Portfolio Builder.</div>
            )}
            {section === 'projects' && (
              <div className="text-sm text-gray-500 italic">Auto-synced from portfolio. Edit fields in Portfolio Builder.</div>
            )}
            {section === 'certifications' && (
              <div className="text-sm text-gray-500 italic">Auto-synced from portfolio. Edit fields in Portfolio Builder.</div>
            )}

          </div>
        );
      })}

      {/* Global CSS for standard inputs within this form */}
      <style dangerouslySetInnerHTML={{__html: `
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 1px #6366f1;
        }
      `}} />
    </div>
  );
};

export default ResumeForm;
