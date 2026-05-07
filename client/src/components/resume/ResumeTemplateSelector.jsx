import { Check } from 'lucide-react';

const templates = [
  { id: 'classic', name: 'Classic Clean', desc: 'Single-column, traditional' },
  { id: 'modern', name: 'Modern Two-Column', desc: 'Sidebar for skills & contact' },
  { id: 'minimal', name: 'Minimal Compact', desc: 'Ultra-clean, max density' },
  { id: 'developer', name: 'Creative Developer', desc: 'Monospace, GitHub style' },
  { id: 'executive', name: 'Executive', desc: 'Conservative, formal' },
];

const ResumeTemplateSelector = ({ currentTemplate, onSelect }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{
        fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
        marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em'
      }}>Resume Template</h3>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '12px'
      }}>
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              position: 'relative', padding: '12px', borderRadius: 'var(--radius-sm)',
              border: '2px solid ' + (currentTemplate === t.id ? 'var(--accent)' : 'var(--border)'),
              background: currentTemplate === t.id ? 'var(--accent-dim)' : 'var(--bg-surface)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              if (currentTemplate !== t.id) {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }
            }}
            onMouseLeave={e => {
              if (currentTemplate !== t.id) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-surface)';
              }
            }}
          >
            {currentTemplate === t.id && (
              <div style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: 'var(--accent)', borderRadius: '50%', padding: '4px',
                color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Check size={14} />
              </div>
            )}
            <div style={{
              fontWeight: 600, fontSize: '13px',
              color: 'var(--text-primary)', marginBottom: '4px'
            }}>{t.name}</div>
            <div style={{
              fontSize: '11px', color: 'var(--text-muted)',
              lineHeight: 1.3
            }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeTemplateSelector;
