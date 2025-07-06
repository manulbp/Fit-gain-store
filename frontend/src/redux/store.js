import { configureStore } from '@reduxjs/toolkit';

import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    payment: paymentReducer,
    
  },
});