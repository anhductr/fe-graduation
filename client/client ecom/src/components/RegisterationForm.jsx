import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye } from "react-icons/fa";
import { PiEyeClosedDuotone } from "react-icons/pi";

const RegistrationForm = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { register, isRegisterLoading, registerError } = useAuth();
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [phone, setPhone] = useState(""); 
  const [dob, setDob] = useState(""); 
  const [gender, setGender] = useState(""); 
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
        email,
        phone,
        dob,
        gender,
      });
      alert("Đăng ký thành công! Kiểm tra email để xác minh.");
      onSwitchToLogin();
    } catch (err) {
      const msg = err.response?.data || "Đăng nhập thất bại";
      setError(msg);
    }
  };

  //CHẶN CUỘN TRANG KHI MỞ MODAL
  useEffect(() => {
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
  }, [isOpen]);

  if (!isOpen) return null;


  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-md bg-white/20 transition-all duration-300"
        onClick={onClose}
      ></div>

      <div
        className="border border-gray-200 fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl w-100 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="flex justify-between items-center w-full border-b border-black py-4 rounded-t-2xl">
          <h2
            id="modal-title"
            className="px-6 text-gray-800 font-semibold text-base leading-5"
          >
            ĐĂNG KÝ TÀI KHOẢN
          </h2>
          <button
            aria-label="Close"
            className="px-6 text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={onClose}
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6">
          <div className="mb-3 flex flex-col gap-3">
            <input type="text" placeholder="Username" className="input-field" onChange={(e) => setUsername(e.target.value)} required />
            <input type="email" placeholder="Email" className="input-field" onChange={(e) => setEmail(e.target.value)} required />
            <div className="flex gap-4">
              <input type="text" placeholder="Họ" className="input-field" onChange={(e) => setLastName(e.target.value)} required />
              <input type="text" placeholder="Tên" className="input-field" onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="relative">
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
            <input type="text" placeholder="Số điện thoại" className="input-field" onChange={(e) => setPhone(e.target.value)} />
            <div className="flex gap-4">
              <input type="date" className="input-field" onChange={(e) => setDob(e.target.value)} />
              <select className="input-field" onChange={(e) => setGender(e.target.value)}>
                <option value="">Giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm mb-3">
              {registerError.response?.data?.message || "Đăng ký thất bại"}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-sm py-3 rounded-md"
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
            Bạn đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => {
                onSwitchToLogin();  // Hàm cũ
                setError(null);
              }}
              className="text-blue-600 hover:underline"
            >
              Đăng nhập ngay!
            </button>
          </p>
        </form>
      </div>
    </>
  );
};

export default RegistrationForm;