const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, BorderStyle, TabStopType, TabStopPosition } = require('docx');
const { calculateFit } = require('./resumeFitCalculator');

exports.generateDOCX = async (resume) => {
  const fontSizeOverride = resume.fontSizeOverride || calculateFit(resume);
  const baseSizeScale = fontSizeOverride / 11; // 11pt is our standard '1' scale
  
  // Calculate specific sizes based on base font fit level (*2 for half-points in docx)
  const nameSize = Math.floor(16 * baseSizeScale) * 2;
  const headerSize = Math.floor(11 * baseSizeScale) * 2;
  const sectionSize = Math.floor(11 * baseSizeScale) * 2;
  const entryTitleSize = 21; // 10.5pt
  const bodySize = Math.floor(10 * baseSizeScale) * 2;

  const { header, summary, experience, education, skillGroups, projects, certifications, publications = [], achievements = [], leadership = [], sectionOrder, sectionLabels = {}, hiddenSections } = resume;

  // Contact info builder
  const contactText = [];
  if (header.title) contactText.push(new TextRun({ text: header.title, color: "555555", size: headerSize }));
  if (header.email) contactText.push(new TextRun({ text: ` | ${header.email}`, color: "555555", size: headerSize }));
  if (header.phone) contactText.push(new TextRun({ text: ` | ${header.phone}`, color: "555555", size: headerSize }));
  if (header.location) contactText.push(new TextRun({ text: ` | ${header.location}`, color: "555555", size: headerSize }));
  if (header.linkedin) contactText.push(new TextRun({ text: ` | ${header.linkedin}`, color: "555555", size: headerSize }));
  if (header.github) contactText.push(new TextRun({ text: ` | ${header.github}`, color: "555555", size: headerSize }));

  const children = [
    new Paragraph({
      text: (header.fullName || '').toUpperCase(),
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
    }),
    new Paragraph({
      children: contactText,
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 * baseSizeScale },
    })
  ];

  const addSectionHeader = (text) => {
    children.push(
      new Paragraph({
        text: text.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120 * baseSizeScale, after: 80 * baseSizeScale },
        border: {
          bottom: { color: "000000", space: 1, value: BorderStyle.SINGLE, size: 6 },
        },
      })
    );
  };

  sectionOrder.forEach(section => {
    if (hiddenSections && hiddenSections.includes(section)) return;

    if (section === 'summary' && summary) {
      addSectionHeader(sectionLabels.summary ?? 'Summary');
      children.push(new Paragraph({ children: [new TextRun({ text: summary, size: bodySize, font: "Calibri" })], spacing: { before: 40, after: 40 } }));
    }

    if (section === 'education' && education?.length > 0) {
      const vis = education.filter(e => !e.hidden);
      if (vis.length > 0) {
        addSectionHeader(sectionLabels.education ?? 'Education');
        vis.forEach(edu => {
          children.push(new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 10000 }], children: [new TextRun({ text: edu.institution, bold: true, size: entryTitleSize, font: "Calibri" }), new TextRun({ text: `\t${[edu.startYear, edu.endYear].filter(Boolean).join(' – ')}`, size: bodySize, font: "Calibri" })], spacing: { before: 80, after: 40 } }));
          children.push(new Paragraph({ children: [new TextRun({ text: `${edu.degree}${edu.field ? `, ${edu.field}` : ''}`, size: bodySize, font: "Calibri" })], spacing: { after: 40 } }));
          if (edu.showCgpa && edu.cgpa) children.push(new Paragraph({ children: [new TextRun({ text: `GPA: ${edu.cgpa}`, size: bodySize, font: "Calibri" })], spacing: { after: 40 } }));
        });
      }
    }

    if (section === 'skills' && skillGroups?.length > 0) {
      addSectionHeader(sectionLabels.skills ?? 'Skills');
      skillGroups.forEach(group => {
        children.push(new Paragraph({ children: [new TextRun({ text: `${group.category}: `, bold: true, size: bodySize, font: "Calibri" }), new TextRun({ text: group.skills.join(', '), size: bodySize, font: "Calibri" })], spacing: { before: 40, after: 40 } }));
      });
    }

    if (section === 'publications' && publications?.length > 0) {
      const vis = publications.filter(p => !p.hidden);
      if (vis.length > 0) {
        addSectionHeader(sectionLabels.publications ?? 'Publications');
        vis.forEach(pub => {
          children.push(new Paragraph({ children: [new TextRun({ text: `• ${pub.title}`, bold: true, size: bodySize, font: "Calibri" })], spacing: { before: 60, after: 20 } }));
          if (pub.publisher || pub.year) children.push(new Paragraph({ children: [new TextRun({ text: `- ${[pub.publisher, pub.year].filter(Boolean).join(' — ')}`, size: bodySize, font: "Calibri", italics: true })], indent: { left: 240 }, spacing: { after: 20 } }));
        });
      }
    }

    if (section === 'projects' && projects?.length > 0) {
      const vis = projects.filter(e => !e.hidden);
      if (vis.length > 0) {
        addSectionHeader(sectionLabels.projects ?? 'Projects');
        vis.forEach(proj => {
          children.push(new Paragraph({ children: [new TextRun({ text: `• ${proj.name}`, bold: true, size: entryTitleSize, font: "Calibri" }), proj.techStack?.length ? new TextRun({ text: ` | ${proj.techStack.join(', ')}`, size: bodySize, font: "Calibri" }) : new TextRun({text:''}), new TextRun({ text: proj.githubLink || proj.liveLink ? `  [${proj.githubLink ? 'GitHub' : ''}${proj.githubLink && proj.liveLink ? '/' : ''}${proj.liveLink ? 'Live' : ''}]` : '', size: bodySize, font: "Calibri" })], spacing: { before: 60, after: 20 } }));
          if (proj.description) children.push(new Paragraph({ children: [new TextRun({ text: `– ${proj.description}`, size: bodySize, font: "Calibri" })], indent: { left: 240 }, spacing: { after: 40 } }));
        });
      }
    }

    if (section === 'experience' && experience?.length > 0) {
      const vis = experience.filter(e => !e.hidden);
      if (vis.length > 0) {
        addSectionHeader(sectionLabels.experience ?? 'Work Experience');
        vis.forEach(exp => {
          children.push(new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 10000 }], children: [new TextRun({ text: `• ${exp.role}`, bold: true, size: entryTitleSize, font: "Calibri" }), exp.company ? new TextRun({ text: `, ${exp.company}`, size: bodySize, font: "Calibri" }) : new TextRun({text:''}), new TextRun({ text: `\t${[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ')}`, size: bodySize, font: "Calibri" })], spacing: { before: 80, after: 40 } }));
          if (exp.bullets) exp.bullets.filter(b => b?.trim()).forEach(b => children.push(new Paragraph({ children: [new TextRun({ text: `– ${b.replace(/^[•\-–]\s*/, '')}`, size: bodySize, font: "Calibri" })], indent: { left: 240 }, spacing: { after: 40 } })));
        });
      }
    }

    if (section === 'certifications' && certifications?.length > 0) {
      const vis = certifications.filter(e => !e.hidden);
      if (vis.length > 0) {
        addSectionHeader(sectionLabels.certifications ?? 'Certifications');
        vis.forEach(cert => children.push(new Paragraph({ children: [new TextRun({ text: `${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.year ? ` (${cert.year})` : ''}`, size: bodySize, font: "Calibri" })], bullet: { level: 0 }, spacing: { after: 40 } })));
      }
    }

    if (section === 'achievements' && achievements?.length > 0) {
      const vis = achievements.filter(a => !a.hidden);
      if (vis.length > 0) {
        addSectionHeader(sectionLabels.achievements ?? 'Achievements');
        vis.forEach(a => children.push(new Paragraph({ children: [new TextRun({ text: a.title ? `${a.title}: ` : '', bold: true, size: bodySize, font: "Calibri" }), new TextRun({ text: a.description || '', size: bodySize, font: "Calibri" })], bullet: { level: 0 }, spacing: { after: 40 } })));
      }
    }

    if (section === 'leadership' && leadership?.length > 0) {
      const vis = leadership.filter(l => !l.hidden);
      if (vis.length > 0) {
        addSectionHeader(sectionLabels.leadership ?? 'Leadership & Extracurriculars');
        vis.forEach(l => children.push(new Paragraph({ children: [new TextRun({ text: l.title || '', bold: true, size: bodySize, font: "Calibri" }), new TextRun({ text: l.organization ? `, ${l.organization}` : '', size: bodySize, font: "Calibri" }), new TextRun({ text: l.description ? `: ${l.description}` : '', size: bodySize, font: "Calibri" })], bullet: { level: 0 }, spacing: { after: 40 } })));
      }
    }
  });


  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 } // 0.5 inches (1.27cm)
        }
      },
      children: children,
    }],
    styles: {
      default: {
        document: { run: { font: "Calibri" } },
        heading1: {
          run: { font: "Calibri", size: sectionSize, bold: true, color: "000000" },
        },
        title: {
          run: { font: "Calibri", size: nameSize, bold: true, color: "000000" },
        }
      }
    }
  });

  return Packer.toBuffer(doc);
};
