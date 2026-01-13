import { useEffect, useState, useRef } from 'react';
import Pagination from '@mui/material/Pagination';
import Boxes from '../../components/common/Boxes';
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Paper, Dialog, DialogActions, DialogTitle, Button, Chip
} from "@mui/material";
import { Link } from 'react-router';
import { MdDelete } from "react-icons/md";
import { IoEye } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { MdCardMembership } from "react-icons/md";
// import SearchBar from '../../components/common/SearchBar';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useLocation } from "react-router-dom";
import { TbCubePlus } from "react-icons/tb";
import Modal from '@mui/material/Modal';
import InventoryModal from '../../components/Inventory/InventoryModal';

export default function OrderList() {
    const inputSearchRef = useRef(null);
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const size = 6; // số sản phẩm mỗi trang

    //api
    // const fetchInventory = async ({ queryKey }) => {
    //     const [, { page, size }] = queryKey;
    //     const token = localStorage.getItem("token");
    //     const res = await axios.get(`/api/v1/inventory-service/inventory/get-all`, {
    //         headers: {
    //             Authorization: token ? `Bearer ${token}` : "",
    //         },
    //         params: { page: page, size },
    //     });
    //     console.log("res: ", res.data.result)
    //     return res.data.result;
    // };

    // //inv querry
    // const {
    //     data: inventoryData,
    //     isLoading: isLoadingInventory,
    //     isError: isErrorInventory,
    //     error: errorInventory,
    // } = useQuery({
    //     queryKey: ["inventory", { page, size }],
    //     queryFn: fetchInventory,
    //     refetchOnMount: "always",
    //     keepPreviousData: true,
    // });

    // // Khi có dữ liệu:
    // const inventory = inventoryData?.data;

    // //popup thông báo
    // const [popup, setPopup] = useState({
    //     open: false,
    //     vertical: 'top',
    //     horizontal: 'center',
    //     severity: "info",
    // });
    // const { vertical, horizontal, open } = popup;

    // const location = useLocation();

    // useEffect(() => {
    //     if (location.state?.popup) {
    //         // Bọc trong timeout nhỏ để đảm bảo component render xong rồi mới set popup
    //         const timer = setTimeout(() => {
    //             setPopup({ ...location.state.popup, open: true }); // clone object mới
    //         }, 100);

    //         // Xóa state khỏi history để reload lại không hiện lại popup
    //         window.history.replaceState({}, document.title);

    //         return () => clearTimeout(timer);
    //     }
    // }, [location.state]);


    // useEffect(() => {
    //     if (isLoadingInventory) {
    //         setPopup({
    //             open: true,
    //             vertical: "top",
    //             horizontal: "center",
    //             severity: "info",
    //             message: "Đang tải danh sách tồn kho...",
    //         });
    //     } else if (isErrorInventory) {
    //         // Lấy chi tiết lỗi từ server (nếu có)
    //         const serverError = isErrorInventory?.response?.data?.message;
    //         const serverDetail = isErrorInventory?.response?.data?.error; // nếu backend trả thêm field này
    //         const fallbackMessage = isErrorInventory?.message || "Không xác định";

    //         // Log đầy đủ ra console để debug
    //         console.error("Chi tiết lỗi từ server:", isErrorInventory);

    //         setPopup({
    //             open: true,
    //             vertical: "top",
    //             horizontal: "center",
    //             severity: "error",
    //             message: `Lỗi khi tải danh sách người dùng: ${serverError || serverDetail || fallbackMessage}`,
    //         });
    //     } else {
    //         // Khi load xong thì tắt snackbar loading
    //         setPopup((prev) => ({ ...prev, open: false }));
    //     }
    // }, [isLoadingInventory, isErrorInventory, errorInventory]);

    // Dữ liệu mẫu để test map trong bảng đơn hàng
    const orders = [
        {
            orderId: "ORD-1001",
            userId: "USR-001",
            fullName: "Nguyễn Văn A",
            shippingAddress: "123 Lê Lợi, Quận 1, TP.HCM",
            paymentMethod: "COD",
            orderStatus: "Đang xử lý",
            createdAt: "2025-11-20T10:25:00",
            totalAmount: 1250000,
            items: [
                { productId: "P001", productName: "Điện thoại Galaxy A55", quantity: 1, price: 8500000 },
                { productId: "P010", productName: "Ốp lưng Silicon A55", quantity: 1, price: 150000 }
            ]
        },
        {
            orderId: "ORD-1002",
            userId: "USR-002",
            fullName: "Trần Thị B",
            shippingAddress: "55 Nguyễn Huệ, Quận 1, TP.HCM",
            paymentMethod: "VNPay",
            orderStatus: "Đã thanh toán",
            createdAt: "2025-11-19T14:10:00",
            totalAmount: 32900000,
            items: [
                { productId: "P005", productName: "iPhone 15 Pro Max 256GB", quantity: 1, price: 32900000 }
            ]
        },
        {
            orderId: "ORD-1003",
            userId: "USR-003",
            fullName: "Lê Minh C",
            shippingAddress: "22 Lý Thường Kiệt, Đà Nẵng",
            paymentMethod: "Momo",
            orderStatus: "Đang giao",
            createdAt: "2025-11-18T08:30:00",
            totalAmount: 4500000,
            items: [
                { productId: "P020", productName: "Tai nghe Sony WH-1000XM4", quantity: 1, price: 4500000 }
            ]
        },
        {
            orderId: "ORD-1004",
            userId: "USR-001",
            fullName: "Nguyễn Văn A",
            shippingAddress: "123 Lê Lợi, Quận 1, TP.HCM",
            paymentMethod: "Momo",
            orderStatus: "Hoàn thành",
            createdAt: "2025-11-17T12:15:00",
            totalAmount: 780000,
            items: [
                { productId: "P030", productName: "Chuột Logitech G304", quantity: 1, price: 780000 }
            ]
        },
        {
            orderId: "ORD-1005",
            userId: "USR-004",
            fullName: "Phạm Quốc D",
            shippingAddress: "12 Trần Phú, Hà Nội",
            paymentMethod: "COD",
            orderStatus: "Đã hủy",
            createdAt: "2025-11-17T09:05:00",
            totalAmount: 1500000,
            items: [
                { productId: "P045", productName: "Bàn phím cơ Akko 3068B", quantity: 1, price: 1500000 }
            ]
        },
        {
            orderId: "ORD-1006",
            userId: "USR-005",
            fullName: "Đinh Mỹ E",
            shippingAddress: "48 Võ Văn Ngân, Thủ Đức",
            paymentMethod: "VNPay",
            orderStatus: "Đang xử lý",
            createdAt: "2025-11-16T16:50:00",
            totalAmount: 950000,
            items: [
                { productId: "P060", productName: "Loa Bluetooth JBL Flip 6", quantity: 1, price: 950000 }
            ]
        },
        {
            orderId: "ORD-1007",
            userId: "USR-002",
            fullName: "Trần Thị B",
            shippingAddress: "55 Nguyễn Huệ, Quận 1, TP.HCM",
            paymentMethod: "Momo",
            orderStatus: "Hoàn thành",
            createdAt: "2025-11-15T08:40:00",
            totalAmount: 299000,
            items: [
                { productId: "P075", productName: "Sạc nhanh 25W Samsung", quantity: 1, price: 299000 }
            ]
        },
        {
            orderId: "ORD-1008",
            userId: "USR-006",
            fullName: "Huỳnh Gia F",
            shippingAddress: "77 Hai Bà Trưng, Hà Nội",
            paymentMethod: "COD",
            orderStatus: "Đang giao",
            createdAt: "2025-11-14T13:25:00",
            totalAmount: 2390000,
            items: [
                { productId: "P081", productName: "Máy lọc không khí Xiaomi", quantity: 1, price: 2390000 }
            ]
        },
        {
            orderId: "ORD-1009",
            userId: "USR-007",
            fullName: "Võ Chí G",
            shippingAddress: "90 Hoàng Diệu, Cần Thơ",
            paymentMethod: "ZaloPay",
            orderStatus: "Hoàn thành",
            createdAt: "2025-11-13T11:05:00",
            totalAmount: 650000,
            items: [
                { productId: "P090", productName: "Webcam Logitech C270", quantity: 1, price: 650000 }
            ]
        },
        {
            orderId: "ORD-1010",
            userId: "USR-003",
            fullName: "Lê Minh C",
            shippingAddress: "22 Lý Thường Kiệt, Đà Nẵng",
            paymentMethod: "VNPay",
            orderStatus: "Đang xử lý",
            createdAt: "2025-11-12T15:45:00",
            totalAmount: 1890000,
            items: [
                { productId: "P101", productName: "Ổ cứng SSD Samsung 1TB", quantity: 1, price: 1890000 }
            ]
        }
    ];

    const getOrderStatusChip = (status) => {
        let color = "default";

        switch (status) {
            case "Hoàn thành":
                color = "success";
                break;
            case "Đang giao":
                color = "warning";
                break;
            case "Đã hủy":
                color = "error";
                break;
            case "Đã thanh toán":
                color = "info";
                break;
            default:
                color = "default";
        }

        return (
            <Chip
                label={status}
                color={color}
                size="small"
                sx={{ height: 22, fontSize: "0.7rem", "& .MuiChip-label": { px: 0.75 } }}
            />
        );
    };



    return (
        <>
            <div className="py-[10px] px-[100px]">
                {/* <Snackbar
                    anchorOrigin={{ vertical, horizontal }}
                    open={open}
                    key={vertical + horizontal}
                    autoHideDuration={isLoadingInventory ? null : 3000}
                    onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
                >
                    <Alert
                        severity={popup.severity ?? "info"}   // dùng ?? để tránh lỗi undefined
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {popup.message || ""}
                    </Alert>
                </Snackbar> */}

                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Quản lý đơn hàng
                    </h3>
                </div>

                <div className="flex flex-wrap gap-[26px] w-full">
                    <Boxes color={"#81faf8ff"} header={"Tổng khách hàng"} icon={<FaRegUser />} ></Boxes>
                    <Boxes color={"#e8806bff"} header={"Tổng thành viên"} icon={<MdCardMembership />} ></Boxes>
                </div>

                {/* search bar + filter */}
                <div className='shadow border-0 p-5 my-[20px] bg-white rounded-[10px]'>
                    <div
                        className="relative flex"
                        onClick={(e) => {
                            if (inputSearchRef.current && e.target !== inputSearchRef.current) {
                                inputSearchRef.current.blur(); // click ngoài -> blur input
                            }
                        }}
                    >
                        {/* <SearchBar
                            ref={inputSearchRef}
                        // onChange={(e) => setSearchTerm(e.target.value)}
                        /> */}

                        {/* <Button variant="contained" className='!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow' onClick={handleOpenInventory}>
                            <TbCubePlus className='mr-1 text-[18px]' />
                            <span className='ml-1'>Nhập thêm hàng</span>
                        </Button> */}
                    </div>

                </div>

                <div className="shadow border-0 p-5 my-[20px] mx-[0px] bg-white rounded-[10px]">
                    {/* table */}
                    <div className='mt-3'>
                        <TableContainer
                            component={Paper}
                            sx={{
                                width: "100%",
                                borderTop: "1px solid #e0e0e0",
                                borderRight: "1px solid #e0e0e0",
                                borderLeft: "1px solid #e0e0e0",
                            }}
                        >
                            <Table sx={{ width: "100%" }}>
                                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableRow>
                                        <TableCell>Mã đơn</TableCell>
                                        <TableCell>Người dùng</TableCell>
                                        <TableCell>Tổng tiền</TableCell>
                                        <TableCell>Thanh toán</TableCell>
                                        <TableCell>Trạng thái</TableCell>
                                        <TableCell>Ngày tạo</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.orderId}>
                                            <TableCell>{order.orderId}</TableCell>
                                            <TableCell>{order.fullName}</TableCell>
                                            <TableCell>{order.totalAmount.toLocaleString()}₫</TableCell>
                                            <TableCell>{order.paymentMethod}</TableCell>
                                            <TableCell>{getOrderStatusChip(order.orderStatus)}</TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleString("vi-VN")}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>


                        <div className='flex justify-center pb-[20px] pt-[30px]'>
                            <Pagination
                                count={10}
                                sx={{
                                    "& .MuiPaginationItem-root.Mui-selected": {
                                        background: "linear-gradient(to right, #4a2fcf, #6440F5)",
                                        color: "#fff",
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}