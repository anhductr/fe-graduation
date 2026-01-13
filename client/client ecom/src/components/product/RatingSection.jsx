import React, { useEffect, useState } from "react";
import { ratingApi } from "../../services/ratingApi";
import { CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, Box, Avatar, Pagination } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { FaStar, FaCamera, FaCheckCircle } from "react-icons/fa";

const RatingSection = ({ productId, productName }) => {
    const { user, isLoggedIn } = useAuth();
    const [summary, setSummary] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [open, setOpen] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [content, setContent] = useState("");

    // Pagination & Filter
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterType, setFilterType] = useState("ALL"); // ALL, HAS_IMAGE, BOUGHT, 5_STAR, etc.

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
    };

    const handleSubmit = async () => {
        if (!user?.id) return;

        try {
            await ratingApi.createRating({
                productId: productId,
                ratingScore: userRating,
                content: content
            });
            alert("Đánh giá thành công!");
            handleClose();
            fetchRatingSummary();
            fetchReviews();
        } catch (error) {
            console.error("Rating error:", error);
            alert("Gửi đánh giá thất bại: " + (error.response?.data?.message || "Lỗi"));
        }
    };

    // Defaults
    const displaySummary = summary || { average: 0, totalRatings: 0, starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    const average = displaySummary.average || 0;
    const totalRatings = displaySummary.totalRatings || 0;
    const starCounts = displaySummary.starCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const getPercent = (count) => {
        if (totalRatings === 0) return 0;
        return (count / totalRatings) * 100;
    };

    const FilterButton = ({ label, type, count }) => (
        <button
            onClick={() => { setFilterType(type); setPage(1); }}
            className={`px-4 py-1 rounded-full border text-sm whitespace-nowrap transition-colors ${filterType === type
                ? "bg-blue-50 border-[#0096FF] text-[#0096FF] font-medium"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-white rounded-lg">
            <h2 className="font-bold text-xl text-gray-900 mb-6">Đánh giá {productName}</h2>
            {/* Header / Summary Section */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Overall Rating */}
                    <div className="md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                            {average.toFixed(1)}<span className="text-2xl text-gray-400 font-normal">/5</span>
                        </div>
                        <div className="flex text-yellow-400 text-xl mb-2 space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <FaStar key={star} className={star <= Math.round(average) ? "" : "text-gray-300"} />
                            ))}
                        </div>
                        <div className="text-gray-500 text-sm mb-4">{totalRatings} đánh giá</div>
                        <Button
                            variant="contained"
                            className="!bg-[#e0052b] !normal-case !font-semibold !px-6 !py-2 !rounded-[8px]"
                            onClick={handleOpen}
                        >
                            Viết đánh giá
                        </Button>
                    </div>

                    {/* Star Bars */}
                    <div className="md:w-1/3 flex flex-col justify-center space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = starCounts[star] || 0;
                            const percent = getPercent(count);
                            return (
                                <div key={star} className="flex items-center text-sm">
                                    <span className="w-6 font-bold text-xs mr-2">{star} ★</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#d70018] rounded-full"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="w-16 text-right text-xs text-gray-500 ml-2">{count} đg</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feature Ratings (Mocked for UI) */}
                    <div className="md:w-1/3 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0">
                        <h4 className="font-semibold text-gray-900 mb-4">Đánh giá theo trải nghiệm</h4>
                        <div className="space-y-3">
                            {[{ label: "Hiệu năng", score: 5, count: 7 }, { label: "Thời lượng pin", score: 5, count: 7 }, { label: "Chất lượng camera", score: 5, count: 7 }].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">{item.label}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-yellow-400 text-xs">
                                            {[1, 2, 3, 4, 5].map(s => <FaStar key={s} />)}
                                        </div>
                                        <span className="text-gray-500 text-xs">5/5 ({item.count} đánh giá)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6 overflow-x-auto">
                <div className="flex gap-3 pb-2">
                    <h3 className="font-semibold text-gray-900 mr-2 content-center whitespace-nowrap">Lọc đánh giá theo:</h3>
                    <FilterButton label="Tất cả" type="ALL" />
                    <FilterButton label="Có hình ảnh" type="IMAGE" />
                    <FilterButton label="Đã mua hàng" type="PURCHASED" />
                    <FilterButton label="5 sao" type="5_STAR" />
                    <FilterButton label="4 sao" type="4_STAR" />
                    <FilterButton label="3 sao" type="3_STAR" />
                    <FilterButton label="2 sao" type="2_STAR" />
                    <FilterButton label="1 sao" type="1_STAR" />
                </div>
            </div>

            {/* Accessing Reviews List */}
            {loadingReviews ? (
                <div className="flex justify-center p-8"><CircularProgress /></div>
            ) : (
                <div className="space-y-6">
                    {reviews.length > 0 ? reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex gap-4">
                                <Avatar
                                    src={review.userAvatar}
                                    className="!bg-yellow-600 !w-10 !h-10 !text-sm"
                                >
                                    {review.userName ? review.userName.charAt(0).toUpperCase() : "U"}
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900">{review.userName || "Người dùng"}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex text-yellow-400 text-sm">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <FaStar key={s} className={s <= (review.ratingScore || 5) ? "" : "text-gray-300"} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                            Tuyệt vời
                                        </span>
                                    </div>

                                    {/* Feature Tags - dynamic or mocked */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Hiệu năng Siêu mạnh mẽ</span>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Thời lượng pin Cực khủng</span>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Chất lượng camera Chụp đẹp</span>
                                    </div>

                                    <p className="text-gray-800 text-sm leading-relaxed mb-2">
                                        {review.content}
                                    </p>

                                    <div className="text-xs text-gray-400 flex gap-4 mt-2">
                                        {review.createdDate && (
                                            <span className="flex items-center gap-1">
                                                <i className="far fa-clock"></i>
                                                Đánh giá đã đăng vào {format(new Date(review.createdDate), "dd/MM/yyyy")}
                                            </span>
                                        )}
                                        <span className="text-blue-500 cursor-pointer hover:underline">Thảo luận</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 py-8">Chưa có đánh giá nào cho bộ lọc này.</div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outlined"
                                className="!normal-case !text-gray-600 !border-gray-300 !rounded-lg !px-6"
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page >= totalPages}
                                endIcon={<span className="text-xs">›</span>}
                            >
                                Xem tất cả đánh giá
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Rating Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold text-center">Đánh giá sản phẩm</DialogTitle>
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
                    <Button onClick={handleSubmit} variant="contained" className="!bg-[#d70018]">Gửi đánh giá</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RatingSection;
