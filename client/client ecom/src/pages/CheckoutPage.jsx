import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../services/orderApi";
import { paymentApi } from "../services/paymentApi";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, items, totalPrice } = useCart();
    const { user, isLoggedIn } = useAuth();

    const [addressId, setAddressId] = useState("");
    const [voucher, setVoucher] = useState("");
    const [orderDesc, setOrderDesc] = useState("");
    const [orderFee, setOrderFee] = useState(30000); // Default shipping fee
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [error, setError] = useState(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: location.pathname } });
        }
    }, [isLoggedIn, navigate, location]);

    // Redirect if cart is empty
    useEffect(() => {
        if (!items || items.length === 0) {
            navigate("/cart");
        }
    }, [items, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleCheckout = async () => {
        if (!addressId) {
            setError("Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        setIsCreatingOrder(true);
        setError(null);

        try {
            // 1. Create order
            const orderData = {
                orderDate: new Date().toISOString(),
                orderDesc: orderDesc || "Đơn hàng online",
                orderFee,
                addressId,
                voucher: voucher || undefined,
                items: items.map((item) => ({
                    sku: item.sku,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };

            const orderResponse = await orderApi.createOrder(orderData);

            if (orderResponse.data.code !== 200) {
                throw new Error(orderResponse.data.message || "Tạo đơn hàng thất bại");
            }

            const orderId = orderResponse.data.result.id;

            // 2. Create payment
            const paymentResponse = await paymentApi.createPayment({
                method: "VNPAY",
                orderId,
            });

            if (paymentResponse.data.code !== 200) {
                throw new Error(paymentResponse.data.message || "Khởi tạo thanh toán thất bại");
            }

            // 3. Redirect to VNPay
            const paymentUrl = paymentResponse.data.result.paymentUrl;
            window.location.href = paymentUrl;

        } catch (err) {
            console.error("Checkout error:", err);
            setError(err.response?.data?.message || err.message || "Lỗi xảy ra khi thanh toán");
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const finalTotal = totalPrice + orderFee;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Địa chỉ giao hàng</h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Nhập ID địa chỉ (tạm thời)"
                                    value={addressId}
                                    onChange={(e) => setAddressId(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {/* TODO: Replace with address selector component */}
                            </div>
                        </div>

                        {/* Voucher */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Mã giảm giá</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nhập mã voucher"
                                    value={voucher}
                                    onChange={(e) => setVoucher(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition">
                                    Áp dụng
                                </button>
                            </div>
                        </div>

                        {/* Order Note */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Ghi chú đơn hàng</h2>
                            <textarea
                                placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                                value={orderDesc}
                                onChange={(e) => setOrderDesc(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

                            {/* Items */}
                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.productName || item.sku} x{item.quantity}
                                        </span>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            {/* Subtotal */}
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Tạm tính</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>

                            {/* Shipping */}
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span>{formatPrice(orderFee)}</span>
                            </div>

                            <hr className="my-4" />

                            {/* Total */}
                            <div className="flex justify-between text-lg font-bold mb-6">
                                <span>Tổng cộng</span>
                                <span className="text-red-600">{formatPrice(finalTotal)}</span>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isCreatingOrder || !addressId}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingOrder ? "Đang xử lý..." : "Thanh toán với VNPay"}
                            </button>

                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Bạn sẽ được chuyển đến cổng thanh toán VNPay
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
