const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  template: {
    type: String,
    enum: ['developer', 'designer', 'minimal'],
    default: 'developer',
  },
  personalInfo: {
    fullName: { type: String, default: '' },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    avatar: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  skills: [{
    category: { type: String, default: '' },
    items: [String],
  }],
  experience: [{
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    bullets: [String],
  }],
  education: [{
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    field: { type: String, default: '' },
    startYear: { type: Number },
    endYear: { type: Number },
    cgpa: { type: String, default: '' },
    description: { type: String, default: '' },
  }],
  projects: [{
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    techStack: [String],
    githubLink: { type: String, default: '' },
    liveLink: { type: String, default: '' },
    image: { type: String, default: '' },
  }],
  certifications: [{
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    year: { type: Number },
    link: { type: String, default: '' },
  }],
  isPublished: {
    type: Boolean,
    default: false,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
