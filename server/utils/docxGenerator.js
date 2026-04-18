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

  const { header, summary, experience, education, skillGroups, projects, certifications, sectionOrder, sectionLabels, hiddenSections } = resume;

  // Contact info builder
  const contactText = [];
  if (header.title) contactText.push(new TextRun({ text: header.title, color: "555555", size: headerSize }));
  if (header.email) contactText.push(new TextRun({ text: ` | ${header.email}`, color: "555555", size: headerSize }));
  if (header.phone) contactText.push(new TextRun({ text: ` | ${header.phone}`, color: "555555", size: headerSize }));
  if (header.location) contactText.push(new TextRun({ text: ` | ${header.location}`, color: "555555", size: headerSize }));
  if (header.linkedin) contactText.push(new TextRun({ text: ` | ${header.linkedin}`, color: "555555", size: headerSize }));

  const children = [
    new Paragraph({
      text: header.fullName.toUpperCase(),
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
          bottom: {
            color: "000000",
            space: 1,
            value: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
  };

  sectionOrder.forEach(section => {
    if (hiddenSections && hiddenSections.includes(section)) return;

    if (section === 'summary' && summary) {
      addSectionHeader(sectionLabels.summary || 'Summary');
      children.push(
        new Paragraph({
          children: [new TextRun({ text: summary, size: bodySize, font: "Calibri" })],
          spacing: { before: 40 * baseSizeScale, after: 40 * baseSizeScale },
        })
      );
    }

    if (section === 'experience' && experience && experience.length > 0) {
      const visibleExp = experience.filter(e => !e.hidden);
      if (visibleExp.length > 0) {
        addSectionHeader(sectionLabels.experience || 'Work Experience');
        visibleExp.forEach(exp => {
          // Company and Date line with right-tab stop
          children.push(
            new Paragraph({
              tabStops: [{ type: TabStopType.RIGHT, position: 10000 }], // ~ 7 inches
              children: [
                new TextRun({ text: exp.company, bold: true, size: entryTitleSize, font: "Calibri" }),
                new TextRun({ text: `\t${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`, size: bodySize, font: "Calibri" }),
              ],
              spacing: { before: 80 * baseSizeScale, after: 40 * baseSizeScale },
            })
          );
          // Role and Location
          children.push(
            new Paragraph({
              tabStops: [{ type: TabStopType.RIGHT, position: 10000 }],
              children: [
                new TextRun({ text: exp.role, italics: true, size: bodySize, font: "Calibri" }),
                new TextRun({ text: exp.location ? `\t${exp.location}` : '', italics: true, size: bodySize, font: "Calibri" }),
              ],
              spacing: { after: 40 * baseSizeScale },
            })
          );
          // Bullets
          if (exp.bullets) {
            exp.bullets.forEach(bullet => {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: bullet, size: bodySize, font: "Calibri" })],
                  bullet: { level: 0 },
                  spacing: { after: 40 * baseSizeScale },
                })
              );
            });
          }
        });
      }
    }

    if (section === 'education' && education && education.length > 0) {
      const visibleEdu = education.filter(e => !e.hidden);
      if (visibleEdu.length > 0) {
        addSectionHeader(sectionLabels.education || 'Education');
        visibleEdu.forEach(edu => {
          children.push(
            new Paragraph({
              tabStops: [{ type: TabStopType.RIGHT, position: 10000 }],
              children: [
                new TextRun({ text: edu.institution, bold: true, size: entryTitleSize, font: "Calibri" }),
                new TextRun({ text: `\t${edu.startYear || ''} – ${edu.endYear || ''}`, size: bodySize, font: "Calibri" }),
              ],
              spacing: { before: 80 * baseSizeScale, after: 40 * baseSizeScale },
            })
          );
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `${edu.degree}${edu.field ? `, ${edu.field}` : ''}`, size: bodySize, font: "Calibri" })],
              spacing: { after: 40 * baseSizeScale },
            })
          );
          if (edu.showCgpa && edu.cgpa) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `CGPA: ${edu.cgpa}`, size: bodySize, font: "Calibri" })],
                spacing: { after: 40 * baseSizeScale },
              })
            );
          }
        });
      }
    }

    if (section === 'skills' && skillGroups && skillGroups.length > 0) {
      addSectionHeader(sectionLabels.skills || 'Skills');
      skillGroups.forEach(group => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${group.category}: `, bold: true, size: bodySize, font: "Calibri" }),
              new TextRun({ text: group.skills.join(', '), size: bodySize, font: "Calibri" }),
            ],
            spacing: { before: 40 * baseSizeScale, after: 40 * baseSizeScale },
          })
        );
      });
    }

    if (section === 'projects' && projects && projects.length > 0) {
      const visibleProj = projects.filter(e => !e.hidden);
      if (visibleProj.length > 0) {
        addSectionHeader(sectionLabels.projects || 'Projects');
        visibleProj.forEach(proj => {
          children.push(
            new Paragraph({
              tabStops: [{ type: TabStopType.RIGHT, position: 10000 }],
              children: [
                new TextRun({ text: proj.name, bold: true, size: entryTitleSize, font: "Calibri" }),
                new TextRun({ text: ` | ${proj.techStack.join(', ')}`, size: bodySize, font: "Calibri" }),
                new TextRun({ text: `\t${proj.githubLink ? '[GitHub] ' : ''}${proj.liveLink ? '[Live]' : ''}`, size: bodySize, font: "Calibri" }),
              ],
              spacing: { before: 80 * baseSizeScale, after: 40 * baseSizeScale },
            })
          );
          if (proj.description) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: proj.description, size: bodySize, font: "Calibri" })],
                spacing: { after: 40 * baseSizeScale },
              })
            );
          }
        });
      }
    }

    if (section === 'certifications' && certifications && certifications.length > 0) {
      const visibleCert = certifications.filter(e => !e.hidden);
      if (visibleCert.length > 0) {
        addSectionHeader(sectionLabels.certifications || 'Certifications');
        visibleCert.forEach(cert => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${cert.name} — ${cert.issuer} (${cert.year})`, size: bodySize, font: "Calibri" })
              ],
              bullet: { level: 0 },
              spacing: { after: 40 * baseSizeScale },
            })
          );
        });
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
