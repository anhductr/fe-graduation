import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../services/orderApi";
import { paymentApi } from "../services/paymentApi";
import { authApi } from "../services/authApi";
import { promotionApi } from "../services/promotionApi";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, items, totalPrice } = useCart();
    const { user, isLoggedIn } = useAuth();
    const { selectedItems, subtotal } = location.state || {};
    const checkoutItems = selectedItems && selectedItems.length > 0
        ? selectedItems
        : items;
    const checkoutSubtotal =
        typeof subtotal === "number"
            ? subtotal
            : totalPrice;
    const checkoutState = location.state;

    const skuList = checkoutItems.map(item => item.sku).join(",");
    const today = new Date()
        .toLocaleDateString("en-CA");
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);


    const [addressId, setAddressId] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
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
        if (
            (!location.state || !location.state.selectedItems) &&
            (!items || items.length === 0)
        ) {
            navigate("/cart");
        }
    }, [location.state, items, navigate]);


    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await authApi.getMyInfo();
                if (res.data.code === 200) {
                    const addrList = res.data.result.address || [];
                    setAddresses(addrList);

                    if (addrList.length > 0) {
                        setSelectedAddress(addrList[0]);
                        setAddressId(addrList[0].id);
                    }
                }
            } catch (err) {
                console.error("Fetch addresses error:", err);
            }
        };

        if (isLoggedIn) {
            fetchAddresses();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!checkoutItems || checkoutItems.length === 0) return;

        const fetchVouchers = async () => {
            try {
                const res = await promotionApi.getVouchers({
                    skus: checkoutItems.map(i => i.sku).join(","),
                    totalAmount: checkoutSubtotal,
                    today,
                });

                console.log("Voucher API response:", res.data);

                if (res.data.code === 200) {
                    setVouchers(res.data.result || []);
                }
            } catch (err) {
                console.error("Fetch voucher error:", err);
            }
        };

        fetchVouchers();
    }, [checkoutItems, checkoutSubtotal, today]);


    const calculateDiscount = (voucher) => {
        if (!voucher) return 0;

        let discount = 0;

        if (voucher.discountType === "DISCOUNT_PERCENT") {
            discount = (checkoutSubtotal * voucher.discountPercent) / 100;

            if (voucher.maxDiscountAmount) {
                discount = Math.min(discount, voucher.maxDiscountAmount);
            }
        }

        if (voucher.discountType === "DISCOUNT_FIXED") {
            discount = voucher.fixedAmount;
        }

        return Math.floor(discount);
    };

    const handleSelectVoucher = (voucher) => {
        setSelectedVoucher(voucher);
        setDiscountAmount(calculateDiscount(voucher));
        setShowVoucherModal(false);
    };

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
                voucher: selectedVoucher?.voucherCode,
                items: checkoutItems.map((item) => ({
                    sku: item.sku,
                    quantity: item.quantity,
                    price: item.sellPrice || item.price,
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

    const finalTotal = checkoutSubtotal + orderFee - discountAmount;

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

                            {selectedAddress ? (
                                <div className="border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">
                                            {selectedAddress.receiverName} - {selectedAddress.receiverPhone}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {selectedAddress.addressLine}, {selectedAddress.street},{" "}
                                            {selectedAddress.ward}, {selectedAddress.district},{" "}
                                            {selectedAddress.city}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddressModal(true)}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        Thay đổi
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAddressModal(true)}
                                    className="w-full border border-dashed border-gray-400 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    + Chọn địa chỉ giao hàng
                                </button>
                            )}
                        </div>

                        {showAddressModal && (
                            <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50">
                                <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Chọn địa chỉ giao hàng</h3>

                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => {
                                                    setSelectedAddress(addr);
                                                    setAddressId(addr.id);
                                                    setShowAddressModal(false);
                                                }}
                                                className={`border rounded-lg p-4 cursor-pointer hover:border-blue-500 ${selectedAddress?.id === addr.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : ""
                                                    }`}
                                            >
                                                <p className="font-semibold">
                                                    {addr.receiverName} - {addr.receiverPhone}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {addr.addressLine}, {addr.street},{" "}
                                                    {addr.ward}, {addr.district}, {addr.city}
                                                </p>
                                            </div>
                                        ))}

                                        {addresses.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center">
                                                Bạn chưa có địa chỉ nào
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2 mt-6">
                                        <button
                                            onClick={() => setShowAddressModal(false)}
                                            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Voucher */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Mã giảm giá</h2>

                            {selectedVoucher ? (
                                <div className="border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{selectedVoucher.name}</p>
                                        <p className="text-sm text-gray-600">
                                            Mã: {selectedVoucher.voucherCode}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowVoucherModal(true)}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        Thay đổi
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowVoucherModal(true)}
                                    className="w-full border border-dashed border-gray-400 py-3 rounded-lg text-gray-600"
                                >
                                    + Chọn voucher
                                </button>
                            )}
                        </div>

                        {showVoucherModal && (
                            <div className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50">
                                <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Chọn voucher</h3>

                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {vouchers.map(v => (
                                            <div
                                                key={v.id}
                                                onClick={() => handleSelectVoucher(v)}
                                                className={`border rounded-lg p-4 cursor-pointer hover:border-blue-500
              ${selectedVoucher?.id === v.id ? "border-blue-500 bg-blue-50" : ""}`}
                                            >
                                                <p className="font-semibold">{v.name}</p>
                                                <p className="text-sm text-gray-600">{v.descriptions}</p>
                                                <p className="text-sm text-red-600">
                                                    Giảm {v.discountPercent}% (tối đa {formatPrice(v.maxDiscountAmount)})
                                                </p>
                                            </div>
                                        ))}

                                        {vouchers.length === 0 && (
                                            <p className="text-center text-gray-500 text-sm">
                                                Không có voucher phù hợp
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => setShowVoucherModal(false)}
                                            className="px-4 py-2 border rounded-lg"
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


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
                                {checkoutItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.productName || item.variantName || item.sku} x{item.quantity}
                                        </span>
                                        <span>
                                            {formatPrice(
                                                (item.sellPrice || item.price) * item.quantity
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            {/* Subtotal */}
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Tạm tính</span>
                                <span>{formatPrice(checkoutSubtotal)}</span>
                            </div>

                            {/* Shipping */}
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span>{formatPrice(orderFee)}</span>
                            </div>

                            {selectedVoucher && (
                                <div className="flex justify-between mb-2 text-green-600">
                                    <span>Giảm giá</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}

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
