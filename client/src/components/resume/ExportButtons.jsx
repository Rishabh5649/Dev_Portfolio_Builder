import { useState } from 'react';
import axios from 'axios';
import { Download, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';

const ExportButtons = () => {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingDOCX, setExportingDOCX] = useState(false);
  
  // We check if the state is dirty. If so, they should save before exporting.
  const isDirty = useSelector(state => state.resume.isDirty);

  const handleExport = async (format) => {
    if (isDirty) {
      alert("Please save your changes before exporting.");
      return;
    }

    const setExporting = format === 'pdf' ? setExportingPDF : setExportingDOCX;
    setExporting(true);

    try {
      const response = await axios.post(`/api/resume/export/${format}`, {}, {
        responseType: 'blob', // Important for downloading files
      });

      // Extract filename from header if possible
      let filename = `resume.${format}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Export ${format} failed:`, error);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(false);
    }
  };

  const buttonStyle = (isDisabled) => ({
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
    padding: '8px 16px', border: 'none', fontSize: '13px', fontWeight: 600,
    borderRadius: 'var(--radius-sm)', cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s', opacity: isDisabled ? 0.5 : 1, gap: '8px'
  });

  return (
    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
      <button
        onClick={() => handleExport('pdf')}
        disabled={exportingPDF || exportingDOCX || isDirty}
        style={{
          ...buttonStyle(exportingPDF || exportingDOCX || isDirty),
          background: 'var(--danger-dim)', color: 'var(--danger)'
        }}
        onMouseEnter={e => {
          if (!(exportingPDF || exportingDOCX || isDirty)) {
            e.currentTarget.style.background = 'var(--danger)';
            e.currentTarget.style.color = '#fff';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--danger-dim)';
          e.currentTarget.style.color = 'var(--danger)';
        }}
      >
        {exportingPDF ? (
          <span style={{ opacity: 0.7 }}>Generating PDF...</span>
        ) : (
          <>
            <FileText size={14} /> PDF
          </>
        )}
      </button>
      
      <button
        onClick={() => handleExport('docx')}
        disabled={exportingPDF || exportingDOCX || isDirty}
        style={{
          ...buttonStyle(exportingPDF || exportingDOCX || isDirty),
          background: 'var(--accent-dim)', color: 'var(--accent)'
        }}
        onMouseEnter={e => {
          if (!(exportingPDF || exportingDOCX || isDirty)) {
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.color = '#fff';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--accent-dim)';
          e.currentTarget.style.color = 'var(--accent)';
        }}
      >
        {exportingDOCX ? (
          <span style={{ opacity: 0.7 }}>Generating DOCX...</span>
        ) : (
          <>
            <Download size={14} /> DOCX
          </>
        )}
      </button>
    </div>
  );
};

export default ExportButtons;
