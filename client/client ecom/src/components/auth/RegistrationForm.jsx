import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaEye } from "react-icons/fa";
import { PiEyeClosedDuotone } from "react-icons/pi";

const RegistrationForm = ({ isOpen, onClose, onSwitchToLogin, isModal = true }) => {
  const { register, isRegisterLoading, registerError } = useAuth();
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        firstName,
        lastName,
        username,
        password,
        sex,
        email,
        phone,
        dob,
      });
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      if (onSwitchToLogin) {
        onSwitchToLogin();
      } else if (onClose) {
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Đăng ký thất bại";
      setError(msg);
    }
  };

  //CHẶN CUỘN TRANG KHI MỞ MODAL (if used as modal)
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

  if (isModal && !isOpen) return null;

  const content = (
    <div
      className={isModal
        ? "border border-gray-200 fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-100 shadow-lg"
        : "border border-gray-200 bg-white rounded-2xl w-full max-w-md shadow-lg mx-auto mt-10"
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
          ĐĂNG KÝ TÀI KHOẢN
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
        <div className="mb-3 flex flex-col gap-3">
          <input type="text" placeholder="Username (Min 3 chars)" className="input-field" onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          <input type="email" placeholder="Email" className="input-field" onChange={(e) => setEmail(e.target.value)} required />
          <div className="flex gap-4">
            <input type="text" placeholder="Họ" className="input-field" onChange={(e) => setLastName(e.target.value)} required />
            <input type="text" placeholder="Tên" className="input-field" onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <input type="tel" placeholder="Số điện thoại (Min 10 chars)" className="input-field" onChange={(e) => setPhone(e.target.value)} required minLength={10} />
          <div className="flex gap-4">
            <input type="date" placeholder="Ngày sinh" className="input-field" onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 font-medium">
              Giới tính
            </label>

            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="Nam"
                  checked={sex === "Nam"}
                  onChange={(e) => setSex(e.target.value)}
                  required
                />
                Nam
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="Nữ"
                  checked={sex === "Nữ"}
                  onChange={(e) => setSex(e.target.value)}
                />
                Nữ
              </label>
            </div>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu (Min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={8}
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
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isRegisterLoading}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-sm py-3 rounded-md disabled:opacity-70"
        >
          {isRegisterLoading ? "Đang tạo..." : "TẠO TÀI KHOẢN"}
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-gray-600 text-sm">
            hoặc đăng ký bằng
          </span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {/* <div className="grid grid-cols-2 gap-3">
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
        </div> */}

        <p className="mt-6 text-center text-gray-700 text-sm">
          Bạn đã có tài khoản?{" "}
          <button
            type="button"
            onClick={() => {
              if (onSwitchToLogin) onSwitchToLogin();
              setError(null);
            }}
            className="text-blue-600 hover:underline"
          >
            Đăng nhập ngay!
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

export default RegistrationForm;