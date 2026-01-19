import { api } from "../libs/axios";

const COMMENT_API_BASE = '/rating-service';

const CommentService = {
  // Get all comments for a product
  getCommentsByProduct: (productId, page = 1, size = 10) => {
    return api.get(`${COMMENT_API_BASE}/comment/get/product`, {
      params: {
        productId,
        page,
        size
      }
    });
  },

  // Get all comments (new)
  getAllComments: (page = 1, size = 10) => {
    return api.get(`${COMMENT_API_BASE}/comment/get-all`, {
      params: {
        page,
        size
      }
    });
  },

  // Create a new comment
  createComment: (commentData) => {
    return api.post(`${COMMENT_API_BASE}/comment/create`, commentData);
  },

  // Update an existing comment
  updateComment: (commentData) => {
    return api.put(`${COMMENT_API_BASE}/comment/update`, commentData);
  },

  // Delete a comment by ID
  deleteComment: (id) => {
    return api.delete(`${COMMENT_API_BASE}/comment/delete`, {
      params: { id }
    });
  },

  // Delete all comments by product ID
  deleteCommentsByProduct: (productId) => {
    return api.delete(`${COMMENT_API_BASE}/comment/delete/product`, {
      params: { ProductId: productId }
    });
  }
};

export default CommentService;
