import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../../services/authApi";
import { orderApi } from "../../services/orderApi";

const OrderDetailModal = ({ isOpen, onClose, order }) => {
    if (!order) return null;

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // 1. Fetch User Info
    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ["myInfo"],
        queryFn: async () => {
            const res = await authApi.getMyInfo();
            return res.data.result;
        },
        enabled: isOpen, // Only fetch when modal is open
        staleTime: 5 * 60 * 1000,
    });

    // 2. Fetch Order Detail
    const { data: orderDetail, isLoading: isOrderLoading } = useQuery({
        queryKey: ["orderDetail", order.orderId],
        queryFn: async () => {
            const res = await orderApi.getOrder(order.orderId);
            return res.data.result;
        },
        enabled: isOpen && !!order.orderId,
    });

    const isLoading = isUserLoading || isOrderLoading;

    // Merge data for display: prefer detailed order data, fallback to prop data
    const displayOrder = orderDetail || order;

    const customerName = `${userData?.lastName} ${userData?.firstName}`;
    const customerPhone = userData?.phone;

    // Address có thể là string hoặc object/array tùy API, xử lý an toàn:
    const getAddressString = () => {
        if (userData?.address) {
            if (Array.isArray(userData.address) && userData.address.length > 0) {
                return `${userData.address[0].addressLine}, ${userData.address[0].city}`;
            }
        }
        return displayOrder.address || "";
    };
    const customerAddress = getAddressString();

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                style: {
                    backgroundColor: "#f3f4f6", // gray-100
                    borderRadius: "12px",
                    padding: "0",
                },
            }}
        >
            <DialogContent className="p-6 relative">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Column: Customer Info */}
                        <div className="flex-1 space-y-4">
                            <div className="bg-white rounded-xl p-5 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-gray-800">Thông tin khách hàng</h3>
                                <div className="space-y-4 text-sm text-gray-700">
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Họ và tên:</span>
                                        <span className="font-medium">{customerName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Số điện thoại:</span>
                                        <span className="font-medium">{customerPhone}</span>
                                    </div>
                                    <div className="flex justify-between pt-1">
                                        <span className="text-gray-500">Địa chỉ:</span>
                                        <span className="font-medium text-right max-w-[60%]">
                                            {customerAddress}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Payment Info */}
                        <div className="flex-1 space-y-4">
                            <div className="bg-white rounded-xl p-5 shadow-sm h-full">
                                <h3 className="font-bold text-lg mb-4 text-gray-800">Thông tin thanh toán</h3>

                                {/* Product List */}
                                <div className="bg-gray-100 rounded-lg py-2 px-4">
                                    <h4 className="font-semibold text-sm">Sản phẩm</h4>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {displayOrder.items?.map((item, index) => (
                                        <div key={index} className="flex flex-col gap-[1px]">
                                            <div className="py-2 px-4 flex justify-between items-start gap-4 text-sm border-b border-gray-200 pb-2">
                                                <div className="flex-1">
                                                    <p className="text-gray-500">Tên sản phẩm:</p>
                                                </div>
                                                <span className="font-semibold text-gray-800 shrink-0">
                                                    {item.productName}
                                                </span>
                                            </div>

                                            <div className="py-2 px-4 flex justify-between items-start gap-4 text-sm border-b border-gray-200 pb-2">
                                                <div className="flex-1">
                                                    <p className="text-gray-500">Số lượng sản phẩm:</p>
                                                </div>
                                                <span className="font-semibold text-gray-800 shrink-0">
                                                    {item.quantity}
                                                </span>
                                            </div>

                                            <div className="py-2 px-4 flex justify-between items-start gap-4 text-sm border-b border-gray-200 pb-2">
                                                <div className="flex-1">
                                                    <p className="text-gray-500">Tổng tiền hàng:</p>
                                                </div>
                                                <span className="font-semibold text-gray-800 shrink-0">
                                                    {formatPrice(displayOrder.beforePrice)}
                                                </span>
                                            </div>

                                            {displayOrder.voucherCode !== null &&
                                                <div className="py-2 px-4 flex justify-between items-start gap-4 text-sm border-b border-gray-200 pb-2">
                                                    <div className="flex-1">
                                                        <p className="text-gray-500">Mã voucher:</p>
                                                    </div>
                                                    <span className="font-semibold text-gray-800 shrink-0">
                                                        {displayOrder.voucherCode}
                                                    </span>
                                                </div>
                                            }

                                            <div className="py-2 px-4 flex justify-between items-start gap-4 text-sm pb-4">
                                                <div className="flex-1">
                                                    <p className="text-gray-500">Phí vận chuyển:</p>
                                                </div>
                                                <span className="font-semibold text-red-600 shrink-0">
                                                    {formatPrice(displayOrder.orderFee)}
                                                </span>
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-100 rounded-lg py-2 px-4">
                                    <h4 className="font-semibold text-sm">Thanh toán</h4>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                    {displayOrder.items?.map((item, index) => (
                                        <div key={index} className="flex flex-col gap-[1px]">
                                            <div className="py-2 px-4 flex justify-between items-start gap-4 text-sm border-b border-gray-200 pb-2">
                                                <div className="flex-1">
                                                    <p className="font-bold">Tổng số tiền</p>
                                                </div>
                                                <span className="font-semibold text-red-600 shrink-0">
                                                    {formatPrice(displayOrder.totalPrice || 0)}
                                                </span>
                                            </div>

                                            <div className="py-2 px-4 flex justify-between items-start gap-4 text-sm pb-2">
                                                <div className="flex-1">
                                                    <p className="font-bold">Tổng số tiền đã thanh toán</p>
                                                </div>
                                                <span className="font-semibold text-gray-500 shrink-0">
                                                    {formatPrice(displayOrder.totalPrice || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailModal;
