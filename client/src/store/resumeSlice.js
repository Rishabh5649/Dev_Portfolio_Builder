import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ─── Section constants ────────────────────────────────────────────────────────
const ALL_SECTIONS = [
  'header', 'summary', 'education', 'skills', 'publications',
  'projects', 'experience', 'certifications', 'achievements', 'leadership',
];

const DEFAULT_LABELS = {
  summary:        'Summary',
  experience:     'Work Experience',
  education:      'Education',
  skills:         'Skills',
  projects:       'Projects',
  certifications: 'Certifications',
  publications:   'Publications',
  achievements:   'Achievements',
  leadership:     'Leadership & Extracurriculars',
};

// ─── Normalise incoming resume from DB/API ────────────────────────────────────
const normaliseResume = (raw) => {
  if (!raw) return raw;
  const savedOrder = Array.isArray(raw.sectionOrder) ? raw.sectionOrder : ALL_SECTIONS;
  const merged = [...savedOrder, ...ALL_SECTIONS.filter(s => !savedOrder.includes(s))];
  return {
    ...raw,
    sectionOrder:   merged,
    sectionLabels:  { ...DEFAULT_LABELS, ...(raw.sectionLabels || {}) },
    hiddenSections: raw.hiddenSections  || [],
    experience:     raw.experience      || [],
    education:      raw.education       || [],
    skillGroups:    raw.skillGroups     || [],
    projects:       raw.projects        || [],
    certifications: raw.certifications  || [],
    publications:   raw.publications    || [],
    achievements:   raw.achievements    || [],
    leadership:     raw.leadership      || [],
    summary:        raw.summary         || '',
    header:         raw.header          || {},
    fontFamily:     raw.fontFamily      || 'Georgia',
    spacing: {
      sectionGap:   raw.spacing?.sectionGap   ?? 10,
      lineHeight:   raw.spacing?.lineHeight   ?? 1.4,
      paragraphGap: raw.spacing?.paragraphGap ?? 4,
      pagePadding:  raw.spacing?.pagePadding  ?? 10,
      bottomMargin: raw.spacing?.bottomMargin ?? 4,  // ← was missing — caused reset on every save
    },
  };
};


// ─── Async thunks ─────────────────────────────────────────────────────────────
export const fetchResume = createAsyncThunk('resume/fetch', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/api/resume/user');
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        const createRes = await axios.post('/api/resume/create');
        return createRes.data;
      } catch (createError) {
        return thunkAPI.rejectWithValue(createError.response?.data || 'Failed to create resume');
      }
    }
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch resume');
  }
});

export const updateResume = createAsyncThunk('resume/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await axios.put(`/api/resume/${id}`, data);
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Failed to update resume');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    data:     null,
    loading:  false,
    error:    null,
    isDirty:  false,
  },
  reducers: {
    setResumeData: (state, action) => {
      state.data    = action.payload;
      state.isDirty = true;
    },
    clearDirty: (state) => {
      state.isDirty = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResume.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchResume.fulfilled, (state, action) => {
        state.loading = false;
        state.data    = normaliseResume(action.payload);
        state.isDirty = false;
      })
      .addCase(fetchResume.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload || 'Failed to load resume';
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        state.data    = normaliseResume(action.payload);
        state.isDirty = false;
      });
  },
});

export const { setResumeData, clearDirty } = resumeSlice.actions;
export default resumeSlice.reducer;
