import apiClient from './api.service';
import API_CONFIG from '../config/api.config';

const bidsService = {
  // Place a bid
  async placeBid(listingId, amount) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PLACE_BID, {
      listingId,
      amount
    });
    return response.data;
  },

  // Get bids for a listing
  async getListingBids(listingId, params = {}) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LISTING_BIDS(listingId), { params });
    return response.data;
  },

  // Get my bids
  async getMyBids(params = {}) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MY_BIDS, { params });
    return response.data;
  },

  // Get bid stats
  async getBidStats() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.BID_STATS);
    return response.data;
  },

  // Get bid by ID
  async getBidById(id) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.BID_BY_ID(id));
    return response.data;
  },

  // Cancel bid (if allowed)
  async cancelBid(id) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.BID_BY_ID(id));
    return response.data;
  }
};

export default bidsService;
