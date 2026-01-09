import { api } from "../libs/axios";

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

const productApi = {
    getAllBrands,
    getCategoryById,
};

export default productApi;
