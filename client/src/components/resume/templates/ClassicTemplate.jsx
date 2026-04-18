const ClassicTemplate = ({ data }) => {
  const { header, summary, experience, education, skillGroups, projects, certifications, sectionOrder, sectionLabels, hiddenSections, fontSizeOverride } = data;
  
  // Font size trick. Apply dynamic font size to root container, use 'em' sizing within
  const baseSize = fontSizeOverride ? `${fontSizeOverride}pt` : '11pt';

  const renderSection = (sectionId) => {
    if (hiddenSections?.includes(sectionId)) return null;

    if (sectionId === 'summary' && summary) {
      return (
        <div key={sectionId} className="mb-[1.5em] focus:outline-none focus:ring-1 focus:ring-blue-200">
          <h2 className="text-[1em] font-bold uppercase border-b-2 border-gray-800 pb-[0.2em] mb-[0.6em] tracking-wider text-gray-900">{sectionLabels.summary || 'Summary'}</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{summary}</p>
        </div>
      );
    }

    if (sectionId === 'experience' && experience?.some(e => !e.hidden)) {
      return (
        <div key={sectionId} className="mb-[1.5em]">
          <h2 className="text-[1em] font-bold uppercase border-b-2 border-gray-800 pb-[0.2em] mb-[0.6em] tracking-wider text-gray-900">{sectionLabels.experience || 'Work Experience'}</h2>
          {experience.filter(e => !e.hidden).map((exp, idx) => (
            <div key={idx} className="mb-[1.2em]">
              <div className="flex justify-between items-baseline mb-[0.2em]">
                <h3 className="font-bold text-gray-900">{exp.company}</h3>
                <span className="text-gray-600">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="flex justify-between items-baseline text-[0.95em] italic mb-[0.4em] text-gray-700">
                <span>{exp.role}</span>
                <span>{exp.location}</span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="list-disc pl-[1.5em] space-y-[0.3em] text-[0.95em] text-gray-800">
                  {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (sectionId === 'education' && education?.some(e => !e.hidden)) {
      return (
        <div key={sectionId} className="mb-[1.5em]">
          <h2 className="text-[1em] font-bold uppercase border-b-2 border-gray-800 pb-[0.2em] mb-[0.6em] tracking-wider text-gray-900">{sectionLabels.education || 'Education'}</h2>
          {education.filter(e => !e.hidden).map((edu, idx) => (
            <div key={idx} className="mb-[0.8em]">
              <div className="flex justify-between items-baseline mb-[0.2em]">
                <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                <span className="text-gray-600">{edu.startYear || ''} – {edu.endYear || ''}</span>
              </div>
              <div className="text-gray-800 mb-[0.1em]">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
              {edu.showCgpa && edu.cgpa && (
                <div className="text-[0.9em] text-gray-600">CGPA: {edu.cgpa}</div>
              )}
              {edu.coursework && (
                <div className="text-[0.9em] text-gray-600 mt-[0.2em]"><span className="font-semibold">Coursework:</span> {edu.coursework}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (sectionId === 'skills' && skillGroups?.length > 0) {
      return (
        <div key={sectionId} className="mb-[1.5em]">
          <h2 className="text-[1em] font-bold uppercase border-b-2 border-gray-800 pb-[0.2em] mb-[0.6em] tracking-wider text-gray-900">{sectionLabels.skills || 'Skills'}</h2>
          <div className="space-y-[0.4em]">
            {skillGroups.map((group, idx) => (
              <div key={idx} className="flex">
                <span className="font-bold min-w-[7em] text-gray-900">{group.category}:</span>
                <span className="text-gray-800">{group.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (sectionId === 'projects' && projects?.some(e => !e.hidden)) {
      return (
        <div key={sectionId} className="mb-[1.5em]">
          <h2 className="text-[1em] font-bold uppercase border-b-2 border-gray-800 pb-[0.2em] mb-[0.6em] tracking-wider text-gray-900">{sectionLabels.projects || 'Projects'}</h2>
          {projects.filter(e => !e.hidden).map((proj, idx) => (
             <div key={idx} className="mb-[1em]">
              <div className="flex justify-between items-baseline mb-[0.2em]">
                <div>
                  <span className="font-bold text-gray-900">{proj.name}</span>
                  {proj.techStack?.length > 0 && <span className="text-gray-600 text-[0.9em]"> | {proj.techStack.join(', ')}</span>}
                </div>
                <div className="text-[0.9em] text-gray-600">
                  {proj.githubLink && <a href={proj.githubLink} className="hover:underline">GitHub</a>}
                  {proj.githubLink && proj.liveLink && <span> • </span>}
                  {proj.liveLink && <a href={proj.liveLink} className="hover:underline">Live Demo</a>}
                </div>
              </div>
              {proj.description && (
                <div className="text-[0.95em] text-gray-800">{proj.description}</div>
              )}
             </div>
          ))}
        </div>
      );
    }

    if (sectionId === 'certifications' && certifications?.some(e => !e.hidden)) {
      return (
        <div key={sectionId} className="mb-[1.5em]">
          <h2 className="text-[1em] font-bold uppercase border-b-2 border-gray-800 pb-[0.2em] mb-[0.6em] tracking-wider text-gray-900">{sectionLabels.certifications || 'Certifications'}</h2>
          <ul className="list-disc pl-[1.5em] space-y-[0.3em] text-gray-800">
            {certifications.filter(e => !e.hidden).map((cert, idx) => (
              <li key={idx}>
                {cert.name} — {cert.issuer} {cert.year && `(${cert.year})`} {cert.link && <a href={cert.link} className="text-gray-600 hover:underline">[Link]</a>}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className="bg-white mx-auto font-sans text-gray-800" 
      style={{ fontSize: baseSize, padding: '12mm 14mm' }}
    >
      {/* Header Block */}
      <div className="text-center mb-[2em]">
        <h1 className="text-[1.8em] font-extrabold uppercase tracking-wide text-gray-900 m-0">{header.fullName}</h1>
        {header.title && <div className="text-[1.1em] text-gray-600 mt-[0.3em] font-medium">{header.title}</div>}
        
        <div className="mt-[0.6em] text-[0.9em] text-gray-600 flex flex-wrap items-center justify-center gap-x-[0.6em] gap-y-[0.2em]">
          {header.email && <span>{header.email}</span>}
          {header.phone && <><span className="text-gray-300">|</span><span>{header.phone}</span></>}
          {header.location && <><span className="text-gray-300">|</span><span>{header.location}</span></>}
          {header.linkedin && <><span className="text-gray-300">|</span><span>{header.linkedin.replace(/^https?:\/\//, '')}</span></>}
          {header.github && <><span className="text-gray-300">|</span><span>{header.github.replace(/^https?:\/\//, '')}</span></>}
          {header.portfolio && <><span className="text-gray-300">|</span><span>{header.portfolio.replace(/^https?:\/\//, '')}</span></>}
        </div>
      </div>

      {sectionOrder.map((sectionId) => renderSection(sectionId))}

    </div>
  );
};

export default ClassicTemplate;
