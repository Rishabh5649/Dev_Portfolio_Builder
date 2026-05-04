import { useEffect, useRef, useState } from 'react';

export default function PrismTheme({ portfolio }) {
  const { personalInfo: p, contactInfo: c, socialLinks: s, skills, projects, education, experience, certifications, achievements, testimonials, codingProfiles: cp, blogArticles } = portfolio || {};

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
  const [certModal_prism, setCertModal_prism] = useState(null);
  const containerRef = useRef(null);
  const projectCardsRef = useRef([]);

  // 3D Tilt effect on project cards
  useEffect(() => {
    const handleMouseMove = (e) => {
      projectCardsRef.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xRotate = ((y - rect.height / 2) / rect.height) * 8;
        const yRotate = ((x - rect.width / 2) / rect.width) * -8;
        card.style.transform = `perspective(1000px) rotateX(${xRotate}deg) rotateY(${yRotate}deg)`;
      });
    };

    const handleMouseLeave = () => {
      projectCardsRef.current.forEach((card) => {
        if (card) card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
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
        fontFamily: "'Nunito', 'Inter', sans-serif",
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 25%, #F093FB 50%, #4FACFE 100%)',
        backgroundAttachment: 'fixed',
        color: '#FFFFFF',
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=Nunito:wght@400;500;600;700&family=Source+Code+Pro:wght@400&display=swap');

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

        @keyframes float-orb {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(30px, -30px);
          }
          50% {
            transform: translate(0, -60px);
          }
          75% {
            transform: translate(-30px, -30px);
          }
        }

        .float-orb {
          animation: float-orb 8s ease-in-out infinite;
        }

        a {
          color: #FFD700;
          text-decoration: none;
          transition: all 0.3s;
          position: relative;
        }

        a:hover {
          color: #FF6CAB;
          text-shadow: 0 0 20px rgba(255,107,171,0.5);
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
        height: '3px',
        background: 'linear-gradient(90deg, #FFD700, #FF6CAB)',
        zIndex: 1000,
        transition: 'width 0.1s ease-out',
        width: '0%',
        boxShadow: '0 0 20px #FFD700',
      }} id="progressBar" />

      {/* Floating Gradient Orbs */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="float-orb"
          style={{
            position: 'fixed',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,${100 + i * 30},${150 - i * 30},0.4) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            top: Math.random() * 50 + '%',
            left: Math.random() * 50 + '%',
            zIndex: 0,
            pointerEvents: 'none',
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* HERO SECTION */}
        <section style={{
          padding: '120px 40px 100px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          textAlign: 'center',
        }}>
          {/* Decorative rotated text background */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-15deg)',
            fontSize: '120px',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            color: 'rgba(255,255,255,0.05)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            CREATE
          </div>

          <div data-animate style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '72px',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #FFD700, #FF6CAB, #4FACFE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(255,107,171,0.3)',
            }}>
              {p?.fullName || 'Your Name'}
            </div>
            <p style={{
              fontSize: '26px',
              color: 'rgba(255,255,255,0.95)',
              marginBottom: '20px',
              fontWeight: 600,
            }}>
              {p?.title || 'Creative Developer'}
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
              {(p?.resumeBase64 || p?.resumeUrl) && (
                <button
                  onClick={handleResumeDownload}
                  style={{
                    padding: '14px 32px',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'rgba(255,255,255,0.95)',
                    borderRadius: '30px',
                    fontWeight: 700,
                    fontSize: '14px',
                    backdropFilter: 'blur(20px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255,215,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Download Resume
                </button>
              )}
              {c?.email && (
                <a
                  href={`mailto:${c.email}`}
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, #FFD700, #FF6CAB)',
                    color: '#FFFFFF',
                    borderRadius: '30px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 8px 30px rgba(255,107,171,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,171,0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,171,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Let's Talk
                </a>
              )}
            </div>
            {p?.availabilityStatus && (
              <div style={{
                display: 'inline-block',
                padding: '10px 18px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: 600,
                backdropFilter: 'blur(20px)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                âœ¨ {p.availabilityStatus}
              </div>
            )}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section style={{
          padding: '80px 40px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(255,255,255,0.2)',
        }}>
          <h2 data-animate style={{
            fontSize: '48px',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            marginBottom: '40px',
            color: '#FFFFFF',
          }}>
            About
          </h2>
          {p?.bio && (
            <p data-animate style={{
              fontSize: '16px',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.9)',
              maxWidth: '700px',
            }}>
              {p.bio}
            </p>
          )}
        </section>

        {/* EXPERIENCE SECTION */}
        {experience?.length > 0 && (
          <section style={{
            padding: '80px 40px',
          }}>
            <h2 data-animate style={{
              fontSize: '48px',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              marginBottom: '40px',
              color: '#FFFFFF',
            }}>
              Experience
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {experience.map((exp, i) => (
                <div key={i} data-animate style={{
                  padding: '30px',
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s',
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: 0,
                      }}>
                        {exp.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#FFD700',
                        fontWeight: 600,
                        margin: '4px 0 0',
                      }}>
                        {exp.company}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 500,
                    }}>
                      {exp.startDate} {exp.endDate && `â€“ ${exp.endDate}`}
                    </span>
                  </div>
                  {exp.description && (
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.8)',
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
          <section style={{
            padding: '80px 40px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(30px)',
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}>
            <h2 data-animate style={{
              fontSize: '48px',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              marginBottom: '40px',
              color: '#FFFFFF',
              textAlign: 'center',
            }}>
              Featured Projects
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
              {projects.map((proj, i) => (
                <div
                  key={i}
                  ref={(el) => { projectCardsRef.current[i] = el; }}
                  data-animate
                  style={{
                    padding: '24px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    transformStyle: 'preserve-3d',
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(255,107,171,0.3)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  {proj.coverImage && (
                    <img
                      src={proj.coverImage}
                      alt={proj.name}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '16px',
                      }}
                    />
                  )}
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '8px',
                  }}>
                    {proj.name}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '16px',
                    lineHeight: 1.5,
                  }}>
                    {proj.description}
                  </p>
                  {proj.techStack?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {proj.techStack.map((tech, j) => (
                        <span key={j} style={{
                          fontSize: '11px',
                          padding: '4px 10px',
                          background: 'rgba(255,215,0,0.2)',
                          color: '#FFD700',
                          borderRadius: '20px',
                          fontWeight: 500,
                          border: '1px solid rgba(255,215,0,0.3)',
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: '12px',
                        color: '#FFD700',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}>
                        â†’ Visit
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: '12px',
                        color: '#FF6CAB',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}>
                        â†’ Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

          {/* PUBLICATIONS */}
          {blogArticles?.length > 0 && (
            <section style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.05)' }}>
              <h2 data-animate style={{ fontSize: '40px', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#FFFFFF', textAlign: 'center' }}>Publications</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                {blogArticles.map((art, i) => (
                  <a key={i} href={art.url} target="_blank" rel="noopener noreferrer" data-animate style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', overflow: 'hidden', textDecoration: 'none' }}>
                    {art.coverImageUrl && <img src={art.coverImageUrl} alt={art.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />}
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: '#FFD700', textTransform: 'uppercase', marginBottom: '6px' }}>{art.platform}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>{art.title}</div>
                      <div style={{ fontSize: '12px', color: '#FF6CAB', fontWeight: 600 }}>Read More</div>
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
            <section id="skills" style={{ padding: '80px 40px' }}>
              <h2 data-animate style={{
                fontSize: '48px',
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                marginBottom: '40px',
                color: '#FFFFFF',
                textAlign: 'center',
              }}>Skills</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                {cats.filter(([k]) => Array.isArray(sk[k]) && sk[k].length > 0).map(([k, label]) => (
                  <div key={k} data-animate>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FFD700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '16px',
                    }}>{label}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {sk[k].map((skill, j) => (
                        <span key={j} style={{
                          fontSize: '13px',
                          padding: '6px 14px',
                          background: 'rgba(255,215,0,0.15)',
                          color: '#FFD700',
                          borderRadius: '20px',
                          fontWeight: 500,
                          border: '1px solid rgba(255,215,0,0.3)',
                          transition: 'all 0.3s',
                          cursor: 'pointer',
                        }} onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,215,0,0.25)';
                          e.currentTarget.style.boxShadow = '0 0 15px rgba(255,215,0,0.4)';
                        }} onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,215,0,0.15)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* EDUCATION */}
        {education?.length > 0 && (
          <section style={{ padding: '60px 40px' }}>
            <h2 data-animate style={{ fontSize: '40px', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#FFFFFF', textAlign: 'center' }}>Education</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
              {education.map((ed, i) => (
                <div key={i} data-animate style={{ padding: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', borderTop: '3px solid #FFD700' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>{ed.degree}</div>
                  <div style={{ fontSize: '13px', color: '#FFD700', fontWeight: 600, marginBottom: '6px' }}>{ed.institution}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{(function(){
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
        {/* CERTIFICATIONS */}
        {certifications?.filter(c => c.name || c.title).length > 0 && (
          <>
            {certModal_prism && (
              <div onClick={() => setCertModal_prism(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
                <div onClick={e => e.stopPropagation()} style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'16px', padding:'32px', maxWidth:'600px', width:'100%', maxHeight:'85vh', overflowY:'auto', position:'relative', boxShadow:'0 30px 60px rgba(0,0,0,0.6)' }}>
                  <button onClick={() => setCertModal_prism(null)} style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'18px', color:'#FFD700', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'24px' }}>
                    <div style={{ width:'50px', height:'50px', borderRadius:'12px', background:'linear-gradient(135deg, #FFD700, #FF6CAB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0, boxShadow:'0 8px 16px rgba(255,215,0,0.3)' }}>🎓</div>
                    <div>
                      <div style={{ fontSize:'22px', fontWeight:800, color:'#FFFFFF', marginBottom:'4px', lineHeight:1.2, letterSpacing:'-0.5px' }}>{certModal_prism.name || certModal_prism.title}</div>
                      <div style={{ fontSize:'15px', color:'#FFD700', fontWeight:600 }}>{certModal_prism.organization || certModal_prism.issuer}</div>
                    </div>
                  </div>
                  <div style={{ padding:'12px 16px', background:'rgba(255,215,0,0.05)', borderRadius:'8px', fontSize:'14px', color:'rgba(255,255,255,0.8)', marginBottom:'24px', display:'flex', alignItems:'center', gap:'8px', border:'1px solid rgba(255,215,0,0.2)' }}>
                    <span style={{ fontSize:'16px' }}>📅</span> Date: {certModal_prism.date}
                  </div>
                  {certModal_prism.imageBase64 && certModal_prism.imageType === 'image' && <img src={certModal_prism.imageBase64} alt="Certificate" style={{ width:'100%', borderRadius:'12px', marginBottom:'20px', border:'1px solid rgba(255,255,255,0.1)' }} />}
                  {certModal_prism.imageBase64 && certModal_prism.imageType === 'pdf' && <iframe src={certModal_prism.imageBase64} style={{ width:'100%', height:'400px', border:'none', borderRadius:'12px', marginBottom:'20px' }} title="Certificate PDF" />}
                  <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                    {certModal_prism.imageBase64 && <button onClick={() => window.open(certModal_prism.imageBase64, '_blank')} style={{ padding:'12px 24px', background:'linear-gradient(90deg, #FFD700, #FF6CAB)', color:'#000', border:'none', borderRadius:'30px', cursor:'pointer', fontWeight:700, fontSize:'14px', transition:'transform 0.2s', boxShadow:'0 4px 12px rgba(255,215,0,0.4)' }}>View Document</button>}
                    {!certModal_prism.imageBase64 && (certModal_prism.url || certModal_prism.certificateUrl || certModal_prism.link) && <a href={certModal_prism.url || certModal_prism.certificateUrl || certModal_prism.link} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block', padding:'12px 24px', background:'linear-gradient(90deg, #FFD700, #FF6CAB)', color:'#000', borderRadius:'30px', fontWeight:700, fontSize:'14px', textDecoration:'none', boxShadow:'0 4px 12px rgba(255,215,0,0.4)' }}>Verify Online</a>}
                  </div>
                </div>
              </div>
            )}
            <section style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.05)' }}>
              <h2 data-animate style={{ fontSize: '40px', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#FFFFFF', textAlign: 'center' }}>Certifications</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                {certifications.filter(c => c.name || c.title).map((cert, i) => (
                  <div key={i} data-animate onClick={() => setCertModal_prism(cert)} style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position:'relative', overflow:'hidden' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,215,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' }}>
                      <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>🎓</div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight:1.2 }}>{cert.name || cert.title}</div>
                        <div style={{ fontSize: '13px', color: '#FFD700', fontWeight: 600 }}>{cert.organization || cert.issuer}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', gap:'6px' }}><span>📅</span> {cert.date}</div>
                      {(cert.imageBase64 || cert.url || cert.certificateUrl) && <div style={{ fontSize: '12px', color: '#FF6CAB', fontWeight: 700, textTransform:'uppercase', letterSpacing:'1px' }}>Open</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
{/* ACHIEVEMENTS */}
        {achievements?.length > 0 && (
          <section style={{ padding: '60px 40px' }}>
            <h2 data-animate style={{ fontSize: '40px', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#FFFFFF', textAlign: 'center' }}>Achievements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              {achievements.map((a, i) => (
                <div key={i} data-animate style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,215,0,.3)', borderRadius: '12px', maxWidth: '900px', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>{a.title}</div>
                      <div style={{ fontSize: '13px', color: '#FFD700', fontWeight: 600 }}>{a.organization}</div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)' }}>{a.date}</span>
                  </div>
                  {a.description && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.8)', lineHeight: 1.6 }}>{a.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
        {/* GITHUB */}
        {cp?.github && (
          <section style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.05)' }}>
            <h2 data-animate style={{ fontSize: '40px', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#FFFFFF', textAlign: 'center' }}>GitHub</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <img src={`https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(cp.github)}&show_icons=true&theme=radical&hide_border=true`} alt="GitHub Stats" style={{ borderRadius: '8px', maxWidth: '100%' }} />
              <img src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${encodeURIComponent(cp.github)}&layout=compact&theme=radical&hide_border=true`} alt="Top Languages" style={{ borderRadius: '8px', maxWidth: '100%' }} />
            </div>
          </section>
        )}
        {/* TESTIMONIALS */}
        {testimonials?.length > 0 && (
          <section style={{ padding: '60px 40px' }}>
            <h2 data-animate style={{ fontSize: '40px', fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#FFFFFF', textAlign: 'center' }}>What People Say</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
              {testimonials.map((t, i) => (
                <div key={i} data-animate style={{ padding: '24px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', marginBottom: '20px', lineHeight: 1.7 }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#FFD700,#FF6CAB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{(t.name || '?').charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.7)' }}>{t.roleCompany}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* CONTACT SECTION */}
        <section style={{
          padding: '80px 40px',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
        }}>
          <h2 data-animate style={{
            fontSize: '48px',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            marginBottom: '24px',
            color: '#FFFFFF',
            textAlign: 'center',
          }}>
            Let's Create Something Amazing
          </h2>
          {c?.email && (
            <a
              href={`mailto:${c.email}`}
              data-animate
              style={{
                display: 'inline-block',
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #FFD700, #FF6CAB)',
                color: '#FFFFFF',
                borderRadius: '30px',
                fontWeight: 700,
                fontSize: '15px',
                textDecoration: 'none',
                marginBottom: '40px',
                transition: 'all 0.3s',
                boxShadow: '0 12px 40px rgba(255,107,171,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 16px 60px rgba(255,107,171,0.6)';
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,171,0.4)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              {c.email}
            </a>
          )}

          <div data-animate style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '60px',
            fontSize: '13px',
            flexWrap: 'wrap',
          }}>
            {s?.linkedin && (
              <a href={s.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>
                LinkedIn
              </a>
            )}
            {s?.github && (
              <a href={s.github} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>
                GitHub
              </a>
            )}
            {s?.twitter && (
              <a href={s.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>
                Twitter
              </a>
            )}
            {s?.website && (
              <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>
                Website
              </a>
            )}
          </div>

          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '60px',
            paddingTop: '40px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}>
            Â© {new Date().getFullYear()} â€¢ Crafted with creativity
          </p>
        </section>
      </div>

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








