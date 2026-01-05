import Button from '@mui/material/Button';
import { RxDashboard } from "react-icons/rx";
import { BsBoxSeam } from "react-icons/bs";
import { BsHandbag } from "react-icons/bs";
import { TbRosetteDiscount } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useContext, useState } from 'react';
import { IoFolderOutline } from "react-icons/io5";
import { useEffect } from 'react';
import { GoPeople } from "react-icons/go";
import { LiaClipboardListSolid } from "react-icons/lia";
import { BsChatRightQuote } from "react-icons/bs";


export default function SideBar({ location }) {

    const getActiveFromPath = (path) => {
        if (path.startsWith("/dashboard")) return 1;
        if (path.startsWith("/users")) return 2;
        if (path.startsWith("/products")) return 3;
        if (path.startsWith("/inventory")) return 4;
        if (path.startsWith("/categories")) return 5;
        if (path.startsWith("/orders")) return 6;
        if (path.startsWith("/promotion")) return 7;
        if (path.startsWith("/contents")) return 8;
        if (path.startsWith("/settings")) return 9;
        return 1; // fallback
    };

    // khởi tạo state dựa trên pathname
    const [active, setActiveTab] = useState(() => getActiveFromPath(location.pathname));

    useEffect(() => {
        setActiveTab(getActiveFromPath(location.pathname));
    }, [location.pathname]);


    return (
        <>
            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
            <div className={`w-[18%] transition-all duration-300 ease-in-out h-screen fixed left-0 bg-[#1D1E21] py-[20px]`}>
                <ul className="list-none">
                    {/* dashboard */}
                    <li className="">
                        <Link to="/dashboard">
                            <div
                                className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                            >
                                <Button variant="text" className={`${active === 1 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                    <span aria-label='icon'>
                                        <RxDashboard className={`!text-[38px] !mr-[10px]`} />
                                    </span>
                                    <div className='flex flex-col items-start'>
                                        <span className='!font-semibold !text-[14px]'>Tổng quan</span>
                                        <span className="!text-[10px]">Tổng quan hệ thống</span>
                                    </div>
                                </Button>
                            </div>
                        </Link>
                    </li>

                    {/* user */}
                    <li className="">
                        <Link to="/users">
                            <div
                                className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                            >
                                <Button variant="text" className={`${active === 2 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                    <span aria-label="icon">
                                        <GoPeople className={`!text-[38px] !mr-[10px]`} />
                                    </span>
                                    <div className='flex flex-col items-start'>
                                        <span className="!font-semibold !text-[14px]">Khách hàng</span>
                                        <span className="!text-[10px]">Quản lý khách hàng</span>
                                    </div>
                                </Button>
                            </div>
                        </Link>
                    </li>

                    {/* sản phẩm */}
                    <li className="">
                        <Link to="/products">
                            <div
                                className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                            >
                                <Button variant="text" className={`${active === 3 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                    <span aria-label="icon">
                                        <BsBoxSeam
                                            className={`!text-[38px] !mr-[10px]`}
                                        />
                                    </span>
                                    <div className='flex flex-col items-start'>
                                        <span className="!font-semibold !text-[14px]">Sản phẩm</span>
                                        <span className="!text-[10px]">Quản lý sản phẩm</span>
                                    </div>
                                </Button>
                            </div>
                        </Link>
                    </li>

                    {/* tồn kho */}
                    <li className="">
                        <Link to="/inventory">
                            <div
                                className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                            >
                                <Button variant="text" className={`${active === 4 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                    <span aria-label="icon">
                                        <LiaClipboardListSolid
                                            className={`!text-[38px] !mr-[10px]`}
                                        />
                                    </span>
                                    <div className='flex flex-col items-start'>
                                        <span className="!font-semibold !text-[14px]">Tồn kho</span>
                                        <span className="!text-[10px]">Quản lý tồn kho</span>
                                    </div>
                                </Button>
                            </div>
                        </Link>
                    </li>

                    {/* thể loại */}
                    <li className="">
                        <Link to="/categories">
                            <div
                                className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                            >
                                <Button variant="text" className={`${active === 5 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                    <span aria-label='icon'>
                                        <IoFolderOutline className={`!text-[38px] !mr-[10px]`} />
                                    </span>
                                    <div className='flex flex-col items-start'>
                                        <span className="!font-semibold !text-[14px]">Danh mục</span>
                                        <span className="!text-[10px]">Quản lý danh mục</span>
                                    </div>
                                </Button>
                            </div>
                        </Link>
                    </li>


                    {/* đơn hàng */}
                    <li className="">
                        <Link to="/orders">
                            <div
                                className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                            >
                                <Button variant="text" className={`${active === 6 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                    <span aria-label='icon'>
                                        <BsHandbag className={`!text-[37px] !mr-[10px]`} />
                                    </span>
                                    <div className='flex flex-col items-start'>
                                        <span className="!font-semibold !text-[14px]">Đơn hàng</span>
                                        <span className="!text-[10px]">Quản lý đơn hàng</span>
                                    </div>
                                </Button>
                            </div>
                        </Link>
                    </li>


                    {/* khuyến mãi */}
                    <li className="">
                        <Link to="/promotion">
                            <div
                                className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                            >
                                <Button variant="text" className={`${active === 7 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                    <span aria-label='icon'>
                                        <TbRosetteDiscount className={`!text-[39px] !mr-[10px]`} />
                                    </span>
                                    <div className='flex flex-col items-start'>
                                        <span className="!font-semibold !text-[14px]">Khuyến mãi</span>
                                        <span className="!text-[10px]">Quản lý khuyến mãi</span>
                                    </div>
                                </Button>
                            </div>
                        </Link>
                    </li>

                    {/* content */}
                    <li className="">
                        <Link to="/contents">
                            <div
                                className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                            >
                                <Button variant="text" className={`${active === 9 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                    <span aria-label='icon'>
                                        <BsChatRightQuote className={`!text-[37px] !mr-[10px]`} />
                                    </span>
                                    <div className='flex flex-col items-start'>
                                        <span className="!font-semibold !text-[14px]">Content</span>
                                        <span className="!text-[10px]">Quản lý Chatbot</span>
                                    </div>
                                </Button>
                            </div>
                        </Link>
                    </li>

                    {/* cài đặt */}
                    <li className="">
                        <div
                            className="w-full text-white !text-left !flex !justify-between items-center !py-[12px] !px-[15px] gap-2 !h-[80px]"
                        >
                            <Button variant="text" className={`${active === 8 ? "!bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow !border-0 " : ""} !justify-start !text-white !flex !w-[90%] !items-center !h-full !p-3 !py-[35px] !rounded-[10px] gap-1`}>
                                <span aria-label='icon'>
                                    <IoSettingsOutline className={`!text-[38px] !mr-[10px]`} />
                                </span>
                                <div className='flex flex-col items-start'>
                                    <span className="!font-semibold !text-[14px]">Cài đặt</span>
                                    <span className="!text-[10px]">Cài đặt hệ thống</span>
                                </div>
                            </Button>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    )
}



//build submenu
// const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);

// function isOpenSubmenu(index) {
//     setActiveTab(index);
//     setIsToggleSubmenu(!isToggleSubmenu);
// }

// const matchEditCate = useMatch("/categories/categories-list/categories-edit/:id");
// const matchEditProduct = useMatch("/products/products-list/products-edit/:id");


// useEffect(() => {
//     if (location.pathname === "/products/products-list" || location.pathname === "/products/products-upload" || matchEditProduct) {
//         setActiveTab(2);
//         if (location.pathname === "/products/products-upload") {
//             setProductSubmenuactive(2);
//         }
//         if (location.pathname === "/products/products-list") {
//             setProductSubmenuactive(1);
//         } else {
//             setProductSubmenuactive('');
//         }
//     } else if (location.pathname === "/categories/categories-list" || location.pathname === "/categories/categories-upload" || matchEditCate) {
//         setActiveTab(3);
//         if (location.pathname === "/categories/categories-upload") {
//             setCateSubmenuactive(2);
//         } else if (location.pathname === "/categories/categories-list") {
//             setCateSubmenuactive(1);
//         } else {
//             setCateSubmenuactive('');
//         }
//     } else if (location.pathname === "/users/users-list" || matchEditCate) {
//         setActiveTab(4);
//         if (location.pathname === "/users/users-list") {
//             setUserSubmenuactive(1);
//         } else {
//             setUserSubmenuactive('');
//         }
//     } else {
//         setActiveTab(1);
//     }
// }, [location.pathname]);

// const [productSubmenuactive, setProductSubmenuactive] = useState(1);
// const [cateSubmenuactive, setCateSubmenuactive] = useState(1);
// const [userSubmenuactive, setUserSubmenuactive] = useState(1);

// return (
{/* Menu chính */ }
{/* <li className="">
    <Button
        variant="text"
        className="w-full !text-white !text-left !flex !items-center !py-[12px] !px-[15px]"
        onClick={() => {
            isOpenSubmenu(4);
            if (active !== 4) {
                setUserSubmenuactive('');
            }
        }}
    >
        <span aria-label="icon">
            <GoPeople className={`${active === 4 ? "!text-red-600" : ""} !text-[35px] !mr-[10px]`} />
        </span>
        <span className="!font-semibold !text-[17px]">Người dùng</span>
        <span aria-label="arrow" className="ml-auto">
            <FaAngleRight
                className={`!text-[22px] transition-transform duration-300 ${active === 4 && isToggleSubmenu ? "rotate-90" : "rotate-0"
                    }`}
            />
        </span>
    </Button>
</li> */}
{/* Submenu */ }
{/* <ul
        aria-label="submenu"
        className={`${active === 4 && isToggleSubmenu === true ? "pointer-events-auto" : "h-[0px] opacity-0 pointer-events-none"} !text-[rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300 list-none py-[0px] px-[20px] mx-[30px] flex flex-col gap-[5px] text-[17px] border-l`}
    >
        <Link to="/users/users-list">
            <li
                className={`${userSubmenuactive === 1 ? "text-red-600" : "" } hover:cursor-pointer`}
                onClick={() => setUserSubmenuactive(1)}
            >
                Danh sách người dùng
            </li>
        </Link>
    </ul> */}