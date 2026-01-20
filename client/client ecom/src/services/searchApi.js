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
    if (!keyword) return [];

    const response = await api.get("/search-service/search/autocomplete/full", {
        params: { q: keyword },
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

export const getCateUnderRoot = async () => {
    const response = await api.get("/search-service/search/category/root");
    return response.data;
};

export const getCategoryPathToRoot = async (categoryId) => {
    const response = await api.get("/search-service/search/category/pathToRoot", {
        params: { categoryId }
    });
    return response.data;
};

export const getProductByBanner = async ({
    page = 1,
    size = 10,
    ownerId,
    ownerType,
    minPrice,
    maxPrice,
    sortType
} = {}) => {
    if (!ownerId || !ownerType) {
        throw new Error("ownerId và ownerType là bắt buộc");
    }

    const body = {
        ownerId,
        ownerType,
        minPrice,
        maxPrice,
        sortType
    };

    // Remove null/undefined keys
    Object.keys(body).forEach(key => body[key] == null && delete body[key]);

    const response = await api.post("/search-service/search/banner", body, {
        params: {
            page,
            size,
        },
    });

    return response.data; // ApiResponse<ProductGetListVM>
};

export const getSuggestedProductsByIds = async ({
    productIds = [],
    recomentedType = "",
    page = 1,
    size = 10
} = {}) => {
    const body = {
        productIds,
        recomentedType
    };

    const response = await api.post("/search-service/search/product/suggest", body, {
        params: {
            page,
            size
        }
    });

    return response.data;
};

export const getProductFlashSale = async ({
    page = 1,
    size = 10,
} = {}) => {
    const response = await api.get("/search-service/search/flashSale", {
        params: {
            page,
            size,
        },
    });

    return response.data; // ApiResponse<ProductGetListVM>
};