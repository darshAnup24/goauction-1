import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import listingsReducer from './slices/listingsSlice';
import bidsReducer from './slices/bidsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        listings: listingsReducer,
        bids: bidsReducer,
        cart: (state = { total: 0 }) => state, // Placeholder
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
