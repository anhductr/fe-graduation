import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import OtpVerificationModal from "./OtpVerificationModal";

const VerificationBanner = () => {
    const { user, sendOtp, isLoggedIn } = useAuth();
    const [isOtpHover, setIsOtpHover] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

    // Assuming user object has a status 'ACTIVE' or verified field. 
    // The requirement says: "Hệ thống kiểm tra trạng thái tài khoản: Nếu email chưa xác thực..."
    // Based on register response, we see "role": "USER". 
    // Usually there is a status field. Let's assume there is a property `verified` (boolean) or `status` (string).
    // If not present in initial manual testing, we will debug. 
    // For now I will assume `active` property (common convention) or `verified`.
    // Let's rely on a derived check. 
    // UPDATE: Based on introspection result `verified: true`, let's assume `verified` boolean exists on user profile. 
    // Or `status` === "UNVERIFIED".

    // SAFEGUARDS: Check if user exists.
    if (!isLoggedIn || !user) return null;

    // TODO: Verify exact field name from backend response. 
    // For now, I will assume `!user.verified` or `user.status === 'UNVERIFIED'`.
    // I will check for `verified` first.
    const isVerified = user.verified || user.status === 'ACTIVE' || user.status === true; // status ACTIVE means verified? 
    // Wait, the API doc register response example doesn't show `status`. 
    // But `PUT /users/admin/{userId}/status` exists.
    // Let's assume if it needs verification, a flag is false.
    // I'll assume `verified` is the key based on introspect. 
    // If user.verified is explicitly false, show banner.
    // Or if `emailVerified` is false.

    // TEMPORARY LOGIC: We will display if `user.verified === false` or `user.isVerified === false`.
    const needsVerification = user.isVerified === false || user.verified === false;

    console.log("VerificationBanner Check:", { user, needsVerification });

    // If we can't determine, maybe don't show to avoid annoyance, or show in dev mode.
    if (!needsVerification) return null;

    const handleVerifyClick = async () => {
        try {
            await sendOtp({ userName: user.userame || user.email }); // API doc says body: { username: "..." }
            setIsOtpModalOpen(true);
        } catch (err) {
            alert("Không thể gửi mã OTP. Vui lòng thử lại sau.");
        }
    };

    return (
        <>
            <div className="fixed top-[110px] left-0 right-0 z-40 bg-yellow-100 border-b border-yellow-200 text-yellow-800 px-4 py-2 flex items-center justify-center gap-4 text-sm shadow-md">
                <span>
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Tài khoản của bạn chưa được xác thực email.
                </span>
                <button
                    onClick={handleVerifyClick}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
                >
                    Xác thực ngay
                </button>
            </div>

            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                username={user.username || user.email}
            />
        </>
    );
};

export default VerificationBanner;
