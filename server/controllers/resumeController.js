const Resume = require('../models/Resume');
const Portfolio = require('../models/Portfolio');

// ─── SKILL LABEL MAP ─────────────────────────────────────────────────────────
const SKILL_LABEL_MAP = {
  languages:  'Programming Languages',
  frameworks: 'Technical AoE',
  tools:      'Tools',
  databases:  'Databases',
  other:      'Non-Technical AoE',
};

// @desc    Create resume (auto-fill from portfolio if available)
// @route   POST /api/resume/create
exports.createResume = async (req, res) => {
  try {
    // Return existing if already created
    let resume = await Resume.findOne({ userId: req.user._id });
    if (resume) return res.json(resume);

    // Try to auto-fill from portfolio
    const portfolio = await Portfolio.findOne({ userId: req.user._id });

    let resumeData = { userId: req.user._id };

    if (portfolio) {
      const pi = portfolio.personalInfo || {};
      const ci = portfolio.contactInfo  || {};
      const sl = portfolio.socialLinks  || {};

      // Header — new schema stores contact in contactInfo/socialLinks
      resumeData.header = {
        fullName:  pi.fullName || req.user.name || '',
        title:     pi.title || '',
        email:     ci.email || pi.email || req.user.email || '',
        phone:     ci.phone || pi.phone || '',
        location:  [ci.city, ci.country].filter(Boolean).join(', ') || pi.location || '',
        linkedin:  sl.linkedin || pi.linkedin || '',
        github:    sl.github   || pi.github   || '',
        portfolio: sl.website  || pi.website  || '',
      };

      // Summary — truncate bio
      const bio = pi.bio || '';
      resumeData.summary = bio.length > 400 ? bio.substring(0, 397) + '...' : bio;

      // Experience
      if (portfolio.experience?.length > 0) {
        resumeData.experience = portfolio.experience.map(exp => ({
          company:   exp.company   || '',
          role:      exp.role || exp.title || '',
          startDate: exp.startDate || '',
          endDate:   exp.endDate   || '',
          current:   exp.current   || false,
          location:  exp.location  || '',
          bullets:   exp.bullets?.length > 0 ? exp.bullets
                     : exp.description ? [exp.description] : [],
          hidden: false,
        }));
      }

      // Education
      if (portfolio.education?.length > 0) {
        resumeData.education = portfolio.education.map(edu => ({
          institution: edu.institution || '',
          degree:      edu.degree      || '',
          field:       edu.field       || '',
          startYear:   String(edu.startYear || edu.startDate || ''),
          endYear:     String(edu.endYear   || edu.endDate   || ''),
          cgpa:        edu.cgpa || edu.grade || '',
          showCgpa:    !!(edu.cgpa || edu.grade),
          coursework:  '',
          hidden: false,
        }));
      }

      // Skills — portfolio.skills is now a flat object {languages:[], frameworks:[], ...}
      const portfolioSkills = portfolio.skills;
      if (portfolioSkills && typeof portfolioSkills === 'object' && !Array.isArray(portfolioSkills)) {
        resumeData.skillGroups = Object.entries(portfolioSkills)
          .filter(([, items]) => Array.isArray(items) && items.length > 0)
          .map(([key, items]) => ({
            category: SKILL_LABEL_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1)),
            skills: items,
          }));
      } else if (Array.isArray(portfolioSkills) && portfolioSkills.length > 0) {
        // Legacy array format: [{category, items}]
        resumeData.skillGroups = portfolioSkills.map(sg => ({
          category: sg.category || 'General',
          skills: sg.items || sg.skills || [],
        }));
      }

      // Projects
      if (portfolio.projects?.length > 0) {
        resumeData.projects = portfolio.projects.map(proj => ({
          name:        proj.name || proj.title || '',
          description: proj.description || '',
          techStack:   Array.isArray(proj.technologies) ? proj.technologies
                       : Array.isArray(proj.techStack) ? proj.techStack : [],
          githubLink:  proj.links?.github || proj.githubLink || '',
          liveLink:    proj.links?.live   || proj.liveLink   || '',
          hidden: false,
        }));
      }

      // Certifications
      if (portfolio.certifications?.length > 0) {
        resumeData.certifications = portfolio.certifications.map(cert => ({
          name:   cert.name   || '',
          issuer: cert.issuer || '',
          year:   String(cert.year || ''),
          link:   cert.link   || '',
          hidden: false,
        }));
      }

      // Achievements (portfolio → resume)
      if (portfolio.achievements?.length > 0) {
        resumeData.achievements = portfolio.achievements.map(a => ({
          title:       a.title || a.name || '',
          description: a.description || '',
          hidden: false,
        }));
      }

    } else {
      // No portfolio — seed with basic user info
      resumeData.header = {
        fullName: req.user.name || '',
        title: '', email: req.user.email || '',
        phone: '', location: '', linkedin: '', github: '', portfolio: '',
      };
    }

    resume = await Resume.create(resumeData);
    res.status(201).json(resume);
  } catch (error) {
    console.error('createResume error:', error);
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
      { new: true, runValidators: false }  // runValidators: false for strict:false compat
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
