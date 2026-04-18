const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  template: {
    type: String,
    enum: ['classic', 'modern', 'minimal', 'developer', 'executive'],
    default: 'classic',
  },
  sectionOrder: {
    type: [String],
    default: ['header', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
  },
  sectionLabels: {
    summary: { type: String, default: 'Summary' },
    experience: { type: String, default: 'Work Experience' },
    education: { type: String, default: 'Education' },
    skills: { type: String, default: 'Skills' },
    projects: { type: String, default: 'Projects' },
    certifications: { type: String, default: 'Certifications' },
  },
  header: {
    fullName: { type: String, default: '' },
    title: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
  },
  summary: { type: String, default: '' },
  experience: [{
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    location: { type: String, default: '' },
    bullets: [String],
    hidden: { type: Boolean, default: false },
  }],
  education: [{
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    field: { type: String, default: '' },
    startYear: { type: Number },
    endYear: { type: Number },
    cgpa: { type: String, default: '' },
    showCgpa: { type: Boolean, default: true },
    coursework: { type: String, default: '' },
    hidden: { type: Boolean, default: false },
  }],
  skillGroups: [{
    category: { type: String, default: '' },
    skills: [String],
  }],
  projects: [{
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    techStack: [String],
    githubLink: { type: String, default: '' },
    liveLink: { type: String, default: '' },
    hidden: { type: Boolean, default: false },
  }],
  certifications: [{
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    year: { type: Number },
    link: { type: String, default: '' },
    hidden: { type: Boolean, default: false },
  }],
  fontSizeOverride: { type: Number, default: null },
  hiddenSections: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
