import { memo } from 'react';

const TemplateDark = memo(function TemplateDark({ data, scale = 1 }) {
  const portfolio = data || {};
  const { personalInfo = {}, about = '', projects = [], skills = [], experience = [], education = [] } = portfolio;

  return (
    <div style={{
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      width: '100%',
      background: '#1a1a1a',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      padding: '40px',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', borderBottom: '2px solid #00d4ff', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#00d4ff' }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p style={{ margin: '0 0 12px 0', color: '#aaa', fontSize: '14px' }}>
          {personalInfo.title || 'Professional Title'}
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888', flexWrap: 'wrap' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {/* About */}
      {about && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#00d4ff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            About
          </h2>
          <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: '#ccc' }}>
            {about}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#00d4ff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            Experience
          </h2>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500', color: '#00d4ff' }}>
                <span>{exp.position}</span>
                <span style={{ color: '#888' }}>{exp.startDate} - {exp.endDate}</span>
              </div>
              <p style={{ margin: '4px 0', color: '#aaa', fontSize: '12px' }}>{exp.company}</p>
              {exp.description && <p style={{ margin: '4px 0', fontSize: '12px', lineHeight: '1.5', color: '#ccc' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#00d4ff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            Education
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#00d4ff' }}>{edu.school}</div>
              <p style={{ margin: '4px 0', color: '#aaa', fontSize: '12px' }}>{edu.degree} in {edu.field}</p>
              <p style={{ margin: '4px 0', color: '#666', fontSize: '11px' }}>{edu.graduationDate}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#00d4ff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            Skills
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill, idx) => (
              <span key={idx} style={{ background: '#2a2a2a', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', color: '#00d4ff', border: '1px solid #00d4ff' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#00d4ff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
            Projects
          </h2>
          {projects.map((project, idx) => (
            <div key={idx} style={{ marginBottom: '16px', borderLeft: '3px solid #00d4ff', paddingLeft: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0', color: '#00d4ff' }}>{project.title}</h3>
              {project.description && <p style={{ margin: '4px 0', fontSize: '12px', lineHeight: '1.5', color: '#ccc' }}>{project.description}</p>}
              {project.technologies && <p style={{ margin: '4px 0', fontSize: '11px', color: '#888' }}>Tech: {project.technologies.join(', ')}</p>}
              {project.link && <p style={{ margin: '4px 0', fontSize: '11px' }}><a href={project.link} style={{ color: '#00d4ff' }}>View Project</a></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default TemplateDark;
