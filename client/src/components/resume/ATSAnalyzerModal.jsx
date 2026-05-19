import { useMemo } from 'react';
import {
  X, Zap, CheckCircle2, AlertTriangle, Sparkles,
  Award, Heart, ShieldCheck, Terminal, Compass, Eye
} from 'lucide-react';

export default function ATSAnalyzerModal({ open, onClose, resume }) {
  if (!open) return null;

  // ── DETAILED DETERMINISTIC ATS ANALYSIS ENGINE ────────────────────────────
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

    const issues = [];
    const heatmap = {};

    // ────────────────────────────────────────────────────────────────────────
    // 1. PROFESSIONAL PRESENCE (5% weight)
    // ────────────────────────────────────────────────────────────────────────
    let presenceScore = 0;
    const presenceItems = [];

    if (header.email) {
      if (header.email.includes('@')) {
        presenceScore += 25;
        presenceItems.push({ label: 'Email Address', status: 'valid', detail: header.email });
      } else {
        presenceScore += 10;
        issues.push({ category: 'Presence', text: 'Email format is invalid or missing "@".', type: 'error' });
        presenceItems.push({ label: 'Email Address', status: 'warning', detail: 'Invalid format' });
      }
    } else {
      issues.push({ category: 'Presence', text: 'Add your email address in Contact Info.', type: 'error' });
      presenceItems.push({ label: 'Email Address', status: 'missing', detail: 'Not provided' });
    }

    if (header.phone) {
      const hasDigits = /\d{5,}/.test(header.phone);
      if (hasDigits) {
        presenceScore += 25;
        presenceItems.push({ label: 'Phone Number', status: 'valid', detail: header.phone });
      } else {
        presenceScore += 10;
        issues.push({ category: 'Presence', text: 'Phone number format is weak or lacks digits.', type: 'warning' });
        presenceItems.push({ label: 'Phone Number', status: 'warning', detail: 'Weak format' });
      }
    } else {
      issues.push({ category: 'Presence', text: 'Add your phone number in Contact Info.', type: 'error' });
      presenceItems.push({ label: 'Phone Number', status: 'missing', detail: 'Not provided' });
    }

    if (header.linkedin) {
      presenceScore += 25;
      presenceItems.push({ label: 'LinkedIn Profile', status: 'valid', detail: header.linkedin });
    } else {
      issues.push({ category: 'Presence', text: 'Add your LinkedIn profile link to increase recruiter visibility.', type: 'warning' });
      presenceItems.push({ label: 'LinkedIn Profile', status: 'missing', detail: 'Not provided' });
    }

    if (header.github) {
      presenceScore += 15;
      presenceItems.push({ label: 'GitHub Link', status: 'valid', detail: header.github });
    } else {
      issues.push({ category: 'Presence', text: 'Add your GitHub profile link for technical presence.', type: 'warning' });
      presenceItems.push({ label: 'GitHub Link', status: 'missing', detail: 'Not provided' });
    }

    if (header.portfolio) {
      presenceScore += 10;
      presenceItems.push({ label: 'Portfolio Website', status: 'valid', detail: header.portfolio });
    } else {
      presenceItems.push({ label: 'Portfolio Website', status: 'missing', detail: 'Not provided' });
    }

    heatmap.header = presenceScore >= 80 ? 'strong' : presenceScore >= 40 ? 'average' : 'weak';

    // ────────────────────────────────────────────────────────────────────────
    // 2. RESUME COMPLETENESS (10% weight)
    // ────────────────────────────────────────────────────────────────────────
    let completenessScore = 0;
    const missingSections = [];

    if (summary.trim()) completenessScore += 15; else missingSections.push('Summary');
    if (experience.length > 0) completenessScore += 20; else missingSections.push('Work Experience');
    if (education.length > 0) completenessScore += 15; else missingSections.push('Education');
    if (skillGroups.length > 0) completenessScore += 15; else missingSections.push('Skills');
    if (projects.length > 0) completenessScore += 15; else missingSections.push('Projects');
    if (certifications.length > 0) completenessScore += 10; else missingSections.push('Certifications');
    if (achievements.length > 0 || leadership.length > 0 || publications.length > 0) completenessScore += 10; else missingSections.push('Achievements/Leadership');

    if (missingSections.length > 0) {
      issues.push({
        category: 'Completeness',
        text: `Missing sections: ${missingSections.join(', ')}. Fill them in to increase completeness.`,
        type: 'error'
      });
    }

    heatmap.summary = summary.trim() ? 'strong' : 'weak';
    heatmap.education = education.length > 0 ? 'strong' : 'weak';

    // ────────────────────────────────────────────────────────────────────────
    // 3. KEYWORD & SKILLS STRENGTH (20% weight)
    // ────────────────────────────────────────────────────────────────────────
    let skillsScore = 0;
    const allSkills = skillGroups.flatMap(sg => sg.skills || []);
    const totalSkillsCount = allSkills.length;

    if (totalSkillsCount >= 13) skillsScore += 60;
    else if (totalSkillsCount >= 6) skillsScore += 45;
    else if (totalSkillsCount >= 1) skillsScore += 25;

    // Categorization bonus
    if (skillGroups.length >= 3) skillsScore += 20;
    else if (skillGroups.length >= 1) skillsScore += 10;

    // Check duplicates
    const skillCounts = {};
    allSkills.forEach(s => {
      const norm = s.toLowerCase().trim();
      skillCounts[norm] = (skillCounts[norm] || 0) + 1;
    });
    const duplicateSkills = Object.keys(skillCounts).filter(k => skillCounts[k] > 1);
    if (duplicateSkills.length > 0) {
      skillsScore = Math.max(0, skillsScore - (duplicateSkills.length * 5));
      issues.push({
        category: 'Skills',
        text: `Detected duplicate skills: ${duplicateSkills.join(', ')}. Keep skills concise and unique.`,
        type: 'warning'
      });
    }

    // Outdated tech detection
    const outdatedTech = ['jquery', 'svn', 'cvs', 'ftp', 'frontpage', 'flash'];
    const foundOutdated = allSkills.filter(s => outdatedTech.includes(s.toLowerCase().trim()));
    if (foundOutdated.length > 0) {
      skillsScore = Math.max(0, skillsScore - (foundOutdated.length * 10));
      issues.push({
        category: 'Skills',
        text: `Outdated technologies detected: ${foundOutdated.join(', ')}. Replace them with modern stacks.`,
        type: 'warning'
      });
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

    if (totalSkillsCount > 0) skillsScore += 20; // base skills weight completion
    skillsScore = Math.min(100, skillsScore);

    heatmap.skills = skillsScore >= 80 ? 'strong' : skillsScore >= 50 ? 'average' : 'weak';

    // ────────────────────────────────────────────────────────────────────────
    // 4. ACTION VERBS & IMPACT (15% weight)
    // ────────────────────────────────────────────────────────────────────────
    let impactScore = 0;
    const actionVerbs = new Set([
      'built', 'developed', 'optimized', 'designed', 'led', 'implemented', 'architected',
      'created', 'managed', 'formulated', 'secured', 'deployed', 'engineered', 'enhanced',
      'coordinated', 'accelerated', 'reduced', 'increased', 'formulated', 'spearheaded'
    ]);

    const bulletsToCheck = [];
    experience.forEach(e => {
      if (Array.isArray(e.bullets)) {
        e.bullets.forEach(b => { if (b.trim()) bulletsToCheck.push(b.trim()); });
      }
    });

    let actionVerbCount = 0;
    bulletsToCheck.forEach(b => {
      const firstWord = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
      if (actionVerbs.has(firstWord)) {
        actionVerbCount++;
      }
    });

    if (bulletsToCheck.length > 0) {
      const actionRatio = actionVerbCount / bulletsToCheck.length;
      if (actionRatio >= 0.75) impactScore += 100;
      else if (actionRatio >= 0.5) impactScore += 75;
      else if (actionRatio >= 0.25) impactScore += 50;
      else impactScore += 20;
    } else {
      impactScore = 20; // default low score
    }

    if (bulletsToCheck.length > 0 && actionVerbCount < bulletsToCheck.length / 2) {
      issues.push({
        category: 'Impact',
        text: 'Less than 50% of your Experience bullet points start with strong action verbs. Use verbs like "Spearheaded", "Optimized", "Architected".',
        type: 'warning'
      });
    }

    heatmap.experience = impactScore >= 75 ? 'strong' : experience.length > 0 ? 'average' : 'weak';

    // ────────────────────────────────────────────────────────────────────────
    // 5. CONTENT QUALITY & QUANTIFICATION (20% weight)
    // ────────────────────────────────────────────────────────────────────────
    let contentScore = 0;
    let quantifiedCount = 0;
    let technicalDepthCount = 0;

    // Pattern matches percentages, performance multipliers, time intervals, dollar amounts, large numbers
    const quantPattern = /\b\d+(?:[\d,\.]*)*(?:%|\+|\s*(?:percent|x|k|M|m|B|b|million|billion|dollars|s|ms|fps))\b|\b\d+\b/;

    // Strong technical concepts
    const techPattern = /caching|redis|optimization|api|database|pipeline|latency|throughput|architecture|refactored|migration|cloud|microservices|docker|concurrency|concurrent|scalability|scalable/;

    // Collect all description bullets/paragraphs from projects and experience
    const contentBullets = [...bulletsToCheck];
    projects.forEach(p => {
      if (p.description?.trim()) contentBullets.push(p.description.trim());
    });

    contentBullets.forEach(b => {
      if (quantPattern.test(b)) quantifiedCount++;
      if (techPattern.test(b.toLowerCase())) technicalDepthCount++;
    });

    if (quantifiedCount >= 4) contentScore += 50;
    else if (quantifiedCount >= 2) contentScore += 35;
    else if (quantifiedCount >= 1) contentScore += 20;
    else contentScore += 5;

    if (technicalDepthCount >= 4) contentScore += 50;
    else if (technicalDepthCount >= 2) contentScore += 35;
    else if (technicalDepthCount >= 1) contentScore += 20;
    else contentScore += 10;

    contentScore = Math.min(100, contentScore);

    if (contentBullets.length > 0 && quantifiedCount === 0) {
      issues.push({
        category: 'Quality',
        text: 'Projects and Experience lack quantified achievements. Add real metrics (e.g., "Reduced latency by 35%", "500+ active users").',
        type: 'error'
      });
    }

    heatmap.projects = contentScore >= 75 ? 'strong' : projects.length > 0 ? 'average' : 'weak';

    // ────────────────────────────────────────────────────────────────────────
    // 6. READABILITY & LAYOUT (10% weight)
    // ────────────────────────────────────────────────────────────────────────
    let readabilityScore = 100;

    // Bullet point counts/lengths check
    let excessivelyLongCount = 0;
    contentBullets.forEach(b => {
      if (b.length > 250) excessivelyLongCount++;
    });

    if (excessivelyLongCount > 0) {
      readabilityScore -= (excessivelyLongCount * 10);
      issues.push({
        category: 'Readability',
        text: `${excessivelyLongCount} bullet point(s) exceed 250 characters. Keep them concise for recruiter readability.`,
        type: 'warning'
      });
    }

    // Summary length check
    if (summary.trim().length > 600) {
      readabilityScore -= 20;
      issues.push({
        category: 'Readability',
        text: 'Professional Summary is too long (> 600 characters). Condense it into 2-3 impact-driven lines.',
        type: 'warning'
      });
    }

    readabilityScore = Math.max(20, readabilityScore);

    // ────────────────────────────────────────────────────────────────────────
    // 7. FORMATTING & DENSITY (20% weight)
    // ────────────────────────────────────────────────────────────────────────
    let formattingScore = 100;
    const formatAlerts = [];

    // Is it single column? Modern, minimal, classic templates are ATS-safe single column
    const isSingleColumn = ['classic', 'minimal', 'developer', 'executive'].includes(r.template || 'classic');

    if (!isSingleColumn) {
      formattingScore -= 15;
      formatAlerts.push({ text: 'Multi-column layouts (e.g. Modern) can sometimes pose parsing issues for legacy ATS systems.', type: 'warning' });
    } else {
      formatAlerts.push({ text: 'Sleek single-column formatting matches 100% of modern ATS parser specifications.', type: 'success' });
    }

    // Margin density checks
    if (spacing.pagePadding && spacing.pagePadding < 7) {
      formattingScore -= 10;
      formatAlerts.push({ text: `Narrow margins (${spacing.pagePadding}mm) might look cramped on export. Standard range: 8-15mm.`, type: 'warning' });
    }
    if (spacing.sectionGap && spacing.sectionGap < 6) {
      formattingScore -= 10;
      formatAlerts.push({ text: 'Dense section gaps might lead to overcrowding. Try boosting the Section Gap in Settings.', type: 'warning' });
    }

    // Font readability check
    if (fontOverride && fontOverride < 9.5) {
      formattingScore -= 15;
      formatAlerts.push({ text: `Extremely small font size (${fontOverride}pt) degrades human readability. Aim for 9.5pt to 11.5pt.`, type: 'error' });
    }

    formattingScore = Math.max(30, formattingScore);

    // ────────────────────────────────────────────────────────────────────────
    // 8. FINAL OVERALL SCORE COMPUTATION (WEIGHTED)
    // ────────────────────────────────────────────────────────────────────────
    const finalScore = Math.round(
      (skillsScore * 0.20) +
      (formattingScore * 0.20) +
      (contentScore * 0.20) +
      (impactScore * 0.15) +
      (readabilityScore * 0.10) +
      (completenessScore * 0.10) +
      (presenceScore * 0.05)
    );

    // ────────────────────────────────────────────────────────────────────────
    // 9. CAREER READINESS INSIGHTS
    // ────────────────────────────────────────────────────────────────────────
    const techDepth = Math.min(100, Math.round((technicalDepthCount / 5) * 100));
    const bigTechReadiness = Math.round((finalScore * 0.4) + (techDepth * 0.3) + (quantifiedCount >= 3 ? 30 : quantifiedCount * 10));
    const startupReadiness = Math.round((skillsScore * 0.5) + (techDepth * 0.3) + (projects.length >= 2 ? 20 : 10));
    const internshipReadiness = Math.round((completenessScore * 0.6) + (education.length > 0 ? 40 : 10));

    return {
      finalScore,
      skillsScore,
      formattingScore,
      contentScore,
      impactScore,
      readabilityScore,
      completenessScore,
      presenceScore,
      presenceItems,
      duplicateSkills,
      outdatedSkills: foundOutdated,
      specializations,
      quantifiedCount,
      technicalDepthCount,
      techDepth,
      bigTechReadiness,
      startupReadiness,
      internshipReadiness,
      issues,
      formatAlerts,
      heatmap
    };
  }, [resume]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#00C896'; // Green
    if (score >= 50) return '#FFB830'; // Orange
    return '#FF4D6D'; // Red
  };

  const getHeatmapColor = (status) => {
    if (status === 'strong') return '#00C896';
    if (status === 'average') return '#FFB830';
    return '#FF4D6D';
  };

  if (!analysis) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#E8EBF4',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Modal Card container */}
      <div style={{
        background: '#0B0F19',
        border: '1px solid #1E2535',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '1020px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        overflow: 'hidden'
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
            <Sparkles size={20} style={{ color: '#00F5D4' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              Resume Intelligence & ATS Audit
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

        {/* Scrollable Dashboard Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          
          {/* Top Panel: circular score and readiness stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', marginBottom: '28px' }}>
            
            {/* Score circle */}
            <div style={{
              background: '#0F1320',
              border: '1px solid #1E2535',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: `10px solid #1E2535`,
                borderTopColor: getScoreColor(analysis.finalScore),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                transform: 'rotate(-45deg)'
              }}>
                <div style={{ transform: 'rotate(45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '42px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                    {analysis.finalScore}
                  </span>
                  <span style={{ fontSize: '12px', color: '#8892A4', fontWeight: 600, marginTop: '4px' }}>
                    / 100
                  </span>
                </div>
              </div>

              <div style={{
                background: `${getScoreColor(analysis.finalScore)}15`,
                border: `1px solid ${getScoreColor(analysis.finalScore)}30`,
                color: getScoreColor(analysis.finalScore),
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {analysis.finalScore >= 80 ? 'Ready for FAANG' : analysis.finalScore >= 50 ? 'Strong Match' : 'Needs Work'}
              </div>
            </div>

            {/* Core Breakdown bars & specialization tags */}
            <div style={{
              background: '#0F1320',
              border: '1px solid #1E2535',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8892A4', marginBottom: '16px', margin: 0 }}>
                Category Breakdown
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Formatting', val: analysis.formattingScore },
                  { label: 'Content Quality', val: analysis.contentScore },
                  { label: 'Skills Diversity', val: analysis.skillsScore },
                  { label: 'Verbs & Impact', val: analysis.impactScore },
                  { label: 'Readability', val: analysis.readabilityScore },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#E8EBF4', fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: getScoreColor(item.val), fontWeight: 700 }}>{item.val}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#1E2535', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: getScoreColor(item.val), width: `${item.val}%`, borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Specialization Tags */}
              <div style={{ marginTop: '16px', borderTop: '1px solid #1E2535', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#8892A4' }}>Specializations:</span>
                {analysis.specializations.length > 0 ? (
                  analysis.specializations.map((tag, i) => (
                    <span key={i} style={{ background: 'rgba(0,245,212,0.08)', border: '1px solid rgba(0,245,212,0.3)', color: '#00F5D4', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: '#8892A4', fontStyle: 'italic' }}>None detected</span>
                )}
              </div>
            </div>
          </div>

          {/* Section: Career Readiness & Depth */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Internship Ready', val: analysis.internshipReadiness, icon: <Compass size={16} />, color: '#00D4FF' },
              { label: 'Startup Ready', val: analysis.startupReadiness, icon: <Zap size={16} />, color: '#FFB830' },
              { label: 'Big-Tech Ready', val: analysis.bigTechReadiness, icon: <Award size={16} />, color: '#FF6CAB' },
              { label: 'Technical Depth', val: analysis.techDepth, icon: <Terminal size={16} />, color: '#00C896' }
            ].map((card, i) => (
              <div key={i} style={{
                background: '#0F1320',
                border: '1px solid #1E2535',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8892A4', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ color: card.color }}>{card.icon}</span>
                  {card.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '12px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#FFFFFF' }}>{card.val}</span>
                  <span style={{ fontSize: '12px', color: '#8892A4' }}>%</span>
                </div>
                <div style={{ height: '4px', background: '#1E2535', borderRadius: '2px', overflow: 'hidden', marginTop: '10px' }}>
                  <div style={{ height: '100%', background: card.color, width: `${card.val}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap Section */}
          <div style={{
            background: '#0F1320',
            border: '1px solid #1E2535',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={16} style={{ color: '#00F5D4' }} /> Visual Section Strength Map
            </h3>
            <p style={{ fontSize: '12px', color: '#8892A4', marginBottom: '16px' }}>
              Genuinely audits your resume structure section-by-section to ensure standard ATS readability.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                { label: 'Header & Presence', key: 'header' },
                { label: 'Summary', key: 'summary' },
                { label: 'Education Details', key: 'education' },
                { label: 'Work Experience', key: 'experience' },
                { label: 'Technical Projects', key: 'projects' },
                { label: 'Skill Sets', key: 'skills' }
              ].map((sec, i) => {
                const strength = analysis.heatmap[sec.key] || 'weak';
                return (
                  <div key={i} style={{
                    flex: '1 1 150px',
                    background: '#0B0F19',
                    border: `1px solid ${getHeatmapColor(strength)}30`,
                    borderLeft: `4px solid ${getHeatmapColor(strength)}`,
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#E8EBF4' }}>{sec.label}</span>
                    <span style={{
                      fontSize: '10px',
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

          {/* Row of Issues / Recommendations and ATS Safe Checks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Actionable Suggestions */}
            <div style={{
              background: '#0F1320',
              border: '1px solid #1E2535',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: '#FFB830' }} /> Smart Optimization Checklist
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {analysis.issues.length > 0 ? (
                  analysis.issues.map((issue, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255,184,48,0.05)',
                      border: '1px solid rgba(255,184,48,0.18)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      <span style={{
                        background: 'rgba(255,184,48,0.15)',
                        color: '#FFB830',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginTop: '1px',
                        textTransform: 'uppercase'
                      }}>
                        {issue.category}
                      </span>
                      <span style={{ fontSize: '12px', color: '#E8EBF4', lineHeight: 1.5 }}>
                        {issue.text}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00C896', fontSize: '13px', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> All systems clear! Your content is optimized.
                  </div>
                )}
              </div>
            </div>

            {/* ATS Format Warnings */}
            <div style={{
              background: '#0F1320',
              border: '1px solid #1E2535',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: '#00C896' }} /> ATS Safety Audit
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysis.formatAlerts.map((alert, idx) => (
                  <div key={idx} style={{
                    background: alert.type === 'error' ? 'rgba(255,77,109,0.05)' : alert.type === 'warning' ? 'rgba(255,184,48,0.05)' : 'rgba(0,200,150,0.05)',
                    border: `1px solid ${alert.type === 'error' ? 'rgba(255,77,109,0.2)' : alert.type === 'warning' ? 'rgba(255,184,48,0.2)' : 'rgba(0,200,150,0.2)'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ color: alert.type === 'error' ? '#FF4D6D' : alert.type === 'warning' ? '#FFB830' : '#00C896', marginTop: '1px' }}>
                      {alert.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    </span>
                    <span style={{ fontSize: '12px', color: '#E8EBF4', lineHeight: 1.5 }}>
                      {alert.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Area */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid #1E2535',
          background: '#0F1320',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 600,
              background: 'var(--accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Acknowledge Suggestions
          </button>
        </div>
      </div>
    </div>
  );
}
