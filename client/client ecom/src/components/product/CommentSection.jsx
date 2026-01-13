import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import commentApi from "../../services/commentApi";
import { Avatar, Button, Pagination, TextField, CircularProgress } from "@mui/material";
import { format } from "date-fns";
import { FaPaperPlane, FaUserShield } from "react-icons/fa";

const CommentSection = ({ productId }) => {
    const { user, isLoggedIn } = useAuth();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [content, setContent] = useState("");
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

    // Create comment mutation
    const createMutation = useMutation({
        mutationFn: commentApi.createComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", productId] });
            setContent("");
        },
        onError: (error) => {
            alert("Gửi câu hỏi thất bại: " + (error.response?.data?.message || "Lỗi không xác định"));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        if (!user?.id) {
            window.dispatchEvent(new Event("auth:unauthorized"));
            return;
        }

        const payload = {
            content: content,
            productId: productId,
            userId: user.id,
            parentId: null
        };

        createMutation.mutate(payload);
    };

    if (!productId) return null;

    return (
        <div className="bg-white rounded-lg p-6 mt-6">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Hỏi và đáp</h2>

            {/* Input Box Area */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 flex gap-6 items-start shadow-sm">
                <div className="hidden md:block w-32 shrink-0 text-center">
                    {/* Mascot placeholder */}
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
                                disabled={createMutation.isPending || !content.trim()}
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
                        comments.map((comment) => (
                            <div key={comment.id} className="group">
                                <div className="flex gap-4 mb-3">
                                    <Avatar
                                        src={comment.userAvatar}
                                        className="!bg-gray-500 !w-10 !h-10 !text-sm !font-bold"
                                    >
                                        {comment.userName ? comment.userName.charAt(0).toUpperCase() : "Q"}
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900">{comment.userName}</h4>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <i className="far fa-clock"></i>
                                                {comment.createdDate ? format(new Date(comment.createdDate), "dd/MM/yyyy HH:mm") : ""}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 text-sm">{comment.content}</p>

                                        <div className="mt-2 flex gap-4 text-xs font-medium">
                                            <span className="text-[#d70018] cursor-pointer hover:underline flex items-center gap-1">
                                                <i className="fas fa-comment-dots"></i> Trả lời
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Divider for next item */}
                                <div className="border-b border-gray-100 mt-4 group-last:hidden"></div>
                            </div>
                        ))
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
