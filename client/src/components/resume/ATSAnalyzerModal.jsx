import { useMemo } from 'react';
import {
  X, Zap, CheckCircle2, AlertTriangle, Sparkles,
  Award, ShieldCheck, Terminal, Compass, Eye, ShieldAlert,
  Info, TrendingDown
} from 'lucide-react';

export default function ATSAnalyzerModal({
  open,
  onClose,
  resume,
  activeCategory,
  setActiveCategory
}) {
  if (!open) return null;

  // ── 1. DETERMINISTIC ATS PENALTY & METRIC ENGINE ────────────────────────────
  const analysis = useMemo(() => {
    if (!resume) return null;

    const r = resume;
    const header = r.header || {};
    const summary = r.summary || '';
    const experience = (r.experience || []).filter(e => !e.hidden);
    const education = (r.education || []).filter(e => !e.hidden);
    const skillGroups = r.skillGroups || [];
    const projects = (r.projects || []).filter(p => !p.hidden);
    const certifications = (r.certifications || []).filter(c => !c.hidden);
    const achievements = (r.achievements || []).filter(a => !a.hidden);
    const publications = (r.publications || []).filter(p => !p.hidden);
    const leadership = (r.leadership || []).filter(l => !l.hidden);

    const spacing = r.spacing || {};
    const fontOverride = r.fontSizeOverride || 11;

    // Collect all description bullets/paragraphs
    const bulletsToCheck = [];
    experience.forEach(e => {
      if (Array.isArray(e.bullets)) {
        e.bullets.forEach(b => { if (b.trim()) bulletsToCheck.push(b.trim()); });
      }
    });
    projects.forEach(p => {
      if (p.description?.trim()) bulletsToCheck.push(p.description.trim());
    });
    const totalBullets = bulletsToCheck.length;

    // A. PROFESSIONAL PRESENCE (5% weight)
    let presenceScore = 100;
    const presenceDeductions = [];
    if (!header.email) {
      presenceScore -= 25;
      presenceDeductions.push({ label: 'Missing Email Contact Info', penalty: -25 });
    }
    if (!header.phone) {
      presenceScore -= 25;
      presenceDeductions.push({ label: 'Missing Phone Contact Info', penalty: -25 });
    }
    if (!header.linkedin) {
      presenceScore -= 20;
      presenceDeductions.push({ label: 'Missing LinkedIn Professional Profile', penalty: -20 });
    }
    if (!header.github) {
      presenceScore -= 15;
      presenceDeductions.push({ label: 'Missing GitHub Portfolio Link', penalty: -15 });
    }
    if (!header.portfolio) {
      presenceScore -= 15;
      presenceDeductions.push({ label: 'Missing Personal Portfolio link', penalty: -15 });
    }
    presenceScore = Math.max(0, presenceScore);

    // B. RESUME COMPLETENESS (10% weight)
    let completenessScore = 100;
    const completenessDeductions = [];
    if (!summary.trim()) {
      completenessScore -= 15;
      completenessDeductions.push({ label: 'Missing Professional Summary Profile', penalty: -15 });
    }
    if (experience.length === 0) {
      completenessScore -= 25;
      completenessDeductions.push({ label: 'Missing Work Experience History', penalty: -25 });
    }
    if (education.length === 0) {
      completenessScore -= 15;
      completenessDeductions.push({ label: 'Missing Education Records', penalty: -15 });
    }
    if (skillGroups.length === 0) {
      completenessScore -= 15;
      completenessDeductions.push({ label: 'Missing Technical Skills Section', penalty: -15 });
    }
    if (projects.length === 0) {
      completenessScore -= 15;
      completenessDeductions.push({ label: 'Missing Technical Projects Section', penalty: -15 });
    }
    if (certifications.length === 0) {
      completenessScore -= 10;
      completenessDeductions.push({ label: 'Missing Certifications Block', penalty: -10 });
    }
    if (achievements.length === 0 && leadership.length === 0) {
      completenessScore -= 5;
      completenessDeductions.push({ label: 'Missing Extracurricular achievements', penalty: -5 });
    }
    completenessScore = Math.max(0, completenessScore);

    // C. KEYWORD & SKILLS DIVERSITY (20% weight)
    let skillsScore = 100;
    const skillsDeductions = [];
    const allSkills = skillGroups.flatMap(sg => sg.skills || []);
    const totalSkillsCount = allSkills.length;

    if (totalSkillsCount < 6) {
      skillsScore -= 25;
      skillsDeductions.push({ label: 'Sparse technical list (< 6 skills)', penalty: -25 });
    } else if (totalSkillsCount < 12) {
      skillsScore -= 10;
      skillsDeductions.push({ label: 'Moderate tech stacks presence', penalty: -10 });
    }

    if (skillGroups.length < 3) {
      skillsScore -= 10;
      skillsDeductions.push({ label: 'Poor skill categories clustering', penalty: -10 });
    }

    // Check duplicates
    const skillCounts = {};
    allSkills.forEach(s => {
      const norm = s.toLowerCase().trim();
      skillCounts[norm] = (skillCounts[norm] || 0) + 1;
    });
    const duplicateSkills = Object.keys(skillCounts).filter(k => skillCounts[k] > 1);
    if (duplicateSkills.length > 0) {
      const penalty = duplicateSkills.length * 5;
      skillsScore -= penalty;
      skillsDeductions.push({ label: `Duplicate skill keywords redundancy (${duplicateSkills.length})`, penalty: -penalty });
    }

    // Outdated tech detection
    const outdatedTech = ['jquery', 'svn', 'cvs', 'ftp', 'frontpage', 'flash'];
    const foundOutdated = allSkills.filter(s => outdatedTech.includes(s.toLowerCase().trim()));
    if (foundOutdated.length > 0) {
      const penalty = foundOutdated.length * 15;
      skillsScore -= penalty;
      skillsDeductions.push({ label: `Legacy tools listed (${foundOutdated.join(', ')})`, penalty: -penalty });
    }

    // Specialize check
    const specializations = [];
    const skillStr = allSkills.join(' ').toLowerCase();
    if (/pytorch|tensorflow|scikit-learn|numpy|pandas|machine learning|deep learning|cnn|lstm|nlp/.test(skillStr)) {
      specializations.push('AI/ML');
    }
    if (/aws|docker|kubernetes|ci\/cd|terraform|jenkins|gcp|azure|nginx/.test(skillStr)) {
      specializations.push('Cloud/DevOps');
    }
    if (/react|node|express|mongodb|next\.js|django|flask|javascript|typescript|html|css/.test(skillStr)) {
      specializations.push('Full Stack');
    }
    if (/python|tableau|powerbi|sql|statistics/.test(skillStr)) {
      specializations.push('Data Science');
    }
    skillsScore = Math.max(0, skillsScore);

    // D. ACTION VERBS & IMPACT (15% weight)
    let impactScore = 100;
    const impactDeductions = [];
    const actionVerbs = new Set([
      'built', 'developed', 'optimized', 'designed', 'led', 'implemented', 'architected',
      'created', 'managed', 'formulated', 'secured', 'deployed', 'engineered', 'enhanced',
      'coordinated', 'accelerated', 'reduced', 'increased', 'spearheaded', 'automated', 'streamlined', 'leveraged'
    ]);

    let actionVerbCount = 0;
    const verbList = [];
    bulletsToCheck.forEach(b => {
      const firstWord = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
      if (actionVerbs.has(firstWord)) {
        actionVerbCount++;
        verbList.push(firstWord);
      }
    });

    if (totalBullets > 0) {
      const actionRatio = actionVerbCount / totalBullets;
      if (actionRatio < 0.8) {
        const penalty = Math.round((1 - actionRatio) * 30);
        impactScore -= penalty;
        impactDeductions.push({ label: `Non-action leading words ratio (${Math.round((1 - actionRatio) * 100)}%)`, penalty: -penalty });
      }
    } else {
      impactScore -= 50;
      impactDeductions.push({ label: 'No experience bullets to evaluate', penalty: -50 });
    }

    // Verb repetition check
    const verbCounts = {};
    verbList.forEach(v => { verbCounts[v] = (verbCounts[v] || 0) + 1; });
    const repetitiveVerbs = Object.keys(verbCounts).filter(k => verbCounts[k] > 1);
    if (repetitiveVerbs.length > 0) {
      const penalty = repetitiveVerbs.length * 8;
      impactScore -= penalty;
      impactDeductions.push({ label: `Repetitive leading verbs: "${repetitiveVerbs.join(', ')}"`, penalty: -penalty });
    }
    impactScore = Math.max(0, impactScore);

    // E. CONTENT QUALITY & SPECIFICITY (20% weight)
    let contentScore = 100;
    const contentDeductions = [];
    let quantifiedCount = 0;
    let technicalDepthCount = 0;

    const quantPattern = /\b\d+(?:[\d,\.]*)*(?:%|\+|\s*(?:percent|x|k|M|m|B|b|million|billion|dollars|s|ms|fps))\b|\b\d+\b/;
    const techPattern = /caching|redis|optimization|api|database|pipeline|latency|throughput|architecture|refactored|migration|cloud|microservices|docker|concurrency|concurrent|scalability|scalable|pytorch|tensorflow|cnn|lstm|mern/;

    bulletsToCheck.forEach(b => {
      if (quantPattern.test(b)) quantifiedCount++;
      if (techPattern.test(b.toLowerCase())) technicalDepthCount++;
    });

    if (totalBullets > 0) {
      const quantRatio = quantifiedCount / totalBullets;
      if (quantRatio < 0.4) {
        const penalty = Math.round((0.4 - quantRatio) * 60);
        contentScore -= penalty;
        contentDeductions.push({ label: `Low quantified achievements ratio (${Math.round(quantRatio * 100)}%)`, penalty: -penalty });
      }
    } else {
      contentScore -= 40;
      contentDeductions.push({ label: 'No statements to quantify', penalty: -40 });
    }

    if (technicalDepthCount < 4) {
      contentScore -= 20;
      contentDeductions.push({ label: 'Lack of tech depth / system descriptors', penalty: -20 });
    }
    contentScore = Math.max(0, contentScore);

    // F. READABILITY & LAYOUT (10% weight)
    let readabilityScore = 100;
    const readabilityDeductions = [];
    let excessivelyLongCount = 0;
    let underdocumentedCount = 0;

    bulletsToCheck.forEach(b => {
      if (b.length > 200) excessivelyLongCount++;
      if (b.length < 40) underdocumentedCount++;
    });

    if (excessivelyLongCount > 0) {
      const penalty = excessivelyLongCount * 10;
      readabilityScore -= penalty;
      readabilityDeductions.push({ label: `Verbose bullets > 200 characters (${excessivelyLongCount})`, penalty: -penalty });
    }
    if (underdocumentedCount > 0) {
      const penalty = underdocumentedCount * 8;
      readabilityScore -= penalty;
      readabilityDeductions.push({ label: `Under-documented bullets < 40 chars (${underdocumentedCount})`, penalty: -penalty });
    }
    if (summary.trim().length > 400) {
      readabilityScore -= 15;
      readabilityDeductions.push({ label: 'Professional Profile summary > 400 chars', penalty: -15 });
    }
    readabilityScore = Math.max(0, readabilityScore);

    // G. FORMATTING & DENSITY (20% weight)
    let formattingScore = 100;
    const formattingDeductions = [];
    const isSingleColumn = ['classic', 'minimal', 'developer', 'executive'].includes(r.template || 'classic');

    if (!isSingleColumn) {
      formattingScore -= 25;
      formattingDeductions.push({ label: 'Multi-column template selection (Parsing risk)', penalty: -25 });
    }
    if (spacing.pagePadding && spacing.pagePadding < 8) {
      formattingScore -= 15;
      formattingDeductions.push({ label: `Cramped margins (${spacing.pagePadding}mm < 8mm)`, penalty: -15 });
    }
    if (spacing.sectionGap && spacing.sectionGap < 8) {
      formattingScore -= 15;
      formattingDeductions.push({ label: `Dense section gaps (${spacing.sectionGap}px < 8px)`, penalty: -15 });
    }
    if (fontOverride && fontOverride < 9.5) {
      formattingScore -= 15;
      formattingDeductions.push({ label: `Illegible tiny font override (${fontOverride}pt)`, penalty: -15 });
    }
    formattingScore = Math.max(0, formattingScore);

    // ── FINAL COMBINED WEIGHTED SCORE ──
    const finalScore = Math.round(
      (skillsScore * 0.20) +
      (formattingScore * 0.20) +
      (contentScore * 0.20) +
      (impactScore * 0.15) +
      (readabilityScore * 0.10) +
      (completenessScore * 0.10) +
      (presenceScore * 0.05)
    );

    // BREADCRUMBS READINESS
    const techDepth = Math.min(100, Math.round((technicalDepthCount / 5) * 100));
    const bigTechReadiness = Math.max(20, Math.round((finalScore * 0.4) + (techDepth * 0.3) + (quantifiedCount >= 3 ? 30 : quantifiedCount * 10)));
    const startupReadiness = Math.max(20, Math.round((skillsScore * 0.5) + (techDepth * 0.3) + (projects.length >= 2 ? 20 : 10)));
    const internshipReadiness = Math.max(20, Math.round((completenessScore * 0.6) + (education.length > 0 ? 40 : 10)));

    // Heatmap markers
    const heatmap = {
      header: presenceScore >= 80 ? 'strong' : presenceScore >= 50 ? 'average' : 'weak',
      summary: summary.trim() ? (summary.trim().length <= 400 ? 'strong' : 'average') : 'weak',
      education: education.length > 0 ? 'strong' : 'weak',
      experience: (experience.length > 0 && impactScore >= 75) ? 'strong' : experience.length > 0 ? 'average' : 'weak',
      projects: (projects.length > 0 && contentScore >= 75) ? 'strong' : projects.length > 0 ? 'average' : 'weak',
      skills: skillsScore >= 80 ? 'strong' : skillsScore >= 50 ? 'average' : 'weak'
    };

    return {
      finalScore,
      skillsScore,
      formattingScore,
      contentScore,
      impactScore,
      readabilityScore,
      completenessScore,
      presenceScore,
      specializations,
      quantifiedCount,
      technicalDepthCount,
      techDepth,
      bigTechReadiness,
      startupReadiness,
      internshipReadiness,
      heatmap,
      totalBullets,
      presenceDeductions,
      completenessDeductions,
      skillsDeductions,
      impactDeductions,
      contentDeductions,
      readabilityDeductions,
      formattingDeductions,
      isSingleColumn
    };
  }, [resume]);

  // ── 2. CONFIDENCE SYSTEM ──
  const confidenceData = useMemo(() => {
    if (!resume) return { rating: 'Limited Analysis', score: 20, color: '#D9534F' };
    
    let checklist = 0;
    const allText = (resume.summary || '') + 
      (resume.experience || []).flatMap(e => e.bullets || []).join(' ') + 
      (resume.projects || []).map(p => p.description || '').join(' ');
      
    const totalBullets = (resume.experience || []).flatMap(e => e.bullets || []).filter(Boolean).length;
    const techWords = (allText.match(/caching|redis|optimization|api|database|pipeline|latency|throughput|architecture|refactored|migration|cloud|microservices|docker/gi) || []).length;
    
    if (allText.length > 1000) checklist += 25;
    if (totalBullets >= 5) checklist += 25;
    if (techWords >= 3) checklist += 25;
    if (resume.skillGroups?.length >= 2) checklist += 25;

    if (checklist >= 75) {
      return {
        rating: 'High Confidence',
        score: 95,
        color: '#2CA58D',
        desc: 'Comprehensive content volume ensures standard recruiting audit accuracy.'
      };
    }
    if (checklist >= 50) {
      return {
        rating: 'Medium Confidence',
        score: 65,
        color: '#E2B93B',
        desc: 'Moderate details. Fill in additional experience bullets and system keywords to unlock 100% confidence.'
      };
    }
    return {
      rating: 'Limited Analysis',
      score: 30,
      color: '#D9534F',
      desc: 'Sparse profile details. Populate descriptions and list professional tools for accurate results.'
    };
  }, [resume]);

  // ── 3. RESUME SPACING DENSITY ANALYZER ──
  const densityData = useMemo(() => {
    if (!resume) return { rating: 'Balanced', color: '#2CA58D', text: 'Optimal layout density.' };
    const spacing = resume.spacing || {};
    const padding = spacing.pagePadding ?? 10;
    const gap = spacing.sectionGap ?? 10;
    const font = resume.fontSizeOverride ?? 11;
    
    if (padding < 8 || gap < 8 || font < 9.5) {
      return {
        rating: 'Overcrowded',
        color: '#D9534F',
        text: 'Layout density is overcrowded. Try using the "Auto Fit" utility in the Spacing panel to redistribute borders and establish balanced page counts.'
      };
    }
    if (padding > 15 && gap > 15) {
      return {
        rating: 'Loose Density',
        color: '#E2B93B',
        text: 'Layout is under-utilized. Reduce gaps or use "Auto Fit" to compact vertical elements into a crisp presentation.'
      };
    }
    return {
      rating: 'Balanced',
      color: '#2CA58D',
      text: 'Layout and typography sizing match standard scanner margins and human readability guidelines.'
    };
  }, [resume]);

  // ── 4. MAJOR ATS RISKS CARD ──
  const majorRisks = useMemo(() => {
    if (!analysis) return [];
    const risks = [];
    if (!analysis.isSingleColumn) {
      risks.push({
        title: 'Multi-column Layout',
        desc: 'Legacy ATS parsers fail to read multi-column text side-by-side, potentially misaligning experience timelines.',
        severity: 'high',
        deduction: -25
      });
    }
    if (analysis.quantifiedCount < 3) {
      risks.push({
        title: 'Lack of Quantified Achievements',
        desc: 'Hiring managers scan for concrete numeric values. Bullet points without metrics fail to prove direct scope.',
        severity: 'high',
        deduction: -20
      });
    }
    const spacing = resume.spacing || {};
    if (spacing.pagePadding && spacing.pagePadding < 8) {
      risks.push({
        title: 'Overcrowded Layout Margins',
        desc: `Cramped borders (${spacing.pagePadding}mm) impede scanners and degrade readability.`,
        severity: 'medium',
        deduction: -15
      });
    }
    if (analysis.techDepth < 50) {
      risks.push({
        title: 'Weak Technical Specificity',
        desc: 'Missing strong engineering concepts reduces matching odds in targeted pipeline software.',
        severity: 'medium',
        deduction: -15
      });
    }

    if (risks.length === 0) {
      risks.push({
        title: 'Clean Structural Profile',
        desc: 'No major structural parser vulnerabilities detected on this revision revision!',
        severity: 'safe',
        deduction: 0
      });
    }
    return risks.slice(0, 3);
  }, [analysis, resume]);

  // ── 5. CLICK DETAILED RECRUITER AUDIT DRAWER ──
  const drawerInfo = useMemo(() => {
    if (!activeCategory || !analysis) return null;
    const isCategory = ['formatting', 'content', 'skills', 'impact', 'readability'].includes(activeCategory);
    const spacing = resume.spacing || {};
    const fontOverride = resume.fontSizeOverride || 11;

    if (isCategory) {
      switch (activeCategory) {
        case 'formatting':
          return {
            title: 'Formatting & Margin Boundaries',
            score: analysis.formattingScore,
            whyMatters: 'Legacy ATS systems fail to parse multi-column formats, which overlap experience logs and cause auto-rejections.',
            strengths: analysis.isSingleColumn ? ['Excellent single-column layout structure guarantees 100% keyword capture.'] : [],
            weaknesses: !analysis.isSingleColumn ? ['Multi-column templates overlap vertical texts in older scanner parsers.'] : [],
            suggestions: [
              'Maintain page padding above 8mm for standard scanner scaling.',
              'Set section gaps between 8px and 12px to establish explicit borders.',
              'Ensure font size is at least 9.5pt to keep text scannable on standard recruiter dashboards.'
            ],
            deductions: analysis.formattingDeductions
          };
        case 'content':
          return {
            title: 'Content Quality & Specificity',
            score: analysis.contentScore,
            whyMatters: 'Hiring managers spend less than 6 seconds scanning resumes. Bullet points without concrete metrics fail to demonstrate professional scope and value.',
            strengths: analysis.quantifiedCount >= 3 ? ['High percentage of quantified achievements showing business metrics.'] : [],
            weaknesses: analysis.quantifiedCount < 3 ? ['Low proportion of statements contain concrete metrics or numeric values.'] : [],
            suggestions: [
              'Add concrete metrics (e.g. percentages, users, latency reductions) to at least 3 bullet points.',
              'Remove passive phrases like "worked on" and explicitly claim direct task ownership.',
              'Integrate high-specificity engineering concepts to pass software scans.'
            ],
            deductions: analysis.contentDeductions
          };
        case 'skills':
          return {
            title: 'Skills Diversity & Redundancy',
            score: analysis.skillsScore,
            whyMatters: 'Outdated libraries dilute developer focus, while duplicate keywords trigger strict deduplication filter penalties in HR software.',
            strengths: analysis.specializations.length > 0 ? [`Successfully categorized specialist tags: ${analysis.specializations.join(', ')}.`].filter(Boolean) : [],
            weaknesses: analysis.skillsDeductions.map(d => d.label),
            suggestions: [
              'Group skills clearly by technology category to simplify parser segmentation.',
              'Prune legacy frameworks (e.g. jQuery, SVN) in favor of modern standard stacks.',
              'De-duplicate terms to present a concise, impact-oriented skillset.'
            ],
            deductions: analysis.skillsDeductions
          };
        case 'impact':
          return {
            title: 'Verbs & Structural Impact',
            score: analysis.impactScore,
            whyMatters: 'Passive leading words mask your direct contributions. Strong, varied action verbs assert ownership and make accomplishments instantly scannable.',
            strengths: analysis.impactScore >= 80 ? ['Superb diversity of active leading verbs.'] : [],
            weaknesses: analysis.impactScore < 80 ? ['Several bullet points begin with passive leading words.'] : [],
            suggestions: [
              'Prune weak helper verbs ("helped with", "assisted in") and start with direct action verbs.',
              'Use varied action terms (e.g. "Spearheaded", "Optimized", "Architected").',
              'Review repetitive leading words across consecutive entries.'
            ],
            deductions: analysis.impactDeductions
          };
        case 'readability':
          return {
            title: 'Readability & Scannability',
            score: analysis.readabilityScore,
            whyMatters: 'Extremely long bullet points (>200 characters) are skipped by reviewers, while short entries (<40 characters) fail to express complete achievements.',
            strengths: analysis.readabilityScore >= 80 ? ['Excellent visual scannability across experience blocks.'] : [],
            weaknesses: analysis.readabilityScore < 80 ? ['Contains overly wordy summary or experience bullet blocks.'] : [],
            suggestions: [
              'Break up bullet items longer than 200 characters into separate single bullet lines.',
              'Keep professional summary under 3 lines (max 400 characters).',
              'Draft statements following the action-driven CAR method (Context, Action, Result).'
            ],
            deductions: analysis.readabilityDeductions
          };
        default:
          return null;
      }
    } else {
      // Detailed section audit
      const sec = activeCategory;
      const educ = (resume.education || []).filter(e => !e.hidden);
      const exp = (resume.experience || []).filter(e => !e.hidden);
      const proj = (resume.projects || []).filter(p => !p.hidden);
      const summary = resume.summary || '';
      
      switch (sec) {
        case 'summary':
          return {
            title: 'Summary Profile Audit',
            score: summary.trim() ? (summary.trim().length <= 400 ? 100 : 60) : 0,
            whyMatters: 'Hiring managers read the professional summary first to see if you have the core value proposition. Keep it brief and metrics-focused.',
            strengths: summary.trim() ? ['Section is active and present at the top.'] : [],
            weaknesses: summary.trim() ? [summary.trim().length > 400 ? 'Professional profile summary is verbose (>400 chars).' : ''] : ['Missing vital profile summary.'],
            suggestions: summary.trim() ? [summary.trim().length > 400 ? 'Trim text down to under 3 impact-driven lines.' : ''] : ['Draft a 3-sentence summary highlighting your core expertise and metrics.'],
            deductions: summary.trim() ? (summary.trim().length > 400 ? [{ label: 'Summary exceeds 400 characters', penalty: -15 }] : []) : [{ label: 'Missing entire Summary section', penalty: -40 }]
          };
        case 'experience':
          return {
            title: 'Work Experience Audit',
            score: exp.length > 0 ? analysis.impactScore : 0,
            whyMatters: 'Your professional work history is the core weight of standard audits. It must prove technical ownership, scale, and concrete metrics.',
            strengths: exp.length > 0 ? ['Work history blocks exist and are well structured.'] : [],
            weaknesses: exp.length === 0 ? ['Missing work experience history entirely.'] : [],
            suggestions: [
              'Ensure every experience bullet point starts with a bold action verb.',
              'Add numerical results to every job duty to show scope and business performance.'
            ],
            deductions: exp.length === 0 ? [{ label: 'Missing entire Experience section', penalty: -50 }] : []
          };
        case 'projects':
          return {
            title: 'Projects Section Audit',
            score: proj.length > 0 ? 95 : 0,
            whyMatters: 'Technical projects validate practical stack application. Strong project entries display self-directed learning and systems engineering skills.',
            strengths: proj.length > 0 ? ['Technical projects successfully specify developer stacks and details.'] : [],
            weaknesses: proj.length === 0 ? ['No personal or academic projects listed.'] : [],
            suggestions: [
              'Include a dedicated tech stack line for every project entry.',
              'Describe the architecture and system trade-offs in addition to functional features.'
            ],
            deductions: proj.length === 0 ? [{ label: 'Missing entire Projects section', penalty: -30 }] : []
          };
        case 'education':
          return {
            title: 'Education Section Audit',
            score: educ.length > 0 ? 100 : 0,
            whyMatters: 'Academic credentials verify structural training and foundational knowledge. Keep it formatted with high consistency.',
            strengths: educ.length > 0 ? ['Education section is well-structured with GPA/Percentage fields.'] : [],
            weaknesses: educ.length === 0 ? ['Missing academic background details.'] : [],
            suggestions: [
              'List institution name, degree, and graduation dates clearly.',
              'Include GPA or Percentage metrics if above standard recruiter bars.'
            ],
            deductions: educ.length === 0 ? [{ label: 'Missing entire Education section', penalty: -25 }] : []
          };
        case 'skills':
          return {
            title: 'Skills Section Audit',
            score: analysis.skillsScore,
            whyMatters: 'Your tech skills listing is a prime parser target. Categorize skills to ensure standard search engines match your stack perfectly.',
            strengths: skillGroups.length > 0 ? ['Skills are grouped logically by technical category.'] : [],
            weaknesses: skillGroups.length === 0 ? ['No skills listed on the resume sheet.'] : [],
            suggestions: [
              'Distribute your tech keywords into "Languages", "Frameworks", and "Tools" sections.',
              'Avoid listing more than 15 skills to keep sections scannable.'
            ],
            deductions: skillGroups.length === 0 ? [{ label: 'Missing entire Skills section', penalty: -30 }] : []
          };
        default:
          return {
            title: `${sec.toUpperCase()} Section Audit`,
            score: 90,
            whyMatters: 'Additional sections like Certifications, Achievements, and Publications show extracurricular drive and unique focus.',
            strengths: ['Additional section provides nice contextual background.'],
            weaknesses: [],
            suggestions: ['Ensure listed achievements are unique, relevant, and metrics-oriented.'],
            deductions: []
          };
      }
    }
  }, [activeCategory, analysis, resume]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#2CA58D'; // Forest green
    if (score >= 50) return '#E2B93B'; // Warm amber gold
    return '#D9534F'; // Red
  };

  const getHeatmapColor = (status) => {
    if (status === 'strong') return '#2CA58D';
    if (status === 'average') return '#E2B93B';
    return '#D9534F';
  };

  if (!analysis) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 15, 25, 0.72)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#E8EBF4',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Resizable Modal Card holding split layout */}
      <div style={{
        background: '#0B0F19',
        border: '1px solid #1E2535',
        borderRadius: '20px',
        width: '100%',
        maxWidth: activeCategory ? '1200px' : '980px',
        height: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #1E2535',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#0F1320'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: '#2CA58D' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              Resume Recruiter Audit & ATS Diagnostics
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8892A4',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8892A4'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Double-column container */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* LEFT PANEL: The Main Dashboard View */}
          <div style={{
            flex: activeCategory ? '0 0 60%' : '0 0 100%',
            overflowY: 'auto',
            padding: '28px',
            borderRight: activeCategory ? '1px solid #1E2535' : 'none',
            transition: 'all 0.3s ease-in-out',
            boxSizing: 'border-box'
          }}>
            
            {/* Top Score Circular Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', marginBottom: '24px' }}>
              
              {/* Circular Score card */}
              <div style={{
                background: '#0F1320',
                border: '1px solid #1E2535',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  border: `8px solid #1E2535`,
                  borderTopColor: getScoreColor(analysis.finalScore),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  transform: 'rotate(-45deg)'
                }}>
                  <div style={{ transform: 'rotate(45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '38px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                      {analysis.finalScore}
                    </span>
                    <span style={{ fontSize: '11px', color: '#8892A4', fontWeight: 600, marginTop: '2px' }}>
                      / 100
                    </span>
                  </div>
                </div>

                <div style={{
                  background: `${getScoreColor(analysis.finalScore)}15`,
                  border: `1px solid ${getScoreColor(analysis.finalScore)}30`,
                  color: getScoreColor(analysis.finalScore),
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '12px'
                }}>
                  {analysis.finalScore >= 80 ? 'Enterprise Grade' : analysis.finalScore >= 50 ? 'Strong Match' : 'Needs Optimization'}
                </div>

                <div style={{
                  fontSize: '11px',
                  color: '#8892A4',
                  lineHeight: 1.4,
                  borderTop: '1px solid #1E2535',
                  paddingTop: '10px',
                  width: '100%'
                }}>
                  This audit reflects spacing consistency balanced with keyword metrics. Select a card to inspect deductions.
                </div>
              </div>

              {/* Category progress bars */}
              <div style={{
                background: '#0F1320',
                border: '1px solid #1E2535',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8892A4', margin: 0 }}>
                    Category Breakdown
                  </h3>
                  <span style={{ fontSize: '11px', color: '#8892A4', fontStyle: 'italic' }}>Click bars to inspect</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Formatting & Layout Density', val: analysis.formattingScore, key: 'formatting' },
                    { label: 'Content Specificity & Metrics', val: analysis.contentScore, key: 'content' },
                    { label: 'Skills Diversity & Redundancy', val: analysis.skillsScore, key: 'skills' },
                    { label: 'Verbs & Structural Impact', val: analysis.impactScore, key: 'impact' },
                    { label: 'Readability & Scannability', val: analysis.readabilityScore, key: 'readability' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveCategory(activeCategory === item.key ? null : item.key)}
                      style={{
                        cursor: 'pointer',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: activeCategory === item.key ? '#1E2535' : 'transparent',
                        transition: 'all 0.2s',
                        border: activeCategory === item.key ? '1px solid #2CA58D' : '1px solid transparent'
                      }}
                      onMouseEnter={e => { if (activeCategory !== item.key) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { if (activeCategory !== item.key) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#E8EBF4', fontWeight: 600 }}>{item.label}</span>
                        <span style={{ color: getScoreColor(item.val), fontWeight: 700 }}>{item.val}%</span>
                      </div>
                      <div style={{ height: '5px', background: '#1E2535', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: getScoreColor(item.val), width: `${item.val}%`, borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specializations list */}
                <div style={{ marginTop: '12px', borderTop: '1px solid #1E2535', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#8892A4' }}>Specializations:</span>
                  {analysis.specializations.length > 0 ? (
                    analysis.specializations.map((tag, i) => (
                      <span key={i} style={{ background: 'rgba(44,165,141,0.08)', border: '1px solid rgba(44,165,141,0.3)', color: '#2CA58D', padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 600 }}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '11px', color: '#8892A4', fontStyle: 'italic' }}>None detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Confidence & Spacing Density Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              
              {/* Confidence System Card */}
              <div style={{
                background: '#0F1320',
                border: '1px solid #1E2535',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  background: `${confidenceData.color}15`,
                  border: `1px solid ${confidenceData.color}35`,
                  color: confidenceData.color,
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>Audit Confidence</h4>
                    <span style={{ fontSize: '10px', background: `${confidenceData.color}20`, color: confidenceData.color, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {confidenceData.rating}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#8892A4', margin: 0, lineHeight: 1.4 }}>
                    {confidenceData.desc}
                  </p>
                </div>
              </div>

              {/* Spacing Density Card */}
              <div style={{
                background: '#0F1320',
                border: '1px solid #1E2535',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  background: `${densityData.color}15`,
                  border: `1px solid ${densityData.color}35`,
                  color: densityData.color,
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Info size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>Layout Density</h4>
                    <span style={{ fontSize: '10px', background: `${densityData.color}20`, color: densityData.color, padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      {densityData.rating}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#8892A4', margin: 0, lineHeight: 1.4 }}>
                    {densityData.text}
                  </p>
                </div>
              </div>

            </div>

            {/* Career Readiness & Scale metrics clickable */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
              {[
                { label: 'Internship Ready', val: analysis.internshipReadiness, icon: <Compass size={14} />, color: '#00D4FF', key: 'internship' },
                { label: 'Startup Ready', val: analysis.startupReadiness, icon: <Zap size={14} />, color: '#E2B93B', key: 'startup' },
                { label: 'Big-Tech Ready', val: analysis.bigTechReadiness, icon: <Award size={14} />, color: '#FF6CAB', key: 'big_tech' },
                { label: 'Technical Depth', val: analysis.techDepth, icon: <Terminal size={14} />, color: '#2CA58D', key: 'tech_depth' }
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={() => setActiveCategory(activeCategory === card.key ? null : card.key)}
                  style={{
                    background: activeCategory === card.key ? '#1E2535' : '#0F1320',
                    border: activeCategory === card.key ? `1px solid ${card.color}` : '1px solid #1E2535',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { if (activeCategory !== card.key) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (activeCategory !== card.key) e.currentTarget.style.background = '#0F1320'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8892A4', fontSize: '11px', fontWeight: 600 }}>
                    <span style={{ color: card.color }}>{card.icon}</span>
                    {card.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginTop: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF' }}>{card.val}</span>
                    <span style={{ fontSize: '11px', color: '#8892A4' }}>%</span>
                  </div>
                  <div style={{ height: '3px', background: '#1E2535', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
                    <div style={{ height: '100%', background: card.color, width: `${card.val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Major ATS Risks List Card */}
            <div style={{
              background: '#0F1320',
              border: '1px solid #1E2535',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <ShieldAlert size={16} style={{ color: '#D9534F' }} /> Critical Parser Vulnerabilities
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {majorRisks.map((risk, i) => (
                  <div key={i} style={{
                    background: 'rgba(217, 83, 79, 0.05)',
                    border: '1px solid rgba(217, 83, 79, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{
                        background: 'rgba(217, 83, 79, 0.15)',
                        color: '#D9534F',
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 5px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        {risk.severity} Risk
                      </span>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#E8EBF4', marginBottom: '2px' }}>{risk.title}</div>
                        <div style={{ fontSize: '11px', color: '#8892A4', lineHeight: 1.3 }}>{risk.desc}</div>
                      </div>
                    </div>
                    {risk.deduction < 0 && (
                      <span style={{ fontSize: '11px', color: '#D9534F', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                        {risk.deduction} PTS
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Visually Clickable Strength Map */}
            <div style={{
              background: '#0F1320',
              border: '1px solid #1E2535',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Eye size={16} style={{ color: '#2CA58D' }} /> Visual Section Strength Map
              </h3>
              <p style={{ fontSize: '11px', color: '#8892A4', marginBottom: '14px', margin: 0 }}>
                Audits individual resume segments. Select a card to inspect section strengths and suggestions.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Header Presence', key: 'header' },
                  { label: 'Summary Profile', key: 'summary' },
                  { label: 'Education Details', key: 'education' },
                  { label: 'Work Experience', key: 'experience' },
                  { label: 'Technical Projects', key: 'projects' },
                  { label: 'Skill Sets', key: 'skills' }
                ].map((sec, i) => {
                  const strength = analysis.heatmap[sec.key] || 'weak';
                  const isActive = activeCategory === sec.key;
                  return (
                    <div
                      key={i}
                      onClick={() => setActiveCategory(activeCategory === sec.key ? null : sec.key)}
                      style={{
                        background: isActive ? '#1E2535' : '#0B0F19',
                        border: `1px solid ${isActive ? '#2CA58D' : getHeatmapColor(strength) + '25'}`,
                        borderLeft: `4px solid ${getHeatmapColor(strength)}`,
                        padding: '12px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#0B0F19'; }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#E8EBF4' }}>{sec.label}</span>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: getHeatmapColor(strength),
                        marginTop: '8px'
                      }}>
                        {strength === 'strong' ? '✓ Excellent' : strength === 'average' ? '⚠ Standard' : '✗ Weak'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Slide-over Recruiter Drawer Column */}
          {activeCategory && drawerInfo && (
            <div style={{
              flex: '0 0 40%',
              overflowY: 'auto',
              background: '#0F1320',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              
              {/* Drawer Title & Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {drawerInfo.title}
                </h3>
                <button
                  onClick={() => setActiveCategory(null)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8892A4',
                    cursor: 'pointer'
                  }}
                >
                  <X size={12} />
                </button>
              </div>

              {/* Score breakdown inside drawer */}
              <div style={{
                background: '#0B0F19',
                border: '1px solid #1E2535',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '12px', color: '#8892A4', fontWeight: 600 }}>Section Audit Rank</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: getScoreColor(drawerInfo.score) }}>
                  {drawerInfo.score}%
                </span>
              </div>

              {/* Why This Matters recruiter annotation callout */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                borderLeft: '3px solid #2CA58D',
                borderRadius: '4px',
                padding: '12px 14px',
                fontSize: '11px',
                color: '#8892A4',
                lineHeight: 1.4,
                fontStyle: 'italic',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#2CA58D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  <Info size={12} /> Recruiter Insight
                </div>
                "{drawerInfo.whyMatters}"
              </div>

              {/* Deductions breakdown list (Transparency!) */}
              {drawerInfo.deductions?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#8892A4', margin: '0 0 10px 0' }}>
                    Transparent Deductions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {drawerInfo.deductions.map((ded, i) => (
                      <div key={i} style={{
                        background: 'rgba(217, 83, 79, 0.04)',
                        border: '1px dashed rgba(217, 83, 79, 0.25)',
                        borderRadius: '6px',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <TrendingDown size={14} style={{ color: '#D9534F' }} />
                          <span style={{ fontSize: '11px', color: '#E8EBF4' }}>{ded.label}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#D9534F', fontWeight: 700 }}>
                          {ded.penalty} PTS
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths checklist */}
              {drawerInfo.strengths?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#8892A4', margin: '0 0 10px 0' }}>
                    Observed Strengths
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {drawerInfo.strengths.filter(Boolean).map((str, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: '#E8EBF4', lineHeight: 1.4 }}>
                        <span style={{ color: '#2CA58D', marginTop: '1px' }}>✓</span>
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable suggestions */}
              {drawerInfo.suggestions?.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#8892A4', margin: '0 0 10px 0' }}>
                    Actionable Adjustments
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {drawerInfo.suggestions.filter(Boolean).map((sug, i) => (
                      <div key={i} style={{
                        background: 'rgba(226,185,59,0.05)',
                        border: '1px solid rgba(226,185,59,0.18)',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '11px',
                        color: '#E8EBF4',
                        lineHeight: 1.4
                      }}>
                        <div style={{ fontWeight: 700, color: '#E2B93B', marginBottom: '2px' }}>Adjustment #{i+1}</div>
                        {sug}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Area */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #1E2535',
          background: '#0F1320',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#8892A4', fontStyle: 'italic', fontWeight: 500 }}>
            * The ATS system must prioritize explainability, consistency, and recruiter usefulness over artificially high scores.
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              background: '#2CA58D',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#22816E'}
            onMouseLeave={e => e.currentTarget.style.background = '#2CA58D'}
          >
            Acknowledge Suggestions
          </button>
        </div>
      </div>
      
      {/* CSS Animation for Drawer slide in */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
