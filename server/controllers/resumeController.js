const Resume = require('../models/Resume');
const Portfolio = require('../models/Portfolio');

// @desc    Create resume (auto-fill from portfolio)
// @route   POST /api/resume/create
exports.createResume = async (req, res) => {
  try {
    // Check if resume already exists
    let resume = await Resume.findOne({ userId: req.user._id });
    if (resume) {
      return res.json(resume);
    }

    // Try to auto-fill from portfolio
    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    let resumeData = { userId: req.user._id };

    if (portfolio) {
      resumeData.header = {
        fullName: portfolio.personalInfo?.fullName || req.user.name || '',
        title: portfolio.personalInfo?.title || '',
        email: portfolio.personalInfo?.email || req.user.email || '',
        phone: portfolio.personalInfo?.phone || '',
        location: portfolio.personalInfo?.location || '',
        linkedin: portfolio.personalInfo?.linkedin || '',
        github: portfolio.personalInfo?.github || '',
        portfolio: portfolio.personalInfo?.website || '',
      };

      // Truncate bio for summary (2-3 lines ≈ 300 chars)
      const bio = portfolio.personalInfo?.bio || '';
      resumeData.summary = bio.length > 300 ? bio.substring(0, 297) + '...' : bio;

      // Map experience
      if (portfolio.experience && portfolio.experience.length > 0) {
        resumeData.experience = portfolio.experience.map(exp => ({
          company: exp.company || '',
          role: exp.role || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: exp.current || false,
          location: exp.location || '',
          bullets: exp.bullets && exp.bullets.length > 0
            ? exp.bullets
            : exp.description
              ? [exp.description]
              : [],
          hidden: false,
        }));
      }

      // Map education
      if (portfolio.education && portfolio.education.length > 0) {
        resumeData.education = portfolio.education.map(edu => ({
          institution: edu.institution || '',
          degree: edu.degree || '',
          field: edu.field || '',
          startYear: edu.startYear,
          endYear: edu.endYear,
          cgpa: edu.cgpa || '',
          showCgpa: !!edu.cgpa,
          coursework: '',
          hidden: false,
        }));
      }

      // Map skills
      if (portfolio.skills && portfolio.skills.length > 0) {
        resumeData.skillGroups = portfolio.skills.map(skillGroup => ({
          category: skillGroup.category || 'General',
          skills: skillGroup.items || [],
        }));
      }

      // Map projects
      if (portfolio.projects && portfolio.projects.length > 0) {
        resumeData.projects = portfolio.projects.map(proj => ({
          name: proj.name || '',
          description: proj.description || '',
          techStack: proj.techStack || [],
          githubLink: proj.githubLink || '',
          liveLink: proj.liveLink || '',
          hidden: false,
        }));
      }

      // Map certifications
      if (portfolio.certifications && portfolio.certifications.length > 0) {
        resumeData.certifications = portfolio.certifications.map(cert => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: cert.year,
          link: cert.link || '',
          hidden: false,
        }));
      }
    } else {
      // No portfolio — use basic user info
      resumeData.header = {
        fullName: req.user.name || '',
        title: '',
        email: req.user.email || '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
      };
    }

    resume = await Resume.create(resumeData);
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's resume
// @route   GET /api/resume/user
exports.getUserResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Create one first.' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update resume
// @route   PUT /api/resume/:id
exports.updateResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedResume);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
