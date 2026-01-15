import React, { useState, useMemo } from 'react';
import './CommentsTable.css';

const CommentsTable = ({ comments, onEdit, onDelete, onReply, loading }) => {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpanded = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Xây dựng cấu trúc cây từ dữ liệu flat
  const buildCommentTree = (flatComments) => {
    const commentMap = new Map();
    const rootComments = [];

    // Tạo map của tất cả comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, children: [] });
    });

    // Xây dựng cây
    flatComments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  // Tìm parent comment từ commentMap
  const findParentComment = (parentId, commentMap) => {
    return commentMap.get(parentId);
  };

  const renderComment = (comment, commentMap, level = 0) => {
    const isAdmin = comment.lastName === 'ADMIN';
    const parentComment = comment.parentId ? findParentComment(comment.parentId, commentMap) : null;
    const isAdminReply = isAdmin && parentComment;

    return (
      <div
        key={comment.id}
        className={`comment-item level-${level} ${isAdmin ? 'admin-comment' : ''
          } ${isAdminReply ? 'admin-reply' : ''}`}
      >
        {/* Header của comment */}
        <div className="comment-header">
          <div className="comment-user">
            {comment.avatarUrl ? (
              <img
                src={comment.avatarUrl}
                alt={comment.firstName}
                className={`comment-avatar ${isAdmin ? 'admin-avatar' : ''}`}
              />
            ) : (
              <div className={`comment-avatar-placeholder ${isAdmin ? 'admin-avatar' : ''}`}>
                {isAdmin ? 'A' : (comment.firstName?.[0] || 'U')}
              </div>
            )}
            <div className="user-details">
              <div className="flex items-center gap-2">
                <span className={`user-name ${isAdmin ? 'admin-name' : ''}`}>
                  {isAdmin ? 'Quản trị viên' : `${comment.firstName} ${comment.lastName}`.trim() || 'Người dùng'}
                </span>
                {isAdmin && (
                  <span className="admin-badge">
                    <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="created-date">
            {new Date(comment.createdAt).toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* Nội dung comment */}
        <div className="comment-content">
          {/* Hiển thị thông tin reply */}
          {parentComment && (
            <div className={`reply-info ${isAdmin ? 'admin-reply-info' : ''}`}>
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {isAdmin ? (
                <span>
                  <strong className="text-blue-600">Admin</strong> đã trả lời{' '}
                  <strong>
                    {parentComment.lastName === 'ADMIN'
                      ? 'Admin'
                      : `${parentComment.firstName} ${parentComment.lastName}`.trim() || 'Người dùng'}
                  </strong>
                </span>
              ) : (
                <span>
                  Trả lời{' '}
                  <strong>
                    {parentComment.lastName === 'ADMIN'
                      ? 'Quản trị viên'
                      : `${parentComment.firstName} ${parentComment.lastName}`.trim() || 'Người dùng'}
                  </strong>
                </span>
              )}
            </div>
          )}

          <p className={isAdmin ? 'admin-content-text' : ''}>{comment.content}</p>
        </div>

        {/* Footer actions */}
        <div className="comment-footer">
          <button className="btn-reply" onClick={() => onReply(comment)}>
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Trả lời
          </button>
          <button className="btn-delete-comment" onClick={() => onDelete(comment.id)}>
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa
          </button>
        </div>

        {/* Replies section */}
        {comment.children && comment.children.length > 0 && (
          <div className="replies-section">
            <button
              className="toggle-replies"
              onClick={() => toggleExpanded(comment.id)}
            >
              {expandedIds[comment.id] ? (
                <>
                  <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Ẩn {comment.children.length} câu trả lời
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Xem {comment.children.length} câu trả lời
                </>
              )}
            </button>
            {expandedIds[comment.id] && (
              <div className="replies-list">
                {comment.children.map(child => renderComment(child, commentMap, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Sử dụng useMemo để tối ưu performance
  const processedData = useMemo(() => {
    if (!comments || comments.length === 0) return { groupedComments: {}, commentMap: new Map() };

    // Tạo comment map
    const commentMap = new Map();
    comments.forEach(comment => {
      commentMap.set(comment.id, comment);
    });

    // Xây dựng cây comment
    const commentTree = buildCommentTree(comments);

    // Group theo productId
    const groupedComments = commentTree.reduce((groups, comment) => {
      const key = comment.productId || 'Unknown Product';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(comment);
      return groups;
    }, {});

    return { groupedComments, commentMap };
  }, [comments]);

  const { groupedComments, commentMap } = processedData;

  return (
    <div className="comments-table-container">
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải bình luận...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="no-data">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>Chưa có bình luận nào</p>
        </div>
      ) : (
        <div className="comments-list">
          {Object.entries(groupedComments).map(([productId, productComments]) => {
            // Đếm tổng số comments (bao gồm cả replies)
            const totalComments = comments.filter(c => c.productId === productId).length;

            return (
              <div key={productId} className="product-group">
                <div className="product-header">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>Sản phẩm: {productId}</span>
                  </div>
                  <span className="comment-count">
                    {totalComments} bình luận
                  </span>
                </div>
                <div className="product-comments">
                  {productComments.map(comment => renderComment(comment, commentMap, 0))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentsTable;