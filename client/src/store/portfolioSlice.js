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
      // Optimistic update for live preview
      state.data = { ...state.data, ...action.payload };
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

export const { setPortfolioData } = portfolioSlice.actions;
export default portfolioSlice.reducer;
