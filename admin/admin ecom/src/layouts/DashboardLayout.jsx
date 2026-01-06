// import Header from "../components/Header.jsx";
import SideBar from "../components/layout/SideBar.jsx";
import { Outlet } from "react-router-dom";
import { useState, createContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';
import { IoShieldHalfSharp } from "react-icons/io5";
import { FaLeaf, FaUser } from "react-icons/fa";
import React from "react"
import Button from '@mui/material/Button';
import { useLoginContext } from "../context/LoginContext";


export default function DashboardLayout() {
    const location = useLocation();

    // useEffect(() => {
    //     console.log("URL hiện tại:", location.pathname);
    // }, [location.pathname]);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }


    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div
                className={`w-[18%] flex-[0_0_18%] transition-all duration-300 ease-in-out`}
            >
                <SideBar location={location} />
            </div>

            {/* Nội dung sẽ thay đổi theo route con */}
            <div
                className={`relative w-[82%] flex-[0_0_82%] transition-all duration-300 ease-in-out bg-[#1D1E21] min-h-screen`}
            >
                <div className="bg-[#f5f5f5] min-h-screen border-0 rounded-[10px] mx-1 my-3">
                    <div className='absolute top-[8px] right-[85px] flex items-center justify-end p-5'>
                        {/* avatar, info */}
                        <div className="">
                            <div onClick={handleClick} className="flex gap-3 items-center justify-center bg-white rounded-[10px] shadow px-3 py-2">
                                <div className="">
                                    <div className="rounded-full overflow-hidden">
                                        <img className="h-[60px]" src="data:image/jpeg;base64,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" alt="avatar"></img>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[21px]">Anh Duc Tr</h4>
                                    <h4 className="text-[14px]">ducanh020304@gmail.com</h4>
                                </div>
                            </div>

                            <Menu
                                anchorEl={anchorEl}
                                id="account-menu"
                                open={open}
                                onClose={handleClose}
                                onClick={handleClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                disableAutoFocusItem // Thêm prop này
                            >
                                <MenuItem onClick={handleClose}>
                                    <ListItemIcon>
                                        <FaUser />
                                    </ListItemIcon>
                                    Hồ sơ
                                </MenuItem>
                                <MenuItem onClick={handleClose}>
                                    <ListItemIcon>
                                        <IoShieldHalfSharp />
                                    </ListItemIcon>
                                    Thay đổi mật khẩu
                                </MenuItem>
                                <MenuItem onClick={handleClose}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Đăng xuất
                                </MenuItem>
                            </Menu>
                        </div>

                    </div>

                    <Outlet />
                </div>
            </div>
        </div>
    );
}

