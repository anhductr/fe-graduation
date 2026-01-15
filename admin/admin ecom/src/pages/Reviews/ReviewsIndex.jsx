import React, { useState } from 'react';
import RatingsList from '../Ratings/RatingsList';
import CommentsList from '../Comments/CommentsList';
import { Tabs, Tab, Box } from '@mui/material';

const ReviewsIndex = () => {
    const [productId, setProductId] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [tabIndex, setTabIndex] = useState(0);

    const handleSearch = () => {
        setProductId(inputValue.trim());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Quản lý Đánh giá & Bình luận</h1>
                <p className="text-gray-600">Quản lý các đánh giá và bình luận của người dùng theo sản phẩm.</p>
            </div>

            <div className="bg-white p-4 rounded shadow mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Nhập ID sản phẩm..."
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                        onClick={handleSearch}
                        disabled={!inputValue.trim()}
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>

            {productId && (
                <div className="bg-white rounded shadow">
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabIndex} onChange={handleTabChange}>
                            <Tab label="Đánh giá (Ratings)" />
                            <Tab label="Bình luận (Comments)" />
                        </Tabs>
                    </Box>
                    <div className="p-4">
                        {tabIndex === 0 && <RatingsList productId={productId} />}
                        {tabIndex === 1 && <CommentsList productId={productId} />}
                    </div>
                </div>
            )}

            {!productId && (
                <div className="text-center text-gray-500 mt-10">
                    <p>Vui lòng nhập ID sản phẩm để xem đánh giá và bình luận.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewsIndex;
