import React, { useState, useEffect, useContext } from 'react';
import CommentService from '../../services/CommentService';
import CommentsTable from '../../components/Comments/CommentsTable';
import CommentModal from '../../components/Comments/CommentModal';
import AlertContext from '../../context/AlertContext';
import Pagination from '../../components/common/Pagination';
import './CommentsList.css';

const CommentsList = ({ productId }) => {
  const { showAlert } = useContext(AlertContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPage: 0,
    totalElements: 0
  });

  // Fetch comments on mount and when filters change
  useEffect(() => {
    fetchComments();
  }, [productId, pagination.page]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      let response;

      if (productId) {
        response = await CommentService.getCommentsByProduct(
          productId,
          pagination.page,
          pagination.size
        );
      } else {
        response = await CommentService.getAllComments(
          pagination.page,
          pagination.size
        );
      }

      if (response.data && response.data.result) {
        setComments(response.data.result.data);
        setPagination(prev => ({
          ...prev,
          totalPage: response.data.result.totalPage,
          totalElements: response.data.result.totalElements
        }));
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

  const handleReply = (comment) => {
    setSelectedComment(null); // Ensure we are not in edit mode
    setReplyingTo(comment); // New state for replying
    setShowModal(true);
  };

  const handleSaveComment = async (formData) => {
    try {
      setLoading(true);
      if (formData.id) {
        // Update existing comment - Not implementing edit as per previous request?
        // But logic is here if needed.
        const response = await CommentService.updateComment(formData);
        if (response.data) {
          // Refresh or update state
          fetchComments();
          showAlert('Comment updated successfully', 'success');
        }
      } else {
        // Create new comment (or reply)
        // If it's a reply, ensure parentId is set (Modal handles this in formData)
        // User request: { content, productId, parentId }
        const payload = {
          content: formData.content,
          productId: formData.productId,
          parentId: formData.parentId
        };
        const response = await CommentService.createComment(payload);
        if (response.data) {
          await fetchComments();
          showAlert('Comment created successfully', 'success');
        }
      }
      setShowModal(false);
      setSelectedComment(null);
      setReplyingTo(null);
    } catch (error) {
      console.error('Error saving comment:', error);
      showAlert(error.response?.data?.message || 'Failed to save comment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      // ... existing logic
      try {
        setLoading(true);
        await CommentService.deleteComment(id);
        // Refresh to handle threaded deletion if needed, but filtering local state is faster if flat
        // Since we have threads, maybe refetch is safer to update tree?
        // But reusing existing logic:
        fetchComments(); // safer than filter for threads
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
    // ... existing logic
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

  // State for replying
  const [replyingTo, setReplyingTo] = useState(null);

  return (
    <div className="comments-list-container">
      <div className="search-filter-section">
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
          onReply={handleReply}
          loading={loading}
        />
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPage={pagination.totalPage}
        totalElements={pagination.totalElements}
        pageSize={pagination.size}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {showModal && (
        <CommentModal
          comment={selectedComment}
          replyingTo={replyingTo}
          productId={productId}
          onClose={() => {
            setShowModal(false);
            setSelectedComment(null);
            setReplyingTo(null);
          }}
          onSave={handleSaveComment}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default CommentsList;
