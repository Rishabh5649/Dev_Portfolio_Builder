// Utility to estimate physical height and compute a downscaled font size.

exports.calculateFit = (resume) => {
  // If user explicitly set an override, use it.
  if (resume.fontSizeOverride) {
    return resume.fontSizeOverride; 
  }

  // Count raw text lengths as an approximation of line counts.
  // 1 A4 page at 11pt fits approximately ~55-60 physical lines of standard text 
  // depending on margins. 
  
  let estimatedLines = 0;

  // Header
  estimatedLines += 4; // Name + Contact block

  // Summary
  if (resume.summary && (!resume.hiddenSections || !resume.hiddenSections.includes('summary'))) {
    estimatedLines += 2; // header space
    estimatedLines += Math.ceil(resume.summary.length / 90); // chars per line approx
  }

  // Experience
  if (resume.experience && resume.experience.length > 0 && (!resume.hiddenSections || !resume.hiddenSections.includes('experience'))) {
    estimatedLines += 2; // section header
    resume.experience.forEach(exp => {
      if (!exp.hidden) {
        estimatedLines += 2; // title/date + role/location
        if (exp.bullets) {
          exp.bullets.forEach(b => {
             estimatedLines += Math.ceil(b.length / 85);
          });
        }
      }
    });
  }

  // Education
  if (resume.education && resume.education.length > 0 && (!resume.hiddenSections || !resume.hiddenSections.includes('education'))) {
    estimatedLines += 2;
    resume.education.forEach(edu => {
      if (!edu.hidden) {
        estimatedLines += 2; // institution + degree
        if (edu.showCgpa && edu.cgpa) estimatedLines += 1;
        if (edu.coursework) estimatedLines += Math.ceil(edu.coursework.length / 90);
      }
    });
  }

  // Skills
  if (resume.skillGroups && resume.skillGroups.length > 0 && (!resume.hiddenSections || !resume.hiddenSections.includes('skills'))) {
    estimatedLines += 2;
    resume.skillGroups.forEach(group => {
       estimatedLines += Math.ceil((group.category.length + group.skills.join(', ').length) / 85);
    });
  }

  // Projects
  if (resume.projects && resume.projects.length > 0 && (!resume.hiddenSections || !resume.hiddenSections.includes('projects'))) {
    estimatedLines += 2;
    resume.projects.forEach(proj => {
      if (!proj.hidden) {
        estimatedLines += 1; // title line
        if (proj.description) estimatedLines += Math.ceil(proj.description.length / 90);
      }
    });
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0 && (!resume.hiddenSections || !resume.hiddenSections.includes('certifications'))) {
    estimatedLines += 2;
    resume.certifications.forEach(cert => {
      if (!cert.hidden) {
        estimatedLines += 1;
      }
    });
  }

  // Determine scaling logic based on max A4 lines at 11pt (~ 55)
  if (estimatedLines <= 56) return 11;
  if (estimatedLines <= 62) return 10.5;
  if (estimatedLines <= 68) return 10;
  if (estimatedLines <= 75) return 9.5;
  
  return 9; // Absolute minimum font size to remain readable
};
