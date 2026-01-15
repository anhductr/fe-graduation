import React, { useState } from 'react';
import './RatingsTable.css';

const RatingsTable = ({ ratings, onEdit, onDelete, loading }) => {
  const [expandedId, setExpandedId] = useState(null);

  const getRatingColor = (score) => {
    if (score >= 4.5) return '#28a745';
    if (score >= 3.5) return '#ffc107';
    if (score >= 2.5) return '#ff9800';
    return '#dc3545';
  };

  const renderStars = (score) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`star ${i < Math.floor(score) ? 'filled' : i < score ? 'half' : ''}`}
          >
            ★
          </span>
        ))}
        <span className="score-text">({score.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="ratings-table-container">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : ratings.length === 0 ? (
        <div className="no-data">No ratings found</div>
      ) : (
        <table className="ratings-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Rating</th>
              <th>Content</th>
              <th>Product ID</th>
              <th>Verified Purchase</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((rating) => (
              <tr key={rating.id}>
                <td>
                  <div className="user-info">
                    {rating.avatarUrl && (
                      <img src={rating.avatarUrl} alt={rating.firstName} className="avatar" />
                    )}
                    <span>{`${rating.firstName} ${rating.lastName}`}</span>
                  </div>
                </td>
                <td>
                  <div className="rating-score" style={{ color: getRatingColor(rating.ratingScore) }}>
                    {renderStars(rating.ratingScore)}
                  </div>
                </td>
                <td>
                  <div className="content-cell">
                    <span className="content-preview">{rating.content.substring(0, 50)}...</span>
                    <button
                      className="expand-btn"
                      onClick={() => setExpandedId(expandedId === rating.id ? null : rating.id)}
                    >
                      {expandedId === rating.id ? 'Hide' : 'Show'}
                    </button>
                    {expandedId === rating.id && (
                      <div className="content-full">{rating.content}</div>
                    )}
                  </div>
                </td>
                <td>{rating.productId}</td>
                <td>
                  <span className={`badge ${rating.verifiedPurchase ? 'verified' : 'unverified'}`}>
                    {rating.verifiedPurchase ? '✓ Yes' : '✗ No'}
                  </span>
                </td>
                <td>{new Date(rating.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit" onClick={() => onEdit(rating)} title="Edit">
                      ✎
                    </button>
                    <button className="btn-delete" onClick={() => onDelete(rating.id)} title="Delete">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RatingsTable;
