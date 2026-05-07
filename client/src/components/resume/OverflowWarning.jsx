import { AlertTriangle } from 'lucide-react';

const OverflowWarning = ({ isOverflowing }) => {
  if (!isOverflowing) return null;

  return (
    <div style={{
      background: 'var(--warning-dim)', borderLeft: '4px solid var(--warning)',
      padding: '16px', marginBottom: '16px', borderRadius: 'var(--radius-sm)'
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flexShrink: 0 }}>
          <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
        </div>
        <div>
          <p style={{
            fontSize: '14px', color: 'var(--text-primary)', margin: 0
          }}>
            <strong style={{ fontWeight: 700, color: 'var(--warning)' }}>Warning:</strong> Your resume may overflow 1 page. Consider shortening bullet points, reducing font size, or hiding less relevant sections.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverflowWarning;
