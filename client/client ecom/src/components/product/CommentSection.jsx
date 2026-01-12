import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import commentApi from "../../services/commentApi";
import { Avatar, Button, Pagination, TextField, CircularProgress } from "@mui/material";
import { format } from "date-fns";

const CommentSection = ({ productId }) => {
    const { user, isLoggedIn } = useAuth();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [content, setContent] = useState("");
    const PAGE_size = 5;

    // Fetch comments
    const { data: commentsData, isLoading } = useQuery({
        queryKey: ["comments", productId, page],
        queryFn: () => commentApi.getAllForProduct(productId, page, PAGE_size),
        keepPreviousData: true,
    });

    console.log("Comments Data:", commentsData); // Debug log

    const result = commentsData?.data?.result || {};
    const comments = result.data || [];
    const totalPages = result.totalPage || 1;

    // Create comment mutation
    const createMutation = useMutation({
        mutationFn: commentApi.createComment,
        onSuccess: () => {
            // Invalidate all queries starting with ['comments', productId]
            queryClient.invalidateQueries({ queryKey: ["comments", productId] });
            setContent("");
        },
        onError: (error) => {
            alert("Đăng bình luận thất bại: " + (error.response?.data?.message || "Lỗi không xác định"));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        if (!user?.id) {
            alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            return;
        }

        const payload = {
            content: content,
            productId: productId,
            userId: user.id, // Assuming user object has 'id'
            parentId: null // Top level comment
        };

        createMutation.mutate(payload);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    if (!productId) return null;

    return (
        <>
            {/* Input Form */}
            {isLoggedIn ? (
                <form onSubmit={handleSubmit} className="mb-8 flex gap-4 items-start">
                    <Avatar src={user?.avatar || ""} alt={user?.name || "User"} />
                    <div className="flex-1">
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Viết bình luận của bạn..."
                            variant="outlined"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="bg-gray-50 mb-2"
                        />
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={createMutation.isPending || !content.trim()}
                                className="!normal-case"
                            >
                                {createMutation.isPending ? "Đang gửi..." : "Gửi bình luận"}
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-100 p-4 rounded-lg text-center mb-6">
                    <p className="text-gray-600">Vui lòng <a href="/login" className="text-blue-600 hover:underline">đăng nhập</a> để bình luận.</p>
                </div>
            )}

            {/* List Comments */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <CircularProgress />
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                                <Avatar src={comment.userAvatar || ""} alt={comment.userName || "User"} /> {/* Verify comment response user fields */}
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900">{comment.userName || `User ${comment.userId}`}</h4> {/* Verify field */}
                                        <span className="text-xs text-gray-500">
                                            {comment.createdDate ? format(new Date(comment.createdDate), "dd/MM/yyyy HH:mm") : ""}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 italic py-4">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default CommentSection;
