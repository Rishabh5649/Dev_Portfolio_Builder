const Resume = require('../models/Resume');
const { generatePDF } = require('../utils/pdfGenerator');
const { generateDOCX } = require('../utils/docxGenerator');

// @desc    Export resume as PDF
// @route   POST /api/resume/export/pdf
exports.exportPDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const pdfBuffer = await generatePDF(resume);

    const firstName = resume.header.fullName?.split(' ')[0] || 'Resume';
    const lastName = resume.header.fullName?.split(' ').slice(1).join('_') || '';
    const filename = `${firstName}${lastName ? '_' + lastName : ''}_Resume.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
  }
};

// @desc    Export resume as DOCX
// @route   POST /api/resume/export/docx
exports.exportDOCX = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const docxBuffer = await generateDOCX(resume);

    const firstName = resume.header.fullName?.split(' ')[0] || 'Resume';
    const lastName = resume.header.fullName?.split(' ').slice(1).join('_') || '';
    const filename = `${firstName}${lastName ? '_' + lastName : ''}_Resume.docx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': docxBuffer.length,
    });

    res.send(docxBuffer);
  } catch (error) {
    console.error('DOCX Export Error:', error);
    res.status(500).json({ message: 'Failed to generate DOCX', error: error.message });
  }
};
