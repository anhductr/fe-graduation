import { api } from "../libs/axios";

export const commentApi = {
    // Create a new comment
    createComment: (data) => {
        return api.post('rating-service/comment/create', data);
    },

    // Update an existing comment
    updateComment: (data) => {
        return api.put('rating-service/comment/update', data);
    },

    // Get comments for a product
    getAllForProduct: (productId, page = 1, size = 10) => {
        return api.get('rating-service/comment/get/product', {
            params: {
                productId,
                page,
                size
            }
        });
    }
};

export default commentApi;
