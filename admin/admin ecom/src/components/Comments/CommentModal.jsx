import React, { useState } from 'react';
import './CommentModal.css';

const CommentModal = ({ comment, replyingTo, productId, userId, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState(
    comment || {
      id: '',
      content: '',
      productId: productId || (replyingTo ? replyingTo.productId : '') || '',
      userId: userId || '',
      parentId: replyingTo ? replyingTo.id : ''
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{comment ? 'Edit Comment' : replyingTo ? 'Reply to Comment' : 'Add Comment'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="comment-form">
          {replyingTo && (
            <div className="reply-context p-3 bg-gray-100 rounded mb-4 text-sm border-l-4 border-blue-500">
              <p className="font-semibold text-gray-700">Replying to {replyingTo.firstName} {replyingTo.lastName}:</p>
              <p className="italic text-gray-600 truncate">"{replyingTo.content}"</p>
            </div>
          )}

          {comment && (
            <div className="form-group">
              <label>Comment ID (Read-only)</label>
              <input
                type="text"
                value={formData.id}
                disabled
                className="form-control disabled"
              />
            </div>
          )}

          <div className="form-group hidden">
            {/* Hidden but required for submission logic usually */}
            <label>Product ID *</label>
            <input
              type="text"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
              disabled={!!comment || !!replyingTo}
              className="form-control"
              placeholder="Enter product ID"
            />
          </div>

          <div className="form-group hidden">
            {/* Admin User ID usually comes from auth context, but here we can let them input or hide it */}
            <label>User ID *</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              // required // making it not required in UI if backend handles it, but typically explicit for this admin tool
              className="form-control"
              placeholder="Enter user ID"
            />
          </div>

          <div className="form-group">
            <label>Comment Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              required
              className="form-control"
              placeholder="Enter your reply..."
            />
            <div className="char-count">
              {formData.content.length} characters
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;
