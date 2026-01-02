import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    listings: [],
    currentListing: null,
    loading: false,
    error: null,
    filters: {
        search: '',
        category: '',
        status: 'active',
    },
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
    },
};

const listingsSlice = createSlice({
    name: 'listings',
    initialState,
    reducers: {
        setListings: (state, action) => {
            state.listings = action.payload;
        },
        setCurrentListing: (state, action) => {
            state.currentListing = action.payload;
        },
        addListing: (state, action) => {
            state.listings.unshift(action.payload);
        },
        updateListing: (state, action) => {
            const index = state.listings.findIndex(l => l.id === action.payload.id);
            if (index !== -1) {
                state.listings[index] = action.payload;
            }
        },
        removeListing: (state, action) => {
            state.listings = state.listings.filter(l => l.id !== action.payload);
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setListings,
    setCurrentListing,
    addListing,
    updateListing,
    removeListing,
    setFilters,
    setPagination,
    setLoading,
    setError,
} = listingsSlice.actions;

export default listingsSlice.reducer;
