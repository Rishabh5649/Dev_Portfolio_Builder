const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Template: aurora | obsidian | prism (+ legacy values)
  template: {
    type: String,
    default: 'aurora',
  },

  // ── Personal Info ────────────────────────────────────────────────────────────
  personalInfo: {
    fullName:           { type: String, default: '' },
    title:              { type: String, default: '' },
    tagline:            { type: String, default: '' },
    bio:                { type: String, default: '' },
    profilePhoto:       { type: String, default: '' }, // base64 or URL
    resumeBase64:       { type: String, default: '' }, // base64 encoded PDF
    resumeUrl:          { type: String, default: '' }, // remote URL
    availabilityStatus: { type: String, default: '' },
  },

  // ── Contact Info ─────────────────────────────────────────────────────────────
  contactInfo: {
    email:   { type: String, default: '' },
    phone:   { type: String, default: '' },
    city:    { type: String, default: '' },
    country: { type: String, default: '' },
  },

  // ── Social Links ─────────────────────────────────────────────────────────────
  socialLinks: {
    linkedin:    { type: String, default: '' },
    github:      { type: String, default: '' },
    twitter:     { type: String, default: '' },
    website:     { type: String, default: '' },
    customLabel: { type: String, default: '' },
    customUrl:   { type: String, default: '' },
  },

  // ── Skills ───────────────────────────────────────────────────────────────────
  // Stored as a plain object {languages:[],frameworks:[],tools:[],databases:[],other:[]}
  // Using Mixed type so Mongoose doesn't strip unknown nested keys
  skills: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // ── Experience ───────────────────────────────────────────────────────────────
  experience: [{
    company:     { type: String, default: '' },
    role:        { type: String, default: '' },
    startDate:   { type: String, default: '' },
    endDate:     { type: String, default: '' },
    current:     { type: Boolean, default: false },
    location:    { type: String, default: '' },
    description: { type: String, default: '' },
    bullets:     [String],
  }],

  // ── Education ────────────────────────────────────────────────────────────────
  education: [{
    institution: { type: String, default: '' },
    degree:      { type: String, default: '' },
    field:       { type: String, default: '' },
    startYear:   { type: String, default: '' },
    endYear:     { type: String, default: '' },
    cgpa:        { type: String, default: '' },
    scoreType:   { type: String, default: 'cgpa' }, // 'cgpa' | 'percentage'
    description: { type: String, default: '' },
  }],

  // ── Projects ─────────────────────────────────────────────────────────────────
  projects: [{
    name:            { type: String, default: '' },
    description:     { type: String, default: '' },   // short
    fullDescription: { type: String, default: '' },   // long / README
    techStack:       [String],
    githubUrl:       { type: String, default: '' },
    githubLink:      { type: String, default: '' },   // alias
    liveUrl:         { type: String, default: '' },
    liveLink:        { type: String, default: '' },   // alias
    coverImage:      { type: String, default: '' },
    image:           { type: String, default: '' },   // alias
    featured:        { type: Boolean, default: false },
  }],

  // ── Certifications ───────────────────────────────────────────────────────────
  certifications: [{
    name:      { type: String, default: '' },
    issuer:    { type: String, default: '' },
    issueDate: { type: String, default: '' },
    link:      { type: String, default: '' },
    imageUrl:  { type: String, default: '' },
  }],

  // ── Achievements ─────────────────────────────────────────────────────────────
  achievements: [{
    title:       { type: String, default: '' },
    organization:{ type: String, default: '' },
    date:        { type: String, default: '' },
    description: { type: String, default: '' },
  }],

  // ── Testimonials ─────────────────────────────────────────────────────────────
  testimonials: [{
    name:    { type: String, default: '' },
    role:    { type: String, default: '' },
    company: { type: String, default: '' },
    text:    { type: String, default: '' },
    avatar:  { type: String, default: '' },
  }],

  // ── Coding Profiles ──────────────────────────────────────────────────────────
  codingProfiles: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // ── Blog Articles ────────────────────────────────────────────────────────────
  blogArticles: [{
    title:       { type: String, default: '' },
    platform:    { type: String, default: '' },
    url:         { type: String, default: '' },
    description: { type: String, default: '' },
    date:        { type: String, default: '' },
    coverImage:  { type: String, default: '' },
  }],

  // ── Theme Customization ──────────────────────────────────────────────────────
  themeCustomization: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // ── Publishing ───────────────────────────────────────────────────────────────
  isPublished: { type: Boolean, default: false },
  slug:        { type: String, unique: true, sparse: true },

}, { timestamps: true, strict: false }); // strict:false allows extra fields during transition

module.exports = mongoose.model('Portfolio', portfolioSchema);
