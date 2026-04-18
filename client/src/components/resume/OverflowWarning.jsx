import { AlertTriangle } from 'lucide-react';

const OverflowWarning = ({ isOverflowing }) => {
  if (!isOverflowing) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong className="font-medium text-yellow-800">Warning:</strong> Your resume may overflow 1 page. Consider shortening bullet points, reducing font size, or hiding less relevant sections.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverflowWarning;
