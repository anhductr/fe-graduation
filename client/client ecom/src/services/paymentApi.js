import { api } from "../libs/axios";

const API_URL = '/payment-service';

export const paymentApi = {
    // Create payment (initiate VNPay)
    createPayment: (data) => api.post(`${API_URL}/pay/create`, data),

    // Get payment history
    getPaymentHistory: (page = 1, size = 10) =>
        api.get(`${API_URL}/pay/history`, { params: { page, size } }),
};

export default paymentApi;
