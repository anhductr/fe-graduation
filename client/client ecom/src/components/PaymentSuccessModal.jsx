// PaymentSuccessModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaCheck } from "react-icons/fa";
import { IoClose } from 'react-icons/io5';
import { Button } from '@mui/material';
import ConfettiExplosion from 'react-confetti-explosion';
import { useNavigate } from 'react-router-dom';

export default function PaymentSuccessModal({ open, onClose }) {
  const [isExploding, setIsExploding] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose();
    navigate("/");
  };

  useEffect(() => {
    if (open) {
      setIsExploding(true); // Bật pháo khi modal hiện
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop che toàn màn hình */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50" onClick={onClose} />

      {/* Modal chính - căn giữa màn hình */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center animate-in fade-in zoom-in duration-300">

          {/* Nút đóng X */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition z-10"
          >
            <IoClose size={28} />
          </button>

          {/* Icon tick xanh */}
          <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <FaCheck className="text-white" size={56} />
          </div>

          <h1 className="mt-8 text-3xl font-bold text-gray-900">
            Thanh toán thành công
          </h1>

          <p className="mt-4 text-gray-600 text-base leading-relaxed">
            Đơn hàng của bạn đã được xử lý thành công. Bây giờ bạn có thể quay về trang chủ và khám phá các sản phẩm mới.
          </p>

          {/* Confetti */}
          <div className="flex justify-center mt-6">
            {isExploding && (
              <ConfettiExplosion
                force={0.8}
                duration={3500}
                particleCount={150}
                width={1600}
                zIndex={100}
                onComplete={() => setIsExploding(false)}
              />
            )}
          </div>

          {/* Nút tiếp tục mua sắm */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleContinue}
            sx={{
              mt: 6,
              backgroundColor: '#10b981',
              borderRadius: '9999px',
              py: 2.5,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
              '&:hover': { backgroundColor: '#059669' }
            }}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </>,
    document.body // Đưa ra ngoài cùng, phủ toàn trang
  );
}