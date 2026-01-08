import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        // console.error("Catalogue API Error:", err.response?.data || err.message);
        return Promise.reject(err);
    }
);

export const getAllBrands = async () => {
    const response = await api.get("/product-service/brand/get-all");
    // console.log("getAllBrands: ", response);
    return response.data;
};

export const getCategoryById = async (categoryId) => {
    const response = await api.get(`/search-service/search/category/${categoryId}`);
    // console.log("getCategoryById: ", response.data);
    return response.data;
};

export default api;
