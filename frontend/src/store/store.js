import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from '../features/portfolio/portfolioSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    auth: authReducer,
  },
});
