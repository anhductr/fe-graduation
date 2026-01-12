import { api } from "../libs/axios";

// NOTE: Based on other files (catalogueApi uses /product-service), assuming ratings are in product-service.
// If typical pattern is used, it might be /rating-service or /product-service
const RATING_URL_PREFIX = '/rating-service/rating';
// If your gateway routes /rating directly, change above to '/rating'

export const createRating = async (data) => {
    // POST /create
    const response = await api.post(`${RATING_URL_PREFIX}/create`, data);
    return response.data;
};

export const updateRating = async (data) => {
    // PUT /update
    const response = await api.put(`${RATING_URL_PREFIX}/update`, data);
    return response.data;
};

export const getRatingsByFilter = async (page = 1, size = 10, type = "ALL", productId) => {
    // GET /get/filter
    const response = await api.get(`${RATING_URL_PREFIX}/get/filter`, {
        params: {
            page, // Controller expects 1-based index (implied by defaultValue="1") and handles -1 internally
            size,
            RatingFilterType: type,
            productId
        }
    });
    return response.data;
};

export const getRatingSummary = async (productId) => {
    // GET /get/summary
    const response = await api.get(`${RATING_URL_PREFIX}/get/summary`, {
        params: { productId }
    });
    return response.data;
};

export const ratingApi = {
    createRating,
    updateRating,
    getRatingsByFilter,
    getRatingSummary
};

export default ratingApi;
