import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
// import LogInContext from "../context/LogInContext";
// import LogInContext from "../context/LogInContext";
import { useCart } from "../context/CartContext";
// import { ProductContext } from "../context/ProductContext";
// import { WishlistContext } from "../context/WishlistContext";
// import LoginForm from "../components/auth/LogInForm";
// import RegistrationForm from "../components/auth/RegisterationForm";
// import VerificationBanner from "../components/auth/VerificationBanner";
import Catalogue from "../components/product/Catalogue";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineViewList } from "react-icons/hi";
import { IoIosArrowUp } from "react-icons/io";
import { IoMdCart } from "react-icons/io";
import { IoNotificationsOutline } from "react-icons/io5";
import NotificationModal from "../components/common/NotificationModal";
import Badge, { badgeClasses } from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { IoMdSearch } from "react-icons/io";
import { IconButton, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { MdLogout } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { useSearchKeyword } from "../context/SearchContext";
import { getSearchSuggestionsQuick } from "../services/searchApi";
import { useQuery } from "@tanstack/react-query";

function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { itemCount } = useCart();

  const navbarRef = useRef(null);
  const prevScrollY = useRef(window.scrollY);

  const navigate = useNavigate();

  const goToProfile = () => {
    navigate("/account");
  };

  const goToOrder = () => {
    navigate("/account/orders");
  };

  const goToAddress = () => {
    navigate("/account/adress");
  };


  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const navbar = navbarRef.current;

      if (!navbar) return;

      if (currentScrollY === 0) {
        // Ở đầu trang, navbar hiện bình thường
        navbar.classList.remove("translate-y-0", "-translate-y-full");
      } else if (currentScrollY > prevScrollY.current) {
        // 👉 Scroll xuống → navbar biến mất
        navbar.classList.remove("translate-y-0");
        navbar.classList.add("-translate-y-full");
      } else {
        // 👉 Scroll lên → navbar hiện lại
        navbar.classList.remove("-translate-y-full");
        navbar.classList.add("translate-y-0");
      }

      // Cập nhật vị trí cuộn
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // const [isLoginOpen, setIsLoginOpen] = useState(false);
  // const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const style = {
    width: "100%",
    height: "110px",
    backgroundImage:
      "linear-gradient(90deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
    backgroundSize: "300% 300%",
    animation: "colorAnim 12s infinite linear alternate",
  };


  const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: 3px;
  }
`;
  useEffect(() => {
    console.log("user: ", user)
  }, [user])


  ////////////////////////// Xử lý search ////////////////////////// 
  const { currentKeyword, setCurrentKeyword } = useSearchKeyword();
  const [inputValue, setInputValue] = useState(currentKeyword);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Đồng bộ khi vào trang search từ URL
  useEffect(() => {
    setInputValue(currentKeyword);
  }, [currentKeyword]);

  // React Query: gọi gợi ý tìm kiếm
  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["search-suggest", inputValue],
    queryFn: () => getSearchSuggestionsQuick(inputValue),
    enabled: inputValue.trim().length >= 1,
    staleTime: 1000 * 60 * 5, // cache 5 phút
    placeholderData: [], // không flash khi loading
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      setCurrentKeyword(trimmed);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Khi focus → hiện luôn dropdown(không cần đợi có gợi ý)
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setCurrentKeyword(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };
  return (
    <>
      <div className="h-[110px]"></div>
      <nav
        ref={navbarRef}
        className="fixed top-0 left-0 right-0 z-30 transform transition-transform duration-300 ease-in-out flex items-center shadow"
        style={style}
      ><style>{`
        @keyframes colorAnim {
          0%   { background-position: 100% 50%; }
          50%  { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        `}</style>
        <div className="relative w-full px-15">
          <div className="h-[70px] w-full bg-black/50 rounded-[10px] text-white shadow-md z-50 flex">
            <div className="h-full w-[23%] flex justify-center items-center"
              onMouseEnter={() => { setIsCatalogueOpen(true); setShowSuggestions(false); inputRef.current?.blur(); }}
              onMouseLeave={() => setIsCatalogueOpen(false)}
            >
              <div className="flex h-[50px] px-5 w-full items-center justify-between border-r border-white/20">
                <HiOutlineViewList className="text-[25px]"></HiOutlineViewList>
                <span className="text-[16px]">Xem tất cả danh mục</span>
                <IoIosArrowUp
                  className={`ml-1 transition-transform duration-300`}
                  style={{
                    transform: isCatalogueOpen ? "rotateX(0deg)" : "rotateX(180deg)",
                    transformOrigin: "center",
                  }} />
              </div>

              <AnimatePresence>
                {isCatalogueOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute top-full z-50 w-full left-0 right-0 h-full"
                  >
                    <Catalogue />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            <div className="w-[54%] px-12 flex justify-center items-center">
              <form onSubmit={handleSubmit} className="bg-white w-full flex rounded-[10px]">
                <input
                  name="search"
                  type="text"
                  value={inputValue}
                  ref={inputRef}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Nhập tên điện thoại, máy tính, phụ kiện... cần tìm"
                  className="w-full text-[16px] py-2 pl-4 text-gray-700 text-sm focus:outline-none"
                  aria-label="Tìm kiếm sản phẩm"
                  autoComplete="off"
                />
                <IconButton
                  type="submit"                    // quan trọng: để form submit khi nhấn
                  size="medium"
                  sx={{
                    color: "gray",
                    "&:hover": {
                      color: "#1976d2",            // màu xanh khi hover
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                    transition: "all 0.2s ease",
                  }}
                  disabled={isFetching}            // vô hiệu hóa khi đang loading gợi ý (tùy chọn)
                >
                  {isFetching ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <IoMdSearch className="text-[22px]" />
                  )}
                </IconButton>
              </form>

              {/* Dropdown gợi ý */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    layout
                    ref={dropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed left-1/2 top-24 -translate-x-1/2 w-[44%] bg-white rounded-xl shadow-2xl overflow-hidden z-20 border border-gray-200"
                    style={{ top: "90px" }} // điều chỉnh theo chiều cao navbar 
                  >
                    <div className="py-1 overflow-y-auto">
                      {
                        suggestions.length > 0 ? (
                          suggestions.map((item) => (
                            <div
                              key={item.id || item.name}
                              onClick={() => handleSuggestionClick(item.name)}
                              className="px-6 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent cursor-pointer flex items-center gap-4 transition-all"
                            >
                              <span className="text-[15px] text-gray-800 font-medium">
                                {item.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="px-2 py-2">
                            {isFetching ? (
                              <div className="flex justify-center">
                                <CircularProgress size={40} />
                                <p className="text-gray-500">Đang tìm kiếm...</p>
                              </div>
                            ) : (
                              <>
                                {inputValue.length > 0 ? (
                                  <>
                                    <div className="flex items-center gap-1 border-b border-gray-500 pb-2">
                                      <IoMdSearch className="text-[20px] text-red-500" />
                                      <h2 className="text-[18px] text-black">Không tìm thấy kết quả với từ khóa <strong>"{inputValue}"</strong> </h2>
                                    </div>
                                    <div className="text-center text-gray-500 mt-2">
                                      Kiểm tra lỗi chính tả với từ khoá đã nhập
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-gray-500 text-center">Vui lòng nhập từ khóa để bắt đầu tìm kiếm</div>
                                  </>
                                )
                                }
                              </>
                            )}
                          </div>
                        )
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-[23%] flex justify-center gap-4 items-center pl-4">
              {/* Notification */}
              <div className="relative">
                <IconButton
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  sx={{ color: "white" }}
                >
                  <Badge badgeContent={3} color="error">
                    <IoNotificationsOutline className="text-[24px]" />
                  </Badge>
                </IconButton>
                <NotificationModal
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>

              {/* user */}
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                {/* Nút user */}
                <button
                  type="button"
                  aria-label="User profile"
                  className="relative rounded-full bg-white/20 p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="7" r="5" />
                    <path d="M4 20c0-4 7-4 8-4s8 0 8 4v1H4v-1z" />
                  </svg>
                  <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-orange-400 ring-2 ring-red-600"></span>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute top-[calc(100%+1px)] left-[0px] w-[210px] h-[100px] bg-white text-black rounded shadow-lg border border-gray-200 z-30 px-2 gap-2 flex flex-col justify-center"
                    >
                      {isLoggedIn ? (
                        <>
                          <button onClick={goToProfile}>
                            <div className="flex items-center gap-2">
                              <LuUserRound />
                              <span>Thông tin cá nhân</span>
                            </div>
                          </button>
                          <button onClick={goToOrder}>
                            <div className="flex items-center gap-2">
                              <BsBoxSeam />
                              <span>Đơn hàng của tôi</span>
                            </div>
                          </button>
                          <button onClick={goToAddress}>
                            <div className="flex items-center gap-2">
                              <BsBoxSeam />
                              <span>Địa chỉ</span>
                            </div>
                          </button>
                          <button onClick={logout}>
                            <div className="flex items-center gap-2">
                              <MdLogout />
                              <span>Đăng xuất</span>
                            </div>
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <i className="far fa-hand-paper text-[15px]"></i>
                            <span className="text-[13px]">
                              Xin chào, vui lòng đăng nhập
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <button
                              className="w-1/2 bg-black text-white text-[13px] font-semibold px-1 py-2 rounded border border-black"
                              onClick={() => {
                                navigate('/login');
                              }}
                            >
                              ĐĂNG NHẬP
                            </button>
                            <button
                              className="w-1/2 text-[13px] font-semibold text-black px-1 py-2 border border-black rounded"
                              onClick={() => {
                                navigate('/signup');
                              }}
                            >
                              ĐĂNG KÝ
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to={`/cart`}>
                <button
                  type="button"
                  aria-label="Giỏ hàng"
                  className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-[9px] text-white text-[15px]"
                >
                  <IoMdCart className="text-[18px]"></IoMdCart>
                  <CartBadge badgeContent={itemCount} color="primary" overlap="circular" />
                  <span>Giỏ hàng</span>
                </button>
              </Link>
            </div >
          </div >
        </div >
      </nav >

      {/* Catalogue Dropdown */}
      {
        isCatalogueOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-20 backdrop-blur-md bg-white/20 transition-all duration-300"
            ></div>
          </>
        )
      }

      {/* Modals removed in favor of pages */}
    </>
  );
}

export default Navbar;
