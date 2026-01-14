import React, { useState } from 'react';
import './CommentModal.css';

const CommentModal = ({ comment, productId, userId, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState(
    comment || { 
      id: '',
      content: '', 
      productId: productId || '',
      userId: userId || '',
      parentId: ''
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
          <h2>{comment ? 'Edit Comment' : 'Add Comment'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="comment-form">
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

          <div className="form-group">
            <label>Product ID *</label>
            <input
              type="text"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
              disabled={!!comment}
              className="form-control"
              placeholder="Enter product ID"
            />
          </div>

          <div className="form-group">
            <label>User ID *</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              disabled={!!comment}
              className="form-control"
              placeholder="Enter user ID"
            />
          </div>

          <div className="form-group">
            <label>Parent Comment ID (Optional - for replies)</label>
            <input
              type="text"
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              className="form-control"
              placeholder="Leave empty if not a reply"
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
              placeholder="Enter comment content..."
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
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;
