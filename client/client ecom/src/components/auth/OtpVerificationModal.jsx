import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Snackbar, Alert } from "@mui/material";

const OtpVerificationModal = ({ isOpen, onClose, username }) => {
    const { verifyOtp, isVerifyOtpLoading, sendOtp } = useAuth();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        let timer;
        if (isOpen && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Mã OTP phải có 6 chữ số.");
            return;
        }
        try {
            await verifyOtp({ username, otp });
            setSnackbar({ open: true, message: "Xác thực email thành công!", severity: "success" });
            setTimeout(() => onClose(), 1500); // Close modal after delay
        } catch (err) {
            const msg = err.response?.data?.message || "Xác thực thất bại. Vui lòng thử lại.";
            setError(msg);
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    };

    const handleResend = async () => {
        try {
            await sendOtp({ userName: username });
            setTimeLeft(300);
            setError(null);
            setSnackbar({ open: true, message: "Đã gửi lại mã OTP.", severity: "success" });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Gửi lại mã thất bại.", severity: "error" });
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30" onClick={onClose}></div>
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-96 p-6">
                <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Xác thực Email</h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    Nhập mã OTP 6 số đã gửi đến email của bạn.
                </p>

                <form onSubmit={handleVerify}>
                    <div className="flex justify-center mb-6">
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setOtp(val);
                                if (error) setError(null);
                            }}
                            className="text-center text-2xl tracking-widest w-40 border-b-2 border-gray-300 focus:border-red-600 focus:outline-none py-2 text-black"
                            placeholder="000000"
                        />
                    </div>

                    {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}

                    <div className="text-center mb-6">
                        <span className="text-gray-500 text-sm">Mã hết hạn sau: </span>
                        <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={isVerifyOtpLoading || otp.length !== 6}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50 mb-3"
                    >
                        {isVerifyOtpLoading ? "Đang xác thực..." : "Xác thực ngay"}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Gửi lại mã
                        </button>
                    </div>
                </form>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>
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

export default OtpVerificationModal;
