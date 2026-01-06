import { useContext, useEffect, useState } from "react"
import { MdMenuOpen, MdOutlineMenu, MdDarkMode, MdOutlineMailOutline } from "react-icons/md"
import { CiLight } from "react-icons/ci"
import { IoIosCart } from "react-icons/io"
import { FaRegBell } from "react-icons/fa6"
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';
import { IoShieldHalfSharp } from "react-icons/io5";
import { FaLeaf, FaUser } from "react-icons/fa";
import React from "react"
import Button from '@mui/material/Button';
import { HpContext } from "../pages/HomePage"
import { useLoginContext } from "../context/LoginContext";


export default function Header() {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const context = useContext(HpContext)

    const { user, login, logout } = useLoginContext();

    useEffect(()=>{
        console.log('user: ',user);
    }, [user])

    return (
        <>
            <header className="fixed top-0 left-0 z-40 w-full h-[100px] bg-[#1D1E21] flex items-center justify-center px-5">
                <div className="w-full">
                    <div className="flex items-center justify-center">
                        {/* logo */}
                        <div className="w-1/4">
                            <div className="flex items-center">
                                LOGO
                            </div>
                        </div>

                        <div className="w-1/4 flex items-center">
                            <Button className="!rounded-full !bg-[#f0f5ff] !min-w-[45px] !min-w-[45px] !w-[45px] !h-[45px] !text-black"  onClick={() => context.setIsToggleSidebar(!context.isToggleSidebar)}>
                            {
                                context.isToggleSidebar===false ? <MdMenuOpen className="!text-[25px]" /> : <MdOutlineMenu className="!text-[25px]" />
                            }
                            
                            </Button>
                        </div>

                        <div className="w-3/4 flex gap-4 justify-end items-center">
                            <Button className="!rounded-full !bg-[#f0f5ff] !min-w-[45px] !min-w-[45px] !w-[45px] !h-[45px] !text-black"><CiLight className="!text-[25px]" /> </Button>
                            <Button className="!rounded-full !bg-[#f0f5ff] !min-w-[45px] !min-w-[45px] !w-[45px] !h-[45px] !text-black"><FaRegBell className="!text-[25px]" /> </Button>

                            {/* avatar, info */}
                            <div className="">
                                <div onClick={handleClick} className="flex gap-5 items-center justify-center">
                                    <div className="">
                                        <div className="rounded-full border-[2px] border-solid border-[#0858f7] overflow-hidden">
                                            <img className="h-[60px]" src="https://scontent.fhan19-1.fna.fbcdn.net/v/t39.30808-1/497517924_1730917004491037_6902974271898961288_n.jpg?stp=cp6_dst-jpg_s200x200_tt6&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_ohc=1hZZOyKKawIQ7kNvwEHzdhM&_nc_oc=AdnqZVRSYVKTPJ21MgM-Zw--wJGMIhSjGfS6QD5lPza9Y0MuCj2EnEX-9j1UDGI2xhY&_nc_zt=24&_nc_ht=scontent.fhan19-1.fna&_nc_gid=tku-FRgDHAqtnqzynkOjRg&oh=00_AfX2zyTAoHElfBHHiZP_DAjBXfpgepm2Oe8iv6oBLln0-w&oe=689F8318" alt="avatar"></img>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[22px]">Anh Duc Tr</h4>
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
                    </div>
                </div>
            </header>
        </>
    )
}