import { api } from "../libs/axios";

const API_URL = '/cart-service';

export const cartApi = {
    // Add item to cart
    addToCart: (data) => api.post(`${API_URL}/cart/create-cart`, data),

    // Update cart item quantity
    updateCart: (data) => api.put(`${API_URL}/cart/update-cart`, data),

    // Get current user's cart
    getMyCart: () => api.get(`${API_URL}/cart/get-my-cart`),

    // Delete items from cart
    deleteItems: (cartItemIds) => api.delete(`${API_URL}/cart/delete-items`, { data: { cartItemId: cartItemIds } }),
};

export default cartApi;
