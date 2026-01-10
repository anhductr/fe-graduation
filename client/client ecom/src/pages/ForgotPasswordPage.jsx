import React, { useState, useEffect } from "react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import { authApi } from "../services/authApi";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [resetToken, setResetToken] = useState(null);

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await authApi.sendForgotPasswordOtp({ email });
            setStep(2);
            setTimer(300); // Reset timer
        } catch (err) {
            setError(err.response?.data?.message || "Gửi OTP thất bại. Vui lòng kiểm tra lại email.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.forgotPasswordVerify({ email, otp });
            // Check based on user request response structure: result: { email, token, authenticated }
            if (response.data?.result?.authenticated && response.data?.result?.token) {
                setResetToken(response.data.result.token);
                setStep(3);
            } else {
                setError("OTP không hợp lệ hoặc đã hết hạn.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Xác thực OTP thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await authApi.submitResetPassword({ newPassword }, resetToken);
            alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Đặt lại mật khẩu thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.sendForgotPasswordOtp({ email });
            setTimer(300);
            alert("Đã gửi lại mã OTP.");
        } catch (err) {
            setError(err.response?.data?.message || "Gửi lại OTP thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="component-container">
            <Navbar />
            <div className="flex justify-center items-center min-h-[60vh] py-10">
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                        {step === 1 && "Quên Mật Khẩu"}
                        {step === 2 && "Xác Thực OTP"}
                        {step === 3 && "Đặt Lại Mật Khẩu"}
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendOtp}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email đăng ký
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="email"
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-6">
                                <p className="text-gray-600 text-sm mb-4 text-center">
                                    Mã OTP đã được gửi đến <strong>{email}</strong>
                                </p>
                                <div className="flex justify-center mb-4">
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center text-xl tracking-widest"
                                        type="text"
                                        placeholder="------"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="text-center text-sm text-gray-500 mb-4">
                                    Thời gian hiệu lực: <span className="font-bold text-red-600">{formatTime(timer)}</span>
                                </div>
                            </div>
                            <button
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 mb-3"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang xác thực..." : "Xác thực"}
                            </button>
                            <button
                                type="button"
                                className="w-full text-blue-600 text-sm hover:underline focus:outline-none"
                                onClick={handleResendOtp}
                                disabled={isLoading || timer > 0}
                            >
                                {timer > 0 ? `Gửi lại mã (${formatTime(timer)})` : "Gửi lại mã"}
                            </button>
                            <button
                                type="button"
                                className="w-full text-gray-500 text-xs mt-4 hover:underline focus:outline-none"
                                onClick={() => setStep(1)}
                            >
                                Quay lại bước trước
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new-password">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                                    >
                                    </button>
                                </div>
                            </div>
                            <button
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPasswordPage;
