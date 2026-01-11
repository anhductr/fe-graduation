import { api } from "../libs/axios";

// Helper to handle search request
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
    const body = {
        keyword: keyword?.trim() || null,
        brandName,
        category, // ID string
        attributes,
        minPrice,
        maxPrice,
        sortType,
    };

    // Remove null/undefined keys to keep body clean
    Object.keys(body).forEach(key => body[key] == null && delete body[key]);

    const response = await api.post(
        "/search-service/search/catalog-search",
        body,
        {
            params: { page, size },
        }
    );
    return response.data; // Returns ApiResponse<ProductGetListVM>
};

/**
 * Gợi ý tìm kiếm (autocomplete) quick
 */
export const getSearchSuggestionsQuick = async (keyword = "", limit = 5) => {
    if (!keyword.trim()) return [];

    const response = await api.get("/search-service/search/autocomplete/quick", {
        params: {
            q: keyword.trim(),
            limit
        },
    });
    return response.data; // ApiResponse<List<AutoCompletedResponse>>
};

export const getSearchSuggestionsFull = async (keyword = "") => {
    if (!keyword.trim()) return [];

    const response = await api.get("/search-service/search/autocomplete/full", {
        params: { q: keyword.trim() },
    });
    return response.data;
};

// Public detail
export const getProductDetail = async (productId) => {
    const response = await api.get("/search-service/search/product", {
        params: { productId }
    });
    return response.data; // ApiResponse<ProductGetVM>
};
