import React, { useMemo } from 'react';
import { useComparison } from '../context/ComparisonContext';
import Navbar from '../layouts/Navbar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { IoMdClose } from 'react-icons/io';

const ComparisonPage = () => {
    const { compareList, removeFromCompare, clearComparison } = useComparison();

    const allSpecs = useMemo(() => {
        const specs = new Set();
        compareList.forEach(product => {
            if (product.specifications) {
                product.specifications.forEach(spec => {
                    specs.add(spec.name || spec.key);
                });
            }
        });
        return Array.from(specs);
    }, [compareList]);

    const getSpecValue = (product, specName) => {
        if (!product.specifications) return "N/A";
        const spec = product.specifications.find(s => (s.name || s.key) === specName);
        return spec ? spec.value : "-";
    };

    if (compareList.length === 0) {
        return (
            <>
                <Navbar />
                <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 2 0 01.707.293l5.414 5.414a1 2 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">Chưa có sản phẩm nào để so sánh</h2>
                    <p className="mb-8 text-gray-500 max-w-md">Thêm ít nhất 2 sản phẩm vào danh sách so sánh để thấy sự khác biệt về thông số kỹ thuật.</p>
                    <Link to="/">
                        <Button variant="contained" className="!bg-[#d70018] !text-white !font-bold !px-8 !py-3 !rounded-lg !normal-case text-lg shadow-lg hover:shadow-xl transition-all">
                            Tiếp tục mua sắm
                        </Button>
                    </Link>
                </div>
            </>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            <Navbar />
            <div className="container mx-auto px-4 py-6">
                <Breadcrumbs pagename="So sánh sản phẩm" />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                        <h1 className="text-2xl font-bold text-gray-800">
                            So sánh sản phẩm <span className="text-gray-500 text-lg font-normal">({compareList.length} sản phẩm)</span>
                        </h1>
                        <Button
                            variant="text"
                            color="error"
                            onClick={clearComparison}
                            className="!normal-case !text-red-500 hover:!bg-red-50"
                        >
                            Xóa tất cả
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="p-4 w-[250px] min-w-[200px] bg-gray-50 text-left font-semibold text-gray-600 sticky left-0 z-10 border-b border-r border-gray-200">
                                        Đặc điểm
                                    </th>
                                    {compareList.map(product => (
                                        <th key={product.id} className="p-6 w-[300px] min-w-[280px] align-top relative border-b border-r border-gray-100 last:border-r-0 bg-white">
                                            <button
                                                onClick={() => removeFromCompare(product.id)}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                                                title="Xóa sản phẩm này"
                                            >
                                                <IoMdClose size={20} />
                                            </button>
                                            <div className="flex flex-col items-center">
                                                <Link to={`/${product.name}`} state={{ productId: product.id, productName: product.name }} className="block mb-4 group relative">
                                                    <div className="w-40 h-40 flex items-center justify-center p-2 transition-transform group-hover:scale-105 duration-300">
                                                        <img
                                                            src={product.thumbnailUrl || product.thumbnails?.[0] || product.thumbnail || (product.imageList?.[0]) || "https://via.placeholder.com/150"}
                                                            alt={product.name}
                                                            className="max-w-full max-h-full object-contain drop-shadow-sm"
                                                        />
                                                    </div>
                                                </Link>
                                                <Link to={`/${product.name}`} state={{ productId: product.id, productName: product.name }} className="text-gray-800 font-bold hover:text-[#d70018] line-clamp-2 text-center text-base min-h-[48px] mb-2 px-2 transition-colors leading-snug">
                                                    {product.name}
                                                </Link>
                                                <p className="text-[#d70018] font-bold text-xl mb-4">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.sellPrice || product.price || 0)}
                                                </p>
                                                <Link to={`/${product.name}`} state={{ productId: product.id, productName: product.name }} className="w-full">
                                                    <Button variant="contained" className="!w-full !bg-[#d70018] !normal-case !font-semibold !rounded-lg !shadow-none hover:!shadow-md">
                                                        Mua ngay
                                                    </Button>
                                                </Link>
                                            </div>
                                        </th>
                                    ))}
                                    {/* Create empty columns to maintain layout if less than 3 products */}
                                    {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, idx) => (
                                        <th key={`empty-${idx}`} className="p-6 w-[300px] min-w-[280px] align-middle items-center justify-center border-b border-r border-gray-100 last:border-r-0 bg-gray-50/30">
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-8 min-h-[300px]">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                </div>
                                                <span className="text-sm font-medium">Thêm sản phẩm</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-gray-100/50">
                                    <td colSpan={compareList.length + 1 + Math.max(0, 3 - compareList.length)} className="p-3 bg-gray-200/50 font-bold text-gray-700 uppercase text-xs tracking-wider sticky left-0 z-10 px-4">
                                        Thông số kỹ thuật
                                    </td>
                                </tr>
                                {allSpecs.length > 0 ? (
                                    allSpecs.map((specName, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-4 border-b border-r border-gray-100 text-gray-600 font-medium bg-white sticky left-0 group-hover:bg-gray-50 transition-colors z-10">
                                                {specName}
                                            </td>
                                            {compareList.map(product => (
                                                <td key={product.id} className="p-4 border-b border-r border-gray-100 text-center text-gray-800 last:border-r-0 bg-white group-hover:bg-gray-50 transition-colors">
                                                    {getSpecValue(product, specName)}
                                                </td>
                                            ))}
                                            {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, idx) => (
                                                <td key={`empty-cell-${idx}`} className="p-4 border-b border-r border-gray-100 last:border-r-0 bg-white group-hover:bg-gray-50"></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="p-8 text-center text-gray-500 italic">
                                            Không có thông tin kỹ thuật để so sánh
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;
