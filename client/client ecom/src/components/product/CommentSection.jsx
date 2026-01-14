import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import commentApi from "../../services/commentApi";
import { Avatar, Button, Pagination, TextField, CircularProgress, Collapse } from "@mui/material";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { FaPaperPlane, FaUserShield, FaEdit, FaTrash, FaTimes, FaSave, FaChevronDown, FaChevronUp } from "react-icons/fa";

const CommentSection = ({ productId }) => {
    const { user, isLoggedIn, isUserLoading } = useAuth();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [content, setContent] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [expandedComments, setExpandedComments] = useState({}); // State để quản lý thu gọn
    const PAGE_size = 5;

    // Fetch comments (Questions)
    const { data: commentsData, isLoading } = useQuery({
        queryKey: ["comments", productId, page],
        queryFn: () => commentApi.getAllForProduct(productId, page, PAGE_size),
        keepPreviousData: true,
    });

    const result = commentsData?.data?.result || {};
    const comments = result.data || [];
    const totalPages = result.totalPage || 1;

    // Toggle collapse/expand cho replies
    const toggleExpanded = (commentId) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    // Create comment mutation
    const createMutation = useMutation({
        mutationFn: commentApi.createComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", productId] });
            setContent("");
            toast.success("Gửi câu hỏi thành công!");
        },
        onError: (error) => {
            toast.error("Gửi câu hỏi thất bại: " + (error.response?.data?.message || "Lỗi không xác định"));
        }
    });

    // Update comment mutation
    const updateMutation = useMutation({
        mutationFn: commentApi.updateComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", productId] });
            setEditingCommentId(null);
            setEditContent("");
            toast.success("Cập nhật thành công!");
        },
        onError: (error) => {
            toast.error("Cập nhật thất bại: " + (error.response?.data?.message || "Lỗi không xác định"));
        }
    });

    // Delete comment mutation
    const deleteMutation = useMutation({
        mutationFn: commentApi.deleteComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", productId] });
            toast.success("Xóa thành công!");
        },
        onError: (error) => {
            toast.error("Xóa thất bại: " + (error.response?.data?.message || "Lỗi không xác định"));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        if (!isLoggedIn) {
            window.dispatchEvent(new Event("auth:unauthorized"));
            return;
        }

        const payload = {
            content: content,
            productId: productId,
            userId: user?.id,
            parentId: null
        };

        createMutation.mutate(payload);
    };

    const handleReplySubmit = (parentId) => {
        if (!replyContent.trim()) return;

        if (!isLoggedIn) {
            window.dispatchEvent(new Event("auth:unauthorized"));
            return;
        }

        const payload = {
            content: replyContent,
            productId: productId,
            userId: user?.id,
            parentId: parentId
        };

        createMutation.mutate(payload, {
            onSuccess: () => {
                setReplyingToId(null);
                setReplyContent("");
                // Tự động mở rộng để hiển thị reply mới
                setExpandedComments(prev => ({
                    ...prev,
                    [parentId]: true
                }));
            }
        });
    };

    const handleEditClick = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    const handleSaveEdit = (commentId) => {
        if (!editContent.trim()) return;
        updateMutation.mutate({
            id: commentId,
            content: editContent,
            productId: productId,
            userId: user?.id
        });
    };

    const handleDeleteClick = (commentId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
            deleteMutation.mutate(commentId);
        }
    };

    // Color generator for avatar based on name
    const getAvatarColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return "#" + "00000".substring(0, 6 - c.length) + c;
    };

    if (!productId) return null;

    return (
        <div className="bg-white rounded-lg p-6 mt-6">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Hỏi và đáp</h2>

            {/* Input Box Area */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 flex gap-6 items-start shadow-sm">
                <div className="hidden md:block w-32 shrink-0 text-center">
                    <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
                        <img src="https://cdn2.cellphones.com.vn/insecure/rs:fill:160:0/q:90/plain/https://cellphones.com.vn/media/wysiwyg/ant-hello-2025.png" alt="Mascot" />
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-900 mb-2">Hãy đặt câu hỏi cho chúng tôi</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Chúng tôi sẽ phản hồi trong vòng 1 giờ. Nếu Quý khách gửi câu hỏi sau 22h, câu trả lời sẽ được gửi vào sáng hôm sau.
                    </p>

                    <form onSubmit={handleSubmit} className="relative">
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Viết câu hỏi của bạn tại đây..."
                            variant="outlined"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="bg-white"
                            InputProps={{
                                className: "!rounded-lg !pr-32"
                            }}
                        />
                        <div className="absolute bottom-3 right-3">
                            <Button
                                type="submit"
                                variant="contained"
                                className="!bg-[#e0052b] !normal-case !rounded-lg !px-4 !text-white"
                                disabled={createMutation.isPending || !content.trim() || isUserLoading}
                                endIcon={<FaPaperPlane className="text-xs" />}
                            >
                                {createMutation.isPending ? "Đang gửi..." : "Gửi câu hỏi"}
                            </Button>
                        </div>
                    </form>
                    {!isLoggedIn && (
                        <p className="text-xs text-red-500 mt-2">* Bạn cần đăng nhập để đặt câu hỏi</p>
                    )}
                </div>
            </div>

            {/* List Q&A */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <CircularProgress />
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.length > 0 ? (
                        comments.map((comment) => {
                            const displayName = [comment.firstName, comment.lastName].filter(Boolean).join(" ") || "Người dùng";
                            const initial = displayName.charAt(0).toUpperCase();
                            const hasReplies = comment.childrent && comment.childrent.length > 0;
                            const isExpanded = expandedComments[comment.id] ?? true; // Mặc định là mở

                            return (
                                <div key={comment.id} className="group">
                                    {/* Parent Comment */}
                                    <div className="flex gap-4 mb-3">
                                        <Avatar
                                            src={comment.avatarUrl}
                                            className="!w-10 !h-10 !text-sm !font-bold"
                                            style={{ backgroundColor: !comment.avatarUrl ? getAvatarColor(displayName) : undefined }}
                                        >
                                            {!comment.avatarUrl ? initial : ""}
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{displayName}</h4>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <i className="far fa-clock"></i>
                                                        {comment.createdAt ? format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm") : ""}
                                                    </span>
                                                </div>
                                                {user?.id && comment?.userId && String(user.id) === String(comment.userId) && (
                                                    <div className="flex gap-2">
                                                        {!editingCommentId && (
                                                            <>
                                                                <button onClick={() => handleEditClick(comment)} className="text-gray-400 hover:text-blue-500">
                                                                    <FaEdit />
                                                                </button>
                                                                <button onClick={() => handleDeleteClick(comment.id)} className="text-gray-400 hover:text-red-500">
                                                                    <FaTrash />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {editingCommentId === comment.id ? (
                                                <div className="mt-2">
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        size="small"
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                    />
                                                    <div className="flex gap-2 mt-2 justify-end">
                                                        <Button
                                                            size="small"
                                                            onClick={handleCancelEdit}
                                                            startIcon={<FaTimes />}
                                                            className="!text-gray-600 !normal-case"
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => handleSaveEdit(comment.id)}
                                                            disabled={updateMutation.isPending}
                                                            startIcon={<FaSave />}
                                                            className="!normal-case"
                                                        >
                                                            Lưu
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-800 text-sm">{comment.content}</p>
                                            )}

                                            <div className="mt-2  text-xs font-medium">
                                                <span
                                                    className="text-[#d70018] cursor-pointer hover:underline flex items-center gap-1"
                                                    onClick={() => {
                                                        if (!isLoggedIn) {
                                                            window.dispatchEvent(new Event("auth:unauthorized"));
                                                            return;
                                                        }
                                                        setReplyingToId(comment.id);
                                                    }}
                                                >
                                                    <button className="mb-2 btn-rep-cmt respondent button__cmt-rep flex items-center gap-1">
                                                        <div>
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M5.3335 6H10.6668" stroke="#D70018" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                <path d="M5.3335 8.6665H9.3335" stroke="#D70018" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                <path d="M6 11.9998H4C3.46957 11.9998 2.96086 11.7891 2.58579 11.4141C2.21071 11.039 2 10.5303 2 9.99984V4.6665C2 4.13607 2.21071 3.62736 2.58579 3.25229C2.96086 2.87722 3.46957 2.6665 4 2.6665H12C12.5304 2.6665 13.0391 2.87722 13.4142 3.25229C13.7893 3.62736 14 4.13607 14 4.6665V9.99984C14 10.5303 13.7893 11.039 13.4142 11.4141C13.0391 11.7891 12.5304 11.9998 12 11.9998H10L8 13.9998L6 11.9998Z" stroke="#D70018" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                            </svg>
                                                        </div>
                                                        <p>&nbsp;Phản hồi</p>
                                                    </button>
                                                </span>

                                                {/* Nút thu gọn/mở rộng phản hồi */}
                                                {hasReplies && (
                                                    <span
                                                        className="text-gray-600 cursor-pointer hover:text-[#d70018] flex items-center gap-1 transition-colors"
                                                        onClick={() => toggleExpanded(comment.id)}
                                                    >
                                                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                                        <span>{isExpanded ? 'Thu gọn' : 'Xem'} {comment.childrent.length} phản hồi</span>
                                                    </span>
                                                )}
                                            </div>

                                            {/* Reply Input Form */}
                                            {replyingToId === comment.id && (
                                                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        size="small"
                                                        placeholder={`Trả lời ${displayName}...`}
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        className="bg-white mb-2"
                                                    />
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                setReplyingToId(null);
                                                                setReplyContent("");
                                                            }}
                                                            className="!normal-case !text-gray-600"
                                                        >
                                                            Hủy
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="primary"
                                                            className="!bg-[#e0052b] !normal-case !text-white !hover:bg-[#e0052b]"
                                                            disabled={!replyContent.trim() || createMutation.isPending}
                                                            onClick={() => handleReplySubmit(comment.id)}
                                                        >
                                                            Gửi trả lời
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Children (Replies) với hiệu ứng Collapse */}
                                    {hasReplies && (
                                        <Collapse in={isExpanded} timeout="auto">
                                            <div className="ml-14 mt-2 space-y-4 border-l-2 border-gray-100 pl-4">
                                                {comment.childrent.map((child) => {
                                                    const childName = [child.firstName, child.lastName].filter(Boolean).join(" ") || "Người dùng";
                                                    const childInitial = childName.charAt(0).toUpperCase();
                                                    const isAdmin = child.lastName?.toUpperCase() === "ADMIN";

                                                    return (
                                                        <div key={child.id} className="flex gap-3">
                                                            <Avatar
                                                                src={child.avatarUrl}
                                                                className={`!w-8 !h-8 !text-xs !font-bold ${isAdmin ? '!bg-red-600' : ''}`}
                                                                style={{ backgroundColor: (!child.avatarUrl && !isAdmin) ? getAvatarColor(childName) : undefined }}
                                                            >
                                                                {!child.avatarUrl ? (isAdmin ? "QTV" : childInitial) : ""}
                                                            </Avatar>
                                                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h5 className={`font-bold text-sm ${isAdmin ? 'text-[#d70018]' : 'text-gray-900'}`}>
                                                                        {childName}
                                                                        {isAdmin && <span className="ml-1 bg-red-100 text-red-600 text-[10px] px-1 rounded border border-red-200">QTV</span>}
                                                                    </h5>
                                                                    <span className="text-xs text-gray-400">
                                                                        {child.createdAt ? format(new Date(child.createdAt), "dd/MM HH:mm") : ""}
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-800 text-sm whitespace-pre-wrap">{child.content}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Collapse>
                                    )}

                                    <div className="border-b border-gray-100 mt-4 group-last:hidden"></div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 py-4">Chưa có câu hỏi nào. Hãy đặt câu hỏi ngay!</p>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(e, v) => setPage(v)}
                                color="primary"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentSection;