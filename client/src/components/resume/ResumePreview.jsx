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
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%', maxWidth: '1000px', margin: '0 auto', height: '100%'
    }}>
      <div style={{ width: '100%', maxWidth: '800px', padding: '0 16px' }}>
         <OverflowWarning isOverflowing={isOverflowing} />
      </div>
      
      {/* Scroll container wrapper holding scaled A4 page */}
      <div style={{
        flex: 1, width: '100%', display: 'flex', justifyContent: 'center',
        alignItems: 'flex-start', paddingTop: '16px', overflowY: 'auto',
        overflowX: 'hidden', paddingBottom: '48px'
      }}>
        
        {/* The scaled wrapper - visually shrinks A4 to fit most screens */}
        <div className="resume-preview-wrapper" style={{ transform: 'scale(0.85)' }}>
          
          {/* Physical A4 Container representation */}
          <div 
            ref={printRef}
            style={{
              background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              borderRadius: '2px',
              width: '794px', 
              minHeight: '1123px',
              padding: 0,
              position: 'relative',
              transition: 'box-shadow 0.2s',
              border: isOverflowing ? '2px solid var(--danger)' : '1px solid var(--border)'
            }}
          >
            {/* The actual resume DOM content */}
            <div style={{ width: '100%', height: '100%', color: '#000' }}>
              {renderTemplate()}
            </div>

            {/* 1-page boundary visual indicator */}
            {isOverflowing && (
                <div 
                  style={{
                    position: 'absolute', left: 0, width: '100%',
                    borderTop: '2px dashed var(--danger)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 50,
                    pointerEvents: 'none', top: '1123px'
                  }}
                >
                  <span style={{
                    background: 'var(--danger)', color: '#fff',
                    fontSize: '11px', padding: '4px 12px', borderRadius: '12px',
                    marginTop: '-10px', fontWeight: 600
                  }}>1-Page Boundary</span>
                </div>
            )}
            
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ResumePreview;
