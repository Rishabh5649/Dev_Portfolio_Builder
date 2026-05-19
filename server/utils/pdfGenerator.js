const puppeteer = require('puppeteer');
const { calculateFit } = require('./resumeFitCalculator');

/**
 * generateHTML — HTML that EXACTLY mirrors ClassicTemplate.jsx output.
 * Same font stacks, spacing variables, section layout, bullet/header patterns.
 * This guarantees pixel-level preview ↔ export consistency.
 */
const generateHTML = (resume, fontSize) => {
  const {
    header = {}, summary = '',
    experience = [], education = [], skillGroups = [],
    projects = [], certifications = [],
    publications = [], achievements = [], leadership = [],
    sectionOrder = [], sectionLabels = {}, hiddenSections = [],
    fontFamily = 'Georgia', spacing = {},
  } = resume;

  const sectionGap   = spacing.sectionGap   ?? 10;
  const lineHeight   = spacing.lineHeight   ?? 1.4;
  const paragraphGap = spacing.paragraphGap ?? 4;
  const pagePadding  = spacing.pagePadding  ?? 10;
  // 0 = ultra-compact ATS, 4 = normal default
  const bottomMargin = spacing.bottomMargin ?? 4;

  const FONT_STACKS = {
    'Georgia':         "'Georgia', 'Times New Roman', serif",
    'Times New Roman': "'Times New Roman', Times, serif",
    'Garamond':        "Garamond, 'EB Garamond', serif",
    'Merriweather':    "'Merriweather', Georgia, serif",
    'Inter':           "'Inter', system-ui, sans-serif",
    'Calibri':         "Calibri, 'Gill Sans', sans-serif",
    'Helvetica':       "Helvetica, Arial, sans-serif",
    'Lato':            "'Lato', Arial, sans-serif",
    'Poppins':         "'Poppins', 'Helvetica Neue', sans-serif",
  };
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Georgia'];
  const webFonts  = ['Inter', 'Merriweather', 'Lato', 'Poppins'];
  const gFontLink = webFonts.includes(fontFamily)
    ? `<link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g,'+')}:wght@400;600;700&display=swap" rel="stylesheet">`
    : '';

  const esc = (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const labels = {
    summary:        sectionLabels.summary        || 'Summary',
    education:      sectionLabels.education      || 'Education',
    skills:         sectionLabels.skills         || 'Skills',
    publications:   sectionLabels.publications   || 'Publications',
    projects:       sectionLabels.projects       || 'Projects',
    experience:     sectionLabels.experience     || 'Work Experience',
    certifications: sectionLabels.certifications || 'Certifications',
    achievements:   sectionLabels.achievements   || 'Achievements',
    leadership:     sectionLabels.leadership     || 'Leadership & Extracurriculars',
  };

  // ── CSS ─ exactly mirrors ClassicTemplate.jsx inline styles ──────────────
  const css = `
    /* @page: enforce A4 with zero printer margins — eliminates Puppeteer margin drift */
    @page {
      size: A4;
      margin: 0;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 794px;
      margin: 0; padding: 0;
    }
    body {
      font-family: ${fontStack};
      font-size: ${fontSize}pt;
      line-height: ${lineHeight};
      color: #333;
      background: #fff;
    }
    .page {
      width: 794px;
      /* top/sides match pagePadding; bottom uses bottomMargin (0 = ultra-compact) */
      padding: ${pagePadding}mm ${pagePadding + 2}mm ${bottomMargin}mm ${pagePadding + 2}mm;
    }

    /* ── Header ── */
    .hdr { text-align: center; margin-bottom: 6px; }
    .hdr-name {
      font-size: 1.8em; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.06em;
      color: #000; margin-bottom: 2px;
      /* Uses selected fontStack — NO hardcoded Arial */
      font-family: ${fontStack};
    }
    .hdr-title { font-size: 0.92em; color: #555; margin-bottom: 3px; }
    .hdr-contacts {
      font-size: 0.82em; color: #444;
      display: flex; flex-wrap: wrap; justify-content: center; gap: 0 2px;
    }
    .sep { color: #999; margin: 0 4px; }
    /* Thick divider below header — mirrors ClassicTemplate.jsx */
    .hdr-divider {
      border: none; border-top: 2px solid #111;
      margin: 8px 0 ${sectionGap}px 0;
    }

    /* ── Sections ── */
    .section { margin-bottom: ${sectionGap}px; }
    .sec-title {
      font-size: 1em; font-weight: 700;
      text-transform: uppercase;
      border-bottom: 1.5px solid #111;
      padding-bottom: 2px; margin-bottom: ${paragraphGap + 2}px;
      letter-spacing: 0.05em; color: #111;
    }

    /* ── Education ── */
    .edu-entry { margin-bottom: ${paragraphGap + 1}px; }
    .edu-row { display: flex; justify-content: space-between; align-items: baseline; }
    .edu-inst { font-weight: 700; color: #111; }
    /* GPA label AND value both bold — matches ClassicTemplate fix */
    .edu-score { font-size: 0.9em; color: #333; font-style: italic; font-weight: 700; }
    .edu-deg  { color: #333; font-size: 0.92em; font-style: italic; }
    .edu-date { color: #555; font-size: 0.88em; font-style: italic; white-space: nowrap; }
    .edu-note { font-size: 0.85em; color: #555; margin-top: 2px; }

    /* ── Skills ── */
    .skill-row { display: flex; margin-bottom: ${paragraphGap - 1}px; font-size: 0.95em; }
    .skill-cat { font-weight: 700; color: #111; margin-right: 4px; white-space: nowrap; }
    .skill-val { color: #333; }

    /* ── Publications ── */
    .pub-entry  { margin-bottom: ${paragraphGap}px; }
    .pub-bullet { display: flex; align-items: baseline; gap: 4px; }
    .pub-title  { font-weight: 600; color: #111; }
    .pub-meta   { font-size: 0.9em; color: #555; padding-left: 14px; font-style: italic; }
    .pub-desc   { font-size: 0.9em; color: #444; padding-left: 14px; }

    /* ── Projects ── */
    .proj-entry    { margin-bottom: ${paragraphGap + 1}px; }
    .proj-hdr      { display: flex; align-items: baseline; gap: 4px; }
    .proj-bullet   { color: #333; flex-shrink: 0; }
    .proj-name     { font-weight: 700; color: #111; }
    /* Tech Stack on its own indented line — matches ClassicTemplate sub-bullet */
    .proj-tech-row   { padding-left: 14px; font-size: 0.9em; color: #333; margin-top: 1px; }
    .proj-tech-label { font-weight: 700; color: #111; }
    .proj-desc       { font-size: 0.9em; color: #444; padding-left: 14px; margin-top: 1px; }

    /* ── Experience ── */
    .exp-entry  { margin-bottom: ${paragraphGap + 1}px; }
    .exp-hdr    { display: flex; justify-content: space-between; align-items: baseline; }
    .exp-inner  { display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap; }
    .exp-role   { font-weight: 700; color: #111; }
    /* Company bold — matches ClassicTemplate */
    .exp-co     { font-weight: 700; color: #111; }
    .exp-date   { color: #555; font-size: 0.88em; white-space: nowrap; font-style: italic; }
    .exp-bullet { font-size: 0.9em; color: #444; padding-left: 14px; margin-top: 1px; }

    /* ── Lists (certs, achievements, leadership) ── */
    .list-ul    { margin: 0; padding-left: 16px; list-style: disc; }
    .list-ul li { margin-bottom: ${paragraphGap - 1}px; color: #333; }
    .bold  { font-weight: 700; color: #111; }
    .muted { color: #555; }
  `;

  // ── Contact line ─────────────────────────────────────────────────────────
  const contacts = [
    header.email,
    header.phone,
    header.location,
    header.linkedin  ? header.linkedin.replace(/^https?:\/\//, '')  : '',
    header.github    ? header.github.replace(/^https?:\/\//, '')    : '',
    header.portfolio ? header.portfolio.replace(/^https?:\/\//, '') : '',
  ].filter(Boolean);

  const contactHtml = contacts.map((c, i) =>
    i === 0
      ? `<span>${esc(c)}</span>`
      : `<span class="sep">•</span><span>${esc(c)}</span>`
  ).join('');

  // ── Header block ─────────────────────────────────────────────────────────
  let body = `
    <div class="page">
      <div class="hdr">
        <div class="hdr-name">${esc(header.fullName)}</div>
        ${header.title ? `<div class="hdr-title">${esc(header.title)}</div>` : ''}
        <div class="hdr-contacts">${contactHtml}</div>
        <hr class="hdr-divider">
      </div>
  `;

  // ── Render each section ──────────────────────────────────────────────────
  sectionOrder.forEach(section => {
    if (hiddenSections.includes(section)) return;

    // SUMMARY
    if (section === 'summary' && summary) {
      body += `
        <div class="section">
          <div class="sec-title">${esc(labels.summary)}</div>
          <p style="color:#333">${esc(summary)}</p>
        </div>`;
    }

    // EDUCATION
    if (section === 'education') {
      const vis = education.filter(e => !e.hidden);
      if (vis.length > 0) {
        body += `<div class="section"><div class="sec-title">${esc(labels.education)}</div>`;
        vis.forEach(edu => {
          // Build score with label prefix (both bold via .edu-score)
          let scoreHtml = '';
          if (edu.showCgpa && edu.cgpa) {
            const lbl = String(edu.cgpa).includes('%') ? 'Percentage:' : 'GPA:';
            scoreHtml = `<span class="edu-score">${esc(lbl)} ${esc(edu.cgpa)}</span>`;
          }
          const dateStr = [edu.startYear, edu.endYear].filter(Boolean).join(' – ');
          body += `
            <div class="edu-entry">
              <div class="edu-row">
                <span class="edu-inst">${esc(edu.institution)}</span>
                ${scoreHtml}
              </div>
              <div class="edu-row">
                <span class="edu-deg">${esc([edu.degree, edu.field].filter(Boolean).join(', '))}</span>
                <span class="edu-date">${esc(dateStr)}</span>
              </div>
              ${edu.coursework ? `<div class="edu-note">Coursework: ${esc(edu.coursework)}</div>` : ''}
            </div>`;
        });
        body += `</div>`;
      }
    }

    // SKILLS
    if (section === 'skills' && skillGroups.length > 0) {
      body += `<div class="section"><div class="sec-title">${esc(labels.skills)}</div>`;
      skillGroups.forEach(g => {
        body += `
          <div class="skill-row">
            <span class="skill-cat">${esc(g.category)}:</span>
            <span class="skill-val">${esc(g.skills.join(', '))}</span>
          </div>`;
      });
      body += `</div>`;
    }

    // PUBLICATIONS
    if (section === 'publications') {
      const vis = publications.filter(p => !p.hidden);
      if (vis.length > 0) {
        body += `<div class="section"><div class="sec-title">${esc(labels.publications)}</div>`;
        vis.forEach(pub => {
          body += `
            <div class="pub-entry">
              <div class="pub-bullet"><span>•</span><span class="pub-title">${esc(pub.title)}</span></div>
              ${(pub.publisher || pub.year) ? `<div class="pub-meta">- ${esc([pub.publisher, pub.year].filter(Boolean).join(' — '))}</div>` : ''}
              ${pub.description ? `<div class="pub-desc">${esc(pub.description)}</div>` : ''}
            </div>`;
        });
        body += `</div>`;
      }
    }

    // PROJECTS
    if (section === 'projects') {
      const vis = projects.filter(p => !p.hidden);
      if (vis.length > 0) {
        body += `<div class="section"><div class="sec-title">${esc(labels.projects)}</div>`;
        vis.forEach(proj => {
          body += `
            <div class="proj-entry">
              <div class="proj-hdr">
                <span class="proj-bullet">•</span>
                <span class="proj-name">${esc(proj.name)}</span>
              </div>
              ${proj.techStack && proj.techStack.length > 0
                ? `<div class="proj-tech-row"><span class="proj-tech-label">Tech Stack: </span>${esc(proj.techStack.join(', '))}</div>`
                : ''}
              ${proj.description ? `<div class="proj-desc">– ${esc(proj.description)}</div>` : ''}
            </div>`;
        });
        body += `</div>`;
      }
    }

    // EXPERIENCE
    if (section === 'experience') {
      const vis = experience.filter(e => !e.hidden);
      if (vis.length > 0) {
        body += `<div class="section"><div class="sec-title">${esc(labels.experience)}</div>`;
        vis.forEach(exp => {
          const dateStr = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
          body += `
            <div class="exp-entry">
              <div class="exp-hdr">
                <span class="exp-inner">
                  <span style="color:#333;flex-shrink:0">• </span>
                  <span class="exp-role">${esc(exp.role)}</span>
                  ${exp.company ? `<span class="exp-co"> ${esc(exp.company)}</span>` : ''}
                </span>
                <span class="exp-date">${esc(dateStr)}</span>
              </div>
              ${(exp.bullets || []).filter(b => b && b.trim()).map(b =>
                `<div class="exp-bullet">– ${esc(b.replace(/^[•\-–]\s*/, ''))}</div>`
              ).join('')}
            </div>`;
        });
        body += `</div>`;
      }
    }

    // CERTIFICATIONS
    if (section === 'certifications') {
      const vis = certifications.filter(c => !c.hidden);
      if (vis.length > 0) {
        body += `
          <div class="section">
            <div class="sec-title">${esc(labels.certifications)}</div>
            <ul class="list-ul">
              ${vis.map(c =>
                `<li><span class="bold">${esc(c.name)}</span>${c.issuer ? ` <span class="muted">— ${esc(c.issuer)}</span>` : ''}${c.year ? ` <span class="muted">(${esc(c.year)})</span>` : ''}</li>`
              ).join('')}
            </ul>
          </div>`;
      }
    }

    // ACHIEVEMENTS
    if (section === 'achievements') {
      const vis = achievements.filter(a => !a.hidden);
      if (vis.length > 0) {
        body += `
          <div class="section">
            <div class="sec-title">${esc(labels.achievements)}</div>
            <ul class="list-ul">
              ${vis.map(a =>
                `<li>${a.title ? `<span class="bold">${esc(a.title)}: </span>` : ''}${esc(a.description || '')}</li>`
              ).join('')}
            </ul>
          </div>`;
      }
    }

    // LEADERSHIP
    if (section === 'leadership') {
      const vis = leadership.filter(l => !l.hidden);
      if (vis.length > 0) {
        body += `
          <div class="section">
            <div class="sec-title">${esc(labels.leadership)}</div>
            <ul class="list-ul">
              ${vis.map(l =>
                `<li>${l.title ? `<span class="bold">${esc(l.title)}</span>` : ''}${l.organization ? `<span class="muted">, ${esc(l.organization)}</span>` : ''}${l.description ? `: ${esc(l.description)}` : ''}</li>`
              ).join('')}
            </ul>
          </div>`;
      }
    }
  });

  body += `</div></body></html>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume</title>
  ${gFontLink}
  <style>${css}</style>
</head>
<body>${body}`;
};

// ── Shared Puppeteer Instance for ultra-fast PDF Exports ──────────────────────
let sharedBrowser = null;

const getSharedBrowser = async () => {
  if (sharedBrowser) {
    try {
      // Fast responsiveness check
      await sharedBrowser.version();
      return sharedBrowser;
    } catch (e) {
      console.warn('[PDF] Shared Puppeteer browser instance died, restarting...', e);
      try {
        await sharedBrowser.close();
      } catch (_) {}
      sharedBrowser = null;
    }
  }

  sharedBrowser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
      '--disable-default-apps',
    ],
  });
  return sharedBrowser;
};

// Clean up Chrome zombie process on server exit
process.on('exit', () => {
  if (sharedBrowser) {
    sharedBrowser.close().catch(() => {});
  }
});

// ── Puppeteer export ──────────────────────────────────────────────────────────
exports.generatePDF = async (resume) => {
  const fontSize    = resume.fontSizeOverride || calculateFit(resume);
  const usesWebFont = ['Inter', 'Merriweather', 'Lato', 'Poppins'].includes(resume.fontFamily);
  const html        = generateHTML(resume, fontSize);

  let page;
  try {
    const browser = await getSharedBrowser();
    page = await browser.newPage();

    // A4 at 96dpi = 794×1122px (297mm × 96/25.4 = 1122.5 → 1122)
    // Note: use 1122 not 1123 — Puppeteer rounds down, matching Chrome print
    const A4_H_PX = 1122;

    // Match browser preview viewport exactly
    await page.setViewport({ width: 794, height: A4_H_PX, deviceScaleFactor: 1 });

    // Resource interception: skip media and tracking/websockets during PDF layout compilation
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (type === 'image' || type === 'media' || type === 'websocket') {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Wait for web fonts; system fonts can use faster domcontentloaded
    await page.setContent(html, {
      waitUntil: usesWebFont ? 'networkidle0' : 'domcontentloaded',
      timeout: 15000,
    });

    // ── Measure actual rendered height inside headless Chrome ────────────────
    // Headless Chrome font metrics differ slightly from browser — this bridges the gap
    const contentHeight = await page.evaluate(() => {
      const el = document.querySelector('.page');
      return el ? Math.ceil(el.getBoundingClientRect().height) : document.body.scrollHeight;
    });

    console.log(`[PDF] content height: ${contentHeight}px, A4: ${A4_H_PX}px`);

    // If content is over A4 height (but within 15%), apply zoom to squeeze it in
    if (contentHeight > A4_H_PX && contentHeight <= A4_H_PX * 1.15) {
      const zoom = (A4_H_PX / contentHeight).toFixed(5);
      console.log(`[PDF] scaling to fit: zoom=${zoom}`);
      await page.addStyleTag({
        content: `html { zoom: ${zoom}; }`,
      });
    }

    // @page { size: A4; margin: 0 } in CSS handles all margins
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return pdfBuffer;
  } finally {
    if (page) await page.close().catch(() => {});
  }
};


// Export for server-side preview
exports.generateHTML = generateHTML;
