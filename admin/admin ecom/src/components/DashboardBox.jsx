import React from "react";
import { HiDotsVertical } from "react-icons/hi";
import Button from '@mui/material/Button';
import { IoMdTrendingDown } from "react-icons/io";
import { IoMdTrendingUp } from "react-icons/io";
import { useState } from "react";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IoIosTimer } from "react-icons/io";

export default function DashboardBox(props) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const ITEM_HEIGHT = 48;

    const menuOptions = ["Ngày trước", "Tuần trước", "Tháng trước", "Năm trước"];

    return (
        <div
            className="relative flex flex-col w-[47%] h-[180px] rounded-[10px] overflow-hidden p-[20px]"
            style={{
                backgroundImage: `linear-gradient(to right, ${props.color?.[0]}, ${props.color?.[1]})`
            }}
        >
            <span className="absolute bottom-[20px] left-[20px] text-[115px] opacity-10">
                {props.grow ? <IoMdTrendingUp /> : <IoMdTrendingDown />}
            </span>

            <div className="flex w-full">
                <div>
                    <h4 className="text-white text-[20px] font-semibold">Tổng số người dùng</h4>
                    <span className="text-white text-[35px] font-bold leading-[45px]">277</span>
                </div>

                <div className="ml-auto">
                    {/* icon */}
                    <span className="flex items-center justify-center rounded-[10px] w-[50px] h-[50px] bg-gradient-to-br from-[rgba(0,0,0,0)] to-[rgba(0,0,0,0.4)]">
                        {React.cloneElement(props.icon, { className: "!text-white !opacity-40 !text-[36px]" })}
                    </span>
                </div>
            </div>

            <div className="flex items-center mt-auto py-[0px]">
                <h6 className="text-white pt-[20px] mb-[0px] mt-[0px]">THÁNG TRƯỚC</h6>
                <div className="ml-auto relative">
                    <Button onClick={handleClick} className="!w-[20px] !h-[20px] !min-w-[40px] !min-h-[40px] !rounded-full"><HiDotsVertical className="text-[20px] text-[rgba(0,0,0,0.5)] hover:cursor-pointer" /></Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                            paper: {
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: '102px',
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    paddingLeft: '0px',
                                },
                            },
                        }}
                        className="!absolute !left-[-42px]"
                    >

                        {menuOptions.map((option, index) => (
                            <MenuItem
                                key={index}
                                onClick={handleClose}
                                className="!px-[5px]"
                            >
                                <div className="flex items-center justify-start w-full gap-1">
                                    <IoIosTimer className="text-[12px]" />
                                    <span className="text-[13px]">{option}</span>
                                </div>
                            </MenuItem>
                        ))}

                    </Menu>
                </div>
            </div>

        </div>
    )
}
