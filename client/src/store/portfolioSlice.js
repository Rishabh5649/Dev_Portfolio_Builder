import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ─── Default empty portfolio shape ───────────────────────────────────────────
// This is the canonical empty state. ALL fields the exporter reads must exist here
// so there are never undefined falls-through to exporter defaults.
const EMPTY_PORTFOLIO = {
  personalInfo: {
    fullName: '',
    title: '',
    tagline: '',
    bio: '',
    profilePhoto: '',   // used by exporter for hero photo
    resumeBase64: '',   // base64-encoded PDF
    resumeUrl: '',      // remote URL
    availabilityStatus: '',
  },
  contactInfo: {
    email: '',
    phone: '',
    city: '',
    country: '',
  },
  socialLinks: {
    linkedin: '',
    github: '',
    twitter: '',
    website: '',
    customLabel: '',
    customUrl: '',
  },
  template: 'aurora',
  skills: {
    languages: [],
    frameworks: [],
    tools: [],
    databases: [],
    other: [],
  },
  projects: [],
  education: [],
  experience: [],
  certifications: [],
  achievements: [],
  testimonials: [],
  codingProfiles: {},
  blogArticles: [],
  themeCustomization: {},
};

/**
 * Normalise a portfolio document coming from the server or localStorage.
 * Merges DB data on top of EMPTY_PORTFOLIO so missing fields are always
 * initialised to their empty defaults instead of undefined.
 */
function normalisePortfolio(raw) {
  if (!raw) return null;

  // Deep-merge personal info
  const personalInfo = {
    ...EMPTY_PORTFOLIO.personalInfo,
    ...(raw.personalInfo || {}),
    // Legacy field aliases from old schema — map to new names
    profilePhoto: raw.personalInfo?.profilePhoto || raw.personalInfo?.avatar || '',
  };

  // Skills: old schema stored as array [{category, items}], new as flat object.
  let skills = EMPTY_PORTFOLIO.skills;
  if (raw.skills) {
    if (Array.isArray(raw.skills)) {
      // Convert old [{category: 'languages', items: ['JS']}] → {languages: ['JS']}
      const converted = { ...EMPTY_PORTFOLIO.skills };
      raw.skills.forEach(group => {
        if (group.category && Array.isArray(group.items)) {
          const key = group.category.toLowerCase();
          if (key in converted) converted[key] = group.items;
          else converted.other = [...(converted.other || []), ...group.items];
        }
      });
      skills = converted;
    } else if (typeof raw.skills === 'object') {
      skills = { ...EMPTY_PORTFOLIO.skills, ...raw.skills };
    }
  }

  return {
    ...EMPTY_PORTFOLIO,
    ...raw,
    personalInfo,
    contactInfo: { ...EMPTY_PORTFOLIO.contactInfo, ...(raw.contactInfo || {}) },
    socialLinks: { ...EMPTY_PORTFOLIO.socialLinks, ...(raw.socialLinks || {}) },
    skills,
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    achievements: Array.isArray(raw.achievements) ? raw.achievements : [],
    testimonials: Array.isArray(raw.testimonials) ? raw.testimonials : [],
    blogArticles: Array.isArray(raw.blogArticles) ? raw.blogArticles : [],
    codingProfiles: (raw.codingProfiles && typeof raw.codingProfiles === 'object' && !Array.isArray(raw.codingProfiles)) ? raw.codingProfiles : {},
    themeCustomization: (raw.themeCustomization && typeof raw.themeCustomization === 'object') ? raw.themeCustomization : {},
    template: raw.template || 'aurora',
  };
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchPortfolio = createAsyncThunk('portfolio/fetch', async (_, thunkAPI) => {
  try {
    // 1. Try to load from DB
    const res = await axios.get('/api/portfolio/user');
    return normalisePortfolio(res.data);
  } catch (error) {
    if (error.response?.status === 404) {
      // No DB portfolio yet — fall back to localStorage
      try {
        const local = localStorage.getItem('portfolioBuilder_v2_data');
        if (local) return normalisePortfolio(JSON.parse(local));
      } catch (_) { /* ignore parse errors */ }
      return null; // triggers createPortfolio in PortfolioBuilder
    }
    // Network errors etc — fall back to localStorage silently
    try {
      const local = localStorage.getItem('portfolioBuilder_v2_data');
      if (local) return normalisePortfolio(JSON.parse(local));
    } catch (_) { /* ignore */ }
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const savePortfolioToDB = createAsyncThunk('portfolio/save', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const portfolio = state.portfolio.data;
  if (!portfolio) return null;

  // Always persist to localStorage first
  try {
    localStorage.setItem('portfolioBuilder_v2_data', JSON.stringify(portfolio));
    localStorage.setItem('portfolioBuilder_v2_lastSaved', Date.now().toString());
  } catch (_) { /* storage quota exceeded */ }

  // Sync to DB if we have an _id
  if (portfolio._id) {
    try {
      const res = await axios.put(`/api/portfolio/${portfolio._id}`, portfolio);
      return normalisePortfolio(res.data);
    } catch (err) {
      // DB save failed — not a fatal error, localStorage has the data
      console.warn('DB sync failed, falling back to localStorage:', err.message);
      return portfolio;
    }
  }
  return portfolio;
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    // Seed from a raw object (localStorage restore or initial create)
    setPortfolioData: (state, action) => {
      state.data = normalisePortfolio(action.payload);
    },
    // Creates a blank portfolio locally (used when no DB/localStorage record)
    createPortfolio: (state) => {
      state.data = { ...EMPTY_PORTFOLIO };
    },

    // ── Top-level fields ──────────────────────────────────────────────────────
    setTemplate: (state, action) => {
      if (state.data) state.data.template = action.payload;
    },

    // ── Section setters (all merge, never replace) ────────────────────────────
    setPersonalInfo: (state, action) => {
      if (state.data) state.data.personalInfo = { ...state.data.personalInfo, ...action.payload };
    },
    setContactInfo: (state, action) => {
      if (state.data) state.data.contactInfo = { ...state.data.contactInfo, ...action.payload };
    },
    setSocialLinks: (state, action) => {
      if (state.data) {
        if (!state.data.socialLinks) state.data.socialLinks = {};
        state.data.socialLinks = { ...state.data.socialLinks, ...action.payload };
      }
    },
    setSkills: (state, action) => {
      if (state.data) state.data.skills = action.payload;
    },
    setCodingProfiles: (state, action) => {
      if (state.data) {
        if (!state.data.codingProfiles) state.data.codingProfiles = {};
        state.data.codingProfiles = { ...state.data.codingProfiles, ...action.payload };
      }
    },
    setThemeCustomization: (state, action) => {
      if (state.data) {
        state.data.themeCustomization = { ...state.data.themeCustomization, ...action.payload };
      }
    },

    // ── Projects ──────────────────────────────────────────────────────────────
    addProject: (state, action) => {
      if (state.data) {
        if (!Array.isArray(state.data.projects)) state.data.projects = [];
        state.data.projects.push(action.payload);
      }
    },
    removeProject: (state, action) => {
      if (state.data?.projects) {
        state.data.projects = state.data.projects.filter((_, i) => i !== action.payload);
      }
    },
    updateProject: (state, action) => {
      if (state.data?.projects) {
        const i = action.payload.idx ?? action.payload.index;
        if (i != null) state.data.projects[i] = { ...state.data.projects[i], ...action.payload.data };
      }
    },
    addProjects: (state, action) => {
      if (state.data) {
        if (!Array.isArray(state.data.projects)) state.data.projects = [];
        state.data.projects = [...state.data.projects, ...action.payload];
      }
    },

    // ── Education ─────────────────────────────────────────────────────────────
    addEducation: (state, action) => {
      if (state.data) {
        if (!Array.isArray(state.data.education)) state.data.education = [];
        state.data.education.push(action.payload);
      }
    },
    removeEducation: (state, action) => {
      if (state.data?.education) {
        state.data.education = state.data.education.filter((_, i) => i !== action.payload);
      }
    },
    updateEducation: (state, action) => {
      if (state.data?.education) {
        const i = action.payload.idx ?? action.payload.index;
        if (i != null) state.data.education[i] = { ...state.data.education[i], ...action.payload.data };
      }
    },

    // ── Experience ────────────────────────────────────────────────────────────
    addExperience: (state, action) => {
      if (state.data) {
        if (!Array.isArray(state.data.experience)) state.data.experience = [];
        state.data.experience.push(action.payload);
      }
    },
    removeExperience: (state, action) => {
      if (state.data?.experience) {
        state.data.experience = state.data.experience.filter((_, i) => i !== action.payload);
      }
    },
    updateExperience: (state, action) => {
      if (state.data?.experience) {
        const i = action.payload.idx ?? action.payload.index;
        if (i != null) state.data.experience[i] = { ...state.data.experience[i], ...action.payload.data };
      }
    },

    // ── Certifications ────────────────────────────────────────────────────────
    addCertification: (state, action) => {
      if (state.data) {
        if (!Array.isArray(state.data.certifications)) state.data.certifications = [];
        state.data.certifications.push(action.payload);
      }
    },
    removeCertification: (state, action) => {
      if (state.data?.certifications) {
        state.data.certifications = state.data.certifications.filter((_, i) => i !== action.payload);
      }
    },
    updateCertification: (state, action) => {
      if (state.data?.certifications) {
        const i = action.payload.idx ?? action.payload.index;
        if (i != null) state.data.certifications[i] = { ...state.data.certifications[i], ...action.payload.data };
      }
    },

    // ── Achievements ──────────────────────────────────────────────────────────
    addAchievement: (state, action) => {
      if (state.data) {
        if (!Array.isArray(state.data.achievements)) state.data.achievements = [];
        state.data.achievements.push(action.payload);
      }
    },
    removeAchievement: (state, action) => {
      if (state.data?.achievements) {
        state.data.achievements = state.data.achievements.filter((_, i) => i !== action.payload);
      }
    },
    updateAchievement: (state, action) => {
      if (state.data?.achievements) {
        const i = action.payload.idx ?? action.payload.index;
        if (i != null) state.data.achievements[i] = { ...state.data.achievements[i], ...action.payload.data };
      }
    },

    // ── Testimonials ──────────────────────────────────────────────────────────
    addTestimonial: (state, action) => {
      if (state.data) {
        if (!Array.isArray(state.data.testimonials)) state.data.testimonials = [];
        state.data.testimonials.push(action.payload);
      }
    },
    removeTestimonial: (state, action) => {
      if (state.data?.testimonials) {
        state.data.testimonials = state.data.testimonials.filter((_, i) => i !== action.payload);
      }
    },
    updateTestimonial: (state, action) => {
      if (state.data?.testimonials) {
        const i = action.payload.idx ?? action.payload.index;
        if (i != null) state.data.testimonials[i] = { ...state.data.testimonials[i], ...action.payload.data };
      }
    },

    // ── Blog Articles ─────────────────────────────────────────────────────────
    addBlogArticle: (state, action) => {
      if (state.data) {
        if (!Array.isArray(state.data.blogArticles)) state.data.blogArticles = [];
        state.data.blogArticles.push(action.payload);
      }
    },
    removeBlogArticle: (state, action) => {
      if (state.data?.blogArticles) {
        state.data.blogArticles = state.data.blogArticles.filter((_, i) => i !== action.payload);
      }
    },
    updateBlogArticle: (state, action) => {
      if (state.data?.blogArticles) {
        const i = action.payload.idx ?? action.payload.index;
        if (i != null) state.data.blogArticles[i] = { ...state.data.blogArticles[i], ...action.payload.data };
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is already normalised (or null if not found)
        state.data = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch portfolio';
      })
      .addCase(savePortfolioToDB.pending, (state) => {
        state.saving = true;
      })
      .addCase(savePortfolioToDB.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) state.data = action.payload;
      })
      .addCase(savePortfolioToDB.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const {
  setPortfolioData,
  createPortfolio,
  setTemplate,
  setPersonalInfo,
  setContactInfo,
  setSocialLinks,
  setSkills,
  setCodingProfiles,
  setThemeCustomization,
  addProject,
  removeProject,
  updateProject,
  addProjects,
  addEducation,
  removeEducation,
  updateEducation,
  addExperience,
  removeExperience,
  updateExperience,
  addCertification,
  removeCertification,
  updateCertification,
  addAchievement,
  removeAchievement,
  updateAchievement,
  addTestimonial,
  removeTestimonial,
  updateTestimonial,
  addBlogArticle,
  removeBlogArticle,
  updateBlogArticle,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
