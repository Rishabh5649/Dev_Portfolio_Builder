import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './portfolioSlice';
import resumeReducer from './resumeSlice';

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    resume: resumeReducer,
  },
});
