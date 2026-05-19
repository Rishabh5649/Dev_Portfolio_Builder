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
    default: ['header', 'summary', 'education', 'skills', 'publications', 'projects', 'experience', 'certifications', 'achievements', 'leadership'],
  },
  sectionLabels: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      summary: 'Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      certifications: 'Certifications',
      publications: 'Publications',
      achievements: 'Achievements',
      leadership: 'Leadership & Extracurriculars',
    },
  },
  header: {
    fullName:  { type: String, default: '' },
    title:     { type: String, default: '' },
    email:     { type: String, default: '' },
    phone:     { type: String, default: '' },
    location:  { type: String, default: '' },
    linkedin:  { type: String, default: '' },
    github:    { type: String, default: '' },
    portfolio: { type: String, default: '' },
  },
  summary: { type: String, default: '' },

  experience: [{
    company:   { type: String, default: '' },
    role:      { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate:   { type: String, default: '' },
    current:   { type: Boolean, default: false },
    location:  { type: String, default: '' },
    bullets:   [String],
    hidden:    { type: Boolean, default: false },
  }],

  education: [{
    institution: { type: String, default: '' },
    degree:      { type: String, default: '' },
    field:       { type: String, default: '' },
    startYear:   { type: String, default: '' },   // String so "Expected 2027" is valid
    endYear:     { type: String, default: '' },
    cgpa:        { type: String, default: '' },
    showCgpa:    { type: Boolean, default: true },
    coursework:  { type: String, default: '' },
    hidden:      { type: Boolean, default: false },
  }],

  skillGroups: [{
    category: { type: String, default: '' },
    skills:   [String],
  }],

  projects: [{
    name:        { type: String, default: '' },
    description: { type: String, default: '' },
    techStack:   [String],
    githubLink:  { type: String, default: '' },
    liveLink:    { type: String, default: '' },
    hidden:      { type: Boolean, default: false },
  }],

  certifications: [{
    name:   { type: String, default: '' },
    issuer: { type: String, default: '' },
    year:   { type: String, default: '' },
    link:   { type: String, default: '' },
    hidden: { type: Boolean, default: false },
  }],

  // ── NEW sections from PDF/backup ───────────────────────────────────────────
  publications: [{
    title:       { type: String, default: '' },
    publisher:   { type: String, default: '' },
    year:        { type: String, default: '' },
    description: { type: String, default: '' },
    link:        { type: String, default: '' },
    hidden:      { type: Boolean, default: false },
  }],

  achievements: [{
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    hidden:      { type: Boolean, default: false },
  }],

  leadership: [{
    title:        { type: String, default: '' },
    organization: { type: String, default: '' },
    description:  { type: String, default: '' },
    hidden:       { type: Boolean, default: false },
  }],

  fontFamily: { type: String, default: 'Georgia' },
  spacing: {
    sectionGap:   { type: Number, default: 10 },
    lineHeight:   { type: Number, default: 1.4 },
    paragraphGap: { type: Number, default: 4 },
    pagePadding:  { type: Number, default: 10 },
    bottomMargin: { type: Number, default: 4 },   // mm — 0=ultra-compact, 4=normal
  },
  fontSizeOverride: { type: Number, default: null },
  hiddenSections: {
    type: [String],
    default: [],
  },
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Resume', resumeSchema);
