import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("loading");
    const [orderInfo, setOrderInfo] = useState(null);

    useEffect(() => {
        // Parse VNPay response parameters
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const vnpTxnRef = searchParams.get("vnp_TxnRef");
        const vnpAmount = searchParams.get("vnp_Amount");
        const vnpOrderInfo = searchParams.get("vnp_OrderInfo");
        const vnpBankCode = searchParams.get("vnp_BankCode");

        if (vnpResponseCode === "00") {
            setStatus("success");
            setOrderInfo({
                orderId: vnpTxnRef,
                amount: vnpAmount ? parseInt(vnpAmount) / 100 : 0, // VNPay returns amount * 100
                bankCode: vnpBankCode,
                description: vnpOrderInfo,
            });
        } else if (vnpResponseCode) {
            setStatus("failed");
            setOrderInfo({
                orderId: vnpTxnRef,
                errorCode: vnpResponseCode,
            });
        } else {
            // No VNPay params, redirect to home
            navigate("/");
        }
    }, [searchParams, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getErrorMessage = (code) => {
        const errors = {
            "01": "Giao dịch bị từ chối",
            "02": "Merchant đóng kết nối",
            "04": "Giao dịch bị từ chối bởi ngân hàng",
            "05": "Giao dịch bị lỗi",
            "06": "Khách hàng hủy giao dịch",
            "07": "Giao dịch bị nghi ngờ",
            "09": "Giao dịch bị hủy bỏ",
        };
        return errors[code] || `Lỗi không xác định (Mã: ${code})`;
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Đang xử lý kết quả thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
                    {status === "success" ? (
                        <>
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h1>
                            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua hàng</p>

                            {orderInfo && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Mã đơn hàng:</span>
                                        <span className="font-medium">{orderInfo.orderId}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-600">Số tiền:</span>
                                        <span className="font-medium text-red-600">{formatPrice(orderInfo.amount)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Ngân hàng:</span>
                                        <span className="font-medium">{orderInfo.bankCode}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Link
                                    to="/account/orders"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                                >
                                    Xem đơn hàng
                                </Link>
                                <Link
                                    to="/"
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
                                >
                                    Về trang chủ
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Failed Icon */}
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h1>
                            <p className="text-gray-600 mb-6">
                                {orderInfo?.errorCode && getErrorMessage(orderInfo.errorCode)}
                            </p>

                            {orderInfo?.orderId && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-gray-600">
                                        Mã đơn hàng: <span className="font-medium">{orderInfo.orderId}</span>
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Link
                                    to="/cart"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
                                >
                                    Thử lại
                                </Link>
                                <Link
                                    to="/"
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
                                >
                                    Về trang chủ
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
