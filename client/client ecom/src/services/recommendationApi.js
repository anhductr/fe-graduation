import axios from "axios";

// Create a dedicated axios instance for the recommendation service
// using the URL defined in the environment variables (CONTENT_CHATBOT_API_URL)
const recApi = axios.create({
    baseURL: import.meta.env.CONTENT_CHATBOT_API_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
});

// Add request interceptor to include the authentication token
recApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Get trending/popular recommendations
export const getTrendingRecommendations = async ({ limit = 10, category = null } = {}) => {
    try {
        const params = { limit };
        if (category) {
            params.category = category;
        }
        const response = await recApi.get("/recommendations/trending", {
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching trending recommendations:", error);
        throw error;
    }
};

// Get personalized recommendations for a user
export const getPersonalizedRecommendations = async (userId, { limit = 15, method = "hybrid", recent_k = 10 } = {}) => {
    try {
        const params = {
            limit,
            method,
            recent_k,
        };

        if (userId) {
            params.user_id = userId;
        }

        const response = await recApi.get("/recommendations/personalized", {
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching personalized recommendations:", error);
        throw error;
    }
};

// Track a product view
export const trackProductView = async (userId, productId) => {
    if (!userId || !productId) return;
    try {
        await recApi.post("/recommendations/track-view", null, {
            params: {
                product_id: productId,
                user_id: userId
            }
        });
    } catch (error) {
        console.warn("Failed to track view", error);
    }
};

/**
 * Track a product click (call this when user clicks a product card).
 */
export const trackProductClick = async (userId, productId) => {
    if (!userId || !productId) return;
    try {
        await recApi.post(`/recommendations/track-click`, null, {
            params: {
                product_id: productId,
                user_id: userId
            },
        });
    } catch (error) {
        console.warn('Failed to track click', error);
    }
};

/**
 * Track adding a product to cart.
 */
export const trackAddToCart = async (userId, productId, variantId = null) => {
    if (!userId || !productId) return;
    try {
        const params = { product_id: productId, user_id: userId };
        if (variantId) params.variant_id = variantId;
        await recApi.post(`/recommendations/track-add-to-cart`, null, {
            params,
        });
    } catch (error) {
        console.warn('Failed to track add-to-cart', error);
    }
};

/**
 * Track a purchase event.
 */
export const trackPurchase = async (userId, productId, variantId = null) => {
    if (!userId || !productId) return;
    try {
        const params = { product_id: productId, user_id: userId };
        if (variantId) params.variant_id = variantId;
        await recApi.post(`/recommendations/track-purchase`, null, {
            params,
        });
    } catch (error) {
        console.warn('Failed to track purchase', error);
    }
};

// Get similar products
export const getSimilarProducts = async (productId, { limit = 6, user_id = null } = {}) => {
    try {
        const params = { limit };
        if (user_id) params.user_id = user_id;
        const response = await recApi.get(`/recommendations/${productId}/similar`, {
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching similar products:", error);
        throw error;
    }
};
