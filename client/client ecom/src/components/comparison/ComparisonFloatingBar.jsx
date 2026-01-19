import React, { useState } from 'react';
import { useComparison } from '../../context/ComparisonContext';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { IoMdClose, IoMdAdd } from 'react-icons/io';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

const ComparisonFloatingBar = () => {
    const { compareList, removeFromCompare, clearComparison } = useComparison();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Only show if there is at least one item
    if (compareList.length === 0) return null;

    const MAX_SLOTS = 3;
    const items = [...compareList];
    // Fill the rest with null to render empty slots
    while (items.length < MAX_SLOTS) {
        items.push(null);
    }

    if (isCollapsed) {
        return (
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-lg border border-gray-200 px-6 py-2 flex items-center gap-4 animate-fade-in-up">
                <span className="font-semibold text-gray-700">So sánh ({compareList.length})</span>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIsCollapsed(false)}
                    endIcon={<IoChevronUp />}
                    className="!text-gray-600 !border-gray-300 !normal-case"
                >
                    Mở rộng
                </Button>
                <Link to="/compare">
                    <Button
                        variant="contained"
                        size="small"
                        className="!bg-[#d70018] !text-white !normal-case !font-bold"
                    >
                        So sánh ngay
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pb-4 pointer-events-none">
            {/* Main Container - pointer-events-auto needed because parent has none */}
            <div className="bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded-xl p-4 flex items-center gap-4 pointer-events-auto border border-gray-100 max-w-[95%] lg:max-w-[80%]">

                {/* Product Slots */}
                <div className="flex gap-4">
                    {items.map((product, index) => {
                        if (product) {
                            return (
                                <div key={product.id} className="relative w-[140px] h-[100px] border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center bg-white">
                                    <button
                                        onClick={() => removeFromCompare(product.id)}
                                        className="absolute top-1 right-1 text-gray-400 hover:text-red-500 bg-gray-100 rounded-full p-0.5"
                                    >
                                        <IoMdClose size={14} />
                                    </button>
                                    <img
                                        src={product.thumbnailUrl || product.thumbnails?.[0] || product.thumbnail || product.imageList?.[0] || "https://via.placeholder.com/50"}
                                        alt={product.name}
                                        className="h-10 object-contain mb-1"
                                    />
                                    <span className="text-[10px] text-center leading-tight line-clamp-2 text-gray-700 font-medium h-[26px] overflow-hidden">
                                        {product.name}
                                    </span>
                                    <span className="text-[10px] text-[#d70018] font-bold">
                                        {(product.sellPrice || product.price || 0).toLocaleString()}đ
                                    </span>
                                </div>
                            );
                        } else {
                            return (
                                <div key={`empty-${index}`} className="w-[140px] h-[100px] border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 cursor-default">
                                    <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                                        <IoMdAdd size={14} />
                                    </div>
                                    <span className="text-[10px] text-gray-400 text-center px-2">
                                        Chọn sản phẩm so sánh
                                    </span>
                                </div>
                            );
                        }
                    })}
                </div>

                {/* Divider */}
                <div className="w-[1px] h-16 bg-gray-200 mx-2"></div>

                {/* Actions */}
                <div className="flex flex-col items-center min-w-[140px] gap-2">
                    <span className="text-sm font-medium text-gray-600">
                        Đã chọn {compareList.length} sản phẩm
                    </span>
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="outlined"
                            className="!text-gray-600 !border-gray-300 !normal-case !text-xs !py-1 !h-[36px] flex-1"
                            onClick={() => setIsCollapsed(true)}
                        >
                            Thu gọn
                        </Button>
                        <Link to="/compare" className="flex-1">
                            <Button
                                variant="contained"
                                className="!bg-[#d70018] !text-white !normal-case !font-bold !text-xs !py-1 !h-[36px] w-full"
                            >
                                So sánh
                            </Button>
                        </Link>
                    </div>
                    <button
                        onClick={clearComparison}
                        className="text-[11px] text-gray-400 hover:text-red-500 hover:underline"
                    >
                        Xóa tất cả sản phẩm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComparisonFloatingBar;
