import SideBar from "../components/layout/SideBar.jsx";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';
import { IoShieldHalfSharp } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import { useLoginContext } from "../context/LoginContext";

export default function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, logout } = useLoginContext();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [token, navigate]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleClose();
        // Navigate to profile page (you can implement this later)
        console.log('Navigate to profile');
    };

    const handleChangePassword = () => {
        handleClose();
        navigate('/auth/change-password');
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-[18%] flex-[0_0_18%] transition-all duration-300 ease-in-out">
                <SideBar location={location} />
            </div>

            {/* Main Content */}
            <div className="relative w-[82%] flex-[0_0_82%] transition-all duration-300 ease-in-out bg-[#1D1E21] min-h-screen">
                <div className="bg-[#f5f5f5] min-h-screen border-0 rounded-[10px] mx-1 my-3">
                    {/* User Menu */}
                    <div className="absolute top-[8px] right-[85px] flex items-center justify-end p-5">
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            sx={{ ml: 2 }}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                        >
                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#4a2fcf' }}>
                                <FaUser />
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={open}
                            onClose={handleClose}
                            onClick={handleClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            disableAutoFocusItem
                            PaperProps={{
                                elevation: 3,
                                sx: {
                                    mt: 1.5,
                                    minWidth: 200,
                                    '& .MuiMenuItem-root': {
                                        px: 2,
                                        py: 1.5,
                                    },
                                },
                            }}
                        >
                            <MenuItem onClick={handleProfile}>
                                <ListItemIcon>
                                    <FaUser />
                                </ListItemIcon>
                                Hồ sơ
                            </MenuItem>
                            <MenuItem onClick={handleChangePassword}>
                                <ListItemIcon>
                                    <IoShieldHalfSharp />
                                </ListItemIcon>
                                Thay đổi mật khẩu
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Đăng xuất
                            </MenuItem>
                        </Menu>
                    </div>

                    <Outlet />
                </div>
            </div>
        </div>
    );
}

