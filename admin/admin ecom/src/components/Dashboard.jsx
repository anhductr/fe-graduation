import DashboardBox from "./DashboardBox"
import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";
import { GiStarsStack } from "react-icons/gi";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IoIosTimer } from "react-icons/io";
import { useState } from "react";
import Button from '@mui/material/Button';
import { HiDotsHorizontal } from "react-icons/hi";
import { Chart } from "react-google-charts"

export default function Dashboard() {
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

    const data = [
        ["Year", "Sales", "Expenses"],
        ["2013", 1000, 400],
        ["2014", 1170, 460],
        ["2015", 660, 1120],
        ["2016", 1030, 540]
    ]

    const options = {
        'backgroundColor': 'transparent',
        'chartArea': { 'width': '100%', 'height': '80%' },
    };

    return (
        <div className="py-[10px] px-[100px]">
            <div className='flex justify-between items-center my-4'>
                <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                    Tổng quan
                </h3>
            </div>

            {/* dashboard wrapper */}
            <div className="flex flex-wrap">
                <div className="w-full md:w-8/12">
                    <div className="flex gap-[20px] flex-wrap w-full">
                        <DashboardBox color={["#1da256", "#48d483"]} icon={<FaUserCircle />} grow={true}></DashboardBox>
                        <DashboardBox color={["#c012e2", "#eb64fe"]} icon={<IoMdCart />} grow={true}></DashboardBox>
                        <DashboardBox color={["#2c78e5", "#60aff5"]} icon={<MdShoppingBag />} grow={true}></DashboardBox>
                        <DashboardBox color={["#e1950e", "#f3cd29"]} icon={<GiStarsStack />} grow={true}></DashboardBox>
                    </div>
                </div>

                <div className="w-full md:w-4/12 pl-[0px]">
                    <div className="flex-row w-[100%] h-[100%] bg-gradient-to-b from-[#1a50b5] to-[#125be8] rounded-[10px] p-[25px]">
                        <div className="flex justify-between">
                            <h4 className="text-white text-[20px] font-semibold"> Tổng số doanh thu</h4>

                            <div className="">
                                <Button onClick={handleClick} className="!w-[20px] !h-[20px] !min-w-[40px] !min-h-[40px] !rounded-full"><HiDotsHorizontal className="text-[20px] text-[rgba(0,0,0,0.5)] hover:cursor-pointer" /></Button>
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
                                    className="!absolute !left-[-15px]"
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

                        <h3 className="text-white font-bold text-[30px]">$3,787,681.00</h3>
                        <p className="text-[15px] text-white opacity-70">3,578.90 trong tháng trước</p>

                        <Chart
                            chartType="PieChart"
                            width="100%"
                            height="200px"
                            data={data}
                            options={options} />
                    </div>
                </div>
            </div>
        </div>
    )
}