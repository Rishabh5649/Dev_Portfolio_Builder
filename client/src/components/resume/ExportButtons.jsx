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

  return (
    <div className="flex space-x-3 mt-4">
      <button
        onClick={() => handleExport('pdf')}
        disabled={exportingPDF || exportingDOCX || isDirty}
        className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50"
      >
        {exportingPDF ? (
          <span className="animate-pulse">Generating PDF...</span>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" /> PDF
          </>
        )}
      </button>
      
      <button
        onClick={() => handleExport('docx')}
        disabled={exportingPDF || exportingDOCX || isDirty}
        className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
      >
        {exportingDOCX ? (
          <span className="animate-pulse">Generating DOCX...</span>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" /> DOCX
          </>
        )}
      </button>
    </div>
  );
};

export default ExportButtons;
