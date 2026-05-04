import { memo } from 'react';

const TemplateMinimal = memo(function TemplateMinimal({ data, scale = 1 }) {
  const portfolio = data || {};
  const { personalInfo = {}, about = '', projects = [], skills = [], experience = [], education = [] } = portfolio;

  return (
    <div style={{
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      width: '100%',
      background: '#fff',
      color: '#000',
      fontFamily: 'Inter, sans-serif',
      padding: '40px',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
          {personalInfo.title || 'Professional Title'}
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666', flexWrap: 'wrap' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {/* About */}
      {about && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
            About
          </h2>
          <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: '#333' }}>
            {about}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
            Experience
          </h2>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
                <span>{exp.position}</span>
                <span style={{ color: '#666' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <p style={{ margin: '4px 0', color: '#666', fontSize: '12px' }}>{exp.company}</p>
              {exp.description && <p style={{ margin: '4px 0', fontSize: '12px', lineHeight: '1.5', color: '#333' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
            Education
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{edu.school}</div>
              <p style={{ margin: '4px 0', color: '#666', fontSize: '12px' }}>{edu.degree} in {edu.field}</p>
              <p style={{ margin: '4px 0', color: '#999', fontSize: '11px' }}>{edu.graduationDate}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
            Skills
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill, idx) => (
              <span key={idx} style={{ background: '#f0f0f0', padding: '4px 12px', borderRadius: '4px', fontSize: '12px' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
            Projects
          </h2>
          {projects.map((project, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' }}>{project.title}</h3>
              {project.description && <p style={{ margin: '4px 0', fontSize: '12px', lineHeight: '1.5', color: '#333' }}>{project.description}</p>}
              {project.technologies && <p style={{ margin: '4px 0', fontSize: '11px', color: '#666' }}>Tech: {project.technologies.join(', ')}</p>}
              {project.link && <p style={{ margin: '4px 0', fontSize: '11px' }}><a href={project.link} style={{ color: '#0066cc' }}>View Project</a></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default TemplateMinimal;
