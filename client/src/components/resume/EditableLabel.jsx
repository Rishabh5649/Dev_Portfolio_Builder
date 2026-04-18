import { useState, useRef, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

const EditableLabel = ({ value, onChange, className = "text-lg font-bold text-gray-800" }) => {
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
      setTempValue(value); // Revert if empty
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
        className={`bg-white border text-indigo-600 border-indigo-300 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-indigo-500 w-full max-w-xs ${className}`}
      />
    );
  }

  return (
    <div 
      className="group flex items-center cursor-pointer hover:bg-gray-100 rounded px-1 -ml-1 transition-colors"
      onClick={() => setIsEditing(true)}
      title="Click to edit heading"
    >
      <span className={`${className} border-b border-transparent group-hover:border-gray-300`}>
        {value}
      </span>
      <Edit2 className="w-3 h-3 ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default EditableLabel;
