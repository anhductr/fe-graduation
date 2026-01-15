import React, { useState } from 'react';
import './CommentsTable.css';

const CommentsTable = ({ comments, onEdit, onDelete, loading }) => {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpanded = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderComment = (comment, level = 0) => {
    return (
      <div key={comment.id} className={`comment-item level-${level}`}>
        <div className="comment-header">
          <div className="comment-user">
            {comment.avatarUrl && (
              <img src={comment.avatarUrl} alt={comment.firstName} className="comment-avatar" />
            )}
            <div className="user-details">
              <span className="user-name">{`${comment.firstName} ${comment.lastName}`}</span>
              <span className="user-id">ID: {comment.userId}</span>
            </div>
          </div>
          <span className="created-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="comment-content">
          <p>{comment.content}</p>
        </div>

        <div className="comment-footer">
          <button className="btn-reply">Reply</button>
          <button className="btn-edit-comment" onClick={() => onEdit(comment)}>Edit</button>
          <button className="btn-delete-comment" onClick={() => onDelete(comment.id)}>Delete</button>
        </div>

        {comment.childrent && comment.childrent.length > 0 && (
          <div className="replies-section">
            <button 
              className="toggle-replies"
              onClick={() => toggleExpanded(comment.id)}
            >
              {expandedIds[comment.id] ? '▼' : '▶'} {comment.childrent.length} replies
            </button>
            {expandedIds[comment.id] && (
              <div className="replies-list">
                {comment.childrent.map(child => renderComment(child, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comments-table-container">
      {loading ? (
        <div className="loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="no-data">No comments found</div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentsTable;
