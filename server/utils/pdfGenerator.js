const puppeteer = require('puppeteer');
const { calculateFit } = require('./resumeFitCalculator');

const generateHTML = (resume, fontSize) => {
  // Render minimal HTML/CSS representation of the resume layout
  // We'll use the 'classic' template style natively since it's the requested A4 default
  
  const { header, summary, experience, education, skillGroups, projects, certifications, sectionOrder, sectionLabels, hiddenSections } = resume;
  
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Resume</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          font-size: ${fontSize}pt;
          line-height: 1.4;
          color: #333;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .container {
          padding: 0;
        }
        h1, h2, h3, p { margin: 0; }
        .header {
          text-align: center;
          margin-bottom: 12px;
        }
        .name {
          font-size: 16pt;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .contact-info {
          font-size: 10pt;
          color: #555;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
        }
        .contact-info span {
          display: inline-flex;
          align-items: center;
        }
        .contact-info span:not(:last-child)::after {
          content: '|';
          margin-left: 6px;
          color: #ccc;
        }
        .section {
          margin-bottom: 10px;
        }
        .section-title {
          font-size: 11pt;
          font-weight: 700;
          text-transform: uppercase;
          border-bottom: 1px solid #333;
          margin-bottom: 6px;
          padding-bottom: 2px;
        }
        .summary text {
          white-space: pre-wrap;
        }
        .entry {
          margin-bottom: 8px;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .entry-title {
          font-weight: 700;
        }
        .entry-date {
          font-size: 0.9em;
        }
        .entry-subtitle {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-style: italic;
          margin-bottom: 4px;
        }
        .entry-location {
          font-style: italic;
          font-size: 0.9em;
        }
        .bullets {
          margin: 0;
          padding-left: 18px;
        }
        .skill-row {
          display: flex;
          margin-bottom: 2px;
        }
        .skill-cat {
          font-weight: 600;
          width: 100px;
          flex-shrink: 0;
        }
        .skill-items {
          flex-grow: 1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="name">${header.fullName}</div>
          <div class="contact-info">
            ${header.title ? `<span>${header.title}</span>` : ''}
            ${header.email ? `<span>${header.email}</span>` : ''}
            ${header.phone ? `<span>${header.phone}</span>` : ''}
            ${header.location ? `<span>${header.location}</span>` : ''}
            ${header.linkedin ? `<span>${header.linkedin}</span>` : ''}
            ${header.github ? `<span>${header.github}</span>` : ''}
            ${header.portfolio ? `<span>${header.portfolio}</span>` : ''}
          </div>
        </div>
  `;

  // Render sections based on sectionOrder
  sectionOrder.forEach(section => {
    if (hiddenSections && hiddenSections.includes(section)) return;

    if (section === 'summary' && summary) {
      html += `
        <div class="section summary">
          <div class="section-title">${sectionLabels.summary || 'Summary'}</div>
          <p>${summary}</p>
        </div>
      `;
    }

    if (section === 'experience' && experience && experience.length > 0) {
      const visibleExp = experience.filter(e => !e.hidden);
      if (visibleExp.length > 0) {
        html += `
          <div class="section">
            <div class="section-title">${sectionLabels.experience || 'Work Experience'}</div>
            ${visibleExp.map(exp => `
              <div class="entry">
                <div class="entry-header">
                  <div class="entry-title">${exp.company}</div>
                  <div class="entry-date">${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}</div>
                </div>
                <div class="entry-subtitle">
                  <div>${exp.role}</div>
                  <div class="entry-location">${exp.location || ''}</div>
                </div>
                ${exp.bullets && exp.bullets.length > 0 ? `
                  <ul class="bullets">
                    ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    if (section === 'education' && education && education.length > 0) {
      const visibleEdu = education.filter(e => !e.hidden);
      if (visibleEdu.length > 0) {
        html += `
          <div class="section">
            <div class="section-title">${sectionLabels.education || 'Education'}</div>
            ${visibleEdu.map(edu => `
              <div class="entry">
                <div class="entry-header">
                  <div class="entry-title">${edu.institution}</div>
                  <div class="entry-date">${edu.startYear || ''} – ${edu.endYear || ''}</div>
                </div>
                <div class="entry-subtitle">
                  <div>${edu.degree}${edu.field ? `, ${edu.field}` : ''}</div>
                </div>
                ${edu.showCgpa && edu.cgpa ? `<div style="font-size:0.9em">CGPA: ${edu.cgpa}</div>` : ''}
                ${edu.coursework ? `<div style="font-size:0.9em">Relevant Coursework: ${edu.coursework}</div>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    if (section === 'skills' && skillGroups && skillGroups.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">${sectionLabels.skills || 'Skills'}</div>
          ${skillGroups.map(group => `
            <div class="skill-row">
              <div class="skill-cat">${group.category}:</div>
              <div class="skill-items">${group.skills.join(', ')}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (section === 'projects' && projects && projects.length > 0) {
      const visibleProj = projects.filter(e => !e.hidden);
      if (visibleProj.length > 0) {
        html += `
          <div class="section">
            <div class="section-title">${sectionLabels.projects || 'Projects'}</div>
            ${visibleProj.map(proj => `
              <div class="entry">
                <div class="entry-header">
                  <div><span class="entry-title">${proj.name}</span> <span style="font-size:0.9em">| ${proj.techStack.join(', ')}</span></div>
                  <div class="entry-date">
                    ${proj.githubLink ? `[GitHub] ` : ''}
                    ${proj.liveLink ? `[Live]` : ''}
                  </div>
                </div>
                <div style="margin-top:2px;">${proj.description}</div>
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    if (section === 'certifications' && certifications && certifications.length > 0) {
      const visibleCert = certifications.filter(e => !e.hidden);
      if (visibleCert.length > 0) {
        html += `
          <div class="section">
            <div class="section-title">${sectionLabels.certifications || 'Certifications'}</div>
            <ul class="bullets">
              ${visibleCert.map(cert => `
                <li>${cert.name} — ${cert.issuer} (${cert.year})${cert.link ? ` [Link]` : ''}</li>
              `).join('')}
            </ul>
          </div>
        `;
      }
    }
  });

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
};

exports.generatePDF = async (resume) => {
  // Use manual font size or compute smart fit
  const fontSize = resume.fontSizeOverride || calculateFit(resume);
  
  const html = generateHTML(resume, fontSize);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Wait for Google Fonts to load
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '14mm',
      right: '14mm'
    }
  });

  await browser.close();

  return pdfBuffer;
};
