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
    },

    // Delete a comment
    deleteComment: (id) => {
        return api.delete('rating-service/comment/delete', {
            params: { id }
        });
    },

    // Delete all comments for a product
    deleteCommentsByProduct: (productId) => {
        return api.delete('rating-service/comment/delete/product', {
            params: { ProductId: productId }
        });
    },

    //Push image comment 
    pushImageComment: (data) => {
        return api.put('rating-service/comment/image?id=' + data.commentId + '&imageUrl=' + data.imageUrl);
    },

};

export default commentApi;
