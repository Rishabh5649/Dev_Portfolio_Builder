import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTwoColumnTemplate from './templates/ModernTwoColumnTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import DeveloperTemplate from './templates/DeveloperTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import OverflowWarning from './OverflowWarning';

const ResumePreview = () => {
  const { data } = useSelector(state => state.resume);
  const printRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // A4 physical pixels at 96dpi approx is 794x1123
  const A4_HEIGHT_PX = 1123; 

  useEffect(() => {
    if (!printRef.current) return;

    const checkOverflow = () => {
      // Use scrollHeight to detect total rendered size inside the A4 constraint box
      if (printRef.current.scrollHeight > A4_HEIGHT_PX) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    };

    // Give react time to render DOM changes before measuring
    const timeout = setTimeout(checkOverflow, 100);

    // Setup ResizeObserver as requested
    const resizeObserver = new ResizeObserver(() => checkOverflow());
    resizeObserver.observe(printRef.current);

    return () => {
      clearTimeout(timeout);
      resizeObserver.disconnect();
    };
  }, [data]);

  if (!data) return null;

  const renderTemplate = () => {
    switch (data.template) {
      case 'modern': return <ModernTwoColumnTemplate data={data} />;
      case 'minimal': return <MinimalTemplate data={data} />;
      case 'developer': return <DeveloperTemplate data={data} />;
      case 'executive': return <ExecutiveTemplate data={data} />;
      case 'classic':
      default: return <ClassicTemplate data={data} />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto h-full">
      <div className="w-full max-w-2xl px-4 lg:px-0">
         <OverflowWarning isOverflowing={isOverflowing} />
      </div>
      
      {/* Scroll container wrapper holding scaled A4 page */}
      <div className="flex-1 w-full flex justify-center items-start pt-4 overflow-y-auto overflow-x-hidden pb-12">
        
        {/* The scaled wrapper - visually shrinks A4 to fit most screens */}
        <div className="resume-preview-wrapper" style={{ transform: 'scale(0.85)' }}>
          
          {/* Physical A4 Container representation */}
          <div 
            ref={printRef}
            className={`bg-white shadow-2xl relative transition-colors ${isOverflowing ? 'ring-2 ring-red-500' : 'ring-1 ring-gray-200'}`}
            style={{ 
              width: '794px', 
              minHeight: '1123px', // A4 aspect ratio at 96 DPI
              // Don't set max-height, let it grow so we can measure overflow
              padding: 0,
            }}
          >
            {/* The actual resume DOM content */}
            <div className="w-full h-full text-black">
              {renderTemplate()}
            </div>

            {/* 1-page boundary visual indicator */}
            {isOverflowing && (
                <div 
                  className="absolute left-0 w-full border-t border-dashed border-red-500 flex justify-center items-center z-50 pointer-events-none"
                  style={{ top: '1123px' }}
                >
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mt-[-10px]">1-Page Boundary</span>
                </div>
            )}
            
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ResumePreview;
