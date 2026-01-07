import axios from "axios";

// Tạo axios instance riêng cho search (có thể tái sử dụng ở các file khác nếu cần)
const api = axios.create({
    baseURL: "/api/v1/search-service",   // Thay bằng URL backend thật của bạn
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: log lỗi cho dễ debug
api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error("Search API Error:", err.response?.data || err.message);
        return Promise.reject(err);
    }
);

/**
 * Tìm kiếm sản phẩm + lọc + phân trang
 */
export const searchProducts = async ({
    keyword = null,
    page = 1,
    size = 20,
    category = null,
    brandName = null,
    attributes = [],
    minPrice = null,
    maxPrice = null,
    sortType = "DEFAULT",
} = {}) => {
    const response = await api.post(
        "/search/catalog-search",
        {
            keyword: keyword?.trim() || null,
            category,
            brandName,
            attributes,
            minPrice,
            maxPrice,
            sortType,
        },
        {
            params: { page, size },
        }
    );
    console.log("keyword:", keyword)
    console.log("category:", category)
    console.log("brandName:", brandName)
    console.log("attributes:", attributes)
    console.log("minP:", minPrice)
    console.log("maxP:", maxPrice)
    console.log("sort type:", sortType)
    console.log("response: ", response.data.productGetVMList)
    return response.data; // backend trả ProductGetListVM
};

/**
 * Gợi ý tìm kiếm (autocomplete)
 */
export const getSearchSuggestions = async (keyword = "") => {
    if (!keyword.trim()) return [];

    const response = await api.get("/search/autocomplete/quick", {
        params: { keyword: keyword.trim() },
    });
    console.log('autocomplete response: ', response)
    return response.data;
};

export default api; // nếu cần dùng axios thuần ở nơi khác