import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const PortfolioPreviewV2 = memo(function PortfolioPreviewV2({ scale = 0.5, template = 'minimal' }) {
  const portfolio = useSelector(s => s.portfolio.data);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [portfolio]);

  if (!portfolio) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--text-muted)',
        fontSize: '14px',
      }}>
        Loading portfolio...
      </div>
    );
  }

  const html = generatePreviewHTML(portfolio);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: '100%',
        background: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <iframe
        key={iframeKey}
        title="Portfolio Preview"
        style={{
          width: '100%',
          height: '600px',
          border: 'none',
          background: '#fff',
        }}
        srcDoc={html}
      />
    </div>
  );
});

function generatePreviewHTML(data) {
  const { personalInfo = {}, about = '', projects = [], skills = [] } = data || {};

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #fff;
      color: #333;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 40px; }
    h1 { font-size: 28px; margin: 0 0 8px 0; }
    .title { color: #666; font-size: 14px; margin-bottom: 16px; }
    h2 { font-size: 16px; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
    p { margin: 8px 0; line-height: 1.6; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .skill { background: #f0f0f0; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
    .projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 12px; }
    .project { border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
    .project h3 { font-size: 14px; margin-bottom: 6px; }
    .project p { font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${personalInfo.fullName || 'Portfolio'}</h1>
    <div class="title">${personalInfo.title || ''}</div>
    ${about ? `<p>${about}</p>` : ''}
    
    ${skills.length > 0 ? `
    <h2>Skills</h2>
    <div class="skills">
      ${skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
    </div>
    ` : ''}
    
    ${projects.length > 0 ? `
    <h2>Projects</h2>
    <div class="projects">
      ${projects.map(project => `
      <div class="project">
        <h3>${project.name || project.title || 'Project'}</h3>
        <p>${project.description || ''}</p>
      </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

export default PortfolioPreviewV2;