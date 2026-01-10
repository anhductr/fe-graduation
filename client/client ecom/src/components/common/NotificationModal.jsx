import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";
import { Snackbar, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import OtpVerificationModal from "../auth/OtpVerificationModal";

const NotificationModal = ({ isOpen, onClose }) => {
    // Mock data for notifications
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "Đơn hàng #12345 đã được giao",
            message: "Đơn hàng của bạn đã được giao thành công đến địa chỉ đăng ký.",
            time: "2 giờ trước",
            isRead: false,
            type: "order"
        },
        {
            id: 2,
            title: "Khuyến mãi 50%",
            message: "Cơ hội săn sale 50% cho tất cả các sản phẩm điện tử chỉ trong hôm nay.",
            time: "5 giờ trước",
            isRead: false,
            type: "promotion"
        },
        {
            id: 3,
            title: "Cập nhật bảo mật",
            message: "Chúng tôi đã cập nhật chính sách bảo mật mới. Vui lòng xem chi tiết.",
            time: "1 ngày trước",
            isRead: true,
            type: "system"
        },
        {
            id: 4,
            title: "Chào mừng bạn mới",
            message: "Cảm ơn bạn đã tham gia cộng đồng của chúng tôi. Nhận ngay voucher 50k.",
            time: "2 ngày trước",
            isRead: true,
            type: "system"
        },
        {
            id: 5,
            title: "Ưu đãi thành viên VIP",
            message: "Bạn đã đạt cấp độ VIP. Xem ngay các ưu đãi đặc quyền.",
            time: "3 ngày trước",
            isRead: true,
            type: "promotion"
        }
    ]);

    const { user, isLoggedIn, sendOtp } = useAuth();
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Verification Logic
    useEffect(() => {
        if (isLoggedIn && user) {
            // Check verification status (using logic from VerificationBanner)
            const isVerified = user.verified || user.status === 'ACTIVE' || user.status === true;
            const needsVerification = user.isVerified === false || user.verified === false;

            if (needsVerification) {
                // Check if notification already exists
                const existingNotif = notifications.find(n => n.type === 'verification_warning');

                if (!existingNotif) {
                    const verificationNotif = {
                        id: 'verification-warning',
                        title: "Yêu cầu xác thực tài khoản",
                        message: "Tài khoản của bạn chưa được xác thực email. Vui lòng xác thực để sử dụng đầy đủ tính năng.",
                        time: "Ngay bây giờ",
                        isRead: false,
                        type: "verification_warning",
                        actionLabel: "Xác thực ngay"
                    };
                    // Add to top of list
                    setNotifications(prev => [verificationNotif, ...prev]);
                }
            } else {
                // If verified, remove the notification if it exists
                setNotifications(prev => prev.filter(n => n.type !== 'verification_warning'));
            }
        }
    }, [isLoggedIn, user]); // Removed 'notifications' from dependency to avoid infinite loop when setting notifications

    const handleVerifyClick = async () => {
        try {
            await sendOtp({ userName: user.username || user.email });
            setIsOtpModalOpen(true);
            onClose(); // Close notification modal
        } catch (err) {
            setSnackbar({ open: true, message: "Không thể gửi mã OTP. Vui lòng thử lại sau.", severity: "error" });
        }
    };

    // Function to handle notification click actions
    const handleNotificationClick = (notif) => {
        if (notif.type === 'verification_warning') {
            handleVerifyClick();
        } else {
            markAsRead(notif.id);
        }
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, isRead: true } : notif
        ));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={onClose}
                        ></div>

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20, x: '50%' }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-[19%] top-[90px] w-[350px] bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100"
                            style={{ transformOrigin: "top right" }}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <IoNotificationsOutline className="text-xl text-blue-600" />
                                    <h3 className="font-semibold text-gray-800">Thông báo</h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <IoMdCheckmarkCircleOutline />
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                            </div>

                            {/* List */}
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    <ul>
                                        {notifications.map((notif) => (
                                            <li
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-blue-50/30' : ''
                                                    } ${notif.type === 'verification_warning' ? 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100/50' : ''}`}
                                            >
                                                {!notif.isRead && (
                                                    <span className={`absolute left-2 top-6 w-2 h-2 rounded-full ${notif.type === 'verification_warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                                                )}
                                                <div className={`flex flex-col gap-1 ${!notif.isRead ? 'pl-2' : ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                                                            } ${notif.type === 'verification_warning' ? 'text-yellow-800' : ''}`}>
                                                            {notif.title}
                                                        </h4>
                                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                            {notif.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    {notif.actionLabel && (
                                                        <div className="mt-2">
                                                            <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded font-semibold hover:bg-yellow-600 transition-colors inline-block">
                                                                {notif.actionLabel}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <IoNotificationsOutline className="text-4xl mx-auto mb-2 opacity-30" />
                                        <p>Không có thông báo nào</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full py-1">
                                    Xem tất cả
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                username={user?.username || user?.email}
            />
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default NotificationModal;
