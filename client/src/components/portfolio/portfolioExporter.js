/**
 * Portfolio HTML Exporter v2 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Self-contained deploy-ready portfolio.html
 * All data paths fixed: achievements, testimonials, certifications are top-level
 */
export function generatePortfolioHTML(portfolio) {
  const {
    personalInfo: p = {},
    socialLinks: s = {},
    skills = {},
    projects = [],
    education = [],
    experience = [],
    certifications = [],
    achievements = [],
    testimonials = [],
    codingProfiles: cp = {},
    blogArticles = [],
    themeCustomization: tc = {},
    template = 'aurora',
  } = portfolio || {};

  // contactInfo with email fallback to personalInfo for backward compat
  const rawC = portfolio?.contactInfo || {};
  const c = {
    email:   rawC.email   || p?.email   || '',
    phone:   rawC.phone   || p?.phone   || '',
    city:    rawC.city    || p?.city    || '',
    country: rawC.country || p?.country || '',
  };


  const theme = template;
  const a1 = theme === 'aurora' ? (tc?.auroraAccent1 || '#00C896')
    : theme === 'obsidian' ? (tc?.obsidianAccent1 || '#00F5D4')
    : (tc?.prismAccent1 || '#FFD700');
  const a2 = theme === 'aurora' ? (tc?.auroraAccent2 || '#C9A84C')
    : theme === 'obsidian' ? (tc?.obsidianAccent2 || '#9B5DE5')
    : (tc?.prismAccent2 || '#FF6CAB');

  const esc = str => String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const normalizeUrl = (url) => {
    const value = String(url || '').trim();
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  };
  const fmt = d => {
    if (!d) return '';
    if (/^\d{4}-\d{2}$/.test(d)) {
      const [y,m] = d.split('-');
      return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+' '+y;
    }
    return String(d);
  };
  const initials = (p?.fullName||'').split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2)||'??';
  const hasCP = !!(cp&&(cp.github||cp.leetcode||cp.hackerrank||cp.codeforces||cp.codechef));
  const featured = projects.filter(pr=>pr.featured);
  const others = projects.filter(pr=>!pr.featured);
  const navLinks = [
    ['Home','#hero'],['About','#about'],
    ...(education.length?[['Education','#education']]:[]),
    ...(experience.length?[['Experience','#experience']]:[]),
    ...(skills&&typeof skills==='object'&&!Array.isArray(skills)&&Object.values(skills).some(v=>Array.isArray(v)&&v.length>0)?[['Skills','#skills']]:[]),
    ...(projects.length?[['Projects','#projects']]:[]),
    ...(blogArticles.length?[['Publications','#publications']]:[]),
    ...(certifications.length?[['Certifications','#certifications']]:[]),
    ...(hasCP?[['Coding','#coding']]:[]),
    ...(achievements.length?[['Achievements','#achievements']]:[]),
    ...(testimonials.length?[['Testimonials','#testimonials']]:[]),
    ...((p?.resumeBase64||p?.resumeUrl)?[['Resume','#resume']]:[]),
    ['Contact','#contact'],
  ];

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="description" content="${esc(p?.tagline||p?.bio?.slice(0,160)||'Portfolio')}">
<title>${esc(p?.fullName||'Portfolio')} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${esc(p?.title||'Developer')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Fira+Code:wght@400;500&family=Syne:wght@700;800&family=Nunito:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous">
<style>
:root{--bg:#FAFAF7;--bg-alt:#FFFFFF;--surface:#FFFFFF;--s2:#F4F4F0;--t1:#0F0F0F;--t2:#6B6B6B;--a1:${a1};--a2:${a2};--a3:#FF6B6B;--bd:#E8E8E2;--sh:rgba(0,0,0,0.08);--fd:"Playfair Display",Georgia,serif;--fb:"DM Sans",system-ui,sans-serif;--fm:"JetBrains Mono",monospace;--nb:rgba(250,250,247,0.92);--nbd:#E8E8E2;}
[data-theme="obsidian"]{--bg:#080B12;--bg-alt:#0F1320;--surface:#0F1320;--s2:#141B2D;--t1:#E8EBF4;--t2:#8892A4;--a1:${a1};--a2:${a2};--a3:#FF6B6B;--bd:#1E2535;--sh:rgba(0,245,212,0.1);--fd:"Space Grotesk",system-ui,sans-serif;--fb:"IBM Plex Sans",system-ui,sans-serif;--fm:"Fira Code",monospace;--nb:rgba(8,11,18,0.88);--nbd:#1E2535;}
[data-theme="prism"]{--bg:transparent;--bg-alt:rgba(255,255,255,0.08);--surface:rgba(255,255,255,0.1);--s2:rgba(255,255,255,0.06);--t1:#fff;--t2:rgba(255,255,255,0.72);--a1:${a1};--a2:${a2};--a3:#FF6CAB;--bd:rgba(255,255,255,0.18);--sh:rgba(0,0,0,0.2);--fd:"Syne",system-ui,sans-serif;--fb:"Nunito",system-ui,sans-serif;--fm:"Source Code Pro",monospace;--nb:rgba(102,126,234,0.7);--nbd:rgba(255,255,255,0.2);}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:var(--fb);background:var(--bg);color:var(--t1);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
[data-theme="prism"] body{background:linear-gradient(135deg,#667EEA,#764BA2,#F093FB,#4FACFE);background-size:400% 400%;animation:gradShift 12s ease infinite;min-height:100vh;}
@keyframes gradShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
a{color:var(--a1);text-decoration:none;transition:all .3s;}
a:hover{opacity:.8;}
/* NAV */
#nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:0 32px;height:64px;display:flex;align-items:center;justify-content:space-between;background:var(--nb);backdrop-filter:blur(20px);border-bottom:1px solid var(--nbd);transition:height .3s,box-shadow .3s;}
#nav.scrolled{height:52px;box-shadow:0 4px 20px var(--sh);}
.nav-brand{font-family:var(--fd);font-weight:700;font-size:18px;color:var(--t1);}
[data-theme="obsidian"] .nav-brand{color:var(--a1);text-shadow:0 0 12px var(--a1);}
.nav-links{display:flex;gap:28px;list-style:none;}
.nav-links a{font-size:13px;font-weight:600;color:var(--t2);position:relative;padding-bottom:2px;}
.nav-links a.active,.nav-links a:hover{color:var(--a1);}
.nav-links a::after{content:"";position:absolute;bottom:0;left:0;width:0;height:2px;background:var(--a1);transition:width .3s;}
.nav-links a.active::after,.nav-links a:hover::after{width:100%;}
.nav-right{display:flex;align-items:center;gap:12px;}
.dark-toggle{background:none;border:1px solid var(--bd);color:var(--t2);padding:6px 10px;border-radius:6px;cursor:pointer;font-size:13px;transition:all .2s;}
.dark-toggle:hover{border-color:var(--a1);color:var(--a1);}
.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;}
.hamburger span{display:block;width:22px;height:2px;background:var(--t1);transition:all .3s;}
.hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px);}
.hamburger.open span:nth-child(2){opacity:0;}
.hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px);}
.mobile-menu{display:none;position:fixed;top:64px;left:0;right:0;background:var(--nb);backdrop-filter:blur(20px);border-bottom:1px solid var(--nbd);padding:20px 32px;z-index:999;}
.mobile-menu.open{display:block;}
.mobile-menu a{display:block;padding:12px 0;color:var(--t2);font-weight:600;border-bottom:1px solid var(--bd);}
.mobile-menu a:last-child{border-bottom:none;}
/* LOADER */
#loader{position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;align-items:center;justify-content:center;transition:opacity .5s;}
#loader.gone{opacity:0;pointer-events:none;}
.loader-initials{font-family:var(--fd);font-size:64px;font-weight:700;color:var(--a1);animation:pulse 1s ease-in-out infinite;}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.7}}
/* CURSOR */
#cursor{position:fixed;width:8px;height:8px;background:var(--a1);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:transform .1s;}
#cursor-ring{position:fixed;width:32px;height:32px;border:2px solid var(--a1);border-radius:50%;pointer-events:none;z-index:9997;transform:translate(-50%,-50%);transition:left .12s ease,top .12s ease,opacity .3s;}
/* PROGRESS */
#progress{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--a1),var(--a2));z-index:10001;width:0%;transition:width .1s;}
[data-theme="obsidian"] #progress{box-shadow:0 0 10px var(--a1);}
/* SECTIONS */
.section{padding:100px 80px;}
.section-sm{padding:80px 60px;}
@media(max-width:768px){.section{padding:60px 24px;}.section-sm{padding:60px 24px;}}
.section-title{font-family:var(--fd);font-size:clamp(32px,4vw,48px);font-weight:700;color:var(--t1);margin-bottom:16px;text-align:center;}
#about .section-title{text-align:left;}
[data-theme="obsidian"] .section-title{color:var(--a1);text-shadow:0 0 20px rgba(0,245,212,.3);}
.section-subtitle{display:none;}

/* Center common grids and constrain width so content is centered after About */
.projects-featured, .projects-grid, .skills-grid, .edu-grid, .certs-grid, .testi-grid, .blog-grid { max-width:1200px; margin:0 auto; }
.ach-list{display:flex;flex-direction:column;gap:16px;align-items:center;}
.ach-card{max-width:900px;width:100%;}

/* HERO */
#hero{min-height:100vh;display:flex;align-items:center;padding:120px 80px 80px;position:relative;overflow:hidden;}
.hero-content{flex:1;max-width:600px;}
.hero-name{font-family:var(--fd);font-size:clamp(48px,6vw,80px);font-weight:700;line-height:1.05;margin-bottom:20px;color:var(--t1);}
[data-theme="obsidian"] .hero-name{color:var(--a1);text-shadow:0 0 30px rgba(0,245,212,.4);}
[data-theme="prism"] .hero-name{background:linear-gradient(135deg,var(--a1),var(--a2),#4FACFE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.hero-role{font-size:clamp(18px,2.5vw,26px);color:var(--t2);margin-bottom:16px;font-weight:500;}
.hero-tagline{font-size:16px;color:var(--a1);font-weight:500;margin-bottom:32px;}
.hero-bio{font-size:15px;line-height:1.8;color:var(--t2);margin-bottom:36px;max-width:480px;}
.hero-ctas{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:32px;}
.btn-primary{padding:14px 32px;background:var(--a1);color:#fff;border-radius:8px;font-weight:700;font-size:14px;border:2px solid var(--a1);transition:all .3s;display:inline-flex;align-items:center;gap:8px;}
.btn-primary:hover{background:transparent;color:var(--a1);transform:translateY(-2px);}
.btn-outline{padding:14px 32px;border:2px solid var(--t1);color:var(--t1);border-radius:8px;font-weight:700;font-size:14px;transition:all .3s;display:inline-flex;align-items:center;gap:8px;}
[data-theme="obsidian"] .btn-outline{border-color:var(--a2);color:var(--a2);}
[data-theme="prism"] .btn-outline{border-color:rgba(255,255,255,.6);color:#fff;backdrop-filter:blur(10px);}
.btn-outline:hover{background:var(--a1);border-color:var(--a1);color:#fff;transform:translateY(-2px);}
.availability-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:var(--s2);border:1px solid var(--bd);border-radius:20px;font-size:12px;font-weight:600;color:var(--a1);text-transform:uppercase;letter-spacing:.05em;}
.pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--a1);animation:pulseDot 2s ease infinite;}
@keyframes pulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.5}}
.hero-photo{flex:0 0 auto;width:340px;height:340px;border-radius:50%;overflow:hidden;border:4px solid var(--a2);box-shadow:0 20px 60px var(--sh);margin-left:60px;}
[data-theme="obsidian"] .hero-photo{border-color:var(--a1);box-shadow:0 0 40px rgba(0,245,212,.2);}
[data-theme="prism"] .hero-photo{border-color:var(--a1);box-shadow:0 0 60px rgba(255,215,0,.3);}
.hero-photo img{width:100%;height:100%;object-fit:cover;transition:transform .4s;}
.hero-photo:hover img{transform:scale(1.04);}
.hero-initials{width:100%;height:100%;background:var(--a1);display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:80px;font-weight:700;color:#fff;}
/* ABOUT */
#about{background:var(--bg-alt);}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
.stat-cards{display:flex;flex-direction:column;gap:16px;}
.stat-card{padding:24px;background:var(--surface);border:1px solid var(--bd);border-radius:12px;}
.stat-num{font-size:40px;font-weight:700;color:var(--a1);font-family:var(--fd);display:block;}
.stat-label{font-size:13px;color:var(--t2);}
/* SKILLS */
.skills-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px;}
.skill-group{background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:24px;}
.skill-cat{font-size:13px;font-weight:700;color:var(--a2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;font-family:var(--fm);}
[data-theme="obsidian"] .skill-cat{color:var(--a3);}
.skill-tags{display:flex;flex-wrap:wrap;gap:8px;}
.skill-tag{font-size:12px;padding:6px 12px;background:var(--s2);color:var(--t1);border-radius:6px;font-weight:500;border:1px solid var(--bd);transition:all .2s;cursor:default;}
[data-theme="obsidian"] .skill-tag{background:rgba(0,245,212,.08);color:var(--a1);border-color:rgba(0,245,212,.2);font-family:var(--fm);}
[data-theme="prism"] .skill-tag{background:rgba(255,215,0,.1);color:var(--a1);border-color:rgba(255,215,0,.3);}
.skill-tag:hover{border-color:var(--a1);color:var(--a1);transform:scale(1.05);}
/* PROJECTS */
.projects-filter{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:40px;}
.filter-btn{padding:8px 18px;border:1px solid var(--bd);background:transparent;color:var(--t2);border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.filter-btn.active,.filter-btn:hover{background:var(--a1);border-color:var(--a1);color:#fff;}
.projects-featured{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px;}
.projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;}
.project-card{background:var(--surface);border:1px solid var(--bd);border-radius:12px;overflow:hidden;transition:all .3s;cursor:default;position:relative;}
.project-card:hover{border-color:var(--a1);box-shadow:0 12px 40px var(--sh);transform:translateY(-4px);}
[data-theme="obsidian"] .project-card:hover{box-shadow:0 0 30px rgba(0,245,212,.15);}
.project-img{width:100%;height:200px;object-fit:cover;}
.project-body{padding:20px;}
.project-title{font-size:16px;font-weight:700;color:var(--t1);margin-bottom:8px;font-family:var(--fd);}
[data-theme="obsidian"] .project-title{color:var(--a1);}
.project-desc{font-size:13px;color:var(--t2);line-height:1.6;margin-bottom:16px;}
.project-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;}
.project-tag{font-size:11px;padding:4px 10px;background:var(--s2);color:var(--t2);border-radius:4px;border:1px solid var(--bd);}
[data-theme="obsidian"] .project-tag{background:rgba(155,93,229,.1);color:var(--a2);border-color:rgba(155,93,229,.2);font-family:var(--fm);}
[data-theme="prism"] .project-tag{background:rgba(255,108,171,.1);color:var(--a2);border-color:rgba(255,108,171,.2);}
.project-links{display:flex;gap:12px;}
.project-link{font-size:12px;font-weight:600;color:var(--a1);display:flex;align-items:center;gap:4px;}
.project-link.src{color:var(--a2);}
/* EXPERIENCE */
.timeline{display:flex;flex-direction:column;gap:0;}
.timeline-item{display:flex;gap:24px;padding-bottom:40px;position:relative;}
.timeline-item:last-child{padding-bottom:0;}
.timeline-line{display:flex;flex-direction:column;align-items:center;}
.timeline-dot{width:14px;height:14px;border-radius:50%;background:var(--a1);border:3px solid var(--bg);box-shadow:0 0 0 2px var(--a1);flex-shrink:0;margin-top:4px;}
[data-theme="obsidian"] .timeline-dot{background:var(--a2);box-shadow:0 0 12px var(--a2);}
.timeline-connector{width:2px;flex:1;background:var(--bd);margin-top:6px;}
.timeline-content{flex:1;padding-bottom:8px;}
.exp-title{font-size:18px;font-weight:700;color:var(--t1);margin-bottom:4px;}
.exp-company{font-size:14px;color:var(--a1);font-weight:600;margin-bottom:4px;}
[data-theme="obsidian"] .exp-company{text-shadow:0 0 8px var(--a1);}
.exp-meta{font-size:12px;color:var(--t2);margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap;}
.exp-badge{padding:2px 10px;background:var(--s2);border-radius:10px;font-size:11px;color:var(--t2);border:1px solid var(--bd);}
.exp-desc{font-size:14px;color:var(--t2);line-height:1.7;white-space:pre-wrap;}
/* EDUCATION */
.edu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;}
.edu-card{background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:24px;border-top:4px solid var(--a1);}
.edu-degree{font-size:18px;font-weight:700;color:var(--t1);margin-bottom:4px;}
.edu-inst{font-size:15px;color:var(--a1);font-weight:600;margin-bottom:8px;}
.edu-meta{font-size:13px;color:var(--t2);opacity:0.85;font-weight:500;}
/* CERTIFICATIONS */
.certs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px;}
.cert-flip-wrapper{perspective:1000px;height:200px;}
.cert-flip{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .6s;}
.cert-flip-wrapper:hover .cert-flip{transform:rotateY(180deg);}
.cert-front,.cert-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:12px;padding:24px;background:var(--surface);border:1px solid var(--bd);}
.cert-back{transform:rotateY(180deg);background:var(--a1);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
.cert-title{font-size:15px;font-weight:700;color:var(--t1);margin-bottom:8px;}
.cert-issuer{font-size:13px;color:var(--a1);font-weight:600;margin-bottom:8px;}
.cert-date{font-size:12px;color:var(--t2);}
.cert-verify{padding:10px 20px;background:#fff;color:var(--a1);border-radius:6px;font-weight:700;font-size:13px;margin-top:12px;display:inline-block;}
/* ACHIEVEMENTS */
.ach-list{display:flex;flex-direction:column;gap:16px;}
.ach-card{background:var(--surface);border:1px solid var(--bd);border-left:4px solid var(--a1);border-radius:0 12px 12px 0;padding:20px 24px;transition:all .3s;}
.ach-card:hover{box-shadow:0 8px 30px var(--sh);transform:translateX(4px);}
[data-theme="obsidian"] .ach-card:hover{box-shadow:0 0 20px rgba(0,245,212,.1);}
.ach-title{font-size:15px;font-weight:700;color:var(--t1);margin-bottom:4px;}
.ach-org{font-size:13px;color:var(--a2);font-weight:600;}
.ach-date{font-size:12px;color:var(--t2);margin-bottom:8px;}
.ach-desc{font-size:13px;color:var(--t2);line-height:1.6;}
/* RESUME */
#resume{text-align:center;background:var(--bg-alt);}
.resume-cta{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:32px;}
/* GITHUB */
.github-stats{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-bottom:40px;}
.github-stats img{border-radius:8px;max-width:100%;height:auto;}
.coding-profiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;}
.coding-link{display:flex;align-items:center;gap:12px;padding:16px 20px;background:var(--surface);border:1px solid var(--bd);border-radius:12px;color:var(--t1);font-weight:600;font-size:13px;transition:all .3s;}
.coding-link:hover{border-color:var(--a1);color:var(--a1);transform:translateY(-2px);}
.coding-link i{font-size:20px;color:var(--a1);}
/* TESTIMONIALS */
.testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;}
.testi-card{background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:24px;position:relative;}
.testi-quote{font-size:60px;line-height:1;color:var(--a1);opacity:.3;font-family:Georgia,serif;position:absolute;top:12px;left:20px;}
.testi-text{font-size:14px;color:var(--t2);line-height:1.7;font-style:italic;margin-bottom:20px;padding-top:20px;}
.testi-author{display:flex;align-items:center;gap:12px;}
.testi-avatar{width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--a1);}
.testi-avatar-initials{width:44px;height:44px;border-radius:50%;background:var(--a1);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;}
.testi-name{font-size:14px;font-weight:700;color:var(--t1);}
.testi-role{font-size:12px;color:var(--t2);}
/* BLOG */
.blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;}
.blog-card{background:var(--surface);border:1px solid var(--bd);border-radius:12px;overflow:hidden;transition:all .3s;display:flex;flex-direction:column;}
.blog-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px var(--sh);border-color:var(--a1);}
.blog-img{width:100%;height:180px;object-fit:cover;}
.blog-body{padding:20px;flex:1;display:flex;flex-direction:column;}
.blog-platform{font-size:11px;font-weight:600;color:var(--a1);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;}
.blog-title{font-size:15px;font-weight:700;color:var(--t1);margin-bottom:8px;flex:1;}
.blog-desc{font-size:13px;color:var(--t2);margin-bottom:12px;line-height:1.6;}
.blog-date{font-size:11px;color:var(--t2);}
.blog-read{font-size:12px;font-weight:600;color:var(--a2);margin-top:auto;}
/* CONTACT */
#contact{background:var(--bg-alt);text-align:center;}
.contact-email-btn{display:inline-flex;align-items:center;gap:10px;padding:18px 40px;background:var(--a1);color:#fff;border-radius:10px;font-size:16px;font-weight:700;margin:24px 0 40px;transition:all .3s;}
.contact-email-btn:hover{transform:translateY(-3px);box-shadow:0 12px 30px var(--sh);opacity:1;}
.social-links{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-bottom:40px;}
.social-link{display:flex;align-items:center;gap:8px;padding:12px 20px;background:var(--surface);border:1px solid var(--bd);border-radius:8px;color:var(--t2);font-size:13px;font-weight:600;transition:all .2s;}
.social-link:hover{border-color:var(--a1);color:var(--a1);}
.social-link i{font-size:16px;}
/* FOOTER */
footer{background:var(--surface);border-top:1px solid var(--bd);padding:40px 80px;}
.footer-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;}
.footer-name{font-family:var(--fd);font-size:20px;font-weight:700;color:var(--t1);}
.footer-copy{font-size:12px;color:var(--t2);}
.back-top{width:44px;height:44px;border-radius:50%;background:var(--a1);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;transition:all .3s;}
.back-top:hover{transform:translateY(-3px);box-shadow:0 8px 20px var(--sh);}
/* CODING PLATFORMS */
.coding-platform-block{margin-bottom:60px;padding-bottom:60px;border-bottom:1px solid var(--bd);}
.coding-platform-block:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0;}
.platform-title{font-family:var(--fd);font-size:22px;font-weight:700;color:var(--a1);margin-bottom:24px;display:flex;align-items:center;gap:12px;}
.stats-cards-row{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:20px;justify-content:flex-start;}
.stats-img{border-radius:10px;height:auto;max-width:100%;object-fit:contain;}
.platform-link-row{display:flex;gap:12px;flex-wrap:wrap;}
.coding-info-card{display:flex;gap:24px;align-items:flex-start;background:var(--surface);border:1px solid var(--bd);border-radius:12px;padding:24px;margin-bottom:20px;}
.coding-info-icon{width:80px;height:80px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.coding-info-text{flex:1;}
/* REVEAL ANIMATIONS */
[data-reveal]{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease;}
[data-reveal].visible{opacity:1;transform:none;}
[data-reveal][data-delay="1"]{transition-delay:.1s;}
[data-reveal][data-delay="2"]{transition-delay:.2s;}
[data-reveal][data-delay="3"]{transition-delay:.3s;}
[data-reveal][data-delay="4"]{transition-delay:.4s;}
[data-reveal][data-delay="5"]{transition-delay:.5s;}
/* RESPONSIVE */
@media(max-width:1024px){#hero{padding:100px 40px 60px;}.section{padding:80px 40px;}.about-grid{grid-template-columns:1fr;gap:40px;}.hero-photo{width:260px;height:260px;margin-left:30px;}.projects-featured{grid-template-columns:1fr;}}
@media(max-width:768px){#hero{flex-direction:column;text-align:center;}.hero-ctas{justify-content:center;}.hero-photo{margin:30px auto 0;}.hero-bio{margin:0 auto 32px;}.nav-links{display:none;}.hamburger{display:flex;}.footer-inner{flex-direction:column;text-align:center;}.section-title{text-align:center;}.about-grid{grid-template-columns:1fr;}.projects-featured{grid-template-columns:1fr;}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;}}
</style></head>
<body>
<div id="loader"><div class="loader-initials">${initials}</div></div>
<div id="cursor"></div><div id="cursor-ring"></div>
<div id="progress"></div>
<nav id="nav">
  <a class="nav-brand" href="#hero">${esc(p?.fullName||'Portfolio')}</a>
  <ul class="nav-links">
    ${navLinks.map(([label,href])=>`<li><a href="${href}" data-section="${href.slice(1)}">${label}</a></li>`).join('')}
  </ul>
  <div class="nav-right">
    <button class="dark-toggle" id="darkToggle" aria-label="Toggle dark mode">&#9790;</button>
    <button class="hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mobile-menu" id="mobileMenu">
  ${navLinks.map(([label,href])=>`<a href="${href}">${label}</a>`).join('')}
</div>
<section id="hero" class="section" style="padding-top:120px;">
  <div class="hero-content" data-reveal>
    <div class="hero-name" id="heroName">${esc(p?.fullName||'Your Name')}</div>
    <div class="hero-role" id="heroRole">${esc(p?.title||'Developer')}</div>
    ${p?.tagline?`<div class="hero-tagline">${esc(p.tagline)}</div>`:''}
    <div class="hero-ctas">
      ${(p?.resumeBase64||p?.resumeUrl)?`<a class="btn-primary magnetic" href="${p?.resumeBase64||esc(p.resumeUrl)}" download="resume.pdf" ${p?.resumeBase64?'':'target="_blank" rel="noopener"'}><i class="fas fa-download"></i> Download Resume</a>`:''}
      ${c?.email?`<a class="btn-outline magnetic" href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-envelope"></i> Get in Touch</a>`:''}
    </div>
    ${p?.availabilityStatus?`<div class="availability-badge"><span class="pulse-dot"></span>${esc(p.availabilityStatus)}</div>`:''}
  </div>
  ${(p?.profilePhoto || p?.profileImage)
    ?`<div class="hero-photo" data-reveal data-delay="2"><img src="${esc(p.profilePhoto || p.profileImage)}" alt="${esc(p?.fullName)}"></div>`
    :`<div class="hero-photo" data-reveal data-delay="2"><div class="hero-initials">${initials}</div></div>`}
</section>
<section id="about" class="section">
  <div class="about-grid">
    <div data-reveal>
      <h2 class="section-title">About</h2>
      ${p?.bio?`<p style="font-size:16px;line-height:1.8;color:var(--t2)">${esc(p.bio)}</p>`:'<p style="color:var(--t2)">Add your bio in the editor.</p>'}
    </div>
    <div class="stat-cards" data-reveal data-delay="2">
      ${[
        {n:(experience?experience.length:0), caption:'Experience positions', target:'experience'},
        {n:(projects?projects.length:0), caption:'Projects built', target:'projects'},
        {n:(skills&&typeof skills==='object'&&!Array.isArray(skills)?Object.values(skills).reduce((a,v)=>a+(Array.isArray(v)?v.length:0),0):0), caption:'Technologies & skills', target:'skills'},
        {n:(certifications?certifications.length:0), caption:'Certifications earned', target:'certifications'}
      ].filter(s => s.n > 0).map(({n,caption,target})=>`<div class="stat-card" style="cursor:pointer; transition: box-shadow 0.3s ease, transform 0.3s ease;" onmouseover="this.style.boxShadow='0 10px 30px rgba(0,0,0,0.1)'; this.style.transform='translateY(-4px)';" onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)';" onclick="document.getElementById('${target}')?.scrollIntoView({ behavior: 'smooth' })"><span class="stat-num" data-count="${n}">0</span><span class="stat-label">${caption}</span></div>`).join('')}
    </div>
  </div>
</section>
${(()=>{
  const sk=(skills&&typeof skills==='object'&&!Array.isArray(skills))?skills:{};
  const cats=[['languages','Languages'],['frameworks','Frameworks'],['tools','Tools'],['databases','Databases'],['other','Other']];
  const hasSk=cats.some(([k])=>Array.isArray(sk[k])&&sk[k].length>0);
  if(!hasSk) return '';
  return `
<section id="skills" class="section" style="background:var(--bg-alt)">
  <div data-reveal>
    <h2 class="section-title">${theme==='obsidian'?'Skills':'Skills & Tech'}</h2>
    <p class="section-subtitle">Technologies and tools I work with</p>
  </div>
  <div class="skills-grid">
    ${cats.filter(([k])=>Array.isArray(sk[k])&&sk[k].length>0).map(([k,label],i)=>`<div class="skill-group" data-reveal data-delay="${Math.min(i+1,5)}">
      <div class="skill-cat">${label}</div>
      <div class="skill-tags">${sk[k].map(s=>`<span class="skill-tag">${esc(s)}</span>`).join('')}</div>
    </div>`).join('')}
  </div>
</section>`;
})()}
${projects.length?`
<section id="projects" class="section">
  <div data-reveal>
    <h2 class="section-title">${theme==='obsidian'?'Projects':'Featured Projects'}</h2>
    <p class="section-subtitle">Things I have built</p>
    <div class="projects-filter">
      <button class="filter-btn active" data-filter="all">All</button>
      ${[...new Set(projects.flatMap(pr=>pr.techStack||[]).slice(0,5))].map(t=>`<button class="filter-btn" data-filter="${esc(t)}">${esc(t)}</button>`).join('')}
    </div>
  </div>
  ${featured.length?`<div class="projects-featured">
    ${featured.map((pr,i)=>`<div class="project-card" data-reveal data-delay="${i+1}" data-tech="${(pr.techStack||[]).join(',')}" style="cursor:pointer;" data-projectname="${esc(pr.name)}" data-projectdesc="${esc(pr.fullDescription || pr.description)}" data-projecttech="${(pr.techStack||[]).join(',')}" data-projectlive="${esc(pr.liveUrl||'')}" data-projectgithub="${esc(pr.githubUrl||'')}" onclick="openProjectModal(this)">
      ${pr.coverImage?`<img class="project-img" src="${esc(pr.coverImage)}" alt="${esc(pr.name)}">`:''}
      <div class="project-body">
        <div class="project-title">${esc(pr.name)}</div>
        <div class="project-desc">${esc(pr.description)}</div>
        <div class="project-tags">${(pr.techStack||[]).map(t=>`<span class="project-tag">${esc(t)}</span>`).join('')}</div>
        <div class="project-links">
          ${pr.liveUrl?`<a class="project-link" href="${esc(pr.liveUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i> Live Demo</a>`:""}
          ${pr.githubUrl?`<a class="project-link src" href="${esc(pr.githubUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="border:1px solid var(--bd); border-radius:6px; padding:4px 8px;"><i class="fab fa-github"></i> GitHub ↗</a>`:""}
        </div>
      </div>
    </div>`).join('')}
  </div>`:''}
  <div class="projects-grid">
    ${others.map((pr,i)=>`<div class="project-card" data-reveal data-delay="${(i%3)+1}" data-tech="${(pr.techStack||[]).join(',')}" style="cursor:pointer;" data-projectname="${esc(pr.name)}" data-projectdesc="${esc(pr.fullDescription || pr.description)}" data-projecttech="${(pr.techStack||[]).join(',')}" data-projectlive="${esc(pr.liveUrl||'')}" data-projectgithub="${esc(pr.githubUrl||'')}" onclick="openProjectModal(this)">
      ${pr.coverImage?`<img class="project-img" src="${esc(pr.coverImage)}" alt="${esc(pr.name)}">`:''}
      <div class="project-body">
        <div class="project-title">${esc(pr.name)}</div>
        <div class="project-desc">${esc(pr.description)}</div>
        <div class="project-tags">${(pr.techStack||[]).map(t=>`<span class="project-tag">${esc(t)}</span>`).join('')}</div>
        <div class="project-links">
          ${pr.liveUrl?`<a class="project-link" href="${esc(pr.liveUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i> Live Demo</a>`:""}
          ${pr.githubUrl?`<a class="project-link src" href="${esc(pr.githubUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="border:1px solid var(--bd); border-radius:6px; padding:4px 8px;"><i class="fab fa-github"></i> GitHub ↗</a>`:""}
        </div>
      </div>
    </div>`).join('')}
  </div>
</section>`:''}
${experience.length?`
<section id="experience" class="section" style="background:var(--bg-alt)">
  <div data-reveal>
    <h2 class="section-title">${theme==='obsidian'?'Experience':'Work Experience'}</h2>
  </div>
  <div class="timeline">
    ${experience.map((ex,i)=>`<div class="timeline-item" data-reveal data-delay="${Math.min(i+1,5)}">
      <div class="timeline-line">
        <div class="timeline-dot"></div>
        ${i<experience.length-1?`<div class="timeline-connector"></div>`:''}
      </div>
      <div class="timeline-content">
        <div class="exp-title">${esc(ex.title)}</div>
        <div class="exp-company">${esc(ex.company)}${ex.location?' · '+esc(ex.location):''}</div>
        <div class="exp-meta">
          <span>${fmt(ex.startDate)}${ex.endDate?' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ '+fmt(ex.endDate):' ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Present'}</span>
          ${ex.employmentType?`<span class="exp-badge">${esc(ex.employmentType)}</span>`:''}
        </div>
        ${ex.description?`<div class="exp-desc">${esc(ex.description)}</div>`:''}
      </div>
    </div>`).join('')}
  </div>
</section>`:''}
${education.length?`
<section id="education" class="section">
  <div data-reveal>
    <h2 class="section-title">${theme==='obsidian'?'Education':'Education'}</h2>
  </div>
  <div class="edu-grid">
    ${education.map((ed,i)=>`<div class="edu-card" data-reveal data-delay="${(i%3)+1}">
      <div class="edu-degree">${esc(ed.degree)}</div>
      <div class="edu-inst">${esc(ed.institution)}</div>
      <div class="edu-meta">${(function(){
        let sy = ed.startYear ? String(ed.startYear) : '';
        let ey = ed.endYear ? String(ed.endYear) : '';
        let dateStr = sy;
        if (ey) {
          if (sy && !sy.includes('-')) {
            dateStr += ' — ' + ey;
          } else if (!sy) {
            dateStr = ey;
          }
        }
        let parts = [];
        if (dateStr) parts.push(dateStr);
        if (ed.gpa) parts.push((ed.scoreType === 'Percentage' ? 'Percentage: ' : 'GPA: ') + esc(ed.gpa));
        return parts.join(' · ');
      })()}</div>
    </div>`).join('')}
  </div>
</section>`:''}
${certifications.filter(c => c.name || c.title).length?`
<section id="certifications" class="section" style="background:var(--bg-alt)">
  <div data-reveal>
    <h2 class="section-title">${theme==='obsidian'?'Certifications':'Certifications'}</h2>
  </div>
  <div class="certs-grid">
    ${certifications.filter(c => c.name || c.title).map((cert,i)=> {
      const certName = esc(cert.name || cert.title);
      const certOrg = esc(cert.organization || cert.issuer);
      const certDate = fmt(cert.date);
      const rawLink = cert.imageBase64 || cert.url || cert.certificateUrl || cert.link || '';
      const hasLink = !!rawLink;
      const certLink = hasLink ? esc(rawLink) : '#';
      const isPdf = certLink.indexOf('application/pdf') !== -1 || certLink.toLowerCase().endsWith('.pdf');
      
      const modalAttrs = hasLink ? `data-certlink="${certLink}" data-certname="${certName}" data-certorg="${certOrg}" data-certdate="${certDate}" data-ispdf="${isPdf}" onclick="openCertModal(this)"` : '';

      if (theme === 'aurora') {
        return `<div ${modalAttrs} style="text-decoration:none; display:block;" data-reveal data-delay="${(i%3)+1}">
          <div class="cert-card-aurora" style="padding: 24px; background: #FFFFFF; border: 1px solid #E8E8E2; border-radius: 12px; border-top: 4px solid var(--a2); cursor: ${hasLink?'pointer':'default'}; transition: all 0.3s ease; display:flex; flex-direction:column; height:100%; box-shadow: 0 4px 12px rgba(0,0,0,0.02);" onmouseover="this.style.boxShadow='0 12px 32px rgba(0,0,0,0.08)'; this.style.transform='translateY(-4px)';" onmouseout="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.02)'; this.style.transform='translateY(0)';">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
              <div style="width:40px; height:40px; border-radius:50%; background:#F5F5F0; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">🎓</div>
              <div style="flex:1;">
                <div style="font-size: 16px; font-weight: 700; color: #0F0F0F; line-height:1.3;">${certName}</div>
                <div style="font-size: 13px; color: var(--a2); font-weight: 600; margin-top:4px;">${certOrg}</div>
              </div>
            </div>
            <div style="margin-top:auto; padding-top:16px; border-top:1px solid #E8E8E2; display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size: 12px; color: #6B6B6B; display:flex; align-items:center; gap:4px;"><span>📅</span> ${certDate}</div>
              ${hasLink ? `<div style="font-size: 12px; color: var(--a2); font-weight: 600; text-transform:uppercase; letter-spacing:0.5px;">View ↗</div>` : ''}
            </div>
          </div>
        </div>`;
      } else if (theme === 'prism') {
        return `<div ${modalAttrs} style="text-decoration:none; display:block;" data-reveal data-delay="${(i%3)+1}">
          <div class="cert-card-prism" style="padding: 24px; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; cursor: ${hasLink?'pointer':'default'}; transition: all 0.3s ease; display:flex; flex-direction:column; height:100%; position:relative; overflow:hidden;" onmouseover="this.style.background='rgba(255,215,0,0.08)'; this.style.borderColor='rgba(255,215,0,0.3)'; this.style.transform='translateY(-4px)';" onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.transform='translateY(0)';">
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
              <div style="width:48px; height:48px; border-radius:12px; background:rgba(255,215,0,0.1); border:1px solid rgba(255,215,0,0.2); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0;">🎓</div>
              <div>
                <div style="font-size: 16px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px; line-height:1.2;">${certName}</div>
                <div style="font-size: 13px; color: var(--a1); font-weight: 600;">${certOrg}</div>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:16px; border-top:1px solid rgba(255,255,255,0.1); margin-top:auto;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.5); display:flex; align-items:center; gap:6px;"><span>📅</span> ${certDate}</div>
              ${hasLink ? `<div style="font-size: 12px; color: var(--a2); font-weight: 700; text-transform:uppercase; letter-spacing:1px;">Open ↗</div>` : ''}
            </div>
          </div>
        </div>`;
      } else {
        return `<div ${modalAttrs} style="text-decoration:none; display:block;" data-reveal data-delay="${(i%3)+1}">
          <div class="cert-card-obs" style="padding: 22px; background: #0F1320; border: 1px solid #1E2535; border-left: 3px solid var(--a2); border-radius: 10px; cursor: ${hasLink?'pointer':'default'}; transition: all 0.25s; display:flex; flex-direction:column; height:100%; position: relative; overflow: hidden;" onmouseover="this.style.background='#111827'; this.style.borderColor='var(--a2)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(155,93,229,0.2)';" onmouseout="this.style.background='#0F1320'; this.style.borderColor='#1E2535'; this.style.transform='none'; this.style.boxShadow='none';">
            <div style="display:flex; align-items:flex-start; gap:12px;">
              <div style="width:38px; height:38px; border-radius:8px; background:linear-gradient(135deg, rgba(155,93,229,0.3), rgba(0,245,212,0.3)); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">🎓</div>
              <div style="flex:1; min-width:0;">
                <div style="font-size:14px; font-weight:700; color:#E8EBF4; margin-bottom:4px; line-height:1.4;">${certName}</div>
                <div style="font-size:12px; color: var(--a2); font-weight:600; margin-bottom:8px;">${certOrg}</div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:11px; color:#6B7A99; background:rgba(107,122,153,0.1); padding:3px 8px; border-radius:20px;">📅 ${certDate}</span>
                  ${hasLink ? `<span style="font-size:11px; color:var(--a1); font-weight:600;">View ↗</span>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>`;
      }
    }).join('')}
  </div>
</section>`:''}
${achievements.length?`
<section id="achievements" class="section">
  <div data-reveal>
    <h2 class="section-title">${theme==='obsidian'?'Achievements':'Achievements'}</h2>
  </div>
  <div class="ach-list">
    ${achievements.map((a,i)=>`<div class="ach-card" data-reveal data-delay="${(i%3)+1}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div>
          <div class="ach-title">${esc(a.title)}</div>
          <div class="ach-org">${esc(a.organization)}</div>
        </div>
        <span class="ach-date">${fmt(a.date)||esc(a.date)}</span>
      </div>
      ${a.description?`<div class="ach-desc" style="margin-top:10px">${esc(a.description)}</div>`:''}
      ${a.link?`<a href="${esc(a.link)}" target="_blank" rel="noopener" style="font-size:12px;font-weight:600;color:var(--a1);margin-top:8px;display:inline-block">View Proof ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â€</a>`:''}
    </div>`).join('')}
  </div>
</section>`:''}
${(p?.resumeBase64||p?.resumeUrl)?`
<section id="resume" class="section" style="background:var(--bg-alt)">
  <div data-reveal style="text-align:center">
    <h2 class="section-title">${theme==='obsidian'?'Resume':'My Resume'}</h2>
    <p style="font-size:16px;color:var(--t2);margin-bottom:32px">Download my resume or preview it online</p>
    <div class="resume-cta">
      <a class="btn-primary magnetic" href="${p?.resumeBase64||esc(p.resumeUrl)}" download="resume.pdf" rel="noopener"><i class="fas fa-download"></i> Download Resume</a>
      <button class="btn-outline magnetic" onclick="toggleResumePreview(this)" style="cursor:pointer; font-family:inherit; font-size:inherit;"><i class="fas fa-eye"></i> <span class="preview-text">Preview Online</span></button>
    </div>
    <iframe id="resume-preview-frame" data-src="${p?.resumeBase64||esc(p.resumeUrl)}" src="" style="width:100%; height:600px; border:1px solid rgba(255,255,255,0.1); border-radius:12px; margin-top:1.5rem; display:none;"></iframe>
  </div>
</section>`:''}
${hasCP?`
<section id="coding" class="section" style="background:var(--bg-alt)">
  <div style="max-width: 900px; margin: 0 auto;">
  <div data-reveal style="text-align:center;margin-bottom:60px">
    <h2 class="section-title" style="text-align:center">${theme==='obsidian'?'Coding Profiles':'Coding Profiles & Stats'}</h2>
    <p class="section-subtitle">Stats from competitive programming platforms</p>
  </div>

  ${cp.github?`
  <div class="coding-platform-block" data-reveal>
    <h3 class="platform-title"><i class="fab fa-github"></i> GitHub</h3>
    <div class="stats-cards-row">
      ${(function(){
        const username = cp.github.replace('https://github.com/', '').replace('/', '').trim();
        return `
          <img class="stats-img" src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=dark&hide_border=true&bg_color=0d1117&title_color=20c997&text_color=c8d8e8&icon_color=20c997" alt="GitHub Stats" onerror="this.style.display='none'">
          <img class="stats-img" src="https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=${theme==='obsidian'?'tokyonight':theme==='prism'?'radical':'default'}&hide_border=true" alt="GitHub Streak" onerror="this.style.display='none'">
          <img class="stats-img" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=${theme==='obsidian'?'tokyonight':theme==='prism'?'radical':'default'}&hide_border=true&langs_count=8" alt="Top Languages" onerror="this.style.display='none'">
        `;
      })()}
    </div>
    <div class="platform-link-row">
      ${(function(){
        const username = cp.github.replace('https://github.com/', '').replace('/', '').trim();
        return `<a class="coding-link" href="https://github.com/${username}" target="_blank" rel="noopener"><i class="fab fa-github"></i> @${username}</a>`;
      })()}
    </div>
  </div>`:''}

  ${cp.leetcode?`
  <div class="coding-platform-block" data-reveal>
    <h3 class="platform-title" style="color:#FFA116"><i class="fas fa-code"></i> LeetCode</h3>
    <div class="stats-cards-row">
      <img class="stats-img" src="https://leetcard.jacoblin.cool/${encodeURIComponent(cp.leetcode.replace(/.*leetcode\.com\/(?:u\/)?/,'').replace(/\/?$/,''))}?theme=${theme==='obsidian'?'dark':'light'}&font=baloo_2&ext=heatmap" alt="LeetCode Stats" style="border-radius:12px;max-width:500px;width:100%">
    </div>
    <div class="platform-link-row">
      <a class="coding-link" style="border-color:#FFA116;color:#FFA116" href="${esc(cp.leetcode)}" target="_blank" rel="noopener"><i class="fas fa-code"></i> LeetCode Profile</a>
    </div>
  </div>`:''}

  ${cp.hackerrank?`
  <div class="coding-platform-block" data-reveal>
    <h3 class="platform-title" style="color:#2EC866"><i class="fab fa-hackerrank"></i> HackerRank</h3>
    <div class="coding-info-card">
      <div class="coding-info-icon" style="background:rgba(46,200,102,.1);color:#2EC866"><i class="fab fa-hackerrank" style="font-size:32px"></i></div>
      <div class="coding-info-text">
        <p style="font-size:15px;font-weight:700;color:var(--t1);margin-bottom:6px">HackerRank Profile</p>
        <p style="font-size:13px;color:var(--t2)">Solve algorithmic challenges, compete in contests, and earn skill certificates</p>
        <a class="coding-link" style="margin-top:12px;border-color:#2EC866;color:#2EC866;display:inline-flex" href="${esc(cp.hackerrank)}" target="_blank" rel="noopener"><i class="fab fa-hackerrank"></i> View HackerRank</a>
      </div>
    </div>
  </div>`:''}

  ${cp.codeforces?`
  <div class="coding-platform-block" data-reveal>
    <h3 class="platform-title" style="color:#1F8DD6"><i class="fas fa-trophy"></i> Codeforces</h3>
    <div class="stats-cards-row">
      <img class="stats-img" src="https://codeforces-readme-stats.vercel.app/api/card?username=${encodeURIComponent(cp.codeforces.replace(/.*codeforces\.com\/profile\//,'').replace(/\/?$/,''))}&theme=${theme==='obsidian'?'dark':'light'}&disable_animations=false&show_icons=true&force_username=true" alt="Codeforces Stats" onerror="this.style.display='none'">
    </div>
    <div class="platform-link-row">
      <a class="coding-link" style="border-color:#1F8DD6;color:#1F8DD6" href="${esc(cp.codeforces)}" target="_blank" rel="noopener"><i class="fas fa-trophy"></i> Codeforces Profile</a>
    </div>
  </div>`:''}

  ${cp.codechef?`
  <div class="coding-platform-block" data-reveal>
    <h3 class="platform-title" style="color:#5B4638"><i class="fas fa-utensils"></i> CodeChef</h3>
    <div class="coding-info-card">
      <div class="coding-info-icon" style="background:rgba(91,70,56,.1);color:#5B4638"><i class="fas fa-utensils" style="font-size:32px"></i></div>
      <div class="coding-info-text">
        <p style="font-size:15px;font-weight:700;color:var(--t1);margin-bottom:6px">CodeChef Profile</p>
        <p style="font-size:13px;color:var(--t2)">Competitive programming contests, long challenges, and cook-offs</p>
        <a class="coding-link" style="margin-top:12px;border-color:#5B4638;color:#5B4638;display:inline-flex" href="${esc(cp.codechef)}" target="_blank" rel="noopener"><i class="fas fa-utensils"></i> View CodeChef</a>
      </div>
    </div>
  </div>`:''}
  </div>
</section>`:''}
${testimonials.length?`
<section id="testimonials" class="section" style="background:var(--bg-alt)">
  <div data-reveal style="text-align:center">
    <h2 class="section-title">${theme==='obsidian'?'Testimonials':'What People Say'}</h2>
  </div>
  <div class="testi-grid">
    ${testimonials.map((t,i)=>`<div class="testi-card" data-reveal data-delay="${(i%3)+1}">
      <div class="testi-quote">"</div>
      <div class="testi-text">${esc(t.text)}</div>
      <div class="testi-author">
        ${t.avatarUrl?`<img class="testi-avatar" src="${esc(t.avatarUrl)}" alt="${esc(t.name)}">`:`<div class="testi-avatar-initials">${(t.name||'?').charAt(0).toUpperCase()}</div>`}
        <div>
          <div class="testi-name">${esc(t.name)}</div>
          <div class="testi-role">${esc(t.roleCompany)}</div>
        </div>
      </div>
    </div>`).join('')}
  </div>
</section>`:''}
${blogArticles.length?`
<section id="publications" class="section">
  <div data-reveal>
    <h2 class="section-title">${theme==='obsidian'?'Publications':'Publications'}</h2>
  </div>
  <div class="blog-grid">
    ${blogArticles.map((art,i)=>`<a class="blog-card" href="${esc(art.url)}" target="_blank" rel="noopener" data-reveal data-delay="${(i%3)+1}">
      ${art.coverImageUrl?`<img class="blog-img" src="${esc(art.coverImageUrl)}" alt="${esc(art.title)}">`:''}
      <div class="blog-body">
        <div class="blog-platform">${esc(art.platform)}</div>
        <div class="blog-title">${esc(art.title)}</div>
        ${art.description?`<div class="blog-desc">${esc(art.description)}</div>`:''}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto">
          <span class="blog-date">${art.publishedDate||''}</span>
          <span class="blog-read">Read More →</span>
        </div>
      </div>
    </a>`).join('')}
  </div>
</section>`:''}
<section id="contact" class="section">
  <div data-reveal style="text-align:center">
    <h2 class="section-title">${theme==='obsidian'?'Get in Touch':"Let's Work Together"}</h2>
    <p style="font-size:16px;color:var(--t2);max-width:500px;margin:0 auto 24px">Have a project in mind or want to collaborate? I'd love to hear from you.</p>
    ${c?.email?`<a class="contact-email-btn magnetic" href="https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-envelope"></i> ${esc(c.email)}</a>`:''}
    <div class="social-links">
      ${s?.linkedin?`<a class="social-link" href="${esc(normalizeUrl(s.linkedin))}" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i> LinkedIn</a>`:''}
      ${s?.github?`<a class="social-link" href="${esc(s.github)}" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>`:''}
      ${s?.website?`<a class="social-link" href="${esc(s.website)}" target="_blank" rel="noopener"><i class="fas fa-globe"></i> Website</a>`:''}
      ${s?.customLabel&&s?.customUrl?`<a class="social-link" href="${esc(s.customUrl)}" target="_blank" rel="noopener"><i class="fas fa-link"></i> ${esc(s.customLabel)}</a>`:''}
    </div>
    ${c?.phone||c?.city?`<p style="font-size:14px;color:var(--t2);margin-top:8px">
      ${c?.phone?`<i class="fas fa-phone" style="color:var(--a1)"></i> ${esc(c.phone)}&nbsp;&nbsp;`:''}
      ${c?.city?`<i class="fas fa-map-marker-alt" style="color:var(--a1)"></i> ${esc(c.city)}${c?.country?', '+esc(c.country):''}`:''}</p>`:''}
  </div>
</section>
<footer>
  <div class="footer-inner">
    <div>
      <div class="footer-name">${esc(p?.fullName||'Portfolio')}</div>
      ${p?.tagline?`<div style="font-size:13px;color:var(--t2);margin-top:4px">${esc(p.tagline)}</div>`:''}
    </div>
    <div class="footer-copy">© ${new Date().getFullYear()} ${esc(p?.fullName||'')} · Built with passion</div>
    <button class="back-top" id="backTop" title="Back to top" onclick="window.scrollTo({top:0,behavior:'smooth'})">
      <i class="fas fa-arrow-up"></i>
    </button>
  </div>
</footer>
<script>
(function(){
  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LOADER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var loader=document.getElementById('loader');
  setTimeout(function(){loader.classList.add('gone');setTimeout(function(){loader.style.display='none';},500);},700);

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ CUSTOM CURSOR ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
  var rx=0,ry=0,mx=0,my=0;
  document.addEventListener('mousemove',function(e){
    mx=e.clientX;my=e.clientY;
    cur.style.left=mx+'px';cur.style.top=my+'px';
  });
  (function animRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();
  document.querySelectorAll('a,button,.filter-btn,.magnetic').forEach(function(el){
    el.addEventListener('mouseenter',function(){cur.style.transform='translate(-50%,-50%) scale(2.5)';ring.style.transform='translate(-50%,-50%) scale(1.5)';ring.style.opacity='0.5';});
    el.addEventListener('mouseleave',function(){cur.style.transform='translate(-50%,-50%) scale(1)';ring.style.transform='translate(-50%,-50%) scale(1)';ring.style.opacity='1';});
  });

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SCROLL PROGRESS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var prog=document.getElementById('progress');
  window.addEventListener('scroll',function(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    prog.style.width=(h>0?window.scrollY/h*100:0)+'%';
  });

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ NAV SCROLL MORPH ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var nav=document.getElementById('nav');
  window.addEventListener('scroll',function(){
    if(window.scrollY>80){nav.classList.add('scrolled');}else{nav.classList.remove('scrolled');}
  });

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ HAMBURGER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var hbg=document.getElementById('hamburger'),mob=document.getElementById('mobileMenu');
  hbg.addEventListener('click',function(){
    hbg.classList.toggle('open');mob.classList.toggle('open');
  });
  mob.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){hbg.classList.remove('open');mob.classList.remove('open');});
  });

  var footer=document.querySelector('footer');
  var orderedSections=['hero','about','education','experience','skills','projects','publications','certifications','coding','achievements','testimonials','resume','contact'];
  if(footer){
    var fragment=document.createDocumentFragment();
    orderedSections.forEach(function(id){
      var section=document.getElementById(id);
      if(section) fragment.appendChild(section);
    });
    if(fragment.childNodes.length) document.body.insertBefore(fragment, footer);
  }

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ ACTIVE NAV SECTION ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var sections=document.querySelectorAll('section[id]');
  var navAs=document.querySelectorAll('.nav-links a[data-section]');
  var secObs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var id=en.target.id;
        navAs.forEach(function(a){
          a.classList.toggle('active',a.getAttribute('data-section')===id);
        });
      }
    });
  },{rootMargin:'-40% 0px -40% 0px'});
  sections.forEach(function(s){secObs.observe(s);});

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ DARK/LIGHT TOGGLE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var btn=document.getElementById('darkToggle');
  var cur_theme=document.documentElement.getAttribute('data-theme')||'aurora';
  function updateToggleLabel(themeName){
    if(btn) btn.innerHTML = themeName === 'obsidian' ? '&#9790;' : '&#9788;';
  }
  updateToggleLabel(cur_theme);
  btn.addEventListener('click',function(){
    if(cur_theme==='aurora'){cur_theme='obsidian';}
    else if(cur_theme==='obsidian'){cur_theme='prism';}
    else{cur_theme='aurora';}
    document.documentElement.setAttribute('data-theme',cur_theme);
    updateToggleLabel(cur_theme);
  });

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ REVEAL ON SCROLL ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var revObs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('visible');revObs.unobserve(en.target);}
    });
  },{threshold:0.1});
  document.querySelectorAll('[data-reveal]').forEach(function(el){revObs.observe(el);});

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ COUNTER ANIMATION ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  function animCount(el,target){
    var start=0,dur=1500,startTime=null;
    function step(ts){
      if(!startTime)startTime=ts;
      var p=Math.min((ts-startTime)/dur,1);
      var ease=p<0.5?2*p*p:-1+(4-2*p)*p;
      el.textContent=Math.round(ease*target);
      if(p<1)requestAnimationFrame(step);else el.textContent=target;
    }
    requestAnimationFrame(step);
  }
  var cntObs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var n=+en.target.getAttribute('data-count');
        animCount(en.target,n);
        cntObs.unobserve(en.target);
      }
    });
  },{threshold:0.5});
  document.querySelectorAll('[data-count]').forEach(function(el){cntObs.observe(el);});

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ TYPEWRITER (Aurora/Prism) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var roleEl=document.getElementById('heroRole');
  if(roleEl&&document.documentElement.getAttribute('data-theme')!=='obsidian'){
    var text=roleEl.textContent,i=0;
    roleEl.textContent='';
    roleEl.style.borderRight='2px solid var(--a1)';
    function type(){
      if(i<text.length){roleEl.textContent+=text[i++];setTimeout(type,60);}
      else{roleEl.style.borderRight='none';}
    }
    setTimeout(type,800);
  }

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ GLITCH TEXT (Obsidian only) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var nameEl=document.getElementById('heroName');
  if(nameEl&&document.documentElement.getAttribute('data-theme')==='obsidian'){
    var orig=nameEl.textContent;
    function glitch(){
      var it=0,chars='!<>-_\/[]{}ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â=+*^?#________';
      var inter=setInterval(function(){
        nameEl.textContent=orig.split('').map(function(c,idx){
          return idx<it?c:chars[Math.floor(Math.random()*chars.length)];
        }).join('');
        it+=1/3;
        if(it>=orig.length){clearInterval(inter);nameEl.textContent=orig;}
      },50);
    }
    setTimeout(glitch,600);
  }

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ MAGNETIC BUTTONS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  document.querySelectorAll('.magnetic').forEach(function(el){
    el.addEventListener('mousemove',function(e){
      var r=el.getBoundingClientRect();
      var dx=e.clientX-(r.left+r.width/2);
      var dy=e.clientY-(r.top+r.height/2);
      el.style.transform='translate('+dx*.15+'px,'+dy*.15+'px)';
    });
    el.addEventListener('mouseleave',function(){el.style.transform='';});
  });

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 3D CARD TILT ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  document.querySelectorAll('.project-card,.testi-card,.cert-flip-wrapper').forEach(function(card){
    card.addEventListener('mousemove',function(e){
      var r=card.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-0.5;
      var y=(e.clientY-r.top)/r.height-0.5;
      card.style.transform='perspective(800px) rotateX('+(-y*8)+'deg) rotateY('+(x*8)+'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave',function(){card.style.transform='';});
  });

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ PROJECT FILTER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  document.querySelectorAll('.filter-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      var filter=btn.getAttribute('data-filter');
      document.querySelectorAll('.project-card').forEach(function(card){
        if(filter==='all'){card.style.display='';}
        else{
          var tech=card.getAttribute('data-tech')||'';
          card.style.display=tech.toLowerCase().indexOf(filter.toLowerCase())>=0?'':'none';
        }
      });
    });
  });

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ HERO PARALLAX ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  var hero=document.getElementById('hero');
  if(hero){
    window.addEventListener('scroll',function(){
      var sc=window.scrollY;
      var hc=hero.querySelector('.hero-content');
      var hp=hero.querySelector('.hero-photo');
      if(hc)hc.style.transform='translateY('+sc*.15+'px)';
      if(hp)hp.style.transform='translateY('+sc*.08+'px)';
    });
  }

  /* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ OBSIDIAN PARTICLE CANVAS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */
  if(document.documentElement.getAttribute('data-theme')==='obsidian'){
    var canvas=document.createElement('canvas');
    canvas.style.cssText='position:fixed;top:0;left:0;pointer-events:none;z-index:0;opacity:0.4;';
    document.body.prepend(canvas);
    var ctx2=canvas.getContext('2d');
    var pts=[];
    function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
    resize();window.addEventListener('resize',resize);
    for(var pi=0;pi<60;pi++){pts.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3});}
    function drawParticles(){
      ctx2.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(function(pt){
        pt.x+=pt.vx;pt.y+=pt.vy;
        if(pt.x<0||pt.x>canvas.width)pt.vx*=-1;
        if(pt.y<0||pt.y>canvas.height)pt.vy*=-1;
        ctx2.beginPath();ctx2.arc(pt.x,pt.y,1.5,0,Math.PI*2);
        ctx2.fillStyle='#00F5D4';ctx2.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }
})();

  /* CERT MODAL LOGIC */
  window.openCertModal = function(el) {
    var url = el.getAttribute('data-certlink');
    if(!url || url === '#') return;
    
    var name = el.getAttribute('data-certname');
    var org = el.getAttribute('data-certorg');
    var date = el.getAttribute('data-certdate');
    var isPdf = el.getAttribute('data-ispdf') === 'true';

    var theme = document.documentElement.getAttribute('data-theme') || 'obsidian';
    
    // Theme colors
    var bg = theme === 'aurora' ? '#FFF' : theme === 'prism' ? '#111' : '#0F1320';
    var text = theme === 'aurora' ? '#0F0F0F' : '#FFF';
    var subText = theme === 'aurora' ? '#6B6B6B' : 'var(--a2)';
    var border = theme === 'aurora' ? '#E8E8E2' : '#1E2535';
    var btnBg = 'var(--a2)';
    
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); z-index:99999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px); font-family:sans-serif; padding: 20px; box-sizing: border-box;';
    overlay.onclick = function() { document.body.removeChild(overlay); };
    
    var content = document.createElement('div');
    content.style.cssText = 'position:relative; width:100%; max-width:800px; max-height:90vh; background:'+bg+'; border-radius:16px; border:1px solid '+border+'; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,0.6); overflow-y:auto;';
    content.onclick = function(e) { e.stopPropagation(); };
    
    // Close Button Top Right (absolute)
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'position:absolute; top:16px; right:16px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.1); border:none; color:'+text+'; font-size:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s; z-index:10;';
    closeBtn.onmouseover = function(){this.style.background='rgba(255,255,255,0.2)';};
    closeBtn.onmouseout = function(){this.style.background='rgba(255,255,255,0.1)';};
    closeBtn.onclick = function() { document.body.removeChild(overlay); };
    content.appendChild(closeBtn);

    var inner = document.createElement('div');
    inner.style.cssText = 'padding: 32px; display:flex; flex-direction:column; gap:24px;';

    // Header Content
    var header = document.createElement('div');
    header.innerHTML = \`
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
        <div style="width:56px; height:56px; border-radius:12px; background:linear-gradient(135deg, var(--a1), var(--a2)); display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">🎓</div>
        <div>
          <div style="font-size:24px; font-weight:700; color:\${text}; line-height:1.2; margin-bottom:4px;">\${name}</div>
          <div style="font-size:15px; color:var(--a1); font-weight:600;">\${org}</div>
        </div>
      </div>
      <div style="padding:12px 16px; background:rgba(155,93,229,0.08); border:1px solid rgba(155,93,229,0.2); border-radius:8px; font-size:14px; color:\${subText}; display:inline-flex; align-items:center; gap:8px;">
        <span>📅</span> Issued: \${date}
      </div>
    \`;
    inner.appendChild(header);

    // Media (PDF/Image)
    var mediaContainer = document.createElement('div');
    if(isPdf) {
      mediaContainer.innerHTML = \`<iframe src="\${url}" style="width:100%; height:450px; border:1px solid \${border}; border-radius:12px;" title="Certificate PDF"></iframe>\`;
    } else {
      mediaContainer.innerHTML = \`<img src="\${url}" style="width:100%; max-height:500px; object-fit:contain; border:1px solid \${border}; border-radius:12px;" alt="Certificate" />\`;
    }
    inner.appendChild(mediaContainer);

    // Footer button
    var footer = document.createElement('div');
    footer.style.cssText = 'display:flex; justify-content:flex-start;';
    footer.innerHTML = \`<button onclick="window.open('\${url}', '_blank')" style="padding:12px 24px; background:\${btnBg}; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; display:flex; align-items:center; gap:8px;">🔗 View Certificate</button>\`;
    inner.appendChild(footer);

    content.appendChild(inner);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
  };

  /* RESUME TOGGLE LOGIC */
  
  /* PROJECT MODAL LOGIC */
  window.openProjectModal = function(el) {
    var existing = document.getElementById('project-modal');
    if(existing) document.body.removeChild(existing);

    var name = el.getAttribute('data-projectname');
    var desc = el.getAttribute('data-projectdesc');
    var tech = el.getAttribute('data-projecttech');
    var live = el.getAttribute('data-projectlive');
    var github = el.getAttribute('data-projectgithub');

    var theme = document.documentElement.getAttribute('data-theme') || 'obsidian';
    var bg = theme === 'aurora' ? '#FFF' : theme === 'prism' ? '#111' : '#0F1320';
    var text = theme === 'aurora' ? '#0F0F0F' : '#FFF';
    var subText = theme === 'aurora' ? '#6B6B6B' : 'var(--a2)';
    var border = theme === 'aurora' ? '#E8E8E2' : '#1E2535';

    var overlay = document.createElement('div');
    overlay.id = 'project-modal';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); z-index:99999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px); font-family:sans-serif; padding: 20px; box-sizing: border-box;';
    overlay.onclick = function() { document.body.removeChild(overlay); };
    
    var content = document.createElement('div');
    content.style.cssText = 'position:relative; width:100%; max-width:600px; max-height:85vh; background:'+bg+'; border-radius:16px; border:1px solid '+border+'; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,0.6); overflow-y:auto; padding:32px;';
    content.onclick = function(e) { e.stopPropagation(); };
    
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'position:absolute; top:16px; right:16px; width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.1); border:none; color:'+text+'; font-size:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s; z-index:10;';
    closeBtn.onclick = function() { document.body.removeChild(overlay); };
    content.appendChild(closeBtn);

    var titleEl = document.createElement('h2');
    titleEl.textContent = name;
    titleEl.style.cssText = 'font-size:28px; font-weight:700; color:'+text+'; margin-top:0; margin-bottom:16px;';
    content.appendChild(titleEl);

    if(tech) {
      var tagsContainer = document.createElement('div');
      tagsContainer.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-bottom:24px;';
      tech.split(',').forEach(function(t) {
        if(!t.trim()) return;
        var span = document.createElement('span');
        span.textContent = t.trim();
        span.style.cssText = 'font-size:12px; padding:4px 12px; background:rgba(155,155,155,0.15); color:'+text+'; border:1px solid rgba(155,155,155,0.3); border-radius:20px; font-weight:600;';
        tagsContainer.appendChild(span);
      });
      content.appendChild(tagsContainer);
    }

    var descEl = document.createElement('p');
    descEl.textContent = desc;
    descEl.style.cssText = 'font-size:16px; line-height:1.6; color:'+text+'; opacity:0.85; margin-bottom:32px; white-space:pre-wrap;';
    content.appendChild(descEl);

    var btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display:flex; gap:16px; margin-top:auto;';
    
    if(live) {
      var liveBtn = document.createElement('button');
      liveBtn.innerHTML = 'Live Demo ↗';
      liveBtn.style.cssText = 'padding:10px 20px; background:var(--a2, #00C896); color:#FFF; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px;';
      liveBtn.onclick = function() { window.open(live, '_blank'); };
      btnContainer.appendChild(liveBtn);
    }
    
    if(github) {
      var gitBtn = document.createElement('button');
      gitBtn.innerHTML = 'GitHub ↗';
      gitBtn.style.cssText = 'padding:10px 20px; background:transparent; color:'+text+'; border:1px solid '+border+'; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px;';
      gitBtn.onclick = function() { window.open(github, '_blank'); };
      btnContainer.appendChild(gitBtn);
    }

    content.appendChild(btnContainer);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
  };

  window.toggleResumePreview = function(btn) {
    var iframe = document.getElementById('resume-preview-frame');
    var textSpan = btn.querySelector('.preview-text');
    var icon = btn.querySelector('i');
    if(iframe.style.display === 'none' || !iframe.style.display) {
      iframe.src = iframe.getAttribute('data-src');
      iframe.style.display = 'block';
      textSpan.textContent = 'Hide Preview';
      icon.className = 'fas fa-eye-slash';
    } else {
      iframe.style.display = 'none';
      iframe.src = '';
      textSpan.textContent = 'Preview Online';
      icon.className = 'fas fa-eye';
    }
  };

<\/script>
</body></html>`;
}














