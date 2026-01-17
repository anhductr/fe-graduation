import { api } from "../libs/axios";

const API_URL = '/order-service';

export const orderApi = {
    // Create a new order
    createOrder: (data) => api.post(`${API_URL}/order/create`, data),

    rePayment: (data) =>
        api.post(`${API_URL}/order/rePayment`, data),

    // Get order by ID
    getOrder: (orderId) => api.get(`${API_URL}/order`, { params: { orderId } }),

    // Get current user's orders
    getMyOrders: (params) => api.get(`${API_URL}/order/get-my-order`, { params }),

    // Cancel an order
    cancelOrder: (orderId) => api.put(`${API_URL}/order/cancel`, null, { params: { orderId } }),

    // Get order amount (for payment)
    getOrderAmount: (orderId) => api.get(`${API_URL}/order/internal/getAmount`, { params: { orderId } }),

    // Update order status (internal)
    updateOrderStatus: (orderId, status) => api.post(`${API_URL}/order/status`, null, { params: { orderId, status } }),

    cancelOrder: (orderId) =>
        api.put(`${API_URL}/order/cancel`, null, {
            params: { orderId },
        }),
};

export default orderApi;
