import { useState, useRef, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

const EditableLabel = ({ value, onChange, style = {} }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempValue.trim() !== '') {
      onChange(tempValue);
    } else {
      setTempValue(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--accent)',
          color: 'var(--accent)', borderRadius: '4px',
          padding: '4px 8px', outline: 'none', boxShadow: '0 0 0 3px var(--accent-dim)',
          width: '100%', maxWidth: '300px', ...style
        }}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        cursor: 'pointer', padding: '4px 8px', borderRadius: '4px',
        transition: 'all 0.2s', ...style
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {value}
      <Edit2 size={14} style={{ opacity: 0.5 }} />
    </div>
  );
};

export default EditableLabel;
