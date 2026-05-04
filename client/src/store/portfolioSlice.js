import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchPortfolio = createAsyncThunk('portfolio/fetch', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/api/portfolio/user');
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Portfolio doesn't exist yet, that's fine
      return null;
    }
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const updatePortfolio = createAsyncThunk('portfolio/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await axios.put(`/api/portfolio/${id}`, data);
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolioData: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
    createPortfolio: (state) => {
      state.data = {
        personalInfo: {},
        contactInfo: {},
        socialLinks: {},
        template: 'minimal',
        skills: [],
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
    },
    setPersonalInfo: (state, action) => {
      if (state.data) state.data.personalInfo = action.payload;
    },
    setContactInfo: (state, action) => {
      if (state.data) state.data.contactInfo = action.payload;
    },
    setSocialLinks: (state, action) => {
      if (state.data) state.data.socialLinks = action.payload;
    },
    setTemplate: (state, action) => {
      if (state.data) state.data.template = action.payload;
    },
    setSkills: (state, action) => {
      if (state.data) state.data.skills = action.payload;
    },
    addProject: (state, action) => {
      if (state.data) {
        if (!state.data.projects) state.data.projects = [];
        state.data.projects.push(action.payload);
      }
    },
    removeProject: (state, action) => {
      if (state.data && state.data.projects) {
        state.data.projects = state.data.projects.filter((_, i) => i !== action.payload);
      }
    },
    updateProject: (state, action) => {
      if (state.data && state.data.projects) {
        state.data.projects[action.payload.index] = action.payload.data;
      }
    },
    addEducation: (state, action) => {
      if (state.data) {
        if (!state.data.education) state.data.education = [];
        state.data.education.push(action.payload);
      }
    },
    removeEducation: (state, action) => {
      if (state.data && state.data.education) {
        state.data.education = state.data.education.filter((_, i) => i !== action.payload);
      }
    },
    updateEducation: (state, action) => {
      if (state.data && state.data.education) {
        state.data.education[action.payload.index] = action.payload.data;
      }
    },
    addExperience: (state, action) => {
      if (state.data) {
        if (!state.data.experience) state.data.experience = [];
        state.data.experience.push(action.payload);
      }
    },
    removeExperience: (state, action) => {
      if (state.data && state.data.experience) {
        state.data.experience = state.data.experience.filter((_, i) => i !== action.payload);
      }
    },
    updateExperience: (state, action) => {
      if (state.data && state.data.experience) {
        state.data.experience[action.payload.index] = action.payload.data;
      }
    },
    addCertification: (state, action) => {
      if (state.data) {
        if (!state.data.certifications) state.data.certifications = [];
        state.data.certifications.push(action.payload);
      }
    },
    removeCertification: (state, action) => {
      if (state.data && state.data.certifications) {
        state.data.certifications = state.data.certifications.filter((_, i) => i !== action.payload);
      }
    },
    updateCertification: (state, action) => {
      if (state.data && state.data.certifications) {
        state.data.certifications[action.payload.index] = action.payload.data;
      }
    },
    addAchievement: (state, action) => {
      if (state.data) {
        if (!state.data.achievements) state.data.achievements = [];
        state.data.achievements.push(action.payload);
      }
    },
    removeAchievement: (state, action) => {
      if (state.data && state.data.achievements) {
        state.data.achievements = state.data.achievements.filter((_, i) => i !== action.payload);
      }
    },
    updateAchievement: (state, action) => {
      if (state.data && state.data.achievements) {
        state.data.achievements[action.payload.index] = action.payload.data;
      }
    },
    addTestimonial: (state, action) => {
      if (state.data) {
        if (!state.data.testimonials) state.data.testimonials = [];
        state.data.testimonials.push(action.payload);
      }
    },
    removeTestimonial: (state, action) => {
      if (state.data && state.data.testimonials) {
        state.data.testimonials = state.data.testimonials.filter((_, i) => i !== action.payload);
      }
    },
    updateTestimonial: (state, action) => {
      if (state.data && state.data.testimonials) {
        state.data.testimonials[action.payload.index] = action.payload.data;
      }
    },
    setCodingProfiles: (state, action) => {
      if (state.data) state.data.codingProfiles = action.payload;
    },
    addBlogArticle: (state, action) => {
      if (state.data) {
        if (!state.data.blogArticles) state.data.blogArticles = [];
        state.data.blogArticles.push(action.payload);
      }
    },
    removeBlogArticle: (state, action) => {
      if (state.data && state.data.blogArticles) {
        state.data.blogArticles = state.data.blogArticles.filter((_, i) => i !== action.payload);
      }
    },
    updateBlogArticle: (state, action) => {
      if (state.data && state.data.blogArticles) {
        state.data.blogArticles[action.payload.index] = action.payload.data;
      }
    },
    setThemeCustomization: (state, action) => {
      if (state.data) state.data.themeCustomization = action.payload;
    },
    addProjects: (state, action) => {
      if (state.data) {
        if (!state.data.projects) state.data.projects = [];
        state.data.projects = [...state.data.projects, ...action.payload];
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
        state.data = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch portfolio';
      })
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export const {
  setPortfolioData,
  createPortfolio,
  setPersonalInfo,
  setContactInfo,
  setSocialLinks,
  setTemplate,
  setSkills,
  addProject,
  removeProject,
  updateProject,
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
  setCodingProfiles,
  addBlogArticle,
  removeBlogArticle,
  updateBlogArticle,
  setThemeCustomization,
  addProjects,
} = portfolioSlice.actions;
export default portfolioSlice.reducer;
