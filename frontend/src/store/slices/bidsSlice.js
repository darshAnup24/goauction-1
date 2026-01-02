import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    bids: [],
    myBids: [],
    currentBid: null,
    loading: false,
    error: null,
};

const bidsSlice = createSlice({
    name: 'bids',
    initialState,
    reducers: {
        setBids: (state, action) => {
            state.bids = action.payload;
        },
        setMyBids: (state, action) => {
            state.myBids = action.payload;
        },
        addBid: (state, action) => {
            state.bids.unshift(action.payload);
        },
        updateBid: (state, action) => {
            const index = state.bids.findIndex(b => b.id === action.payload.id);
            if (index !== -1) {
                state.bids[index] = action.payload;
            }
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
    setBids,
    setMyBids,
    addBid,
    updateBid,
    setLoading,
    setError,
} = bidsSlice.actions;

export default bidsSlice.reducer;
