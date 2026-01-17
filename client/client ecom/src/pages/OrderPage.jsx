import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { orderApi } from "../services/orderApi";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function OrderPage() {
    const { user } = useAuth();
    const [active, setActive] = useState("Tất cả");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const tabs = [
        { label: "Tất cả", status: undefined },
        { label: "Chờ thanh toán", status: "PENDING" },
        { label: "Đang xử lý", status: "PROCESSING" },
        { label: "Đang giao hàng", status: "DELIVERED" },
        { label: "Hoàn tất", status: "COMPLETED" },
        { label: "Đã hủy", status: "CANCELLED" },
        { label: "Hoàn tiền", status: "REFUNDED" },
        // { label: "Trả hàng", status: "RETURNED" },
    ];

    const currentTab = tabs.find(t => t.label === active);

    const { data: ordersData, isLoading, error } = useQuery({
        queryKey: ["orders", currentTab?.status],
        queryFn: async () => {
            const params = {
                page: 1,
                size: 20,
            };
            if (currentTab?.status) {
                params.status = currentTab.status;
            }
            console.log("Call get-my-order with params:", params);
            const res = await orderApi.getMyOrders(params);
            console.log("API response:", res.data);
            return res.data.result;
        },
    });

    const handlePayOrder = (order) => {
        const itemSubtotal = order.items.reduce(
            (sum, item) => sum + item.sellPrice * item.quantity,
            0
        );

        console.log("CLICK PAY ORDER:", order, itemSubtotal);
        navigate("/checkout", {
            state: {
                source: "order",
                orderId: order.orderId,
                items: order.items,
                subtotal: itemSubtotal,
                orderDesc: order.orderDesc || "",
                orderFee: order.orderFee || 0,
            },
        });
    };

    const handleCancelOrder = async (orderId) => {
        const confirmCancel = window.confirm(
            "Bạn có chắc chắn muốn hủy đơn hàng này?"
        );
        if (!confirmCancel) return;

        try {
            await orderApi.cancelOrder(orderId);

            alert("Hủy đơn hàng thành công");

            queryClient.invalidateQueries(["orders"]);
        } catch (err) {
            console.error("Cancel order error:", err);
            alert(
                err.response?.data?.message ||
                "Không thể hủy đơn hàng"
            );
        }
    };


    const orders = ordersData?.data || [];

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getStatusColor = (status) => ({
        PENDING: "bg-yellow-100 text-yellow-800",
        PROCESSING: "bg-blue-100 text-blue-800",
        COMPLETED: "bg-green-100 text-green-800",
        DELIVERED: "bg-emerald-100 text-emerald-800",
        CANCELLED: "bg-red-100 text-red-800",
        REFUNDED: "bg-gray-100 text-gray-800",
        RETURNED: "bg-orange-100 text-orange-800",
    }[status] || "bg-gray-100 text-gray-800");

    const getStatusLabel = (status) => ({
        PENDING: "Chờ thanh toán",
        PROCESSING: "Đang xử lý",
        DELIVERED: "Đang giao hàng",
        COMPLETED: "Hoàn tất",
        CANCELLED: "Đã hủy",
        REFUNDED: "Hoàn tiền",
        RETURNED: "Trả hàng",
    }[status] || status);

    return (
        <>
            <div className="flex flex-col gap-3">
                <div className="w-full flex justify-between items-center">
                    <div className="text-[29px] font-bold">
                        Đơn hàng của tôi
                    </div>

                    <div className="flex items-center w-full max-w-md bg-white rounded-full shadow px-4 py-2">
                        <input
                            type="text"
                            placeholder="Tìm theo tên đơn, mã đơn hoặc tên sản phẩm"
                            className="flex-grow outline-none text-gray-600 placeholder-gray-400 text-sm"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white rounded-t-lg shadow pt-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => setActive(tab.label)}
                            className={`pb-3 flex-1 font-medium transition ${active === tab.label
                                ? "text-[#03A9F4] border-b-2 border-[#03A9F4]"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[10px] shadow w-full flex flex-col p-5 gap-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">
                            Lỗi tải đơn hàng: {error.message}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p>Không có đơn hàng nào</p>
                            <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.orderId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Mã đơn: <span className="font-medium text-gray-800">{order.orderId}</span></p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                        {getStatusLabel(order.orderStatus)}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-3">
                                    {order.items?.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.productName || item.sku}</p>
                                                <p className="text-xs text-gray-500">x{item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium">{formatPrice(item.subTotal || item.sellPrice * item.quantity)}</p>
                                        </div>
                                    ))}
                                    {order.items?.length > 2 && (
                                        <p className="text-xs text-gray-500">+{order.items.length - 2} sản phẩm khác</p>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t">
                                    <p className="text-sm">
                                        Tổng: <span className="font-bold text-red-600">{formatPrice(order.totalPrice || order.totalAmount)}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        {active === "Chờ thanh toán" && (
                                            <button
                                                onClick={() => handlePayOrder(order)}
                                                className="px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                                            >
                                                Thanh toán
                                            </button>
                                        )}
                                        {active === "Đang xử lý" && (
                                            <button
                                                onClick={() => handleCancelOrder(order.orderId)}
                                                className="px-4 py-1.5 border border-red-500 text-red-600 text-sm rounded
                 hover:bg-red-50 transition"
                                            >
                                                Hủy đơn
                                            </button>
                                        )}
                                        <button className="px-4 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50 transition">
                                            Chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
