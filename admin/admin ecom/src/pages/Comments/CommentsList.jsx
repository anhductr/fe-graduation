import React, { useState, useEffect, useContext } from 'react';
import CommentService from '../../services/CommentService';
import CommentsTable from '../../components/Comments/CommentsTable';
import CommentModal from '../../components/Comments/CommentModal';
import AlertContext from '../../context/AlertContext';
import './CommentsList.css';

const CommentsList = () => {
  const { showAlert } = useContext(AlertContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [productId, setProductId] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPage: 0,
    totalElements: 0
  });

  // Fetch comments on mount and when filters change
  useEffect(() => {
    if (productId) {
      fetchComments();
    }
  }, [productId, pagination.page]);

  const fetchComments = async () => {
    if (!productId.trim()) {
      showAlert('Please enter a product ID', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await CommentService.getCommentsByProduct(
        productId,
        pagination.page,
        pagination.size
      );

      if (response.data && response.data.result) {
        setComments(response.data.result.data);
        setPagination(prev => ({
          ...prev,
          totalPage: response.data.result.totalPage,
          totalElements: response.data.result.totalElements
        }));
        showAlert('Comments loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showAlert(error.response?.data?.message || 'Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = () => {
    setSelectedComment(null);
    setShowModal(true);
  };

  const handleEditComment = (comment) => {
    setSelectedComment(comment);
    setShowModal(true);
  };

  const handleSaveComment = async (formData) => {
    try {
      setLoading(true);
      if (formData.id) {
        // Update existing comment
        const response = await CommentService.updateComment(formData);
        if (response.data) {
          setComments(comments.map(c => c.id === formData.id ? response.data.result : c));
          showAlert('Comment updated successfully', 'success');
        }
      } else {
        // Create new comment
        const response = await CommentService.createComment(formData);
        if (response.data) {
          // Refresh comments list
          await fetchComments();
          showAlert('Comment created successfully', 'success');
        }
      }
      setShowModal(false);
      setSelectedComment(null);
    } catch (error) {
      console.error('Error saving comment:', error);
      showAlert(error.response?.data?.message || 'Failed to save comment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        setLoading(true);
        await CommentService.deleteComment(id);
        setComments(comments.filter(c => c.id !== id));
        showAlert('Comment deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting comment:', error);
        showAlert(error.response?.data?.message || 'Failed to delete comment', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAllComments = async () => {
    if (window.confirm('Are you sure you want to delete ALL comments for this product? This cannot be undone.')) {
      try {
        setLoading(true);
        await CommentService.deleteCommentsByProduct(productId);
        setComments([]);
        showAlert('All comments deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting comments:', error);
        showAlert(error.response?.data?.message || 'Failed to delete comments', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchComments();
  };

  return (
    <div className="comments-list-container">
      <div className="page-header">
        <h1>Comment Management</h1>
        <p>Manage user comments on your products</p>
      </div>

      <div className="search-filter-section">
        <div className="search-group">
          <input
            type="text"
            placeholder="Enter Product ID..."
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-search" onClick={handleSearch} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {productId && (
          <button className="btn-add-comment" onClick={handleAddComment} disabled={loading}>
            + Add Comment
          </button>
        )}

        {comments.length > 0 && (
          <button 
            className="btn-delete-all" 
            onClick={handleDeleteAllComments} 
            disabled={loading}
          >
            Delete All
          </button>
        )}
      </div>

      {productId && (
        <div className="stats-section">
          <div className="stat-card">
            <span className="stat-label">Total Comments</span>
            <span className="stat-value">{pagination.totalElements}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Page</span>
            <span className="stat-value">{pagination.page} / {pagination.totalPage}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Per Page</span>
            <span className="stat-value">{pagination.size}</span>
          </div>
        </div>
      )}

      <div className="comments-container">
        <CommentsTable
          comments={comments}
          onEdit={handleEditComment}
          onDelete={handleDeleteComment}
          loading={loading}
        />
      </div>

      {productId && pagination.totalPage > 1 && (
        <div className="pagination-section">
          <button
            className="btn-pagination"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPage}
          </span>
          <button
            className="btn-pagination"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPage || loading}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <CommentModal
          comment={selectedComment}
          productId={productId}
          onClose={() => {
            setShowModal(false);
            setSelectedComment(null);
          }}
          onSave={handleSaveComment}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default CommentsList;
