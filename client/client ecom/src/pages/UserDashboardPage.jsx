// AccountLayout.jsx
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Footer from "../layouts/Footer";
import { MdLogout } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { useAuth } from "../context/AuthContext";

export default function UserDashboardPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const goToProfile = () => {
        navigate("/account");
    };

    const goToOrder = () => {
        navigate("/account/orders");
    };

    const goToAddress = () =>{
        navigate("/account/address")
    }
    return (
        <>
            <Navbar></Navbar>
            <div className="min-h-screen px-15 bg-gray-100">
                <Breadcrumbs pagename="Thông tin cá nhân" product={null} />
                <div className="flex gap-10">
                    <aside className="w-[30%] bg-white rounded-[10px] shadow flex flex-col h-fit">
                        <button onClick={goToProfile} className={`${location.pathname === '/account' ? "bg-gradient-to-r from-[#03A9F4]/50 to-transparent border-l-3 border-[#03A9F4]" : ""} text-[18px]`}>
                            <div className="flex gap-3 items-center transform hover:translate-x-1 transition-all duration-200 p-2">
                                <LuUserRound />
                                <span>Thông tin cá nhân</span>
                            </div>
                        </button>
                        <button onClick={goToOrder} className={`${location.pathname === '/account/orders' ? "bg-gradient-to-r from-[#03A9F4]/50 to-transparent border-l-3 border-[#03A9F4]" : ""} text-[18px]`}>
                            <div className="flex gap-3 items-center transform hover:translate-x-1 transition-all duration-200 p-2">
                                <BsBoxSeam />
                                <span>Đơn hàng của tôi</span>
                            </div>
                        </button>
                        <button onClick={goToAddress} className={`${location.pathname === '/account/address' ? "bg-gradient-to-r from-[#03A9F4]/50 to-transparent border-l-3 border-[#03A9F4]" : ""} text-[18px]`}>
                            <div className="flex gap-3 items-center transform hover:translate-x-1 transition-all duration-200 p-2">
                                <BsBoxSeam />
                                <span>Địa chỉ</span>
                            </div>
                        </button>
                        <button onClick={logout} className="flex gap-3 items-center hover:translate-x-1 transform transition-all duration-200 text-[18px] p-2">
                            <MdLogout />
                            <span>Đăng xuất</span>
                        </button>
                    </aside>

                    <main className="w-full">
                        <Outlet />
                    </main>
                </div>
            </div>
            <Footer></Footer>
        </>
    );
}
