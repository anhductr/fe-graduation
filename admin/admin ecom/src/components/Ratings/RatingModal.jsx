import React, { useState } from 'react';
import './RatingModal.css';

const RatingModal = ({ rating, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState(
    rating || { id: '', ratingScore: 5, content: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ratingScore' ? parseFloat(value) : value
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
          <h2>{rating ? 'Edit Rating' : 'Add Rating'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="rating-form">
          {rating && (
            <div className="form-group">
              <label>Rating ID (Read-only)</label>
              <input
                type="text"
                value={formData.id}
                disabled
                className="form-control disabled"
              />
            </div>
          )}

          <div className="form-group">
            <label>Rating Score *</label>
            <div className="rating-input-group">
              <input
                type="number"
                name="ratingScore"
                value={formData.ratingScore}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.5"
                required
                className="form-control rating-number"
              />
              <div className="stars-display">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`star ${i < Math.floor(formData.ratingScore) ? 'filled' : i < formData.ratingScore ? 'half' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Review Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="5"
              className="form-control"
              placeholder="Enter review content..."
            />
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

export default RatingModal;
