import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import {
  Sparkles, FileText, UploadCloud, Clipboard, Printer, AlertCircle, CheckCircle2,
  TrendingUp, TrendingDown, Info, ShieldAlert, ArrowLeft, ArrowRight, Eye, RefreshCw, X, ShieldCheck
} from 'lucide-react';

export default function AtsAnalyzer() {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload'
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState('');

  // ── 1. SMART REGEX TEXT PARSER (EXTRACTS STRUCTURE FROM ANY TEXT) ─────────
  const parsedData = useMemo(() => {
    if (!rawText.trim()) return null;

    const lines = rawText.split('\n');
    const parsed = {
      summary: '',
      experience: [],
      projects: [],
      education: [],
      skillGroups: [],
      certifications: [],
      leadership: [],
      header: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' }
    };

    let currentSection = 'header';
    let tempExperience = null;
    let tempProject = null;
    let tempSkillGroup = null;

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
    const linkedinRegex = /(?:linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i;
    const githubRegex = /(?:github\.com\/[a-zA-Z0-9_-]+)/i;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Extract header contact info from early lines
      if (index < 12) {
        if (!parsed.header.name && trimmed.length > 3 && trimmed.length < 32 && !trimmed.includes('@') && !trimmed.includes('http')) {
          parsed.header.name = trimmed;
        }
        const emailMatch = trimmed.match(emailRegex);
        if (emailMatch) parsed.header.email = emailMatch[0];

        const phoneMatch = trimmed.match(phoneRegex);
        if (phoneMatch) parsed.header.phone = phoneMatch[0];

        const liMatch = trimmed.match(linkedinRegex);
        if (liMatch) parsed.header.linkedin = liMatch[0];

        const ghMatch = trimmed.match(githubRegex);
        if (ghMatch) parsed.header.github = ghMatch[0];
      }

      // Check section transitions using a cleaned cleanHeader helper
      const cleanHeader = trimmed.replace(/[:\-_\[\]\(\)]/g, '').trim().toLowerCase();
      
      if (/^(summary|objective|profile|about\s*me|executive\s*summary)$/i.test(cleanHeader) || 
          (/summary|objective|profile|about\s+me/i.test(trimmed) && trimmed.length < 24)) {
        currentSection = 'summary';
        return;
      }
      if (/^(experience|employment|work\s*history|professional\s*background|work\s*experience)$/i.test(cleanHeader) || 
          (/experience|employment|work\s+history/i.test(trimmed) && trimmed.length < 30)) {
        currentSection = 'experience';
        return;
      }
      if (/^(projects|personal\s*projects|academic\s*projects|technical\s*projects)$/i.test(cleanHeader) || 
          (/projects|personal\s+projects|academic\s+projects/i.test(trimmed) && trimmed.length < 24)) {
        currentSection = 'projects';
        return;
      }
      if (/^(skills|technical\s*skills|technical\s*expertise|technologies|proficiencies|skills\s*&\s*tools)$/i.test(cleanHeader) || 
          (/skills|technical\s+expertise|technologies|proficiencies/i.test(trimmed) && trimmed.length < 30)) {
        currentSection = 'skills';
        return;
      }
      if (/^(education|academic\s*background|credentials|academic\s*history)$/i.test(cleanHeader) || 
          (/education|academic\s+background/i.test(trimmed) && trimmed.length < 24)) {
        currentSection = 'education';
        return;
      }
      if (/^(certifications|licenses|courses|certifications\s*&\s*licenses)$/i.test(cleanHeader) || 
          (/certifications|licenses|courses/i.test(trimmed) && trimmed.length < 35)) {
        currentSection = 'certifications';
        return;
      }
      if (/^(leadership|activities|extracurricular|organizations|leadership\s*&\s*activities)$/i.test(cleanHeader) || 
          (/leadership|activities|extracurricular/i.test(trimmed) && trimmed.length < 30)) {
        currentSection = 'leadership';
        return;
      }

      // Populate sections
      switch (currentSection) {
        case 'summary':
          parsed.summary += (parsed.summary ? ' ' : '') + trimmed;
          break;
        case 'experience':
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('o ')) {
            const bulletText = trimmed.replace(/^[•\-\*\s\o]+/, '').trim();
            if (tempExperience) {
              tempExperience.bullets.push(bulletText);
            } else {
              tempExperience = { role: 'Software Engineer', company: 'Engineering Corp', duration: '', bullets: [bulletText] };
              parsed.experience.push(tempExperience);
            }
          } else if (trimmed.length > 40) {
            if (tempExperience) {
              tempExperience.bullets.push(trimmed);
            } else {
              tempExperience = { role: 'Software Engineer', company: 'Engineering Corp', duration: '', bullets: [trimmed] };
              parsed.experience.push(tempExperience);
            }
          } else if (trimmed.length > 4 && trimmed.length < 40) {
            tempExperience = { role: trimmed, company: '', duration: '', bullets: [] };
            parsed.experience.push(tempExperience);
          }
          break;
        case 'projects':
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('o ')) {
            const descText = trimmed.replace(/^[•\-\*\s\o]+/, '').trim();
            if (tempProject) {
              tempProject.description += (tempProject.description ? ' ' : '') + descText;
            } else {
              tempProject = { title: 'Project Developer', description: descText };
              parsed.projects.push(tempProject);
            }
          } else if (trimmed.length > 40) {
            if (tempProject) {
              tempProject.description += (tempProject.description ? ' ' : '') + trimmed;
            } else {
              tempProject = { title: 'Project Developer', description: trimmed };
              parsed.projects.push(tempProject);
            }
          } else if (trimmed.length > 3 && trimmed.length < 40) {
            tempProject = { title: trimmed, description: '' };
            parsed.projects.push(tempProject);
          }
          break;
        case 'skills':
          const skillsList = trimmed.split(/[,;|•\-\*]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 25);
          if (skillsList.length > 0) {
            if (tempSkillGroup) {
              tempSkillGroup.skills.push(...skillsList);
            } else {
              tempSkillGroup = { name: 'Technologies', skills: skillsList };
              parsed.skillGroups.push(tempSkillGroup);
            }
          }
          break;
        case 'education':
          if (trimmed.length > 5 && trimmed.length < 90) {
            parsed.education.push({ degree: trimmed, institution: '', duration: '' });
          }
          break;
        case 'certifications':
          if (trimmed.length > 3 && trimmed.length < 80) {
            parsed.certifications.push({ name: trimmed });
          }
          break;
        case 'leadership':
          if (trimmed.length > 3 && trimmed.length < 80) {
            parsed.leadership.push({ role: trimmed });
          }
          break;
        default:
          break;
      }
    });

    return parsed;
  }, [rawText]);

  // ── 2. PARSING WARNINGS / CONFIDENCE SYSTEM ──
  const confidenceData = useMemo(() => {
    if (!rawText.trim()) return { rating: 'High Confidence', score: 100, color: 'var(--success)', desc: '', detectedSections: 5 };
    
    // Check which core sections we could detect headers for
    const hasSummary = /summary|objective|profile|about\s*me/i.test(rawText);
    const hasExperience = /experience|employment|work\s*history|professional\s*background/i.test(rawText);
    const hasSkills = /skills|technical\s*expertise|technologies|proficiencies/i.test(rawText);
    const hasEducation = /education|academic\s*background|credentials/i.test(rawText);
    const hasProjects = /projects|personal\s*projects|academic\s*projects/i.test(rawText);
    
    const detectedSections = [hasSummary, hasExperience, hasSkills, hasEducation, hasProjects].filter(Boolean).length;
    
    let rating = 'High Confidence';
    let score = 95;
    let color = 'var(--success)';
    let desc = 'Parser successfully identified core section layouts for standard recruiting diagnostics.';
    
    if (detectedSections < 3) {
      rating = 'Low Confidence';
      score = 35;
      color = 'var(--danger)';
      desc = 'Some sections could not be reliably extracted from the uploaded document. Paste raw text to ensure 100% accuracy.';
    } else if (detectedSections < 5) {
      rating = 'Medium Confidence';
      score = 70;
      color = 'var(--warning)';
      desc = 'Parser detected moderate section coverage. Consider double checking standard header names.';
    }
    
    return { rating, score, color, desc, detectedSections, hasSummary, hasExperience, hasSkills, hasEducation, hasProjects };
  }, [rawText]);

  // ── 3. DETERMINISTIC RECRUITER CALIBRATED SCORING ENGINE ─────────────────
  const analysis = useMemo(() => {
    if (!parsedData) return null;

    const p = parsedData;
    const header = p.header || {};
    const summary = p.summary || '';
    const experience = p.experience || [];
    const education = p.education || [];
    const skillGroups = p.skillGroups || [];
    const projects = p.projects || [];
    const certifications = p.certifications || [];
    const leadership = p.leadership || [];

    const bulletsToCheck = [];
    experience.forEach(e => {
      if (Array.isArray(e.bullets)) {
        e.bullets.forEach(b => { if (b.trim()) bulletsToCheck.push(b.trim()); });
      }
    });
    projects.forEach(pr => {
      if (pr.description?.trim()) bulletsToCheck.push(pr.description.trim());
    });
    const totalBullets = bulletsToCheck.length;

    // Student / Fresher Heuristic Detection
    const allSummaryText = (summary || '').toLowerCase();
    const experienceText = experience.map(e => (e.role || '') + ' ' + (e.company || '')).join(' ').toLowerCase();
    const educationText = education.map(e => (e.degree || '')).join(' ').toLowerCase();
    const isStudentOrFresher = experience.length <= 1 || 
      /student|fresher|intern|university|college|pursuing|undergrad|graduate/i.test(allSummaryText + ' ' + experienceText + ' ' + educationText);

    // Parsing confidence check
    const lowConf = confidenceData?.rating === 'Low Confidence';

    // A. PROFESSIONAL PRESENCE (5% weight)
    let presenceScore = 100;
    const presenceDeductions = [];
    if (!header.email) { presenceScore -= 12; presenceDeductions.push({ label: 'Missing Email Contact Info', penalty: -12 }); }
    if (!header.phone) { presenceScore -= 12; presenceDeductions.push({ label: 'Missing Phone Contact Info', penalty: -12 }); }
    if (!header.linkedin) { presenceScore -= 8; presenceDeductions.push({ label: 'Missing LinkedIn Professional Profile', penalty: -8 }); }
    if (!header.github) { presenceScore -= 5; presenceDeductions.push({ label: 'Missing GitHub Portfolio Link', penalty: -5 }); }
    if (!header.portfolio) { presenceScore -= 3; presenceDeductions.push({ label: 'Missing Personal Portfolio link', penalty: -3 }); }
    presenceScore = Math.max(0, presenceScore);

    // B. RESUME COMPLETENESS (10% standard weight, 5% fresher weight)
    let completenessScore = 100;
    const completenessDeductions = [];
    
    // Check Summary
    if (!summary.trim()) {
      const penalty = lowConf ? -3 : -15;
      completenessScore -= Math.abs(penalty);
      completenessDeductions.push({ 
        label: lowConf ? 'Summary could not be reliably extracted' : 'Missing Professional Summary Profile', 
        penalty 
      });
    }

    // Check Experience
    if (experience.length === 0) {
      const penalty = isStudentOrFresher ? -5 : (lowConf ? -5 : -25);
      completenessScore -= Math.abs(penalty);
      completenessDeductions.push({ 
        label: isStudentOrFresher 
          ? 'Limited work experience for student/fresher profile' 
          : (lowConf ? 'Work experience could not be reliably extracted from uploaded file' : 'Missing Work Experience History'), 
        penalty 
      });
    }

    // Check Education
    if (education.length === 0) {
      const penalty = lowConf ? -4 : -15;
      completenessScore -= Math.abs(penalty);
      completenessDeductions.push({ 
        label: lowConf ? 'Education could not be reliably extracted' : 'Missing Education Records', 
        penalty 
      });
    }

    // Check Skills
    if (skillGroups.length === 0) {
      const penalty = lowConf ? -4 : -15;
      completenessScore -= Math.abs(penalty);
      completenessDeductions.push({ 
        label: lowConf ? 'Technical skills could not be reliably extracted' : 'Missing Technical Skills Section', 
        penalty 
      });
    }

    // Check Projects
    if (projects.length === 0) {
      const penalty = lowConf ? -4 : -15;
      completenessScore -= Math.abs(penalty);
      completenessDeductions.push({ 
        label: lowConf ? 'Projects could not be reliably extracted' : 'Missing Technical Projects Section', 
        penalty 
      });
    }

    // Check Certifications
    if (certifications.length === 0) {
      const penalty = lowConf ? -2 : -8;
      completenessScore -= Math.abs(penalty);
      completenessDeductions.push({ 
        label: lowConf ? 'Certifications could not be reliably extracted' : 'Missing Certifications Block', 
        penalty 
      });
    }

    // Check Extracurricular
    if (leadership.length === 0) {
      const penalty = lowConf ? -1 : -5;
      completenessScore -= Math.abs(penalty);
      completenessDeductions.push({ 
        label: lowConf ? 'Extracurricular achievements could not be reliably extracted' : 'Missing Extracurricular Leadership', 
        penalty 
      });
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

    const skillCounts = {};
    allSkills.forEach(s => {
      const norm = s.toLowerCase().trim();
      skillCounts[norm] = (skillCounts[norm] || 0) + 1;
    });
    const duplicateSkills = Object.keys(skillCounts).filter(k => skillCounts[k] > 1);
    if (duplicateSkills.length > 0) {
      const penalty = Math.min(10, duplicateSkills.length * 3);
      skillsScore -= penalty;
      skillsDeductions.push({ label: `Duplicate skills keywords redundancy (${duplicateSkills.length})`, penalty: -penalty });
    }

    const outdatedTech = ['jquery', 'svn', 'cvs', 'ftp', 'frontpage', 'flash'];
    const foundOutdated = allSkills.filter(s => outdatedTech.includes(s.toLowerCase().trim()));
    if (foundOutdated.length > 0) {
      const penalty = Math.min(15, foundOutdated.length * 5);
      skillsScore -= penalty;
      skillsDeductions.push({ label: `Legacy tools listed (${foundOutdated.join(', ')})`, penalty: -penalty });
    }

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
    skillsScore = Math.max(0, skillsScore);

    // D. ACTION VERBS & IMPACT (15% weight, 10% fresher weight)
    let impactScore = 100;
    const impactDeductions = [];
    const actionVerbs = new Set([
      'built', 'developed', 'optimized', 'designed', 'led', 'implemented', 'architected',
      'created', 'managed', 'formulated', 'secured', 'deployed', 'engineered', 'enhanced',
      'automated', 'streamlined', 'leveraged', 'spearheaded', 'reduced', 'increased'
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

    // F. READABILITY & SCAN (10% weight)
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

    // G. FORMATTING & DENSITY (20% weight - default perfect client-side paste, but penalize missing structural spacing cues)
    let formattingScore = 100;
    const formattingDeductions = [];
    if (totalBullets === 0) {
      formattingScore -= 15;
      formattingDeductions.push({ label: 'No structured bullet points parsed', penalty: -15 });
    }
    if (experience.length > 0 && !experience[0].role) {
      formattingScore -= 8;
      formattingDeductions.push({ label: 'Ill-formed employment headers', penalty: -8 });
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
      vagueWordCount
    };
  }, [parsedData, confidenceData]);


  // ── 4. DENSITY RATING ──
  const densityData = useMemo(() => {
    if (!rawText.trim()) return null;
    const charCount = rawText.length;
    if (charCount > 4000) {
      return { rating: 'Overcrowded', color: 'var(--danger)', text: 'Text character volume exceeds single-page recruiter scan limits.' };
    }
    if (charCount < 1000) {
      return { rating: 'Sparse Density', color: 'var(--warning)', text: 'Sparse resume text. Add more experience detail.' };
    }
    return { rating: 'Balanced Density', color: 'var(--success)', text: 'Optimal character length for human recruiters and ATS scanning profiles.' };
  }, [rawText]);

  // ── 5. MAJOR RISKS ──
  const majorRisks = useMemo(() => {
    if (!analysis) return [];
    const risks = [];
    if (analysis.quantifiedCount < 3) {
      const isFresher = analysis.completenessDeductions.some(d => d.label.toLowerCase().includes('fresher'));
      risks.push({
        title: 'Lack of Quantified Achievements',
        desc: 'HR reviewers evaluate concrete numeric scale. Bullet points without percentages or integers fail to prove accomplishments.',
        severity: isFresher ? 'medium' : 'high',
        deduction: isFresher ? -5 : -15
      });
    }
    if (analysis.techDepth < 50) {
      const isFresher = analysis.completenessDeductions.some(d => d.label.toLowerCase().includes('fresher'));
      risks.push({
        title: 'Shallow Keyword Depth',
        desc: 'Missing strong technical keywords lowers search indexing ranks in pipeline tracking applications.',
        severity: isFresher ? 'medium' : 'high',
        deduction: isFresher ? -5 : -15
      });
    }
    if (analysis.vagueWordCount > 2) {
      risks.push({
        title: 'Passive Phrasing Flags',
        desc: 'Frequent helper phrases ("assisted in", "helped on") weaken claims of technical leadership.',
        severity: 'medium',
        deduction: -10
      });
    }

    if (risks.length === 0) {
      risks.push({
        title: 'Clean Structural Profile',
        desc: 'No major structural parser vulnerabilities detected on this revision!',
        severity: 'safe',
        deduction: 0
      });
    }
    return risks.slice(0, 3);
  }, [analysis]);

  // ── 6. DRAWER INFOS ──
  const drawerInfo = useMemo(() => {
    if (!activeCategory || !analysis) return null;
    const isCategory = ['formatting', 'content', 'skills', 'impact', 'readability'].includes(activeCategory);

    if (isCategory) {
      switch (activeCategory) {
        case 'formatting':
          return {
            title: 'Formatting & Layout Structure',
            score: analysis.formattingScore,
            whyMatters: 'ATS software splits lines vertically. Clean structures preserve word layouts.',
            strengths: ['Pasted format is fully readable line-by-line.'],
            weaknesses: analysis.formattingDeductions.map(d => d.label),
            suggestions: ['Ensure standard tabs or bullet characters are consistently formatted.'],
            deductions: analysis.formattingDeductions
          };
        case 'content':
          return {
            title: 'Content Quality & Specificity',
            score: analysis.contentScore,
            whyMatters: 'Recruiters scan accomplishments within 6 seconds. Adding metrics ensures your value stands out immediately.',
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
            title: 'Action Verbs & Contribution Style',
            score: analysis.impactScore,
            whyMatters: 'Starting achievements with bold action verbs showcases strong technical ownership and leadership.',
            strengths: analysis.impactScore >= 85 ? ['Superb leading verb variety and impact style.'] : [],
            weaknesses: analysis.impactScore < 80 ? ['Several bullets begin with weak passive helper verbs.'] : [],
            suggestions: [
              'Replace passive terms with active verbs like "Spearheaded", "Architected", "Optimized".',
              'Prune repetitive verbs to maintain a crisp reading flow.'
            ],
            deductions: analysis.impactDeductions
          };
        case 'readability':
          return {
            title: 'Readability & Scannability',
            score: analysis.readabilityScore,
            whyMatters: 'Overly long entries block scanning. Concise, impact-oriented statements hold reviewer focus.',
            strengths: analysis.readabilityScore >= 80 ? ['Optimal bullet length constraints.'] : [],
            weaknesses: analysis.readabilityDeductions.map(d => d.label),
            suggestions: [
              'Trim bullets longer than 200 characters into separate lines.',
              'Ensure experience statements range between 60 and 160 characters.'
            ],
            deductions: analysis.readabilityDeductions
          };
        default:
          return null;
      }
    } else {
      const sec = activeCategory;
      switch (sec) {
        case 'header':
          return {
            title: 'Contact Header Presence',
            score: analysis.presenceScore,
            whyMatters: 'Missing contact info locks recruiters out. Provide email, phone, and standard links.',
            strengths: ['Critical contacts parsed successfully.'],
            weaknesses: analysis.presenceDeductions.map(d => d.label),
            suggestions: ['Ensure your LinkedIn, GitHub, and Portfolio URLs are correct.'],
            deductions: analysis.presenceDeductions
          };
        case 'summary':
          const summaryDeductions = analysis.completenessDeductions.filter(d => d.label.toLowerCase().includes('summary'));
          return {
            title: 'Summary Profile Audit',
            score: parsedData?.summary?.trim() ? 100 : (100 + summaryDeductions.reduce((acc, cur) => acc + cur.penalty, 0)),
            whyMatters: 'A professional profile summarizes your background in 3 quick lines.',
            strengths: parsedData?.summary?.trim() ? ['Summary is present and active.'] : [],
            weaknesses: !parsedData?.summary?.trim() ? [summaryDeductions[0]?.label || 'Missing professional profile summary.'] : [],
            suggestions: ['Draft a 3-sentence summary highlighting your engineering focus.'],
            deductions: summaryDeductions
          };
        case 'experience':
          const expDeductions = analysis.completenessDeductions.filter(d => d.label.toLowerCase().includes('experience') || d.label.toLowerCase().includes('work'));
          return {
            title: 'Work Experience History Audit',
            score: parsedData?.experience?.length > 0 ? 100 : (100 + expDeductions.reduce((acc, cur) => acc + cur.penalty, 0)),
            whyMatters: 'Experience logs prove professional capabilities. Always use bullets.',
            strengths: parsedData?.experience?.length > 0 ? ['Work logs parsed successfully.'] : [],
            weaknesses: parsedData?.experience?.length === 0 ? [expDeductions[0]?.label || 'Missing work history logs.'] : [],
            suggestions: ['Add professional job records using clean standard bullet points.'],
            deductions: expDeductions
          };
        default:
          return {
            title: `${sec.toUpperCase()} Segment Audit`,
            score: 85,
            whyMatters: 'Standard parser segments evaluate specific sections like Projects and Skills.',
            strengths: ['Section parsed successfully.'],
            weaknesses: [],
            suggestions: ['Add metric parameters to show project scope.'],
            deductions: []
          };
      }
    }
  }, [activeCategory, analysis, parsedData]);

  // ── 7. FRONTEND PDF PARSING ENGINE (PDF.JS OVERLAY) ──
  const loadPdfJS = () => {
    return new Promise((resolve, reject) => {
      if (window.pdfjsLib) {
        resolve(window.pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = () => {
        reject(new Error('Failed to load PDF parsing library. Please check your internet connection.'));
      };
      document.body.appendChild(script);
    });
  };

  const parsePdf = async (file) => {
    try {
      const pdfjsLib = await loadPdfJS();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const typedarray = new Uint8Array(e.target.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const items = textContent.items;
              if (items.length === 0) continue;
              
              // Group text items vertically using translateY coordinate
              const linesMap = {};
              items.forEach(item => {
                const y = Math.round(item.transform[5]); // Y coordinate
                const x = item.transform[4];            // X coordinate
                
                // Find a line within a small vertical threshold of 3.5px tolerance
                let foundLineY = null;
                for (const lineY in linesMap) {
                  if (Math.abs(Number(lineY) - y) <= 3.5) {
                    foundLineY = lineY;
                    break;
                  }
                }
                
                if (foundLineY !== null) {
                  linesMap[foundLineY].push({ text: item.str, x });
                } else {
                  linesMap[y] = [{ text: item.str, x }];
                }
              });
              
              // Sort lines descending by Y coordinate (PDF.js origin is bottom-left)
              const sortedLineKeys = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
              
              const pageLines = sortedLineKeys.map(y => {
                // Sort items on the same line from left to right (X coordinate)
                const lineItems = linesMap[y].sort((a, b) => a.x - b.x);
                return lineItems.map(item => item.text).join(' ').trim();
              }).filter(Boolean);
              
              fullText += pageLines.join('\n') + '\n';
            }
            resolve(fullText);
          } catch (err) {
            reject(new Error('Failed to parse PDF content. The file might be corrupted or image-only (scanned).'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file.'));
        reader.readAsArrayBuffer(file);
      });
    } catch (err) {
      throw new Error(err.message || 'Failed to load PDF extraction engine.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file) => {
    setFileName(file.name);
    setErrorMsg('');

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      setIsAnalyzing(true);
      setAnalysisStage('Loading PDF parsing engine...');
      try {
        const text = await parsePdf(file);
        if (!text.trim()) {
          setIsAnalyzing(false);
          setErrorMsg('The uploaded PDF contains no extractable text. It might be scanned or a flattened image. Please upload a standard digital PDF or paste the text directly.');
          return;
        }
        
        // Load text into state and switch active tab to allow raw text editing
        setRawText(text);
        setIsAnalyzing(false);
        setActiveTab('paste');
        setErrorMsg('');
        
        // Show a success message
        setPdfSuccessMsg(`Successfully parsed PDF "${file.name}"! You can now review, edit, and verify the parsed text below, then click "Initiate Recruiter Diagnostics" to analyze.`);
      } catch (err) {
        setIsAnalyzing(false);
        setErrorMsg(err.message || 'Failed to parse PDF document.');
      }
    } else {
      setErrorMsg('Unsupported format. Please upload a valid .pdf document, or copy-paste text directly.');
    }
  };

  const triggerAnalysisAnimation = () => {
    setIsAnalyzing(true);
    setAnalysisStage('Segmenting sections...');
    setTimeout(() => {
      setAnalysisStage('Analyzing leading action verbs...');
      setTimeout(() => {
        setAnalysisStage('Auditing quantified metrics...');
        setTimeout(() => {
          setAnalysisStage('Evaluating stack keyword specificity...');
          setTimeout(() => {
            setIsAnalyzing(false);
            setShowReport(true);
          }, 650);
        }, 550);
      }, 550);
    }, 550);
  };

  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 68) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getHeatmapColor = (status) => {
    if (status === 'strong') return 'var(--success)';
    if (status === 'average') return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', position: 'relative' }}>
      <div className="orb orb-purple" style={{ opacity: 0.15 }} />
      <div className="orb orb-cyan" style={{ opacity: 0.12 }} />
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        {/* Header Title */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent-dim)', border: '1px solid rgba(108,99,255,0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: 'var(--accent)', marginBottom: '12px' }}>
            <Sparkles size={14} /> ATS INTELLIGENCE ENGINE
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.03em' }}>
            Global ATS Resume Analyzer
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '640px', lineHeight: 1.6 }}>
            Execute rigorous recruiter-grade diagnostics on ANY resume document. Upload or paste content below to evaluate scannability, keyword density, and metrics.
          </p>
        </div>

        {/* Split UI Layout */}
        {!showReport ? (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Input Selection Tabs */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '4px',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => { setActiveTab('paste'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  background: activeTab === 'paste' ? 'var(--bg-elevated)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  color: activeTab === 'paste' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Clipboard size={14} /> Paste Resume Text
              </button>
              <button
                onClick={() => { setActiveTab('upload'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  background: activeTab === 'upload' ? 'var(--bg-elevated)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  color: activeTab === 'upload' ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <UploadCloud size={14} /> Upload PDF Resume
              </button>
            </div>

            {/* Input Method Content */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--glass-shadow)',
              marginBottom: '24px'
            }}>
              {activeTab === 'paste' ? (
                <div>
                  {pdfSuccessMsg && (
                    <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,224,150,0.06)', border: '1px solid rgba(0,224,150,0.2)', padding: '12px 14px', borderRadius: '8px', color: 'var(--success)', fontSize: '12px', fontWeight: 600, marginBottom: '16px', alignItems: 'center' }}>
                      <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>{pdfSuccessMsg}</div>
                      <button onClick={() => setPdfSuccessMsg('')} style={{ background: 'transparent', border: 'none', color: 'var(--success)', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={14} /></button>
                    </div>
                  )}
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                    Paste Raw Resume Content
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Copy all text from your resume document (Ctrl+A then Ctrl+C) and paste it here directly..."
                    style={{
                      width: '100%',
                      height: '240px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      padding: '16px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      resize: 'none',
                      outline: 'none',
                      lineHeight: 1.5,
                      marginBottom: '16px'
                    }}
                  />
                </div>
              ) : (
                <div>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-base)',
                      padding: '48px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      marginBottom: '16px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <UploadCloud size={38} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Drag and Drop your resume document</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Supported format: Adobe PDF (.pdf)
                    </p>
                    <label className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                      Select PDF File
                      <input type="file" onChange={handleFileUpload} accept=".pdf" style={{ display: 'none' }} />
                    </label>
                  </div>
                  {fileName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-base)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--success)', fontWeight: 600, marginBottom: '16px' }}>
                      <CheckCircle2 size={16} /> File Selected: {fileName}
                    </div>
                  )}
                </div>
              )}

              {/* Warnings / Error display */}
              {errorMsg && (
                <div style={{ display: 'flex', gap: '10px', background: 'var(--danger-dim)', border: '1px solid rgba(255,77,109,0.25)', padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', lineHeight: 1.5, marginBottom: '16px' }}>
                  <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
                  <div>{errorMsg}</div>
                </div>
              )}

              {/* Analysis limitations callout */}
              <div style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                marginBottom: '20px'
              }}>
                <Info size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Analysis Limitations:</strong> The ATS scoring system is advisory, heuristic-based guidelines mirroring standard modern recruiter checks. Resume parser results vary between enterprise employers; scores do not guarantee specific interview or employment outcomes.
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={triggerAnalysisAnimation}
                disabled={!rawText.trim() || isAnalyzing}
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(108,99,255,0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> {analysisStage}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Initiate Recruiter Diagnostics
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          
          /* RENDER REPORT COMPONENT */
          <div style={{ display: 'grid', gridTemplateColumns: activeCategory ? '1fr 400px' : '1fr', gap: '24px', alignItems: 'flex-start', animation: 'fadeInUp 0.4s ease forwards' }}>
            
            {/* LEFT MAIN DIAGNOSTICS CARD */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--glass-shadow)'
            }}>
              
              {/* Back to Input Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <button
                  onClick={() => { setShowReport(false); setActiveCategory(null); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowLeft size={14} /> Analyze Another Resume
                </button>

                <button
                  onClick={() => window.print()}
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
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Printer size={14} /> Export Report
                </button>
              </div>

              {/* Parsing warning box */}
              {confidenceData && confidenceData.rating !== 'High Confidence' && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(255,184,48,0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  marginBottom: '24px',
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '3px', color: 'var(--text-primary)' }}>
                      {confidenceData.rating === 'Low Confidence' ? 'Some sections could not be reliably extracted from the uploaded document.' : 'Moderate Section Alignment Detected'}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {confidenceData.rating === 'Low Confidence'
                        ? 'Because this parser relies on best-effort client-side heuristics, some resume layouts (especially dense or atypical PDFs) might lose section markers. We have automatically softened deductions to prevent false penalties. Recommend pasting raw resume text for 100% accurate results.'
                        : 'Core sections were detected but some structural headers could be optimized. We have adjusted deductions slightly to keep score calibration fair. Review the parsed raw text tab to make edits.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Core Score Circle Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* Score Circle Card */}
                <div style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
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
                    {analysis.finalScore >= 80 ? 'Exceptional Match' : analysis.finalScore >= 68 ? 'Strong Match' : analysis.finalScore >= 55 ? 'Average Match' : 'Weak Match'}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, borderTop: '1px solid var(--border)', paddingTop: '8px', width: '100%' }}>
                    Calibrated strict scorer. Click categories to inspect recruiter analysis.
                  </div>
                </div>

                {/* Category Progress Card */}
                <div style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: 0 }}>
                      Category Breakdown
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: activeCategory === item.key ? 'var(--bg-elevated)' : 'transparent',
                          transition: 'all 0.2s',
                          border: activeCategory === item.key ? '1px solid var(--accent)' : '1px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</span>
                          <span style={{ color: getScoreColor(item.val), fontWeight: 700 }}>{item.val}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: getScoreColor(item.val), width: `${item.val}%`, borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Specializations:</span>
                    {analysis.specializations.map((tag, i) => (
                      <span key={i} style={{ background: 'var(--accent-dim)', border: '1px solid rgba(108,99,255,0.3)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '12px', fontSize: '9px', fontWeight: 600 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Confidence & Spacing Density Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                
                {/* Confidence */}
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ background: `${confidenceData?.color}15`, border: `1px solid ${confidenceData?.color}35`, color: confidenceData?.color, padding: '6px', borderRadius: '6px' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Parser Confidence</h4>
                      <span style={{ fontSize: '9px', background: `${confidenceData?.color}20`, color: confidenceData?.color, padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        {confidenceData?.rating}
                      </span>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                      {confidenceData?.desc}
                    </p>
                  </div>
                </div>

                {/* Density */}
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ background: `${densityData?.color}15`, border: `1px solid ${densityData?.color}35`, color: densityData?.color, padding: '6px', borderRadius: '6px' }}>
                    <Info size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Text Density</h4>
                      <span style={{ fontSize: '9px', background: `${densityData?.color}20`, color: densityData?.color, padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        {densityData?.rating}
                      </span>
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                      {densityData?.text}
                    </p>
                  </div>
                </div>

              </div>

              {/* Major Risks Section */}
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <ShieldAlert size={14} style={{ color: 'var(--danger)' }} /> Critical Recruiter Warnings
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {majorRisks.map((risk, i) => (
                    <div key={i} style={{ background: 'var(--danger-dim)', border: '1px solid rgba(255,77,109,0.15)', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ background: 'rgba(255,77,109,0.15)', color: 'var(--danger)', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase' }}>
                          {risk.severity} Risk
                        </span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{risk.title}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{risk.desc}</div>
                        </div>
                      </div>
                      {risk.deduction < 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '8px' }}>
                          {risk.deduction} PTS
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap Visual strength map */}
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Eye size={14} style={{ color: 'var(--accent)' }} /> Visual Section Strength Map
                </h3>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '12px', margin: 0 }}>
                  Calculated using parsed text headers and structure. Click blocks to open detailed checklists.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { label: 'Contact Info', key: 'header' },
                    { label: 'Summary Profile', key: 'summary' },
                    { label: 'Education Records', key: 'education' },
                    { label: 'Work History', key: 'experience' },
                    { label: 'Projects List', key: 'projects' },
                    { label: 'Technical Skills', key: 'skills' }
                  ].map((sec, i) => {
                    const strength = analysis.heatmap[sec.key] || 'weak';
                    const isActive = activeCategory === sec.key;
                    return (
                      <div
                        key={i}
                        onClick={() => setActiveCategory(activeCategory === sec.key ? null : sec.key)}
                        style={{
                          background: isActive ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                          border: `1px solid ${isActive ? 'var(--accent)' : getHeatmapColor(strength) + '25'}`,
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
                        <span style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', color: getHeatmapColor(strength), marginTop: '6px' }}>
                          {strength === 'strong' ? '✓ Excellent' : strength === 'average' ? '⚠ Standard' : '✗ Weak'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT ALIGNED AUDIT COLUMN */}
            {activeCategory && drawerInfo && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--glass-shadow)',
                position: 'sticky',
                top: '90px',
                animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {drawerInfo.title}
                  </h3>
                  <button onClick={() => setActiveCategory(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={12} />
                  </button>
                </div>

                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Section Audit Rank</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: getScoreColor(drawerInfo.score) }}>
                    {drawerInfo.score}%
                  </span>
                </div>

                <div style={{ background: 'var(--bg-elevated)', borderLeft: '3px solid var(--accent)', borderRadius: '4px', padding: '10px 12px', fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4, fontStyle: 'italic', marginBottom: '16px' }}>
                  "{drawerInfo.whyMatters}"
                </div>

                {drawerInfo.deductions?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Transparent Deductions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {drawerInfo.deductions.map((ded, i) => (
                        <div key={i} style={{ background: 'var(--danger-dim)', border: '1px dashed rgba(255,77,109,0.25)', borderRadius: '6px', padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <TrendingDown size={12} style={{ color: 'var(--danger)' }} />
                            <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{ded.label}</span>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 700 }}>{ded.penalty} PTS</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {drawerInfo.strengths?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Observed Strengths</h4>
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

                {drawerInfo.suggestions?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Actionable Adjustments</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {drawerInfo.suggestions.filter(Boolean).map((sug, i) => (
                        <div key={i} style={{ background: 'var(--warning-dim)', border: '1px solid rgba(255,184,48,0.18)', borderRadius: '6px', padding: '8px 10px', fontSize: '10px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
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
        )}

      </div>

      {/* Hidden high-contrast printable audit document */}
      {parsedData && (
        <div className="printable-ats-report-content" style={{ display: 'none' }}>
          <div style={{ fontFamily: 'sans-serif', padding: '40px', color: '#000', background: '#fff' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
              Official Resume Recruiter Diagnostics Report
            </h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
              <div>
                <strong>Candidate Name:</strong> {parsedData.header?.name || 'Developer Candidate'}<br />
                <strong>Audit Date:</strong> {new Date().toLocaleDateString()}<br />
                <strong>Confidence level:</strong> {confidenceData?.rating} ({confidenceData?.score}%)
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{analysis?.finalScore} / 100</div>
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
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis?.formattingScore}%</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Content Specificity & Achievements</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis?.contentScore}%</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Skills Diversity & Redundancy</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis?.skillsScore}%</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Action Verbs & Contribution Style</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis?.impactScore}%</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Readability & Character Limits</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{analysis?.readabilityScore}%</td>
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
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(12px); opacity: 0; }
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
