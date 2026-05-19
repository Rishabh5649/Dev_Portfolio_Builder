import { useMemo, useState, useEffect } from 'react';
import {
  X, Zap, CheckCircle2, AlertTriangle, Sparkles,
  Award, ShieldCheck, Terminal, Compass, Eye, ShieldAlert,
  Info, TrendingDown, Printer, RefreshCw
} from 'lucide-react';

export default function ATSAnalyzerModal({
  open,
  onClose,
  resume,
  activeCategory,
  setActiveCategory
}) {
  if (!open) return null;

  // ── 1. TYPING PERFORMANCE DEBOUNCE (400ms) ─────────────────────────────────
  const [debouncedResume, setDebouncedResume] = useState(resume);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsUpdating(true);
    const handler = setTimeout(() => {
      setDebouncedResume(resume);
      setIsUpdating(false);
    }, 400);

    return () => clearTimeout(handler);
  }, [resume]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  // ── 2. STABLE DETERMINISTIC RECRUITER CALIBRATED SCORING ENGINE ────────────
  const analysis = useMemo(() => {
    if (!debouncedResume) return null;

    const r = debouncedResume;
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
    if (!header.email) { presenceScore -= 12; presenceDeductions.push({ label: 'Missing Email Contact Info', penalty: -12 }); }
    if (!header.phone) { presenceScore -= 12; presenceDeductions.push({ label: 'Missing Phone Contact Info', penalty: -12 }); }
    if (!header.linkedin) { presenceScore -= 8; presenceDeductions.push({ label: 'Missing LinkedIn Professional Profile', penalty: -8 }); }
    if (!header.github) { presenceScore -= 5; presenceDeductions.push({ label: 'Missing GitHub Portfolio Link', penalty: -5 }); }
    if (!header.portfolio) { presenceScore -= 3; presenceDeductions.push({ label: 'Missing Personal Portfolio link', penalty: -3 }); }
    presenceScore = Math.max(0, presenceScore);

    // Student / Fresher Heuristic Detection
    const allSummaryText = (summary || '').toLowerCase();
    const experienceText = experience.map(e => (e.role || '') + ' ' + (e.company || '')).join(' ').toLowerCase();
    const educationText = education.map(e => (e.degree || '')).join(' ').toLowerCase();
    const isStudentOrFresher = experience.length <= 1 || 
      /student|fresher|intern|university|college|pursuing|undergrad|graduate/i.test(allSummaryText + ' ' + experienceText + ' ' + educationText);

    // B. RESUME COMPLETENESS (10% standard weight, 5% fresher weight)
    let completenessScore = 100;
    const completenessDeductions = [];
    
    // Check Summary
    if (!summary.trim()) {
      completenessScore -= 15;
      completenessDeductions.push({ label: 'Missing Professional Summary Profile', penalty: -15 });
    }

    // Check Experience
    if (experience.length === 0) {
      const penalty = isStudentOrFresher ? -5 : -25;
      completenessScore -= Math.abs(penalty);
      completenessDeductions.push({ 
        label: isStudentOrFresher ? 'Limited work experience for student/fresher profile' : 'Missing Work Experience History', 
        penalty 
      });
    }

    // Check Education
    if (education.length === 0) {
      completenessScore -= 15;
      completenessDeductions.push({ label: 'Missing Education Records', penalty: -15 });
    }

    // Check Skills
    if (skillGroups.length === 0) {
      completenessScore -= 15;
      completenessDeductions.push({ label: 'Missing Technical Skills Section', penalty: -15 });
    }

    // Check Projects
    if (projects.length === 0) {
      completenessScore -= 15;
      completenessDeductions.push({ label: 'Missing Technical Projects Section', penalty: -15 });
    }

    // Check Certifications
    if (certifications.length === 0) {
      completenessScore -= 8;
      completenessDeductions.push({ label: 'Missing Certifications Block', penalty: -8 });
    }

    // Check Extracurricular
    if (leadership.length === 0) {
      completenessScore -= 5;
      completenessDeductions.push({ label: 'Missing Extracurricular Leadership', penalty: -5 });
    }
    completenessScore = Math.max(0, completenessScore);

    // C. KEYWORD & SKILLS DIVERSITY (20% weight, 25% fresher weight)
    let skillsScore = 100;
    const skillsDeductions = [];
    const allSkills = skillGroups.flatMap(sg => sg.skills || []);
    const totalSkillsCount = allSkills.length;

    if (totalSkillsCount < 6) {
      skillsScore -= 15;
      skillsDeductions.push({ label: 'Sparse technical list (< 6 skills)', penalty: -15 });
    } else if (totalSkillsCount < 12) {
      skillsScore -= 5;
      skillsDeductions.push({ label: 'Moderate tech stacks presence', penalty: -5 });
    }

    if (skillGroups.length < 2) {
      skillsScore -= 5;
      skillsDeductions.push({ label: 'Poor skill categories clustering', penalty: -5 });
    }

    // Check duplicates
    const skillCounts = {};
    allSkills.forEach(s => {
      const norm = s.toLowerCase().trim();
      skillCounts[norm] = (skillCounts[norm] || 0) + 1;
    });
    const duplicateSkills = Object.keys(skillCounts).filter(k => skillCounts[k] > 1);
    if (duplicateSkills.length > 0) {
      const penalty = Math.min(10, duplicateSkills.length * 3);
      skillsScore -= penalty;
      skillsDeductions.push({ label: `Duplicate skill keywords redundancy (${duplicateSkills.length})`, penalty: -penalty });
    }

    // Outdated tech detection
    const outdatedTech = ['jquery', 'svn', 'cvs', 'ftp', 'frontpage', 'flash'];
    const foundOutdated = allSkills.filter(s => outdatedTech.includes(s.toLowerCase().trim()));
    if (foundOutdated.length > 0) {
      const penalty = Math.min(15, foundOutdated.length * 5);
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

    // D. ACTION VERBS & IMPACT (15% weight, 10% fresher weight)
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
        const penalty = Math.min(15, Math.round((0.8 - actionRatio) * 30));
        impactScore -= penalty;
        impactDeductions.push({ label: `Non-action leading words ratio (${Math.round((1 - actionRatio) * 100)}%)`, penalty: -penalty });
      }
    } else {
      const penalty = isStudentOrFresher ? -5 : -40;
      impactScore -= Math.abs(penalty);
      impactDeductions.push({ 
        label: isStudentOrFresher ? 'Action verbs have lower weight for fresher profile' : 'No experience bullets to evaluate', 
        penalty 
      });
    }

    // Verb repetition check
    const verbCounts = {};
    verbList.forEach(v => { verbCounts[v] = (v === 'built' || v === 'developed' || v === 'designed') ? Math.max(0, (verbCounts[v] || 0) + 0.3) : (verbCounts[v] || 0) + 1; });
    const repetitiveVerbs = Object.keys(verbCounts).filter(k => verbCounts[k] > 1);
    if (repetitiveVerbs.length > 0) {
      const penalty = Math.min(10, repetitiveVerbs.length * 3);
      impactScore -= penalty;
      impactDeductions.push({ label: `Repetitive leading verbs: "${repetitiveVerbs.join(', ')}"`, penalty: -penalty });
    }
    impactScore = Math.max(0, impactScore);

    // E. CONTENT QUALITY & SPECIFICITY (20% weight, 25% fresher weight)
    let contentScore = 100;
    const contentDeductions = [];
    let quantifiedCount = 0;
    let technicalDepthCount = 0;
    let vagueWordCount = 0;

    const quantPattern = /\b\d+(?:[\d,\.]*)*(?:%|\+|\s*(?:percent|x|k|M|m|B|b|million|billion|dollars|s|ms|fps))\b|\b\d+\b/;
    const techPattern = /caching|redis|optimization|api|database|pipeline|latency|throughput|architecture|refactored|migration|cloud|microservices|docker|concurrency|concurrent|scalability|scalable|pytorch|tensorflow|cnn|lstm|mern/;
    const vaguePattern = /\b(helped|worked\s+on|assisted|handled|responsible\s+for|tasks\s+included|participated|contributed)\b/i;

    bulletsToCheck.forEach(b => {
      if (quantPattern.test(b)) quantifiedCount++;
      if (techPattern.test(b.toLowerCase())) technicalDepthCount++;
      if (vaguePattern.test(b.toLowerCase())) vagueWordCount++;
    });

    if (totalBullets > 0) {
      const quantRatio = quantifiedCount / totalBullets;
      if (quantRatio < 0.4) {
        const penalty = isStudentOrFresher ? -5 : -15;
        contentScore -= Math.abs(penalty);
        contentDeductions.push({ label: `Low quantified achievements ratio (${Math.round(quantRatio * 100)}%)`, penalty });
      }
    } else {
      const penalty = isStudentOrFresher ? -5 : -30;
      contentScore -= Math.abs(penalty);
      contentDeductions.push({ label: 'No statements to quantify', penalty });
    }

    if (vagueWordCount > 0) {
      const penalty = Math.min(10, vagueWordCount * 3);
      contentScore -= penalty;
      contentDeductions.push({ label: `Passive/Vague phrasing warnings (${vagueWordCount})`, penalty: -penalty });
    }

    if (technicalDepthCount < 4) {
      const penalty = isStudentOrFresher ? -5 : -15;
      contentScore -= Math.abs(penalty);
      contentDeductions.push({ label: 'Lack of tech depth / system descriptors', penalty });
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
      const penalty = Math.min(12, excessivelyLongCount * 4);
      readabilityScore -= penalty;
      readabilityDeductions.push({ label: `Verbose bullets > 200 characters (${excessivelyLongCount})`, penalty: -penalty });
    }
    if (underdocumentedCount > 0) {
      const penalty = Math.min(10, underdocumentedCount * 3);
      readabilityScore -= penalty;
      readabilityDeductions.push({ label: `Under-documented bullets < 40 chars (${underdocumentedCount})`, penalty: -penalty });
    }
    if (summary.trim().length > 400) {
      readabilityScore -= 8;
      readabilityDeductions.push({ label: 'Professional Profile summary > 400 chars', penalty: -8 });
    }
    readabilityScore = Math.max(0, readabilityScore);

    // G. FORMATTING & DENSITY (20% weight)
    let formattingScore = 100;
    const formattingDeductions = [];
    const isSingleColumn = ['classic', 'minimal', 'developer', 'executive'].includes(r.template || 'classic');

    if (!isSingleColumn) {
      formattingScore -= 15;
      formattingDeductions.push({ label: 'Multi-column template selection (Parsing risk)', penalty: -15 });
    }
    if (spacing.pagePadding && spacing.pagePadding < 8) {
      formattingScore -= 8;
      formattingDeductions.push({ label: `Cramped margins (${spacing.pagePadding}mm < 8mm)`, penalty: -8 });
    }
    if (spacing.sectionGap && spacing.sectionGap < 8) {
      formattingScore -= 8;
      formattingDeductions.push({ label: `Dense section gaps (${spacing.sectionGap}px < 8px)`, penalty: -8 });
    }
    if (fontOverride && fontOverride < 10) {
      formattingScore -= 8;
      formattingDeductions.push({ label: `Illegible font override (${fontOverride}pt < 10pt)`, penalty: -8 });
    }
    formattingScore = Math.max(0, formattingScore);

    // ── FINAL COMBINED WEIGHTED SCORE ──
    const weights = isStudentOrFresher ? {
      skills: 0.25,
      formatting: 0.20,
      content: 0.25,
      impact: 0.10,
      readability: 0.10,
      completeness: 0.05,
      presence: 0.05
    } : {
      skills: 0.20,
      formatting: 0.20,
      content: 0.20,
      impact: 0.15,
      readability: 0.10,
      completeness: 0.10,
      presence: 0.05
    };

    const primaryScore = Math.round(
      (skillsScore * weights.skills) +
      (formattingScore * weights.formatting) +
      (contentScore * weights.content) +
      (impactScore * weights.impact) +
      (readabilityScore * weights.readability) +
      (completenessScore * weights.completeness) +
      (presenceScore * weights.presence)
    );

    // ── STRICT SCALING NORMALIZATION & CEILING LOGIC (RECRUITER GRADE BRACKETS) ──
    let finalScore = primaryScore;

    // Soft reductions to bring raw scores into recruiter-realistic ranges:
    const softMultiplier = isStudentOrFresher ? 0.95 : 0.85;
    const softMultiplierRep = isStudentOrFresher ? 0.96 : 0.90;

    if (quantifiedCount < 3 && quantifiedCount > 0) {
      finalScore = Math.round(finalScore * softMultiplier);
    }
    if (technicalDepthCount < 3 && technicalDepthCount > 0) {
      finalScore = Math.round(finalScore * softMultiplierRep);
    }
    if (totalBullets < 6 && totalBullets >= 3) {
      finalScore = Math.round(finalScore * (isStudentOrFresher ? 0.97 : 0.88));
    }

    // Hard recruiter ceilings to prevent unrealistic score inflation
    if (quantifiedCount === 0) {
      finalScore = Math.min(finalScore, 71); // zero quantified achievements -> overall score cap around 70-72
    }
    if (technicalDepthCount < 3) {
      finalScore = Math.min(finalScore, 75); // weak technical depth -> cap around 75
    }
    if (vagueWordCount > 2) {
      finalScore = Math.min(finalScore, 78); // repetitive vague bullets -> cap around 78
    }
    if (readabilityScore < 80) {
      finalScore = Math.min(finalScore, 80); // poor readability -> cap around 80
    }

    // Additional strict recruiter caps for extreme brevity
    if (totalBullets === 0) {
      finalScore = Math.min(finalScore, 40);
    } else if (totalBullets < 3) {
      finalScore = Math.min(finalScore, 50);
    }

    finalScore = Math.max(35, Math.min(95, finalScore));

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
      isSingleColumn,
      vagueWordCount
    };
  }, [debouncedResume]);

  // ── 3. CONFIDENCE SYSTEM ──
  const confidenceData = useMemo(() => {
    if (!resume) return { rating: 'Limited Analysis', score: 20, color: 'var(--danger)' };
    
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
        color: 'var(--success)',
        desc: 'Comprehensive content volume ensures standard recruiting audit accuracy.'
      };
    }
    if (checklist >= 50) {
      return {
        rating: 'Medium Confidence',
        score: 65,
        color: 'var(--warning)',
        desc: 'Moderate details. Fill in additional experience bullets and keywords to unlock 100% confidence.'
      };
    }
    return {
      rating: 'Limited Analysis',
      score: 30,
      color: 'var(--danger)',
      desc: 'Sparse profile details. Populate experience and list tools for accurate results.'
    };
  }, [resume]);

  // ── 4. RESUME SPACING DENSITY ANALYZER ──
  const densityData = useMemo(() => {
    if (!resume) return { rating: 'Balanced', color: 'var(--success)', text: 'Optimal layout density.' };
    const spacing = resume.spacing || {};
    const padding = spacing.pagePadding ?? 10;
    const gap = spacing.sectionGap ?? 10;
    const font = resume.fontSizeOverride ?? 11;
    
    if (padding < 8 || gap < 8 || font < 10) {
      return {
        rating: 'Overcrowded',
        color: 'var(--danger)',
        text: 'Layout density is overcrowded. Try using the "Auto Fit" spacing tool to establish balanced page counts.'
      };
    }
    if (padding > 15 && gap > 15) {
      return {
        rating: 'Loose Density',
        color: 'var(--warning)',
        text: 'Layout is under-utilized. Reduce gaps or use "Auto Fit" to compact vertical elements into a crisp presentation.'
      };
    }
    return {
      rating: 'Balanced',
      color: 'var(--success)',
      text: 'Layout and typography sizing match standard scanner margins and human readability guidelines.'
    };
  }, [resume]);

  // ── 5. MAJOR ATS RISKS CARD ──
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
        deduction: -35
      });
    }
    const spacing = resume.spacing || {};
    if (spacing.pagePadding && spacing.pagePadding < 8) {
      risks.push({
        title: 'Overcrowded Layout Margins',
        desc: `Cramped borders (${spacing.pagePadding}mm) impede scanners and degrade scannability.`,
        severity: 'medium',
        deduction: -15
      });
    }
    if (analysis.techDepth < 50) {
      risks.push({
        title: 'Weak Technical Specificity',
        desc: 'Missing strong engineering concepts reduces matching odds in targeted pipeline software.',
        severity: 'medium',
        deduction: -25
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

  // ── 6. CLICK DETAILED RECRUITER AUDIT DRAWER ──
  const drawerInfo = useMemo(() => {
    if (!selectedCategory || !analysis) return null;
    const isCategory = ['formatting', 'content', 'skills', 'impact', 'readability'].includes(selectedCategory);
    const spacing = resume.spacing || {};
    const fontOverride = resume.fontSizeOverride || 11;

    if (isCategory) {
      switch (selectedCategory) {
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
              'Ensure font size is at least 10pt to keep text scannable on standard recruiter dashboards.'
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
            strengths: analysis.readabilityScore >= 80 ? ['Excellent scannability across experience blocks.'] : [],
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
      const sec = selectedCategory;
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
  }, [selectedCategory, analysis, resume]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getHeatmapColor = (status) => {
    if (status === 'strong') return 'var(--success)';
    if (status === 'average') return 'var(--warning)';
    return 'var(--danger)';
  };

  const handlePrint = () => {
    window.print();
  };

  if (!analysis) return null;

  return (
    <div className="rb-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 5, 10, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: 'var(--text-primary)',
      fontFamily: "var(--font-body)"
    }}>
      {/* Resizable Modal Card holding split layout */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: selectedCategory ? '1200px' : '980px',
        height: '86vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '16px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-base)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Resume Recruiter Audit & ATS Diagnostics
            </h2>
            {isUpdating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent)' }}>
                <RefreshCw size={12} className="animate-spin" /> Recalculating...
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handlePrint}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            >
              <Printer size={14} /> Export Report
            </button>
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
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Double-column container */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* LEFT PANEL: The Main Dashboard View */}
          <div style={{
            flex: selectedCategory ? '0 0 60%' : '0 0 100%',
            overflowY: 'auto',
            padding: '24px',
            borderRight: selectedCategory ? '1px solid var(--border)' : 'none',
            transition: 'all 0.3s ease-in-out',
            boxSizing: 'border-box'
          }}>
            
            {/* Top Score Circular Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', marginBottom: '20px' }}>
              
              {/* Circular Score card */}
              <div style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: `8px solid var(--border)`,
                  borderTopColor: getScoreColor(analysis.finalScore),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  transform: 'rotate(-45deg)'
                }}>
                  <div style={{ transform: 'rotate(45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '34px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {analysis.finalScore}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                      / 100
                    </span>
                  </div>
                </div>

                <div style={{
                  background: `${getScoreColor(analysis.finalScore)}15`,
                  border: `1px solid ${getScoreColor(analysis.finalScore)}30`,
                  color: getScoreColor(analysis.finalScore),
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '10px'
                }}>
                  {analysis.finalScore >= 80 ? 'Exceptional Grade' : analysis.finalScore >= 68 ? 'Strong Match' : analysis.finalScore >= 55 ? 'Average Match' : 'Needs Optimization'}
                </div>

                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                  borderTop: '1px solid var(--border)',
                  paddingTop: '8px',
                  width: '100%'
                }}>
                  Calibrated recruiter-style score model. Hover/Select categories to highlight sheet spacing.
                </div>
              </div>

              {/* Category progress bars */}
              <div style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: 0 }}>
                    Category Breakdown
                  </h3>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Hover to inspect</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { label: 'Formatting & Layout Density', val: analysis.formattingScore, key: 'formatting' },
                    { label: 'Content Specificity & Metrics', val: analysis.contentScore, key: 'content' },
                    { label: 'Skills Diversity & Redundancy', val: analysis.skillsScore, key: 'skills' },
                    { label: 'Verbs & Structural Impact', val: analysis.impactScore, key: 'impact' },
                    { label: 'Readability & Scannability', val: analysis.readabilityScore, key: 'readability' },
                  ].map((item, idx) => {
                    const isHoveredOrSelected = selectedCategory === item.key || activeCategory === item.key;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          const nextVal = selectedCategory === item.key ? null : item.key;
                          setSelectedCategory(nextVal);
                          setActiveCategory(nextVal);
                        }}
                        onMouseEnter={() => {
                          if (!selectedCategory) setActiveCategory(item.key);
                        }}
                        onMouseLeave={() => {
                          if (!selectedCategory) setActiveCategory(null);
                        }}
                        style={{
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '6px',
                          background: isHoveredOrSelected ? 'var(--bg-elevated)' : 'transparent',
                          transition: 'all 0.2s',
                          border: isHoveredOrSelected ? '1px solid var(--accent)' : '1px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</span>
                          <span style={{ color: getScoreColor(item.val), fontWeight: 700 }}>{item.val}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: getScoreColor(item.val), width: `${item.val}%`, borderRadius: '4px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Specializations list */}
                <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Specialist tags:</span>
                  {analysis.specializations.length > 0 ? (
                    analysis.specializations.map((tag, i) => (
                      <span key={i} style={{ background: 'var(--accent-dim)', border: '1px solid rgba(108,99,255,0.3)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', fontWeight: 600 }}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>None parsed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Confidence & Spacing Density Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              
              {/* Confidence System Card */}
              <div style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <div style={{
                  background: `${confidenceData.color}15`,
                  border: `1px solid ${confidenceData.color}35`,
                  color: confidenceData.color,
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Audit Confidence</h4>
                    <span style={{ fontSize: '9px', background: `${confidenceData.color}20`, color: confidenceData.color, padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                      {confidenceData.rating}
                    </span>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                    {confidenceData.desc}
                  </p>
                </div>
              </div>

              {/* Spacing Density Card */}
              <div style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <div style={{
                  background: `${densityData.color}15`,
                  border: `1px solid ${densityData.color}35`,
                  color: densityData.color,
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Info size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Layout Density</h4>
                    <span style={{ fontSize: '9px', background: `${densityData.color}20`, color: densityData.color, padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                      {densityData.rating}
                    </span>
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                    {densityData.text}
                  </p>
                </div>
              </div>

            </div>

            {/* Analysis Limitations transparent notice */}
            <div style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <Info size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Analysis Limitations:</strong> The ATS scoring system is advisory, heuristic-based guidelines mirroring standard modern recruiter checks. Resume parser results vary between enterprise employers; scores do not guarantee specific interview or employment outcomes.
              </div>
            </div>

            {/* Major ATS Risks List Card */}
            <div style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <ShieldAlert size={14} style={{ color: 'var(--danger)' }} /> Critical Parser Vulnerabilities
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {majorRisks.map((risk, i) => (
                  <div key={i} style={{
                    background: 'var(--danger-dim)',
                    border: '1px solid rgba(255,77,109,0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        background: 'rgba(255,77,109,0.15)',
                        color: 'var(--danger)',
                        fontSize: '8px',
                        fontWeight: 800,
                        padding: '1px 4px',
                        borderRadius: '3px',
                        textTransform: 'uppercase'
                      }}>
                        {risk.severity} Risk
                      </span>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1px' }}>{risk.title}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{risk.desc}</div>
                      </div>
                    </div>
                    {risk.deduction < 0 && (
                      <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        {risk.deduction} PTS
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Visually Clickable Strength Map */}
            <div style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Eye size={14} style={{ color: 'var(--accent)' }} /> Visual Section Strength Map
              </h3>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '12px', margin: 0 }}>
                Audits individual resume segments. Hover segments to highlight sheet content; click to view drawer checklist.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Header Presence', key: 'header' },
                  { label: 'Summary Profile', key: 'summary' },
                  { label: 'Education Details', key: 'education' },
                  { label: 'Work Experience', key: 'experience' },
                  { label: 'Technical Projects', key: 'projects' },
                  { label: 'Skill Sets', key: 'skills' }
                ].map((sec, i) => {
                  const strength = analysis.heatmap[sec.key] || 'weak';
                  const isHoveredOrSelected = selectedCategory === sec.key || activeCategory === sec.key;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        const nextVal = selectedCategory === sec.key ? null : sec.key;
                        setSelectedCategory(nextVal);
                        setActiveCategory(nextVal);
                      }}
                      onMouseEnter={() => {
                        if (!selectedCategory) setActiveCategory(sec.key);
                      }}
                      onMouseLeave={() => {
                        if (!selectedCategory) setActiveCategory(null);
                      }}
                      style={{
                        background: isHoveredOrSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                        border: `1px solid ${isHoveredOrSelected ? 'var(--accent)' : getHeatmapColor(strength) + '25'}`,
                        borderLeft: `3px solid ${getHeatmapColor(strength)}`,
                        padding: '10px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>{sec.label}</span>
                      <span style={{
                        fontSize: '8px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: getHeatmapColor(strength),
                        marginTop: '6px'
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
          {selectedCategory && drawerInfo && (
            <div style={{
              flex: '0 0 40%',
              overflowY: 'auto',
              background: 'var(--bg-base)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              borderLeft: '1px solid var(--border)'
            }}>
              
              {/* Drawer Title & Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {drawerInfo.title}
                </h3>
                <button
                  onClick={() => { setSelectedCategory(null); setActiveCategory(null); }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={12} />
                </button>
              </div>

              {/* Score breakdown inside drawer */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Section Audit Rank</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: getScoreColor(drawerInfo.score) }}>
                  {drawerInfo.score}%
                </span>
              </div>

              {/* Why This Matters recruiter annotation callout */}
              <div style={{
                background: 'var(--bg-elevated)',
                borderLeft: '3px solid var(--accent)',
                borderRadius: '4px',
                padding: '10px 12px',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                fontStyle: 'italic',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  <Info size={10} /> Recruiter Insight
                </div>
                "{drawerInfo.whyMatters}"
              </div>

              {/* Deductions breakdown list (Transparency!) */}
              {drawerInfo.deductions?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                    Transparent Deductions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {drawerInfo.deductions.map((ded, i) => (
                      <div key={i} style={{
                        background: 'var(--danger-dim)',
                        border: '1px dashed rgba(255,77,109,0.25)',
                        borderRadius: '6px',
                        padding: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <TrendingDown size={12} style={{ color: 'var(--danger)' }} />
                          <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{ded.label}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 700 }}>
                          {ded.penalty} PTS
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths checklist */}
              {drawerInfo.strengths?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                    Observed Strengths
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {drawerInfo.strengths.filter(Boolean).map((str, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '10px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        <span style={{ color: 'var(--success)', marginTop: '1px' }}>✓</span>
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable suggestions */}
              {drawerInfo.suggestions?.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                    Actionable Adjustments
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {drawerInfo.suggestions.filter(Boolean).map((sug, i) => (
                      <div key={i} style={{
                        background: 'var(--warning-dim)',
                        border: '1px solid rgba(255,184,48,0.18)',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '10px',
                        color: 'var(--text-primary)',
                        lineHeight: 1.3
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '1px' }}>Adjustment #{i+1}</div>
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
          padding: '12px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-base)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
            * The ATS system must prioritize explainability, consistency, and recruiter usefulness over artificially high scores.
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'var(--accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            Acknowledge Suggestions
          </button>
        </div>
      </div>

      {/* Hidden high-contrast printable audit document */}
      <div className="printable-ats-report-content" style={{ display: 'none' }}>
        <div style={{ fontFamily: 'sans-serif', padding: '40px', color: '#000', background: '#fff' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            Official Resume Recruiter Diagnostics Report
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
            <div>
              <strong>Candidate Name:</strong> {resume.header?.name || 'Developer Candidate'}<br />
              <strong>Audit Date:</strong> {new Date().toLocaleDateString()}<br />
              <strong>Confidence level:</strong> {confidenceData.rating} ({confidenceData.score}%)
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{analysis.finalScore} / 100</div>
              <strong>Overall Score Rank</strong>
            </div>
          </div>

          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '20px 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
            Category Metrics Breakdown
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Diagnostic Category</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Formatting & Margin spacing Boundaries</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis.formattingScore}%</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Content Specificity & Achievements</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis.contentScore}%</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Skills Diversity & Redundancy</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis.skillsScore}%</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Action Verbs & Contribution Style</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis.impactScore}%</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Readability & Character Limits</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis.readabilityScore}%</td>
              </tr>
            </tbody>
          </table>

          <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '20px 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
            Critical Recruiter Warnings & Deductions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {majorRisks.map((risk, i) => (
              <div key={i} style={{ padding: '8px 12px', borderLeft: '3px solid red', background: '#fff9f9', marginBottom: '8px' }}>
                <strong>{risk.title} ({risk.severity} severity)</strong><br />
                <span style={{ fontSize: '12px', color: '#555' }}>{risk.desc}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', fontSize: '11px', color: '#777', textAlign: 'center', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
            * This report was generated automatically. The ATS audit operates on deterministic heuristic metrics to assist in interview optimization.
          </div>
        </div>
      </div>
      
      {/* CSS Animation & Custom Print stylesheet for seamless print flow */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .printable-ats-report-content, .printable-ats-report-content * {
            visibility: visible !important;
          }
          .printable-ats-report-content {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            color: #000000 !important;
            z-index: 99999 !important;
          }
        }
      `}</style>
    </div>
  );
}
