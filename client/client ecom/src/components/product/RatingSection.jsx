import React, { useEffect, useState } from "react";
import { ratingApi } from "../../services/ratingApi";
import { CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating, Box } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify"; // Assuming toast usage or use alert

const RatingSection = ({ productId, productName }) => {
    const { user, isLoggedIn } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [content, setContent] = useState("");

    const fetchRatingSummary = async () => {
        try {
            setLoading(true);
            const res = await ratingApi.getRatingSummary(productId);
            setSummary(res.result || res);
        } catch (error) {
            console.error("Failed to fetch rating summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchRatingSummary();
        }
    }, [productId]);

    const handleOpen = () => {
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để đánh giá!");
            return;
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
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
            setOpen(false);
            setContent("");
            setUserRating(0);
            fetchRatingSummary(); // Refresh summary
        } catch (error) {
            console.error("Rating error:", error);
            alert("Gửi đánh giá thất bại: " + error.response?.data?.message || "Lỗi");
        }
    };

    if (loading) return <div className="flex justify-center p-4"><CircularProgress size={24} /></div>;

    // Instead of return null, use default values if summary is null to show "0 stars"
    const displaySummary = summary || { average: 0, totalRatings: 0, starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

    // Safe defaults
    const average = displaySummary.average || 0;
    const totalRatings = displaySummary.totalRatings || 0;
    // Handle star counts. Backend might return object { 1: 10, 2: 20... } or array
    const starCounts = displaySummary.starCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const getPercent = (count) => {
        if (totalRatings === 0) return 0;
        return (count / totalRatings) * 100;
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:space-x-8 border border-gray-200 rounded-md p-4 mb-6">
                {/* Left side: avgRating summary */}
                <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r border-[#ccc] pb-4 md:pb-0 md:pr-6 gap-2">
                    <div className="text-3xl font-semibold leading-none">
                        {average.toFixed(1)}
                        <span className="text-gray-500 text-xl">/5</span>
                    </div>
                    <div className="flex space-x-1 text-yellow-400 text-lg">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className={`fas fa-star ${star <= Math.round(average) ? "" : "text-gray-300"}`}></i>
                        ))}
                    </div>
                    <div className="text-blue-700 text-sm font-semibold underline">
                        {totalRatings} đánh giá
                    </div>

                    <Button
                        variant="contained"
                        color="error"
                        className="!bg-[#0096FF] !normal-case !mt-2"
                        onClick={handleOpen}
                    >
                        Viết đánh giá
                    </Button>
                </div>

                {/* Right side: avgRating bars */}
                <div className="flex-1 pt-4 md:pt-0">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = starCounts[star] || 0;
                        const percent = getPercent(count);
                        return (
                            <div key={star} className="flex items-center space-x-2 text-sm mb-2">
                                <span className="w-4 font-semibold">{star}</span>
                                <i className="fas fa-star text-yellow-400"></i>
                                <div className="flex-1 h-3 rounded-full bg-gray-300 overflow-hidden">
                                    <div
                                        className="h-3 bg-red-700 rounded-full"
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                                <span className="w-20 text-right text-xs text-gray-600">
                                    {count} đánh giá
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Rating Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle className="text-center font-bold">Đánh giá sản phẩm</DialogTitle>
                <DialogContent className="flex flex-col items-center gap-4 py-4">
                    <p className="font-medium">{productName}</p>
                    <Rating
                        name="user-rating"
                        value={userRating}
                        onChange={(event, newValue) => {
                            setUserRating(newValue);
                        }}
                        size="large"
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Mời bạn chia sẻ cảm nhận về sản phẩm..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions className="justify-center pb-6">
                    <Button onClick={handleClose} variant="outlined" color="inherit">Đóng</Button>
                    <Button onClick={handleSubmit} className="bg-[#0096FF]" variant="contained">Gửi đánh giá</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RatingSection;
