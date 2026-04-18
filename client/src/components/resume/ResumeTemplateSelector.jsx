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
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Resume Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`
              relative p-3 rounded-lg border-2 cursor-pointer transition-all
              ${currentTemplate === t.id 
                ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
              }
            `}
          >
            {currentTemplate === t.id && (
              <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1 text-white shadow-sm">
                <Check className="w-3 h-3" />
              </div>
            )}
            <div className="font-semibold text-sm text-gray-900">{t.name}</div>
            <div className="text-xs text-gray-500 mt-1 leading-snug">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeTemplateSelector;
