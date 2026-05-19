import { useEffect, useRef, useState } from 'react';

export default function ObsidianTheme({ portfolio }) {
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
  const [certModal_obsidian, setCertModal_obsidian] = useState(null);
  const containerRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    if (!nameRef.current) return;
    const text = nameRef.current.innerText;
    const glitchEffect = () => {
      const chars = text.split('');
      let iteration = 0;
      const interval = setInterval(() => {
        nameRef.current.innerText = chars
          .map((char, index) => {
            if (index < iteration) return char;
            return String.fromCharCode(33 + Math.random() * 94);
          })
          .join('');
        iteration += 1 / 3;
        if (iteration >= chars.length) {
          clearInterval(interval);
          nameRef.current.innerText = text;
        }
      }, 50);
    };
    const timer = setTimeout(glitchEffect, 500);
    return () => clearTimeout(timer);
  }, [p?.fullName]);

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
        fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
        background: '#080B12',
        color: '#E8EBF4',
        minHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Fira+Code:wght@400&display=swap');

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

        @keyframes glitch {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
            text-shadow:
              -2px 0 #00F5D4,
              2px 0 #9B5DE5,
              0 0 10px #00F5D4;
          }
          20%, 24%, 55% {
            text-shadow:
              2px 0 #00F5D4,
              -2px 0 #9B5DE5,
              0 0 10px #9B5DE5;
          }
        }

        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        .glitch-text {
          animation: glitch 0.5s ease-in-out;
        }

        .cursor-blink {
          display: inline-block;
          width: '2px';
          height: '1em';
          background: #00F5D4;
          animation: blink 1s steps(2) infinite;
          margin-left: 4px;
        }

        a {
          color: #00F5D4;
          text-decoration: none;
          transition: all 0.3s;
          position: relative;
        }

        a:hover {
          color: #9B5DE5;
          text-shadow: 0 0 10px #00F5D4;
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
        background: 'linear-gradient(90deg, #00F5D4, #9B5DE5)',
        zIndex: 1000,
        transition: 'width 0.1s ease-out',
        width: '0%',
        boxShadow: '0 0 10px #00F5D4',
      }} id="progressBar" />

      {/* Animated Background Particles */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: '#00F5D4',
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.3,
              animation: `float ${5 + Math.random() * 10}s infinite linear`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: translate(100px, -100px) rotate(360deg);
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Sticky Top Nav */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        background: 'rgba(8,11,18,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1E2535',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{
          fontSize: '16px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          color: '#00F5D4',
          margin: 0,
          textShadow: '0 0 10px rgba(0,245,212,0.5)',
        }}>
          &lt;{p?.fullName?.split(' ')[0]?.toLowerCase() || 'dev'} /&gt;
        </h1>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
          {[
            { label: 'about', href: '#about', show: true },
            { label: 'work', href: '#experience', show: experience?.length > 0 },
            { label: 'projects', href: '#projects', show: projects?.length > 0 },
            { label: 'contact', href: '#contact', show: true },
          ].filter(item => item.show).map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                color: '#8892A4',
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00F5D4';
                e.currentTarget.style.textShadow = '0 0 10px #00F5D4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8892A4';
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        paddingTop: '120px',
        padding: '120px 40px 100px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        textAlign: 'center',
        zIndex: 1,
      }}>
        <div data-animate style={{ maxWidth: '700px' }}>
          <div style={{
            fontSize: '64px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: '20px',
            color: '#00F5D4',
            textShadow: '0 0 20px rgba(0,245,212,0.5), 0 0 40px rgba(155,93,229,0.3)',
          }} ref={nameRef}>
            {p?.fullName || 'Your Name'}
          </div>
          <p style={{
            fontSize: '24px',
            color: '#8892A4',
            marginBottom: '20px',
            fontWeight: 500,
          }}>
            {p?.title || 'Full Stack Developer'}
            <span className="cursor-blink" />
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
            {(p?.resumeBase64 || p?.resumeBase64 || p?.resumeUrl) && (
              <button
                onClick={handleResumeDownload}
                style={{
                  padding: '14px 28px',
                  border: '1px solid #00F5D4',
                  background: 'transparent',
                  color: '#00F5D4',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: "'Fira Code', monospace",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,245,212,0.1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,212,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                resume.pdf
              </button>
            )}
            {c?.email && (
              <a
                href={`mailto:${c.email}`}
                style={{
                  padding: '14px 28px',
                  border: '1px solid #9B5DE5',
                  background: 'transparent',
                  color: '#9B5DE5',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: "'Fira Code', monospace",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(155,93,229,0.1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(155,93,229,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                get_in_touch()
              </a>
            )}
          </div>
          {p?.availabilityStatus && (
            <div style={{
              display: 'inline-block',
              padding: '8px 14px',
              border: '1px solid #00F5D4',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: "'Fira Code', monospace",
              color: '#00F5D4',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              status: {p.availabilityStatus.toLowerCase()}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={{
        padding: '80px 40px',
        borderTop: '1px solid #1E2535',
        position: 'relative',
        zIndex: 1,
      }}>
        <h2 data-animate style={{
          fontSize: '36px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          marginBottom: '40px',
          color: '#00F5D4',
          textShadow: '0 0 10px rgba(0,245,212,0.3)',
        }}>About</h2>
        {p?.bio && (
          <p data-animate style={{
            fontSize: '15px',
            lineHeight: 1.8,
            color: '#8892A4',
            maxWidth: '700px',
          }}>
            {p.bio}
          </p>
        )}
      </section>

      {/* EXPERIENCE SECTION */}
      {experience?.length > 0 && (
        <section id="experience" style={{
          padding: '80px 40px',
          borderTop: '1px solid #1E2535',
          position: 'relative',
          zIndex: 1,
        }}>
          <h2 data-animate style={{
            fontSize: '36px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            marginBottom: '40px',
            color: '#00F5D4',
            textShadow: '0 0 10px rgba(0,245,212,0.3)',
          }}>
            // Experience
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {experience.map((exp, i) => (
              <div key={i} data-animate style={{
                paddingLeft: '30px',
                position: 'relative',
                borderLeft: '2px solid #1E2535',
              }}>
                <div style={{
                  position: 'absolute',
                  left: '-8px',
                  top: 0,
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#9B5DE5',
                  border: '2px solid #0F1320',
                  boxShadow: '0 0 10px #9B5DE5',
                }} />
                <div style={{
                  fontSize: '14px',
                  color: '#8892A4',
                  marginBottom: '6px',
                  fontFamily: "'Fira Code', monospace",
                }}>
                  {exp.startDate} {exp.endDate && `â€“ ${exp.endDate}`}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#E8EBF4',
                  margin: '0 0 6px',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  {exp.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#00F5D4',
                  fontWeight: 600,
                  margin: '0 0 12px',
                }}>
                  {exp.company}
                </p>
                {exp.description && (
                  <p style={{
                    fontSize: '13px',
                    color: '#8892A4',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    fontFamily: "'Fira Code', monospace",
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
        <section id="projects" style={{
          padding: '80px 40px',
          borderTop: '1px solid #1E2535',
          position: 'relative',
          zIndex: 1,
        }}>
          <h2 data-animate style={{
            fontSize: '36px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            marginBottom: '40px',
            color: '#00F5D4',
            textShadow: '0 0 10px rgba(0,245,212,0.3)',
          }}>
            // Featured Projects
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            {projects.map((proj, i) => (
              <div key={i} data-animate style={{
                border: '1px solid #1E2535',
                borderRadius: '8px',
                padding: '24px',
                background: 'rgba(15,19,32,0.5)',
                transition: 'all 0.3s',
              }} onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00F5D4';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,212,0.2)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1E2535';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#E8EBF4',
                  marginBottom: '8px',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  {proj.name}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#8892A4',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}>
                  {proj.description}
                </p>
                {proj.techStack?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {proj.techStack.map((tech, j) => (
                      <span key={j} style={{
                        fontSize: '10px',
                        padding: '4px 8px',
                        background: 'rgba(0,245,212,0.1)',
                        color: '#00F5D4',
                        borderRadius: '4px',
                        fontWeight: 500,
                        fontFamily: "'Fira Code', monospace",
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
                      color: '#00F5D4',
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontFamily: "'Fira Code', monospace",
                    }}>
                      â†’ live
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '12px',
                      color: '#9B5DE5',
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontFamily: "'Fira Code', monospace",
                    }}>
                      â†’ source
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
        <section id="publications" style={{ padding: '60px 40px', borderTop: '1px solid #1E2535', position: 'relative', zIndex: 1 }}>
          <h2 data-animate style={{ fontSize: '32px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#00F5D4', textAlign: 'center' }}>Publications</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {blogArticles.map((art, i) => (
              <a key={i} href={art.url} target="_blank" rel="noopener noreferrer" data-animate style={{ display: 'flex', flexDirection: 'column', background: '#0F1320', border: '1px solid rgba(0,245,212,.1)', borderRadius: '8px', overflow: 'hidden', textDecoration: 'none' }}>
                {art.coverImageUrl && <img src={art.coverImageUrl} alt={art.title} style={{ width: '100%', height: '130px', objectFit: 'cover' }} />}
                <div style={{ padding: '14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#9B5DE5', textTransform: 'uppercase', marginBottom: '6px' }}>{art.platform}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#E8EBF4', marginBottom: '8px' }}>{art.title}</div>
                  <div style={{ fontSize: '12px', color: '#00F5D4', fontWeight: 600 }}>read more</div>
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
          <section id="skills" style={{ padding: '80px 40px', borderTop: '1px solid #1E2535', position: 'relative', zIndex: 1 }}>
            <h2 data-animate style={{
              fontSize: '36px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              marginBottom: '40px',
              color: '#00F5D4',
              textShadow: '0 0 10px rgba(0,245,212,0.3)',
              textAlign: 'center',
            }}>Skills</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
              {cats.filter(([k]) => Array.isArray(sk[k]) && sk[k].length > 0).map(([k, label]) => (
                <div key={k} data-animate>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#9B5DE5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '16px',
                    fontFamily: "'Fira Code', monospace",
                  }}>{label}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {sk[k].map((skill, j) => (
                      <span key={j} style={{
                        fontSize: '12px',
                        padding: '6px 10px',
                        background: 'rgba(0,245,212,0.1)',
                        color: '#00F5D4',
                        borderRadius: '4px',
                        fontWeight: 500,
                        fontFamily: "'Fira Code', monospace",
                        border: '1px solid rgba(0,245,212,0.2)',
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
        <section style={{ padding: '60px 40px', borderTop: '1px solid #1E2535', position: 'relative', zIndex: 1 }}>
          <h2 data-animate style={{ fontSize: '32px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#00F5D4', textAlign: 'center' }}>Education</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {education.map((ed, i) => (
              <div key={i} data-animate style={{ padding: '20px', background: '#0F1320', border: '1px solid #1E2535', borderTop: '3px solid #00F5D4', borderRadius: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#E8EBF4', marginBottom: '6px' }}>{ed.degree}</div>
                <div style={{ fontSize: '13px', color: '#00F5D4', fontWeight: 600, marginBottom: '6px' }}>{ed.institution}</div>
                <div style={{ fontSize: '12px', color: '#8892A4' }}>{(function(){
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
          {certModal_obsidian && (
            <div onClick={() => setCertModal_obsidian(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
              <div onClick={e => e.stopPropagation()} style={{ background:'#0B0D17', border:'1px solid #1E2535', borderRadius:'16px', padding:'32px', maxWidth:'560px', width:'100%', maxHeight:'85vh', overflowY:'auto', position:'relative', boxShadow:'0 24px 64px rgba(0,0,0,0.7)' }}>
                <button onClick={() => setCertModal_obsidian(null)} style={{ position:'absolute', top:'16px', right:'16px', background:'rgba(255,255,255,0.05)', border:'1px solid #1E2535', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', fontSize:'18px', color:'#00F5D4', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>×</button>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'linear-gradient(135deg,#9B5DE5,#00F5D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>🎓</div>
                  <div>
                    <div style={{ fontSize:'18px', fontWeight:700, color:'#E8EBF4', lineHeight:1.3 }}>{certModal_obsidian.name || certModal_obsidian.title}</div>
                    <div style={{ fontSize:'13px', color:'#9B5DE5', fontWeight:600, marginTop:'2px' }}>{certModal_obsidian.organization || certModal_obsidian.issuer}</div>
                  </div>
                </div>
                <div style={{ padding:'10px 14px', background:'rgba(155,93,229,0.08)', border:'1px solid rgba(155,93,229,0.2)', borderRadius:'8px', fontSize:'13px', color:'#6B7A99', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span>📅</span> Issued: {certModal_obsidian.date}
                </div>
                {certModal_obsidian.imageBase64 && certModal_obsidian.imageType === 'image' && <img src={certModal_obsidian.imageBase64} alt="Certificate" style={{ width:'100%', borderRadius:'10px', marginBottom:'16px', border:'1px solid #1E2535' }} />}
                {certModal_obsidian.imageBase64 && certModal_obsidian.imageType === 'pdf' && <iframe src={certModal_obsidian.imageBase64} style={{ width:'100%', height:'420px', border:'none', borderRadius:'10px', marginBottom:'16px' }} title="Certificate PDF" />}
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  {certModal_obsidian.imageBase64 && <button onClick={() => window.open(certModal_obsidian.imageBase64, '_blank')} style={{ padding:'10px 20px', background:'#9B5DE5', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'13px', display:'flex', alignItems:'center', gap:'6px' }}>🔗 View Certificate</button>}
                  {!certModal_obsidian.imageBase64 && (certModal_obsidian.url || certModal_obsidian.certificateUrl || certModal_obsidian.link) && <a href={certModal_obsidian.url || certModal_obsidian.certificateUrl || certModal_obsidian.link} target="_blank" rel="noopener noreferrer" style={{ padding:'10px 20px', background:'#9B5DE5', color:'#fff', borderRadius:'8px', fontWeight:600, fontSize:'13px', textDecoration:'none', display:'flex', alignItems:'center', gap:'6px' }}>🔗 View Certificate</a>}
                </div>
              </div>
            </div>
          )}
          <section style={{ padding: '60px 40px', borderTop: '1px solid #1E2535', position: 'relative', zIndex: 1 }}>
            <h2 data-animate style={{ fontSize: '32px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#00F5D4', textAlign: 'center' }}>Certifications</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
              {certifications.filter(c => c.name || c.title).map((cert, i) => {
                const hasDoc = !!(cert.imageBase64 || cert.url || cert.certificateUrl || cert.link);
                return (
                  <div key={i} data-animate 
                    onClick={hasDoc ? () => setCertModal_obsidian(cert) : undefined}
                    style={{ padding: '22px', background: '#0F1320', border: '1px solid #1E2535', borderLeft: '3px solid #9B5DE5', borderRadius: '10px', cursor: hasDoc ? 'pointer' : 'default', transition: 'all 0.25s', position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={e => {
                      if (hasDoc) {
                        e.currentTarget.style.background = '#111827';
                        e.currentTarget.style.borderColor = '#9B5DE5';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(155,93,229,0.2)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#0F1320';
                      e.currentTarget.style.borderColor = '#1E2535';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                      <div style={{ width:'38px', height:'38px', borderRadius:'8px', background:'linear-gradient(135deg,rgba(155,93,229,0.3),rgba(0,245,212,0.3))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>🎓</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'14px', fontWeight:700, color:'#E8EBF4', marginBottom:'4px', lineHeight:1.4 }}>{cert.name || cert.title}</div>
                        <div style={{ fontSize:'12px', color:'#9B5DE5', fontWeight:600, marginBottom:'8px' }}>{cert.organization || cert.issuer}</div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:'11px', color:'#6B7A99', background:'rgba(107,122,153,0.1)', padding:'3px 8px', borderRadius:'20px' }}>📅 {cert.date}</span>
                          {hasDoc && <span style={{ fontSize:'11px', color:'#00F5D4', fontWeight:600 }}>View →</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
      
{/* ACHIEVEMENTS */}
      {achievements?.length > 0 && (
        <section style={{ padding: '60px 40px', borderTop: '1px solid #1E2535', position: 'relative', zIndex: 1 }}>
          <h2 data-animate style={{ fontSize: '32px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#00F5D4', textAlign: 'center' }}>Achievements</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            {achievements.map((a, i) => (
              <div key={i} data-animate style={{ padding: '16px 20px', background: '#0F1320', border: '1px solid #1E2535', borderLeft: '3px solid #00F5D4', borderRadius: '0 8px 8px 0', maxWidth: '900px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#E8EBF4' }}>{a.title}</div>
                    <div style={{ fontSize: '12px', color: '#9B5DE5', fontWeight: 600 }}>{a.organization}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#8892A4' }}>{a.date}</span>
                </div>
                {a.description && <p style={{ fontSize: '13px', color: '#8892A4', lineHeight: 1.6 }}>{a.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
      {/* RESUME CTA */}
      {(p?.resumeBase64 || p?.resumeUrl) && (
        <section style={{ padding: '60px 40px', borderTop: '1px solid #1E2535', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 data-animate style={{ fontSize: '28px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '24px', color: '#00F5D4', textAlign: 'center' }}>Resume</h2>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={handleResumeDownload} style={{ padding: '12px 28px', border: '1px solid #00F5D4', color: '#00F5D4', borderRadius: '6px', fontWeight: 600, fontSize: '13px', boxShadow: '0 0 10px rgba(0,245,212,.2)' }}>⬇ resume.pdf</button>
          </div>
        </section>
      )}
      {/* GITHUB */}
      {cp?.github && (
        <section style={{ padding: '60px 40px', borderTop: '1px solid #1E2535', position: 'relative', zIndex: 1 }}>
          <h2 data-animate style={{ fontSize: '32px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#00F5D4', textAlign: 'center' }}>GitHub</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <img src={`https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(cp.github)}&show_icons=true&theme=tokyonight&hide_border=true`} alt="GitHub Stats" style={{ borderRadius: '8px', maxWidth: '100%' }} />
            <img src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${encodeURIComponent(cp.github)}&layout=compact&theme=tokyonight&hide_border=true`} alt="Top Languages" style={{ borderRadius: '8px', maxWidth: '100%' }} />
          </div>
        </section>
      )}
      {/* TESTIMONIALS */}
      {testimonials?.length > 0 && (
        <section style={{ padding: '60px 40px', borderTop: '1px solid #1E2535', position: 'relative', zIndex: 1 }}>
          <h2 data-animate style={{ fontSize: '32px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, marginBottom: '40px', color: '#00F5D4', textAlign: 'center' }}>Testimonials</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '20px' }}>
            {testimonials.map((t, i) => (
              <div key={i} data-animate style={{ padding: '20px', background: '#0F1320', border: '1px solid rgba(155,93,229,.2)', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: '#8892A4', fontStyle: 'italic', marginBottom: '16px', lineHeight: 1.7 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#9B5DE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{(t.name || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#E8EBF4' }}>{t.name}</div>
                    <div style={{ fontSize: '11px', color: '#8892A4' }}>{t.roleCompany}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT SECTION */}
      <section id="contact" style={{
        padding: '80px 40px',
        borderTop: '1px solid #1E2535',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <h2 data-animate style={{
          fontSize: '36px',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          marginBottom: '24px',
          color: '#00F5D4',
          textShadow: '0 0 10px rgba(0,245,212,0.3)',
          textAlign: 'center',
        }}>
          Get in Touch
        </h2>
        <p data-animate style={{
          fontSize: '14px',
          color: '#8892A4',
          marginBottom: '40px',
          fontFamily: "'Fira Code', monospace",
        }}>
          Have a project or question? I'd love to hear from you.
        </p>

        {c?.email && (
          <a
            href={`mailto:${c.email}`}
            data-animate
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              background: 'rgba(0,245,212,0.1)',
              color: '#00F5D4',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
              marginBottom: '40px',
              transition: 'all 0.3s',
              border: '1px solid #00F5D4',
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: '0 0 10px rgba(0,245,212,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,245,212,0.4)';
              e.currentTarget.style.background = 'rgba(0,245,212,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0,245,212,0.2)';
              e.currentTarget.style.background = 'rgba(0,245,212,0.1)';
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
          fontSize: '12px',
          flexWrap: 'wrap',
        }}>
          {s?.linkedin && (
            <a href={s.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#00F5D4' }}>
              LinkedIn
            </a>
          )}
          {s?.github && (
            <a href={s.github} target="_blank" rel="noopener noreferrer" style={{ color: '#00F5D4' }}>
              GitHub
            </a>
          )}
          {s?.twitter && (
            <a href={s.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#00F5D4' }}>
              Twitter
            </a>
          )}
          {s?.website && (
            <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00F5D4' }}>
              Website
            </a>
          )}
        </div>

        <div style={{
          fontSize: '11px',
          color: '#8892A4',
          marginTop: '60px',
          paddingTop: '40px',
          borderTop: '1px solid #1E2535',
          fontFamily: "'Fira Code', monospace",
        }}>
          Â© {new Date().getFullYear()} â€¢ Crafted with &lt;code /&gt;
        </div>
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











