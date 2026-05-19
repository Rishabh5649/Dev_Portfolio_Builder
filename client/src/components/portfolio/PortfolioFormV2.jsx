import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  setPersonalInfo,
  setContactInfo,
  setSocialLinks,
  setSkills,
  addProject,
  removeProject,
  updateProject,
  addExperience,
  removeExperience,
  updateExperience,
  addEducation,
  removeEducation,
  updateEducation,
  addCertification,
  removeCertification,
  updateCertification,
  addAchievement,
  removeAchievement,
  updateAchievement,
  addTestimonial,
  removeTestimonial,
  updateTestimonial,
  setCodingProfiles,
  setThemeCustomization,
  setTemplate,
  addBlogArticle,
  removeBlogArticle,
  updateBlogArticle,
} from '../../store/portfolioSlice';
import { usePortfolioSave } from '../../hooks/usePortfolioSave';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import GitHubImportModal from './GitHubImportModal';
import { ChevronDown, Plus, Trash2, Upload, X } from 'lucide-react';

const AccordionSection = ({ title, children, defaultOpen = false, onAddClick = null }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '12px 0',
        }}
      >
        <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{title}</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onAddClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddClick();
              }}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} /> Add
            </button>
          )}
          <ChevronDown
            size={18}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FormInput = ({ label, value, onChange, placeholder = '', maxLength = null }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
      {label}
      {maxLength && <span style={{ float: 'right', color: 'var(--text-muted)', fontSize: '11px' }}>{value?.length || 0}/{maxLength}</span>}
    </label>
    <input
      type="text"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      style={{
        width: '100%',
        padding: '8px',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        fontSize: '13px',
        boxSizing: 'border-box',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    />
  </div>
);

const FormTextarea = ({ label, value, onChange, placeholder = '', maxLength = null, rows = 4 }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
      {label}
      {maxLength && <span style={{ float: 'right', color: 'var(--text-muted)', fontSize: '11px' }}>{value?.length || 0}/{maxLength}</span>}
    </label>
    <textarea
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={rows}
      style={{
        width: '100%',
        padding: '8px',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        fontSize: '13px',
        boxSizing: 'border-box',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-secondary)',
        fontFamily: 'inherit',
        resize: 'vertical',
      }}
    />
  </div>
);

export default function PortfolioFormV2() {
  const dispatch = useDispatch();
  const portfolio = useSelector((s) => s.portfolio.data);
  const { isSaving, lastSavedTime } = usePortfolioSave();
  const { success, error } = useToast();
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  if (!portfolio) return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Loading...</div>;

  const handleFileUpload = (file, field) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      dispatch(setPersonalInfo({ [field]: e.target.result }));
      success(`${field} uploaded successfully`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Personal Info */}
      <AccordionSection title="👤 Personal Information" defaultOpen>
        <FormInput
          label="Full Name"
          value={portfolio.personalInfo?.fullName}
          onChange={(e) => dispatch(setPersonalInfo({ fullName: e.target.value }))}
          placeholder="John Doe"
          maxLength={100}
        />
        <FormInput
          label="Professional Title"
          value={portfolio.personalInfo?.title}
          onChange={(e) => dispatch(setPersonalInfo({ title: e.target.value }))}
          placeholder="Full Stack Developer"
          maxLength={100}
        />
        <FormInput
          label="Tagline"
          value={portfolio.personalInfo?.tagline}
          onChange={(e) => dispatch(setPersonalInfo({ tagline: e.target.value }))}
          placeholder="Building amazing things with code"
          maxLength={150}
        />
        <FormTextarea
          label="Bio"
          value={portfolio.personalInfo?.bio}
          onChange={(e) => dispatch(setPersonalInfo({ bio: e.target.value }))}
          placeholder="Tell us about yourself..."
          maxLength={500}
        />

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Profile Photo
          </label>
          {portfolio.personalInfo?.profilePhoto ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={portfolio.personalInfo.profilePhoto} alt="Profile" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)' }} />
              <div style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.08)',
                borderLeft: '3px solid #10B981',
                fontSize: '13px',
                color: '#10B981',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✓ Profile Photo Uploaded
              </div>
              <button
                onClick={() => dispatch(setPersonalInfo({ profilePhoto: '' }))}
                style={{
                  padding: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Remove photo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: '4px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              onClick={() => document.getElementById('profile-photo-input')?.click()}
            >
              <Upload size={20} style={{ margin: '0 auto 8px', color: 'var(--accent)' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>Click to upload or drag & drop</p>
              <input
                id="profile-photo-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'profilePhoto')}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Resume
          </label>
          {portfolio.personalInfo?.resumeBase64 || portfolio.personalInfo?.resumeUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.08)',
                borderLeft: '3px solid #10B981',
                fontSize: '13px',
                color: '#10B981',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✓ Resume Uploaded
              </div>
              <button
                onClick={() => dispatch(setPersonalInfo({ resumeBase64: '', resumeUrl: '' }))}
                style={{
                  padding: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Remove resume"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => document.getElementById('resume-input')?.click()}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px dashed var(--border)',
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Upload size={14} /> Upload Resume (PDF/DOCX)
              </button>
              <input
                id="resume-input"
                type="file"
                accept=".pdf,.docx"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'resumeBase64')}
              />
            </>
          )}
        </div>

        <FormInput
          label="Availability Status"
          value={portfolio.personalInfo?.availabilityStatus}
          onChange={(e) => dispatch(setPersonalInfo({ availabilityStatus: e.target.value }))}
          placeholder="Available for freelance projects"
        />
      </AccordionSection>

      {/* Contact Info */}
      <AccordionSection title="📧 Contact Information">
        <FormInput
          label="Email"
          value={portfolio.contactInfo?.email}
          onChange={(e) => dispatch(setContactInfo({ email: e.target.value }))}
          placeholder="your@email.com"
        />
        <FormInput
          label="Phone"
          value={portfolio.contactInfo?.phone}
          onChange={(e) => dispatch(setContactInfo({ phone: e.target.value }))}
          placeholder="+1 (555) 123-4567"
        />
        <FormInput
          label="City"
          value={portfolio.contactInfo?.city}
          onChange={(e) => dispatch(setContactInfo({ city: e.target.value }))}
          placeholder="City"
        />
        <FormInput
          label="Country"
          value={portfolio.contactInfo?.country}
          onChange={(e) => dispatch(setContactInfo({ country: e.target.value }))}
          placeholder="Country"
        />

        <h5 style={{ marginTop: '16px', marginBottom: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Social Links</h5>
        {['linkedin', 'github', 'twitter', 'website', 'custom'].map((social) => (
          <FormInput
            key={social}
            label={social.charAt(0).toUpperCase() + social.slice(1)}
            value={portfolio.socialLinks?.[social]}
            onChange={(e) => dispatch(setSocialLinks({ [social]: e.target.value }))}
            placeholder={`Your ${social} URL`}
          />
        ))}
      </AccordionSection>

      {/* Work Experience */}
      <AccordionSection
        title={`💼 Work Experience ${portfolio.experience?.length ? `(${portfolio.experience.length})` : ''}`}
        onAddClick={() => dispatch(addExperience({ company: '', title: '', startDate: '', endDate: '', location: '', description: '' }))}
      >
        {(portfolio.experience || []).map((exp, idx) => (
          <motion.div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px', position: 'relative' }}>
            <button
              onClick={() => dispatch(removeExperience(idx))}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
            <FormInput label="Company" value={exp.company} onChange={(e) => dispatch(updateExperience({ idx, data: { ...exp, company: e.target.value } }))} />
            <FormInput label="Job Title" value={exp.title} onChange={(e) => dispatch(updateExperience({ idx, data: { ...exp, title: e.target.value } }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormInput label="Start Date" value={exp.startDate} onChange={(e) => dispatch(updateExperience({ idx, data: { ...exp, startDate: e.target.value } }))} />
              <FormInput label="End Date" value={exp.endDate} onChange={(e) => dispatch(updateExperience({ idx, data: { ...exp, endDate: e.target.value } }))} />
            </div>
            <FormTextarea label="Description" value={exp.description} onChange={(e) => dispatch(updateExperience({ idx, data: { ...exp, description: e.target.value } }))} rows={3} />
          </motion.div>
        ))}
      </AccordionSection>

      {/* Education */}
      <AccordionSection
        title={`🎓 Education ${portfolio.education?.length ? `(${portfolio.education.length})` : ''}`}
        onAddClick={() => dispatch(addEducation({ institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' }))}
      >
        {(portfolio.education || []).map((edu, idx) => (
          <motion.div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px', position: 'relative' }}>
            <button
              onClick={() => dispatch(removeEducation(idx))}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
            <FormInput label="Institution" value={edu.institution} onChange={(e) => dispatch(updateEducation({ idx, data: { ...edu, institution: e.target.value } }))} />
            <FormInput label="Degree" value={edu.degree} onChange={(e) => dispatch(updateEducation({ idx, data: { ...edu, degree: e.target.value } }))} />
            <FormInput label="Field of Study" value={edu.field} onChange={(e) => dispatch(updateEducation({ idx, data: { ...edu, field: e.target.value } }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormInput label="Start Date" value={edu.startDate} onChange={(e) => dispatch(updateEducation({ idx, data: { ...edu, startDate: e.target.value } }))} />
              <FormInput label="End Date" value={edu.endDate} onChange={(e) => dispatch(updateEducation({ idx, data: { ...edu, endDate: e.target.value } }))} />
            </div>
            <FormInput label="Grade/GPA" value={edu.grade} onChange={(e) => dispatch(updateEducation({ idx, data: { ...edu, grade: e.target.value } }))} />
          </motion.div>
        ))}
      </AccordionSection>

      {/* Skills */}
      <AccordionSection title={`💻 Skills ${portfolio.skills ? `(${Object.values(portfolio.skills).filter(arr => arr?.length).length} categories)` : ''}`}>
        {['languages', 'frameworks', 'tools', 'databases', 'other'].map((category) => (
          <div key={category} style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </label>
            <textarea
              value={(portfolio.skills?.[category] || []).join(', ')}
              onChange={(e) =>
                dispatch(setSkills({
                  ...portfolio.skills,
                  [category]: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
              placeholder="Comma-separated skills"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box',
                minHeight: '60px',
              }}
            />
          </div>
        ))}
      </AccordionSection>

      {/* Projects */}
      <AccordionSection
        title={`🚀 Projects ${portfolio.projects?.length ? `(${portfolio.projects.length})` : ''}`}
        onAddClick={() => dispatch(addProject({ name: '', title: '', description: '', techStack: [], technologies: [], githubUrl: '', githubLink: '', liveUrl: '', liveLink: '', links: { github: '', live: '' }, featured: false }))}
      >
        {(portfolio.projects || []).map((proj, idx) => (
          <motion.div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px', position: 'relative' }}>
            <button
              onClick={() => dispatch(removeProject(idx))}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
            <FormInput 
              label="Project Title" 
              value={proj.name || proj.title || ''} 
              onChange={(e) => dispatch(updateProject({ idx, data: { ...proj, name: e.target.value, title: e.target.value } }))} 
            />
            <FormTextarea 
              label="Description" 
              value={proj.description || ''} 
              onChange={(e) => dispatch(updateProject({ idx, data: { ...proj, description: e.target.value } }))} 
            />
            <FormInput 
              label="Technologies" 
              value={(proj.techStack || proj.technologies || []).join(', ')} 
              onChange={(e) => {
                const arr = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                dispatch(updateProject({ idx, data: { ...proj, techStack: arr, technologies: arr } }));
              }} 
            />
            <FormInput 
              label="GitHub URL" 
              value={proj.githubUrl || proj.githubLink || proj.links?.github || ''} 
              onChange={(e) => dispatch(updateProject({ idx, data: { 
                ...proj, 
                githubUrl: e.target.value, 
                githubLink: e.target.value, 
                links: { ...(proj.links || {}), github: e.target.value } 
              } }))} 
            />
            <FormInput 
              label="Live URL" 
              value={proj.liveUrl || proj.liveLink || proj.links?.live || ''} 
              onChange={(e) => dispatch(updateProject({ idx, data: { 
                ...proj, 
                liveUrl: e.target.value, 
                liveLink: e.target.value, 
                links: { ...(proj.links || {}), live: e.target.value } 
              } }))} 
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={proj.featured || false}
                onChange={(e) => dispatch(updateProject({ idx, data: { ...proj, featured: e.target.checked } }))}
              />
              <label style={{ fontSize: '12px', cursor: 'pointer' }}>Mark as featured</label>
            </div>
          </motion.div>
        ))}
      </AccordionSection>

      {/* Certifications */}
      <AccordionSection
        title={`🏆 Certifications ${portfolio.certifications?.length ? `(${portfolio.certifications.length})` : ''}`}
        onAddClick={() => dispatch(addCertification({ name: '', issuer: '', date: '', url: '', image: '', imageBase64: '', imageType: '' }))}
      >
        {(portfolio.certifications || []).map((cert, idx) => (
          <motion.div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px', position: 'relative' }}>
            <button
              onClick={() => dispatch(removeCertification(idx))}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
            <FormInput label="Certification Name" value={cert.name} onChange={(e) => dispatch(updateCertification({ idx, data: { ...cert, name: e.target.value } }))} />
            <FormInput label="Issuing Organization" value={cert.issuer} onChange={(e) => dispatch(updateCertification({ idx, data: { ...cert, issuer: e.target.value } }))} />
            <FormInput label="Issue Date" value={cert.date} onChange={(e) => dispatch(updateCertification({ idx, data: { ...cert, date: e.target.value } }))} />
            <FormInput label="Certificate URL" value={cert.url} onChange={(e) => dispatch(updateCertification({ idx, data: { ...cert, url: e.target.value } }))} />
            
            {/* File Upload Option */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                Certificate Document (PDF or Image)
              </label>
              {cert.imageBase64 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderLeft: '3px solid #10B981',
                    fontSize: '13px',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '500'
                  }}>
                    ✓ Certificate Uploaded ({cert.imageType?.toUpperCase()})
                  </div>
                  <button
                    onClick={() => dispatch(updateCertification({ idx, data: { ...cert, imageBase64: '', imageType: '' } }))}
                    style={{
                      padding: '8px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove certificate"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => document.getElementById(`cert-input-${idx}`)?.click()}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px dashed var(--border)',
                      borderRadius: '4px',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Upload size={14} /> Upload PDF / Image
                  </button>
                  <input
                    id={`cert-input-${idx}`}
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (uploadEvent) => {
                          const type = file.type.includes('pdf') ? 'pdf' : 'image';
                          dispatch(updateCertification({
                            idx,
                            data: {
                              ...cert,
                              imageBase64: uploadEvent.target.result,
                              imageType: type
                            }
                          }));
                          success('Certificate file uploaded successfully');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AccordionSection>

      {/* Achievements */}
      <AccordionSection
        title={`⭐ Achievements ${portfolio.achievements?.length ? `(${portfolio.achievements.length})` : ''}`}
        onAddClick={() => dispatch(addAchievement({ title: '', organization: '', date: '', description: '' }))}
      >
        {(portfolio.achievements || []).map((ach, idx) => (
          <motion.div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px', position: 'relative' }}>
            <button
              onClick={() => dispatch(removeAchievement(idx))}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
            <FormInput label="Achievement Title" value={ach.title} onChange={(e) => dispatch(updateAchievement({ idx, data: { ...ach, title: e.target.value } }))} />
            <FormInput label="Organization" value={ach.organization} onChange={(e) => dispatch(updateAchievement({ idx, data: { ...ach, organization: e.target.value } }))} />
            <FormInput label="Date" value={ach.date} onChange={(e) => dispatch(updateAchievement({ idx, data: { ...ach, date: e.target.value } }))} />
            <FormTextarea label="Description" value={ach.description} onChange={(e) => dispatch(updateAchievement({ idx, data: { ...ach, description: e.target.value } }))} />
          </motion.div>
        ))}
      </AccordionSection>

      {/* Testimonials */}
      <AccordionSection
        title={`💬 Testimonials ${portfolio.testimonials?.length ? `(${portfolio.testimonials.length})` : ''}`}
        onAddClick={() => dispatch(addTestimonial({ name: '', role: '', text: '', avatar: '' }))}
      >
        {(portfolio.testimonials || []).map((test, idx) => (
          <motion.div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px', position: 'relative' }}>
            <button
              onClick={() => dispatch(removeTestimonial(idx))}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
            <FormInput label="Person Name" value={test.name} onChange={(e) => dispatch(updateTestimonial({ idx, data: { ...test, name: e.target.value } }))} />
            <FormInput label="Role/Position" value={test.role} onChange={(e) => dispatch(updateTestimonial({ idx, data: { ...test, role: e.target.value } }))} />
            <FormTextarea label="Testimonial" value={test.text} onChange={(e) => dispatch(updateTestimonial({ idx, data: { ...test, text: e.target.value } }))} rows={3} />
          </motion.div>
        ))}
      </AccordionSection>

      {/* Blog Articles */}
      <AccordionSection
        title={`📝 Publications ${portfolio.blog?.length ? `(${portfolio.blog.length})` : ''}`}
        onAddClick={() => dispatch(addBlogArticle({ title: '', date: '', content: '', tags: [] }))}
      >
        {(portfolio.blog || []).map((article, idx) => (
          <motion.div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '12px', position: 'relative' }}>
            <button
              onClick={() => dispatch(removeBlogArticle(idx))}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
            <FormInput label="Article Title" value={article.title} onChange={(e) => dispatch(updateBlogArticle({ idx, data: { ...article, title: e.target.value } }))} />
            <FormInput label="Date" value={article.date} onChange={(e) => dispatch(updateBlogArticle({ idx, data: { ...article, date: e.target.value } }))} />
            <FormTextarea label="Content" value={article.content} onChange={(e) => dispatch(updateBlogArticle({ idx, data: { ...article, content: e.target.value } }))} rows={4} />
            <FormInput label="Tags" value={article.tags?.join(', ')} onChange={(e) => dispatch(updateBlogArticle({ idx, data: { ...article, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } }))} />
          </motion.div>
        ))}
      </AccordionSection>

      {/* Coding Profiles */}
      <AccordionSection title="👨‍💻 Coding Profiles">
        {['github', 'leetcode', 'hackerrank', 'codeforces', 'codechef'].map((profile) => (
          <FormInput
            key={profile}
            label={profile.charAt(0).toUpperCase() + profile.slice(1)}
            value={portfolio.codingProfiles?.[profile]}
            onChange={(e) => dispatch(setCodingProfiles({ [profile]: e.target.value }))}
            placeholder={`Your ${profile} profile URL`}
          />
        ))}
      </AccordionSection>

      {/* Theme & Customization */}
      <AccordionSection title="🎨 Customization">
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>
            Template
          </label>
          <select
            value={portfolio.template || 'aurora'}
            onChange={(e) => dispatch(setTemplate(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: '#1E2535',
              color: '#FAFAF7',
            }}
          >
            <option value="aurora" style={{ backgroundColor: '#1E2535', color: '#FAFAF7' }}>Aurora</option>
            <option value="obsidian" style={{ backgroundColor: '#1E2535', color: '#FAFAF7' }}>Obsidian</option>
            <option value="prism" style={{ backgroundColor: '#1E2535', color: '#FAFAF7' }}>Prism</option>
          </select>
        </div>

        <button
          onClick={() => setShowGitHubModal(true)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          Import from GitHub
        </button>

        <h5 style={{ marginTop: '16px', marginBottom: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Theme Colors</h5>
        {[
          { label: 'Background Color', key: 'backgroundColor', default: portfolio.template === 'aurora' ? '#FAFAF7' : portfolio.template === 'obsidian' ? '#0B0F19' : '#0F0F15' },
          { label: 'Primary Content Color', key: 'primaryColor', default: portfolio.template === 'aurora' ? '#1C1C1A' : '#FFFFFF' },
          { label: 'Secondary Content Color', key: 'secondaryColor', default: portfolio.template === 'aurora' ? '#70706B' : portfolio.template === 'obsidian' ? '#8892A4' : '#A0A5B5' },
          { label: 'Accent Color 1', key: 'accentColor1', default: portfolio.template === 'aurora' ? '#00C896' : portfolio.template === 'obsidian' ? '#00F5D4' : '#FFD700' },
          { label: 'Accent Color 2', key: 'accentColor2', default: portfolio.template === 'aurora' ? '#C9A84C' : portfolio.template === 'obsidian' ? '#9B5DE5' : '#FF6CAB' },
        ].map((item) => (
          <div key={item.key} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', minWidth: '160px', color: 'var(--text-secondary)' }}>
              {item.label}
            </label>
            <input
              type="color"
              value={portfolio.themeCustomization?.[item.key] || item.default}
              onChange={(e) => dispatch(setThemeCustomization({ [item.key]: e.target.value }))}
              style={{ width: '48px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' }}
            />
            <button
              onClick={() => dispatch(setThemeCustomization({ [item.key]: item.default }))}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Reset
            </button>
          </div>
        ))}
      </AccordionSection>

      <GitHubImportModal open={showGitHubModal} onClose={() => setShowGitHubModal(false)} />
    </div>
  );
}
