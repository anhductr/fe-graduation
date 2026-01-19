import { api } from "../libs/axios";

const RATING_API_BASE = '/rating-service';

const RatingService = {
  // Get rating summary for a product
  getRatingSummary: (productId) => {
    return api.get(`${RATING_API_BASE}/rating/get/summary`, {
      params: { productId }
    });
  },

  // Get all ratings (new)
  getAllRatings: (page = 1, size = 10) => {
    return api.get(`${RATING_API_BASE}/rating/get-all`, {
      params: {
        page,
        size
      }
    });
  },

  // Get all ratings with filters
  getAllRatingsFiltered: (productId, page = 1, size = 10, filterType = 'ALL') => {
    return api.get(`${RATING_API_BASE}/rating/get/filter`, {
      params: {
        productId,
        page,
        size,
        RatingFilterType: filterType
      }
    });
  },

  // Create a new rating
  createRating: (ratingData) => {
    return api.post(`${RATING_API_BASE}/rating/create`, ratingData);
  },

  // Update an existing rating
  updateRating: (ratingData) => {
    return api.put(`${RATING_API_BASE}/rating/update`, ratingData);
  },

  // Delete a rating
  deleteRating: (id) => {
    return api.delete(`${RATING_API_BASE}/rating/delete`, {
      params: { id }
    });
  }
};

export default RatingService;
