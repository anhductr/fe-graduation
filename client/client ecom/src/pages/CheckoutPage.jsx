import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../services/orderApi";
import { paymentApi } from "../services/paymentApi";
import { authApi } from "../services/authApi";
import { promotionApi } from "../services/promotionApi";
import { api } from "../libs/axios"; // Import api for address creation
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, items: cartItems, totalPrice: cartTotalPrice } = useCart();
    const { user, isLoggedIn } = useAuth();

    // Use selected items from state if available, otherwise fallback to all cart items
    const items = location.state?.selectedItems || cartItems;
    // Calculate total price based on the actual items being purchased
    const totalPrice = items.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);

    const [addressId, setAddressId] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Address Form State
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [addressLine, setAddressLine] = useState("");
    const [street, setStreet] = useState("");
    const [province, setProvince] = useState(null);
    const [district, setDistrict] = useState(null);
    const [ward, setWard] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

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
        if (!items || items.length === 0) return;

        const skus = items.map(item => item.sku);
        const today = new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd

        promotionApi
            .getVouchers({
                skus,
                totalAmount: totalPrice,
                today,
            })
            .then((res) => {
                console.log("🟢 Voucher response:", res.data);

                if (res.data.code === 200) {
                    setVouchers(res.data.result || []);
                }
            })
            .catch((err) => {
                console.error("🔴 Voucher error:", err);
            });
    }, [items, totalPrice]);

    // Location API Effects
    useEffect(() => {
        if (showAddressModal && isAddingAddress) {
            fetch("https://provinces.open-api.vn/api/p/")
                .then(res => res.json())
                .then(setProvinces)
                .catch(err => console.error(err));
        }
    }, [showAddressModal, isAddingAddress]);

    useEffect(() => {
        if (!province) return;
        fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
            .then(res => res.json())
            .then(data => {
                setDistricts(data.districts || []);
                setDistrict(null);
                setWard(null);
                setWards([]);
            });
    }, [province]);

    useEffect(() => {
        if (!district) return;
        fetch(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
            .then(res => res.json())
            .then(data => {
                setWards(data.wards || []);
                setWard(null);
            });
    }, [district]);

    const handleAddAddress = async () => {
        if (!receiverName || !receiverPhone || !province || !district || !ward) {
            // Simple validation feedback (could be better with toast)
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        const payload = {
            receiverName,
            receiverPhone,
            addressLine,
            street,
            ward: ward.name,
            district: district.name,
            city: province.name,
        };

        try {
            await api.post("/profile-service/address", payload);

            // Refresh address list
            const res = await authApi.getMyInfo();
            if (res.data.code === 200) {
                const addrList = res.data.result.address || [];
                setAddresses(addrList);
                // Select the new address (last one added usually, but good enough to pick the last one or by finding matches)
                // For simplicity, pick the last one
                if (addrList.length > 0) {
                    const newAddr = addrList[addrList.length - 1];
                    setSelectedAddress(newAddr);
                    setAddressId(newAddr.id);
                    localStorage.setItem("checkout_address_id", newAddr.id);
                }
            }

            setIsAddingAddress(false);
            resetAddressForm();
        } catch (err) {
            console.error("Add address error:", err);
            alert("Thêm địa chỉ thất bại");
        }
    };

    const resetAddressForm = () => {
        setReceiverName("");
        setReceiverPhone("");
        setAddressLine("");
        setStreet("");
        setProvince(null);
        setDistrict(null);
        setWard(null);
    };



    const calculateDiscount = (voucher) => {
        if (!voucher) return 0;

        let discount = 0;

        if (voucher.discountType === "DISCOUNT_PERCENT") {
            discount = (totalPrice * voucher.discountPercent) / 100;

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
        localStorage.setItem("checkout_voucher_code", voucher.voucherCode);
        setShowVoucherModal(false);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const extractVnpayUrl = (rawPaymentUrl) => {
        if (!rawPaymentUrl || typeof rawPaymentUrl !== "string") return null;

        const match = rawPaymentUrl.match(/paymentUrl=([^,}]+)/);

        return match ? match[1] : null;
    };


    const handleCheckout = async () => {
        const addressId = localStorage.getItem("checkout_address_id");

        if (!addressId) {
            setError("Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        setIsCreatingOrder(true);
        setError(null);

        try {
            const payload = {
                orderDesc: orderDesc || "",
                orderFee,
                addressId,
                paymentMethod: "VNPAY",
                voucher: selectedVoucher ? selectedVoucher.voucherCode : null,
                items: items.map((item) => ({
                    sku: item.sku,
                    quantity: item.quantity,
                    price: item.sellPrice, // Use sellPrice
                })),
            };

            console.log("Order create payload:", payload);

            const res = await orderApi.createOrder(payload);

            if (res.data.code !== 200) {
                throw new Error(res.data.message || "Tạo đơn hàng thất bại");
            }

            const rawPaymentUrl = res.data.result.paymentUrl;

            const vnpayUrl = extractVnpayUrl(rawPaymentUrl);

            if (!vnpayUrl) {
                throw new Error("Không lấy được VNPay paymentUrl");
            }

            console.log("VNPay URL:", vnpayUrl);

            window.open(vnpayUrl, "_blank");

        } catch (err) {
            console.error("Checkout error:", err);
            setError(
                err.response?.data?.message ||
                err.message ||
                "Lỗi xảy ra khi thanh toán"
            );
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const finalTotal = totalPrice + orderFee - discountAmount;

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
                                        {!isAddingAddress ? (
                                            <>
                                                {addresses.map((addr) => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => {
                                                            setSelectedAddress(addr);
                                                            setAddressId(addr.id);
                                                            localStorage.setItem("checkout_address_id", addr.id);
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

                                                <button
                                                    onClick={() => setIsAddingAddress(true)}
                                                    className="w-full py-2 mt-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                                                >
                                                    + Thêm địa chỉ mới
                                                </button>
                                            </>
                                        ) : (
                                            <div className="space-y-3 p-1">
                                                <input
                                                    placeholder="Tên người nhận"
                                                    value={receiverName}
                                                    onChange={e => setReceiverName(e.target.value)}
                                                    className="w-full border rounded p-2"
                                                />
                                                <input
                                                    placeholder="Số điện thoại"
                                                    value={receiverPhone}
                                                    onChange={e => setReceiverPhone(e.target.value)}
                                                    className="w-full border rounded p-2"
                                                />
                                                <input
                                                    placeholder="Số nhà / địa chỉ cụ thể"
                                                    value={addressLine}
                                                    onChange={e => setAddressLine(e.target.value)}
                                                    className="w-full border rounded p-2"
                                                />
                                                <input
                                                    placeholder="Tên đường"
                                                    value={street}
                                                    onChange={e => setStreet(e.target.value)}
                                                    className="w-full border rounded p-2"
                                                />

                                                <select
                                                    value={province?.code ?? ""}
                                                    onChange={(e) => {
                                                        const code = Number(e.target.value);
                                                        const selected = provinces.find(p => p.code === code);
                                                        setProvince(selected);
                                                    }}
                                                    className="w-full border rounded p-2"
                                                >
                                                    <option value="">Chọn Tỉnh / Thành phố</option>
                                                    {provinces.map(p => (
                                                        <option key={p.code} value={p.code}>{p.name}</option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={district?.code ?? ""}
                                                    onChange={(e) => {
                                                        const code = Number(e.target.value);
                                                        const selected = districts.find(d => d.code === code);
                                                        setDistrict(selected);
                                                    }}
                                                    disabled={!districts.length}
                                                    className="w-full border rounded p-2"
                                                >
                                                    <option value="">Chọn Quận / Huyện</option>
                                                    {districts.map(d => (
                                                        <option key={d.code} value={d.code}>{d.name}</option>
                                                    ))}
                                                </select>

                                                <select
                                                    value={ward?.code ?? ""}
                                                    onChange={(e) => {
                                                        const code = Number(e.target.value);
                                                        const selected = wards.find(w => w.code === code);
                                                        setWard(selected);
                                                    }}
                                                    disabled={!wards.length}
                                                    className="w-full border rounded p-2"
                                                >
                                                    <option value="">Chọn Phường / Xã</option>
                                                    {wards.map(w => (
                                                        <option key={w.code} value={w.code}>{w.name}</option>
                                                    ))}
                                                </select>

                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={handleAddAddress}
                                                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                                    >
                                                        Lưu địa chỉ
                                                    </button>
                                                    <button
                                                        onClick={() => setIsAddingAddress(false)}
                                                        className="px-4 py-2 border rounded hover:bg-gray-100"
                                                    >
                                                        Quay lại
                                                    </button>
                                                </div>
                                            </div>
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
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.productName || item.variantName || item.sku} x{item.quantity}
                                        </span>
                                        <span>
                                            {formatPrice(
                                                (item.sellPrice || item.price) * item.quantity
                                            )}
                                        </span>
                                        <span>{formatPrice(item.sellPrice * item.quantity)}</span>
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
