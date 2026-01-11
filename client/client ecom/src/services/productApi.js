import { api } from "../libs/axios";
import { useQuery } from "@tanstack/react-query";

export const getProductDetail = async (productId) => {
    const response = await api.get(`/search-service/search/product`, {
        params: { productId }
    });
    return response.data.result; // trả về trực tiếp ProductGetVM
};

export const productDetailOptions = (productId) => ({
    queryKey: ["productDetail", productId],
    queryFn: () => getProductDetail(productId),
    enabled: !!productId, // chỉ gọi khi có productId
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000,
    retry: 1,
});

export const useProductDetail = (productId) => {
    return useQuery(productDetailOptions(productId));
};

export const useProductAutocomplete = (keyword) => {
    return useQuery({
        queryKey: ["autocomplete", keyword],
        queryFn: async () => {
            if (!keyword) return [];
            const response = await api.get("/search-service/search/autocomplete/full", {
                params: { q: keyword },
            });
            return response.data.result || [];
        },
        enabled: !!keyword,
        staleTime: 5 * 60 * 1000, // 5 phút
    });
};