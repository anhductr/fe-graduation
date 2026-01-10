import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaEye } from "react-icons/fa";
import { PiEyeClosedDuotone } from "react-icons/pi";

const LoginForm = ({ isOpen, onClose, onSwitchToRegister, isModal = true }) => {
  const { login, isLoginLoading, loginError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  //CHẶN CUỘN TRANG KHI MỞ MODAL
  useEffect(() => {
    if (isModal) {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      if (!isOpen) {
        setError(null);
      }
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, isModal]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ username, password });
      if (onClose) onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Đăng nhập thất bại";
      setError(msg);
    }
  };

  if (isModal && !isOpen) return null;

  const content = (
    <div
      className={isModal
        ? "border border-gray-200 fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-96 shadow-lg"
        : "border border-gray-200 bg-white rounded-2xl w-96 shadow-lg mx-auto mt-10"
      }
      role={isModal ? "dialog" : undefined}
      aria-modal={isModal ? "true" : undefined}
      aria-labelledby="modal-title"
    >
      <header className="flex justify-between items-center w-full border-b border-black py-4 rounded-t-2xl">
        <h2
          id="modal-title"
          className="px-6 text-gray-800 font-semibold text-base leading-5"
        >
          ĐĂNG NHẬP
        </h2>
        {isModal && (
          <button
            aria-label="Close"
            className="px-6 text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={onClose}
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div className="mb-1 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FaEye /> : <PiEyeClosedDuotone />}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-3">
            {error}
          </p>
        )}

        <div className="text-right mb-4">
          <Link
            to="/forgot-password"
            className="text-xs text-gray-700 underline hover:text-gray-900"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoginLoading}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-sm py-3 rounded-md disabled:opacity-70"
        >
          {isLoginLoading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-gray-600 text-sm">
            hoặc đăng nhập bằng
          </span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-[#dd4b39] hover:bg-[#c43d2f] text-white font-semibold text-sm py-3 rounded-md"
          >
            <i className="fab fa-google text-lg"></i>
            <span>Google</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-[#3b5998] hover:bg-[#2d4373] text-white font-semibold text-sm py-3 rounded-md"
          >
            <i className="fab fa-facebook-f text-lg"></i>
            <span>Facebook</span>
          </button>
        </div>

        <p className="mt-6 text-center text-gray-700 text-sm">
          Bạn chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={() => {
              if (onSwitchToRegister) onSwitchToRegister();
              setError(null);
            }}
            className="text-blue-600 hover:underline">
            Đăng ký ngay!
          </button>
        </p>
      </form>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {isModal && isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-md bg-white/20 transition-all duration-300"
          onClick={onClose}
        ></div>
      )}
      {content}
    </>
  );
};

export default LoginForm;
