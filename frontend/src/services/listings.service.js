import apiClient from './api.service';
import API_CONFIG from '../config/api.config';

const listingsService = {
  // Get all listings
  async getAllListings(params = {}) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LISTINGS, { params });
    return response.data;
  },

  // Get listing by ID
  async getListingById(id) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LISTING_BY_ID(id));
    return response.data;
  },

  // Get my listings
  async getMyListings() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MY_LISTINGS);
    return response.data;
  },

  // Create listing
  async createListing(listingData) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.LISTINGS, listingData);
    return response.data;
  },

  // Update listing
  async updateListing(id, listingData) {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.LISTING_BY_ID(id), listingData);
    return response.data;
  },

  // Delete listing
  async deleteListing(id) {
    const response = await apiClient.delete(API_CONFIG.ENDPOINTS.LISTING_BY_ID(id));
    return response.data;
  },

  // Search listings
  async searchListings(query) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LISTINGS, {
      params: { search: query }
    });
    return response.data;
  },

  // Filter listings
  async filterListings(filters) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.LISTINGS, {
      params: filters
    });
    return response.data;
  }
};

export default listingsService;
