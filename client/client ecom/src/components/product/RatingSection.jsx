import React, { useEffect, useState } from "react";
import { ratingApi } from "../../services/ratingApi";
import { CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, Box, Avatar, Pagination } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { FaStar, FaCamera, FaCheckCircle, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const RatingSection = ({ productId, productName }) => {
    const { user, isLoggedIn } = useAuth();
    const [summary, setSummary] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [open, setOpen] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [content, setContent] = useState("");
    const [editingRating, setEditingRating] = useState(null);

    // Pagination & Filter
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState("ALL"); // ALL, HAVE_PURCHASE, STAR_FIVE, etc.

    const fetchRatingSummary = async () => {
        try {
            const res = await ratingApi.getRatingSummary(productId);
            setSummary(res.result || res);
        } catch (error) {
            console.error("Failed to fetch rating summary:", error);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await ratingApi.getRatingsByFilter(page, 5, filterType, productId);
            const result = res.result || res.data || {};
            setReviews(result.data || []);
            setTotalPages(result.totalPage || 1);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (productId) {
            setLoading(true);
            Promise.all([fetchRatingSummary(), fetchReviews()]).finally(() => setLoading(false));
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [page, filterType]);

    const handleOpen = () => {
        if (!isLoggedIn) {
            window.dispatchEvent(new Event("auth:unauthorized"));
            return;
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setContent("");
        setUserRating(5);
        setEditingRating(null);
    };

    const handleEdit = (review) => {
        setEditingRating(review);
        setUserRating(review.ratingScore);
        setContent(review.content);
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingRating) {
                await ratingApi.updateRating({
                    id: editingRating.id,
                    content: content,
                    ratingScore: userRating
                });
                toast.success("Cập nhật đánh giá thành công!");
            } else {

                const res = await ratingApi.createRating({
                    productId: productId,
                    ratingScore: userRating,
                    content: content
                });

                if (user?.avatarUrl) {
                    const newRatingId = res?.result?.id;
                    if (newRatingId) {
                        try {
                            await ratingApi.pushImageRating({
                                ratingId: newRatingId,
                                imageUrl: user.avatarUrl
                            });
                        } catch (imgErr) {
                            console.error("Failed to push rating image:", imgErr);
                        }
                    }
                }

                toast.success("Đánh giá thành công!");
            }

            handleClose();
            fetchRatingSummary();
            fetchReviews();
        } catch (error) {
            console.error("Rating error:", error);
            let msg = error.response?.data?.message || "Lỗi không xác định";

            // Translate specific error messages
            if (error.response?.data?.code === 4020 || msg === "You have rated of product") {
                msg = "Bạn đã đánh giá sản phẩm này rồi";
            }

            toast.error(editingRating ? `Cập nhật thất bại: ${msg}` : `Gửi đánh giá thất bại: ${msg}`);
        }
    };

    const handleDelete = async (reviewId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
            try {
                await ratingApi.deleteRating(reviewId);
                toast.success("Xóa đánh giá thành công");
                fetchReviews();
                fetchRatingSummary();
            } catch (err) {
                toast.error("Xóa thất bại");
            }
        }
    };

    // Defaults
    const displaySummary = summary || { averageRating: 0, totalReviews: 0, starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    const average = displaySummary.averageRating || 0;
    const totalRatings = displaySummary.totalReviews || 0;
    const starCounts = displaySummary.starCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const getPercent = (count) => {
        if (totalRatings === 0) return 0;
        return (count / totalRatings) * 100;
    };

    const FilterButton = ({ label, type }) => (
        <button
            onClick={() => { setFilterType(type); setPage(1); }}
            className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${filterType === type
                ? "bg-blue-50 border-blue-500 text-blue-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
        >
            {label}
        </button>
    );
    // Mock features for demonstration
    const getRandomFeatures = () => {
        return [
            { label: "Hiệu năng", value: "Siêu mạnh mẽ" },
            { label: "Thời lượng pin", value: "Cực khủng" },
            { label: "Chất lượng camera", value: "Chụp đẹp, chuyên nghiệp" }
        ];
    };

    function titleToColor(title) {
        if (!title) return "#f56a00";
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return "#" + "00000".substring(0, 6 - c.length) + c;
    }

    return (
        <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Đánh giá {productName}</h2>

            {/* Header / Summary Section */}
            <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Overall Rating */}
                    <div className="md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6">
                        <div className="flex items-end gap-1 mb-1">
                            <span className="text-5xl font-bold text-gray-900">{average.toFixed(1)}</span>
                            <span className="text-2xl text-gray-400 font-medium mb-1">/5</span>
                        </div>
                        <div className="flex text-yellow-400 text-lg mb-2 space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <FaStar key={star} className={star <= Math.round(average) ? "" : "text-gray-300"} />
                            ))}
                        </div>
                        <div className="text-gray-600 text-sm mb-4 font-medium">{totalRatings} lượt đánh giá</div>
                        <Button
                            variant="contained"
                            className="!bg-[#d70018] !normal-case !font-semibold !px-8 !py-2.5 !rounded-lg hover:!bg-red-700 transition-all shadow-none"
                            onClick={handleOpen}
                        >
                            Viết đánh giá
                        </Button>
                    </div>

                    {/* Star Bars */}
                    <div className="md:w-1/3 flex flex-col justify-center space-y-3 px-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = starCounts[star] || 0;
                            const percent = getPercent(count);
                            return (
                                <div key={star} className="flex items-center text-sm gap-3">
                                    <span className="w-3 font-bold text-xs text-gray-700">{star}</span>
                                    <FaStar className="text-yellow-400 text-xs" />
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#d70018] rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="w-20 text-right text-xs text-gray-400">{count} đánh giá</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feature Ratings (Mocked based on image) */}
                    <div className="md:w-1/3 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0">
                        <h4 className="font-semibold text-gray-900 mb-4 text-base">Đánh giá theo trải nghiệm</h4>
                        <div className="space-y-4">
                            {[{ label: "Hiệu năng", score: 5, count: 7 }, { label: "Thời lượng pin", score: 5, count: 7 }, { label: "Chất lượng camera", score: 5, count: 7 }].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-yellow-400 text-xs gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => <FaStar key={s} />)}
                                        </div>
                                        <span className="text-gray-400 text-xs">5/5 ({item.count} đánh giá)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 text-base">Lọc đánh giá theo</h3>
                <div className="flex flex-wrap gap-2">
                    <FilterButton label="Tất cả" type="ALL" />
                    <FilterButton label="Đã mua hàng" type="HAVE_PURCHASE" />
                    <FilterButton label="5 sao" type="STAR_FIVE" />
                    <FilterButton label="4 sao" type="STAR_FOUR" />
                    <FilterButton label="3 sao" type="STAR_THREE" />
                    <FilterButton label="2 sao" type="STAR_TWO" />
                    <FilterButton label="1 sao" type="STAR_ONE" />
                </div>
            </div>

            {/* Accessing Reviews List */}
            {loadingReviews ? (
                <div className="flex justify-center p-8"><CircularProgress /></div>
            ) : (
                <div className="space-y-4">
                    {reviews.length > 0 ? reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 py-6 last:border-0">
                            <div className="flex gap-4 items-start">
                                {/* Avatar Column */}
                                <div className="flex-shrink-0">
                                    <Avatar
                                        src={review.imageUrl}
                                        className="!w-12 !h-12 !text-lg !font-bold"
                                        style={{ backgroundColor: !review.imageUrl ? titleToColor(review.firstName) : undefined }}
                                    >
                                        {!review.imageUrl ? review.firstName.charAt(0).toUpperCase() : ""}
                                    </Avatar>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1">
                                    {/* Name & Stars */}
                                    <div className="flex flex-col gap-1 mb-2">
                                        <h4 className="font-bold text-gray-900 text-[15px]">
                                            {(review.firstName || "Người dùng") + " " + (review.lastName || "").toUpperCase()}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <div className="flex text-yellow-400 text-sm gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <FaStar key={s} className={s <= (review.ratingScore || 5) ? "" : "text-gray-300"} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {review.ratingScore === 5 ? "Tuyệt vời" :
                                                    review.ratingScore === 4 ? "Hài lòng" :
                                                        review.ratingScore === 3 ? "Bình thường" : "Không hài lòng"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Feature Tags (Mocked) */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {getRandomFeatures().map((f, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs">
                                                <span>{f.label}</span>
                                                <span className="font-semibold text-gray-800">{f.value}</span>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Review Content */}
                                    <p className="text-gray-800 text-[14px] leading-relaxed mb-2 whitespace-pre-wrap">
                                        {review.content}
                                    </p>

                                    {/* Footer: Date & Actions */}
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                        {review.createdAt && (
                                            <span className="flex items-center gap-1">
                                                <i className="far fa-clock"></i>
                                                <span>Đánh giá đã đăng vào {format(new Date(review.createdAt), "d 'tháng' M 'trước'")}</span>
                                                {/* Note: format relative time might be better with date-fns formatDistance, using literal for now to match img */}
                                            </span>
                                        )}
                                        {user?.userId && review?.userId && user.userId === review.userId && (
                                            <div className="flex gap-2 ml-auto">
                                                <span onClick={() => handleEdit(review)} className="cursor-pointer hover:text-blue-600 font-medium text-[17px]"><FaEdit /></span>
                                                {/* <span onClick={() => handleDelete(review.id)} className="cursor-pointer hover:text-red-600 font-medium">Xóa</span> */}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 py-8">Chưa có đánh giá nào cho bộ lọc này.</div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center pt-6">
                            <Button
                                variant="text"
                                className="!normal-case !text-gray-700 !bg-gray-100 !rounded-lg !px-8 !py-2 hover:!bg-gray-200"
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page >= totalPages}
                                endIcon={<span className="text-sm">›</span>}
                            >
                                Xem tất cả đánh giá
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Rating Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold text-center">
                    {editingRating ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}
                </DialogTitle>
                <DialogContent>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <p className="font-semibold text-lg">{productName}</p>
                        <Rating
                            value={userRating}
                            onChange={(event, newValue) => setUserRating(newValue)}
                            size="large"
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            placeholder="Mời bạn chia sẻ thêm cảm nhận..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button onClick={handleClose} color="inherit" className="!mr-2">Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" className="!bg-[#d70018]">
                        {editingRating ? "Cập nhật" : "Gửi đánh giá"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RatingSection;
