import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchResume = createAsyncThunk('resume/fetch', async (_, thunkAPI) => {
  try {
    const res = await axios.get('/api/resume/user');
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Create if doesn't exist
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

const initialState = {
  data: null,
  loading: false,
  error: null,
  isDirty: false, // track if we need to save changes
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setResumeData: (state, action) => {
      // Deep merge would be better, but spreading works for top level. 
      // For arrays/objects we should be explicit. Let's just override data for simplicity
      // and let the components pass the fully updated object.
      state.data = action.payload;
      state.isDirty = true;
    },
    clearDirty: (state) => {
      state.isDirty = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResume.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isDirty = false;
      })
      .addCase(fetchResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load resume';
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isDirty = false;
      });
  },
});

export const { setResumeData, clearDirty } = resumeSlice.actions;
export default resumeSlice.reducer;
