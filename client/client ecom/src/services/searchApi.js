import { api } from "../libs/axios";


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
        "/search-service/search/catalog-search",
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
    return response.data.productGetVMList; // backend trả ProductGetListVM
};

/**
 * Gợi ý tìm kiếm (autocomplete
 */
export const getSearchSuggestionsQuick = async (keyword = "") => {
    if (!keyword.trim()) return [];

    const response = await api.get("/search-service/search/autocomplete/quick", {
        params: { q: keyword.trim() },
    });
    console.log('autocomplete response quick: ', response)
    return response.data;
};


export const getSearchSuggestionsFull = async (keyword = "") => {
    if (!keyword.trim()) return [];

    const response = await api.get("/search-service/search/autocomplete/full", {
        params: { q: keyword.trim() },
    });
    console.log('autocomplete response full: ', response)
    return response.data;
};