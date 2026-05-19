import { useEffect, useRef, useState } from 'react';

export default function AuroraTheme({ portfolio }) {
  const { personalInfo: p, contactInfo: c, socialLinks: s, skills, projects, education, experience, certifications, achievements, testimonials, codingProfiles: cp, blogArticles } = portfolio || {};

  const sk = (skills && typeof skills === 'object' && !Array.isArray(skills)) ? skills : {};
  const cats = [['languages','Languages'],['frameworks','Frameworks'],['tools','Tools'],['databases','Databases'],['other','Other']];
  const hasSkills = cats.some(([key]) => Array.isArray(sk[key]) && sk[key].length > 0);
  const profilePic = p?.profilePhoto || p?.profileImage;
  const initials = p?.fullName ? p.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD';

  const activeSections = [
    { id: 'hero', show: true },
    { id: 'about', show: true },
    { id: 'education', show: education?.length > 0 },
    { id: 'experience', show: experience?.length > 0 },
    { id: 'skills', show: hasSkills },
    { id: 'projects', show: projects?.length > 0 },
    { id: 'publications', show: blogArticles?.length > 0 },
    { id: 'certifications', show: certifications?.filter(c => c.name || c.title).length > 0 },
    { id: 'coding', show: !!cp?.github },
    { id: 'achievements', show: achievements?.length > 0 },
    { id: 'testimonials', show: testimonials?.length > 0 },
    { id: 'resume', show: !!(p?.resumeBase64 || p?.resumeUrl) },
    { id: 'contact', show: true },
  ].filter(sec => sec.show);

  const normalizeExternalUrl = (url) => {
    const value = String(url || '').trim();
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  };

  const handleResumeDownload = () => {
    if (p?.resumeBase64) {
      const a = document.createElement('a');
      a.href = p.resumeBase64;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (p?.resumeUrl) {
      window.open(p.resumeUrl, '_blank');
    }
  };
  const [certModal_aurora, setCertModal_aurora] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Observe sections for fade-up animation
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    containerRef.current.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        background: '#FAFAF7',
        color: '#0F0F0F',
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        [data-animate] {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        a {
          color: #00C896;
          text-decoration: none;
          transition: opacity 0.3s;
        }

        a:hover {
          opacity: 0.7;
        }

        @media (prefers-reduced-motion: reduce) {
          [data-animate], * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '2px',
        background: '#00C896',
        zIndex: 1000,
        transition: 'width 0.1s ease-out',
        width: '0%',
      }} id="progressBar" />

      {/* Sidebar Navigation */}
      <div style={{
        position: 'fixed',
        left: '60px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}>
        {activeSections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #C9A84C',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#C9A84C';
              e.currentTarget.style.transform = 'scale(1.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={sec.id}
          />
        ))}
      </div>

      {/* HERO SECTION */}
      <section id="hero" style={{
        padding: '100px 80px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div data-animate style={{ flex: 1, maxWidth: '550px' }}>
          <div style={{
            fontSize: '64px',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: '24px',
            color: '#0F0F0F',
            letterSpacing: '-0.02em',
          }}>
            {p?.fullName || 'Your Name'}
          </div>
          <p style={{
            fontSize: '24px',
            color: '#6B6B6B',
            marginBottom: '20px',
            fontWeight: 500,
          }}>
            {p?.title || 'Professional Title'}
          </p>
          {p?.tagline && (
            <p style={{
              fontSize: '16px',
              color: '#00C896',
              marginBottom: '32px',
              fontWeight: 500,
            }}>
              {p.tagline}
            </p>
          )}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            {(p?.resumeBase64 || p?.resumeUrl) && (
              <button
                onClick={handleResumeDownload}
                style={{
                  padding: '14px 32px',
                  background: '#00C896',
                  color: '#FAFAF7',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                Download Resume
              </button>
            )}
            {c?.email && (
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '14px 32px',
                  border: '2px solid #0F0F0F',
                  background: 'transparent',
                  color: '#0F0F0F',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                Get in Touch
              </a>
            )}
          </div>
          {p?.availabilityStatus && (
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#E8E8E2',
              color: '#00C896',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {p.availabilityStatus}
            </div>
          )}
        </div>

        {/* Profile Photo */}
        <div data-animate style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: profilePic ? '#FFFFFF' : 'linear-gradient(135deg, #00C896, #C9A84C)',
            border: '3px solid #C9A84C',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {profilePic ? (
              <img
                src={profilePic}
                alt={p?.fullName || 'Profile'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                fontSize: '84px',
                fontWeight: 700,
                color: '#FAFAF7',
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '2px',
                textShadow: '0 4px 12px rgba(0,0,0,0.15)',
                userSelect: 'none',
              }}>
                {initials}
              </div>
            )}
          </div>
        </div>

        <div style={{ position: 'absolute', right: '-100px', bottom: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,200,150,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={{
        padding: '100px 80px',
        background: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'center',
      }}>
        <div data-animate>
          <h2 style={{
            fontSize: '40px',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            marginBottom: '24px',
            color: '#0F0F0F',
          }}>
            About Me
          </h2>
          {p?.bio && (
            <p style={{
              fontSize: '16px',
              lineHeight: 1.8,
              color: '#6B6B6B',
            }}>
              {p.bio}
            </p>
          )}
        </div>

        <div data-animate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { caption: 'Experience', value: experience?.length || 0, target: 'experience' },
            { caption: 'Projects', value: projects?.length || 0, target: 'projects' },
            { caption: 'Skills', value: (skills && typeof skills === 'object' && !Array.isArray(skills)) ? Object.values(skills).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0) : 0, target: 'skills' },
            { caption: 'Certifications', value: certifications?.length || 0, target: 'certifications' }
          ]
          .filter(stat => stat.value > 0)
          .map((stat) => (
            <div 
              key={stat.caption} 
              onClick={() => document.getElementById(stat.target)?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              style={{
                padding: '24px',
                background: '#FAFAF7',
                borderRadius: '8px',
                border: '1px solid #E8E8E2',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease, transform 0.3s ease'
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#00C896', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <p style={{ fontSize: '13px', color: '#6B6B6B', margin: 0 }}>
                {stat.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      {experience?.length > 0 && (
        <section id="experience" style={{ padding: '100px 80px' }}>
          <h2 data-animate style={{
            fontSize: '40px',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            marginBottom: '60px',
            color: '#0F0F0F',
            textAlign: 'center',
          }}>
            Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {experience.map((exp, i) => (
              <div key={i} data-animate style={{
                paddingLeft: '40px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '2px',
                  height: '100%',
                  background: '#E8E8E2',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '-6px',
                    top: 0,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#00C896',
                    border: '3px solid #FAFAF7',
                  }} />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0F0F0F',
                  margin: '0 0 6px',
                }}>
                  {exp.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#C9A84C',
                  fontWeight: 600,
                  margin: '0 0 8px',
                }}>
                  {exp.company} {exp.location && `Â· ${exp.location}`}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6B6B6B',
                  marginBottom: '12px',
                }}>
                  {exp.startDate} {exp.endDate && `â€“ ${exp.endDate}`}
                </p>
                {exp.description && (
                  <p style={{
                    fontSize: '14px',
                    color: '#6B6B6B',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS SECTION */}
      {projects?.length > 0 && (
        <section id="projects" style={{ padding: '100px 80px', background: '#FFFFFF' }}>
          <h2 data-animate style={{
            fontSize: '40px',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            marginBottom: '60px',
            color: '#0F0F0F',
            textAlign: 'center',
          }}>
            Selected Projects
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            {projects.map((proj, i) => (
              <div key={i} data-animate style={{
                background: '#FAFAF7',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #E8E8E2',
                transition: 'all 0.3s',
              }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                {proj.coverImage && (
                  <img
                    src={proj.coverImage}
                    alt={proj.name}
                    style={{
                      width: '100%',
                      height: '240px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div style={{ padding: '24px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#0F0F0F',
                    marginBottom: '8px',
                  }}>
                    {proj.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B6B6B',
                    marginBottom: '16px',
                    lineHeight: 1.5,
                  }}>
                    {proj.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {(proj.techStack || []).map((tech, j) => (
                      <span key={j} style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        background: '#E8E8E2',
                        color: '#0F0F0F',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: '12px',
                        color: '#00C896',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}>
                        â†’ Live Site
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: '12px',
                        color: '#C9A84C',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}>
                        â†’ Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PUBLICATIONS SECTION */}
      {blogArticles?.length > 0 && (
        <section id="publications" style={{ padding: '80px 80px', background: '#FAFAF7' }}>
          <h2 data-animate style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '48px', color: '#0F0F0F', textAlign: 'center' }}>Publications</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {blogArticles.map((art, i) => (
              <a key={i} href={art.url} target="_blank" rel="noopener noreferrer" data-animate style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E8E8E2', borderRadius: '8px', overflow: 'hidden', textDecoration: 'none' }}>
                {art.coverImageUrl && <img src={art.coverImageUrl} alt={art.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#00C896', textTransform: 'uppercase', marginBottom: '8px' }}>{art.platform}</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F0F0F', marginBottom: '8px' }}>{art.title}</div>
                  {art.description && <p style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: 1.5 }}>{art.description}</p>}
                  <div style={{ fontSize: '12px', color: '#C9A84C', marginTop: '12px', fontWeight: 600 }}>Read More →</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS SECTION */}
      {(() => {
        const sk = (skills && typeof skills === 'object' && !Array.isArray(skills)) ? skills : {};
        const cats = [['languages','Languages'],['frameworks','Frameworks'],['tools','Tools'],['databases','Databases'],['other','Other']];
        const hasSkills = cats.some(([k]) => Array.isArray(sk[k]) && sk[k].length > 0);
        if (!hasSkills) return null;
        return (
          <section id="skills" style={{ padding: '100px 80px' }}>
            <h2 data-animate style={{
              fontSize: '40px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              marginBottom: '60px',
              color: '#0F0F0F',
              textAlign: 'center',
            }}>Skills</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
              {cats.filter(([k]) => Array.isArray(sk[k]) && sk[k].length > 0).map(([k, label]) => (
                <div key={k} data-animate>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#C9A84C',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '16px',
                  }}>{label}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {sk[k].map((skill, j) => (
                      <span key={j} style={{
                        fontSize: '13px',
                        padding: '6px 12px',
                        background: '#E8E8E2',
                        color: '#0F0F0F',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* EDUCATION SECTION */}
      {education?.length > 0 && (
        <section style={{ padding: '80px 80px', background: '#FAFAF7' }}>
          <h2 data-animate style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '48px', color: '#0F0F0F', textAlign: 'center' }}>Education</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            {education.map((ed, i) => (
              <div key={i} data-animate style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E8E8E2', borderTop: '4px solid #00C896', borderRadius: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F0F0F', marginBottom: '8px' }}>{ed.degree}</div>
                <div style={{ fontSize: '14px', color: '#00C896', fontWeight: 600, marginBottom: '6px' }}>{ed.institution}</div>
                <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{(function(){
                    let sy = ed.startYear ? String(ed.startYear) : '';
                    let ey = ed.endYear ? String(ed.endYear) : '';
                    let dateStr = sy;
                    if (ey) {
                      if (sy && !sy.includes('-')) dateStr += ' — ' + ey;
                      else if (!sy) dateStr = ey;
                    }
                    let parts = [];
                    if (dateStr) parts.push(dateStr);
                    if (ed.gpa) parts.push((ed.scoreType === 'Percentage' ? 'Percentage: ' : 'GPA: ') + ed.gpa);
                    return parts.join(' · ');
                  })()}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CERTIFICATIONS SECTION */}
      {certifications?.filter(c => c.name || c.title).length > 0 && (
        <>
          {certModal_aurora && (
            <div onClick={() => setCertModal_aurora(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
              <div onClick={e => e.stopPropagation()} style={{ background:'#FFFFFF', borderRadius:'12px', padding:'32px', maxWidth:'600px', width:'100%', maxHeight:'85vh', overflowY:'auto', position:'relative', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
                <button onClick={() => setCertModal_aurora(null)} style={{ position:'absolute', top:'16px', right:'16px', background:'none', border:'none', cursor:'pointer', fontSize:'24px', color:'#6B6B6B', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'24px' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'#F5F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0, border:'1px solid #E8E8E2' }}>🎓</div>
                  <div>
                    <div style={{ fontSize:'22px', fontFamily:"'Playfair Display', serif", fontWeight:700, color:'#0F0F0F', lineHeight:1.2, marginBottom:'4px' }}>{certModal_aurora.name || certModal_aurora.title}</div>
                    <div style={{ fontSize:'15px', color:'#C9A84C', fontWeight:600 }}>{certModal_aurora.organization || certModal_aurora.issuer}</div>
                  </div>
                </div>
                <div style={{ padding:'12px 16px', background:'#F5F5F0', borderRadius:'8px', fontSize:'14px', color:'#6B6B6B', marginBottom:'24px', display:'flex', alignItems:'center', gap:'8px', border:'1px solid #E8E8E2' }}>
                  <span style={{ fontSize:'16px' }}>📅</span> Issued on {certModal_aurora.date}
                </div>
                {certModal_aurora.imageBase64 && certModal_aurora.imageType === 'image' && <img src={certModal_aurora.imageBase64} alt="Certificate" style={{ width:'100%', borderRadius:'8px', marginBottom:'20px', border:'1px solid #E8E8E2' }} />}
                {certModal_aurora.imageBase64 && certModal_aurora.imageType === 'pdf' && <iframe src={certModal_aurora.imageBase64} style={{ width:'100%', height:'400px', border:'1px solid #E8E8E2', borderRadius:'8px', marginBottom:'20px' }} title="Certificate PDF" />}
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  {certModal_aurora.imageBase64 && <button onClick={() => window.open(certModal_aurora.imageBase64, '_blank')} style={{ padding:'12px 24px', background:'#C9A84C', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600, fontSize:'14px', transition:'all 0.2s', boxShadow:'0 4px 12px rgba(201,168,76,0.3)' }}>View Certificate</button>}
                  {!certModal_aurora.imageBase64 && (certModal_aurora.url || certModal_aurora.certificateUrl || certModal_aurora.link) && <a href={certModal_aurora.url || certModal_aurora.certificateUrl || certModal_aurora.link} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block', padding:'12px 24px', background:'#C9A84C', color:'#fff', borderRadius:'6px', fontWeight:600, fontSize:'14px', textDecoration:'none', boxShadow:'0 4px 12px rgba(201,168,76,0.3)' }}>Verify Online</a>}
                </div>
              </div>
            </div>
          )}
          <section style={{ padding: '80px 80px' }}>
            <h2 data-animate style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '48px', color: '#0F0F0F', textAlign: 'center' }}>Certifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
              {certifications.filter(c => c.name || c.title).map((cert, i) => {
                const hasDoc = !!(cert.imageBase64 || cert.url || cert.certificateUrl || cert.link);
                return (
                  <div key={i} data-animate 
                    onClick={hasDoc ? () => setCertModal_aurora(cert) : undefined} 
                    style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E8E8E2', borderRadius: '12px', borderTop: '4px solid #C9A84C', cursor: hasDoc ? 'pointer' : 'default', transition: 'all 0.3s ease', display:'flex', flexDirection:'column', height:'100%' }}
                    onMouseEnter={e => {
                      if (hasDoc) {
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#F5F5F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>🎓</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F0F0F', lineHeight:1.3 }}>{cert.name || cert.title}</div>
                        <div style={{ fontSize: '13px', color: '#C9A84C', fontWeight: 600, marginTop:'4px' }}>{cert.organization || cert.issuer}</div>
                      </div>
                    </div>
                    <div style={{ marginTop:'auto', paddingTop:'16px', borderTop:'1px solid #E8E8E2', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ fontSize: '12px', color: '#6B6B6B', display:'flex', alignItems:'center', gap:'4px' }}><span>📅</span> {cert.date}</div>
                      {hasDoc && <div style={{ fontSize: '12px', color: '#C9A84C', fontWeight: 600, textTransform:'uppercase', letterSpacing:'0.5px' }}>View Detail</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
      {/* GITHUB / CODING PROFILES */}
      {cp?.github && (
        <section style={{ padding: '80px 80px', background: '#FAFAF7' }}>
          <h2 data-animate style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '40px', color: '#0F0F0F', textAlign: 'center' }}>GitHub & Coding</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
            <img src={`https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(cp.github)}&show_icons=true&theme=default&hide_border=true`} alt="GitHub Stats" style={{ borderRadius: '8px', maxWidth: '100%' }} />
            <img src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${encodeURIComponent(cp.github)}&layout=compact&theme=default&hide_border=true`} alt="Top Languages" style={{ borderRadius: '8px', maxWidth: '100%' }} />
          </div>
        </section>
      )}

      {/* ACHIEVEMENTS SECTION */}
      {achievements?.length > 0 && (
        <section style={{ padding: '80px 80px', background: '#FAFAF7' }}>
          <h2 data-animate style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '48px', color: '#0F0F0F', textAlign: 'center' }}>Achievements</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            {achievements.map((a, i) => (
              <div key={i} data-animate style={{ padding: '20px 24px', background: '#FFFFFF', border: '1px solid #E8E8E2', borderLeft: '4px solid #00C896', borderRadius: '0 8px 8px 0', maxWidth: '900px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F0F0F' }}>{a.title}</div>
                    <div style={{ fontSize: '13px', color: '#C9A84C', fontWeight: 600 }}>{a.organization}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B6B6B' }}>{a.date}</span>
                </div>
                {a.description && <p style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: 1.6 }}>{a.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section style={{ padding: '80px 80px', background: '#FFFFFF' }}>
          <h2 data-animate style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '48px', color: '#0F0F0F', textAlign: 'center' }}>What People Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {testimonials.map((t, i) => (
              <div key={i} data-animate style={{ padding: '24px', background: '#FAFAF7', border: '1px solid #E8E8E2', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#6B6B6B', fontStyle: 'italic', marginBottom: '20px', lineHeight: 1.7 }}>&quot;{t.text}&quot;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{(t.name || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F0F0F' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{t.roleCompany}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RESUME CTA */}
      {(p?.resumeBase64 || p?.resumeUrl) && (
        <section style={{ padding: '80px 80px', background: '#FFFFFF', textAlign: 'center' }}>
          <h2 data-animate style={{ fontSize: '36px', fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '16px', color: '#0F0F0F', textAlign: 'center' }}>My Resume</h2>
          <p style={{ color: '#6B6B6B', marginBottom: '32px' }}>Download my resume or preview it online</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={handleResumeDownload} style={{ padding: "14px 32px", background: "#00C896", color: "#fff", borderRadius: "8px", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer" }}>⬇ Download Resume</button>
            {p?.resumeUrl && !p?.resumeBase64 && (<a href={p.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "14px 32px", border: "2px solid #0F0F0F", color: "#0F0F0F", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}>👁 Preview</a>)}
          </div>
        </section>
      )}

      {/* CONTACT SECTION */}
      <section id="contact" style={{
        padding: '100px 80px',
        background: '#FFFFFF',
        textAlign: 'center',
      }}>
        <h2 data-animate style={{
          fontSize: '40px',
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          marginBottom: '24px',
          color: '#0F0F0F',
          textAlign: 'center',
        }}>
          Let's Work Together
        </h2>
        <p data-animate style={{
          fontSize: '16px',
          color: '#6B6B6B',
          marginBottom: '40px',
        }}>
          Have a project in mind? Let's talk about it.
        </p>

        {c?.email && (
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.email)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-animate
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              background: '#00C896',
              color: '#FAFAF7',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none',
              marginBottom: '40px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {c.email}
          </a>
        )}

        {/* Social Links */}
        <div data-animate style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '60px',
          fontSize: '14px',
        }}>
          {s?.linkedin && (
            <a href={normalizeExternalUrl(s.linkedin)} target="_blank" rel="noopener noreferrer" style={{ color: '#00C896' }}>
              LinkedIn
            </a>
          )}
          {s?.github && (
            <a href={s.github} target="_blank" rel="noopener noreferrer" style={{ color: '#00C896' }}>
              GitHub
            </a>
          )}
          {s?.website && (
            <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00C896' }}>
              Website
            </a>
          )}
          {s?.customLabel && s?.customUrl && (
            <a href={s.customUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00C896' }}>
              {s.customLabel}
            </a>
          )}
        </div>

        <p style={{
          fontSize: '12px',
          color: '#C9A84C',
          marginTop: '60px',
          paddingTop: '60px',
          borderTop: '1px solid #E8E8E2',
        }}>
          Designed & built with care â€” Â© {new Date().getFullYear()}
        </p>
      </section>

      <script>{`
        window.addEventListener('scroll', () => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrolled = (window.scrollY / scrollHeight) * 100;
          document.getElementById('progressBar').style.width = scrolled + '%';
        });
      `}</script>
    </div>
  );
}





