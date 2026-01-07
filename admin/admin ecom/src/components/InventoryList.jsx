import { useEffect, useState, useRef } from 'react';
import Pagination from '@mui/material/Pagination';
import Boxes from './Boxes';
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, IconButton, Paper, Dialog, DialogActions, DialogTitle, Button, Chip, Typography, Tooltip
} from "@mui/material";
import { Link } from 'react-router';
import { IoEye } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { MdCardMembership } from "react-icons/md";
import SearchBar from './SearchBar';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useLocation } from "react-router-dom";
import { TbCubePlus } from "react-icons/tb";
import Modal from '@mui/material/Modal';
import InventoryModal from './InventoryModal';
import { MdOutlineHistory } from "react-icons/md";
import { MdDelete } from 'react-icons/md';
import { FaEye } from "react-icons/fa";
import SearchBarNormal from './SearchBarNormal';
import { IoChevronForwardOutline } from 'react-icons/io5';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { viVN } from '@mui/x-date-pickers/locales';
import TransactionModal from './TransactionModal';
dayjs.locale('vi');

export default function InventoryList() {
    const inputSearchRef = useRef(null);
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const size = 6; // số sản phẩm mỗi trang

    const historyRef = useRef(null);

    // const [startDate, setStartDate] = useState('');
    // const [endDate, setEndDate] = useState('');
    const [startDate, setStartDate] = useState(dayjs('2025-01-01').startOf('day'));;
    const [endDate, setEndDate] = useState(dayjs('2025-12-31').endOf('day'));


    //api
    const fetchInventory = async ({ queryKey }) => {
        const [, { page, size }] = queryKey;
        const res = await axios.get(`/api/v1/inventory-service/inventory/get-all`, {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
            params: { page: page, size },
        });
        console.log("inv res: ", res.data.result)
        return res.data.result;
    };

    const fetchStockInHistory = async ({ queryKey }) => {
        const [, { page, size }] = queryKey;
        try {
            const res = await axios.get(`/api/v1/inventory-service/stock-in/get-history?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
                params: { page, size },
            });

            console.log("Lịch sử nhập kho:", res.data.result);
            return res.data.result;

        } catch (error) {
            // QUAN TRỌNG: Phải throw lại lỗi để React Query biết đây là failed query
            console.error("Lỗi trong fetchStockInHistory:", error.response?.data || error);
            // Thêm cái này để log ngay khi có lỗi

            console.error("Lỗi API get-history (400/500/...):", error);
            console.error("Response từ server:", error.response?.data);
            console.error("Status:", error.response?.status);
            console.error("Full error object:", error);
        }
    };

    //inv querry
    const {
        data: inventoryData,
        isLoading: isLoadingInventory,
        isError: isErrorInventory,
        error: errorInventory,
    } = useQuery({
        queryKey: ["inventory", { page, size }],
        queryFn: fetchInventory,
        refetchOnMount: "always",
        keepPreviousData: true,
    });

    // Khi có dữ liệu:
    const inventory = inventoryData?.data;

    //inv querry
    const {
        data: stockInHistoryData,
        isLoading: isLoadingStockHistory,
        isError: isErrorStockHistory,
        error: errorStockHistory,
    } = useQuery({
        queryKey: ["stockins", { page, size, startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
        queryFn: fetchStockInHistory,
        refetchOnMount: "always",
        keepPreviousData: true,
    });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["stockins", { page, size }] });
        setPage(1); // optional: reset về trang 1 khi thay đổi ngày
    }, [startDate, endDate, queryClient]);

    // Khi có dữ liệu:
    const stockInHistory = stockInHistoryData?.data;

    //popup thông báo
    const [popup, setPopup] = useState({
        open: false,
        vertical: 'top',
        horizontal: 'center',
        severity: "info",
    });
    const { vertical, horizontal, open } = popup;

    const location = useLocation();

    useEffect(() => {
        if (location.state?.popup) {
            // Bọc trong timeout nhỏ để đảm bảo component render xong rồi mới set popup
            const timer = setTimeout(() => {
                setPopup({ ...location.state.popup, open: true }); // clone object mới
            }, 100);

            // Xóa state khỏi history để reload lại không hiện lại popup
            window.history.replaceState({}, document.title);

            return () => clearTimeout(timer);
        }
    }, [location.state]);


    useEffect(() => {
        if (isLoadingInventory) {
            setPopup({
                open: true,
                vertical: "top",
                horizontal: "center",
                severity: "info",
                message: "Đang tải danh sách tồn kho...",
            });
        } else if (isErrorInventory) {
            // Lấy chi tiết lỗi từ server (nếu có)
            const serverError = isErrorInventory?.response?.data?.message;
            const serverDetail = isErrorInventory?.response?.data?.error; // nếu backend trả thêm field này
            const fallbackMessage = isErrorInventory?.message || "Không xác định";

            // Log đầy đủ ra console để debug
            console.error("Chi tiết lỗi từ server:", isErrorInventory);

            setPopup({
                open: true,
                vertical: "top",
                horizontal: "center",
                severity: "error",
                message: `Lỗi khi tải danh sách người dùng: ${serverError || serverDetail || fallbackMessage}`,
            });
        } else {
            // Khi load xong thì tắt snackbar loading
            setPopup((prev) => ({ ...prev, open: false }));
        }
    }, [isLoadingInventory, isErrorInventory, errorInventory]);

    //giao dịch
    const [selectedIdTransac, setSelectedIdTransac] = useState(null);
    const [transactionModal, setTransactionModal] = useState(false);
    const handleOpenTransactionModal = (productId) => {
        setTransactionModal(true);
        setSelectedIdTransac(productId);
    };
    const handleCloseTransactionModal = () => {
        setTransactionModal(false);
    };

    //nhập hàng
    const [openInventory, setOpenInventory] = useState(false);
    const handleOpenInventory = () => {
        setSelectedReceipt(null);
        setOpenInventory(true);
    };
    const handleCloseInventory = () => {
        setOpenInventory(false);
    };

    //sửa hóa đơn nhập hàng          
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const handleOpenEditStockIn = (row) => {
        setOpenInventory(true);
        setSelectedReceipt(row);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Thay format date bằng cách này → không cần cài date-fns
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    const getStatus = (invData) => {
        if (invData.quantity === 0) {
            return (
                <Chip
                    label="Hết hàng"
                    color="error"
                    size="small"
                    sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        '& .MuiChip-label': { px: 0.75 }
                    }}
                />
            );
        }
        else if (invData.quantity <= 5) {
            return (
                <Chip
                    label="Sắp hết hàng"
                    color="warning"
                    size="small"
                    sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        '& .MuiChip-label': { px: 0.75 }
                    }}
                />
            );
        }
        else {
            return (
                <Chip
                    label="Còn hàng"
                    color="success"
                    size="small"
                    sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        '& .MuiChip-label': { px: 0.75 }
                    }}
                />
            );
        }
    };

    return (
        <>
            <div className="py-[10px] px-[100px]">
                <Snackbar
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
                </Snackbar>

                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Quản lý tồn kho
                    </h3>
                </div>

                <div className="flex flex-wrap gap-[26px] w-full">
                    <Boxes color={"#81faf8ff"} header={"Tổng khách hàng"} icon={<FaRegUser />} ></Boxes>
                    <Boxes color={"#e8806bff"} header={"Tổng thành viên"} icon={<MdCardMembership />} ></Boxes>
                </div>

                {/* inventory */}
                <div className="shadow border-0 p-5 my-[20px] mx-[0px] bg-white rounded-[10px]">
                    <div className="w-screen pt-2 pb-4 font-semibold text-gray-900 text-[20px]">
                        Danh sách tồn kho
                    </div>

                    <div
                        className="relative flex mb-8"
                        onClick={(e) => {
                            if (inputSearchRef.current && e.target !== inputSearchRef.current) {
                                inputSearchRef.current.blur(); // click ngoài -> blur input
                            }
                        }}
                    >
                        <SearchBar
                            ref={inputSearchRef}
                        // onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <Button variant="contained" className='!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow' onClick={() => { historyRef.current?.scrollIntoView({ behavior: "smooth" }); }}>
                            <MdOutlineHistory className='mr-1 text-[18px]' />
                            <span className='ml-1'>Xem lịch sử thêm hàng</span>
                        </Button>
                    </div>

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
                                        <TableCell sx={{ width: "40%" }}>Tên sản phẩm</TableCell>
                                        <TableCell align='center' sx={{ width: "15%" }}>Số lượng</TableCell>
                                        <TableCell align='center' sx={{ width: "25%" }}>Trạng thái</TableCell>
                                        <TableCell sx={{ width: "20%" }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inventory?.map((inv) => (
                                        <TableRow key={inv.id}>
                                            <TableCell>{inv.variantName}</TableCell>
                                            <TableCell align='center'>{inv.quantity}</TableCell>
                                            <TableCell align='center'>{getStatus(inv)}</TableCell>
                                            <TableCell>
                                                <Button variant="contained" className='!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow' onClick={() => { handleOpenTransactionModal(inv.sku) }}>
                                                    <span className='ml-1 text-[12px]'>Xem lịch sử giao dịch</span>
                                                </Button>
                                            </TableCell>
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


                <div ref={historyRef} className="shadow border-0 p-5 my-[20px] mx-[0px] bg-white rounded-[10px]">
                    <div className="w-screen pt-2 pb-4 font-semibold text-gray-900 text-[20px]">
                        Lịch sử nhập hàng
                    </div>


                    <div
                        className="relative flex gap-5 mb-8"
                        onClick={(e) => {
                            if (inputSearchRef.current && e.target !== inputSearchRef.current) {
                                inputSearchRef.current.blur(); // click ngoài -> blur input
                            }
                        }}
                    >
                        <SearchBarNormal />

                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi" localeText={viVN.components.MuiLocalizationProvider.defaultProps.localeText}>
                            {/* Từ ngày giờ */}
                            <div className='flex items-center gap-3'>
                                <DateTimePicker
                                    label="Từ ngày"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    format="DD/MM/YYYY HH:mm"
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            sx: { width: 210 },
                                        },
                                        actionBar: { actions: ['clear', 'cancel', 'accept'] },
                                    }}

                                />

                                <IoChevronForwardOutline size={20} color="#666" />

                                {/* Đến ngày giờ */}
                                <DateTimePicker
                                    label="Đến ngày"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    minDateTime={startDate} // không cho chọn nhỏ hơn ngày bắt đầu
                                    format="DD/MM/YYYY HH:mm"
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            sx: { width: 210 },
                                        },
                                        actionBar: { actions: ['clear', 'cancel', 'accept'] },
                                    }}
                                />
                            </div>
                        </LocalizationProvider>

                        <Button variant="contained" className='!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow' onClick={handleOpenInventory}>
                            <TbCubePlus className='mr-1 text-[18px]' />
                            <span className='ml-1'>Nhập thêm hàng</span>
                        </Button>
                    </div>

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
                            <Table sx={{
                                '& .MuiTableCell-root': {
                                    fontSize: '13px',
                                },
                            }}>
                                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, width: "14%" }}>Mã phiếu</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "16%" }}>Nhà cung cấp</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "14%" }} align="center">Số mặt hàng</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "14%" }} align="right">Tổng tiền</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "14%" }}>Ngày nhập</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "14%" }}>Ghi chú</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "14%" }} align="center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stockInHistory?.map((row) => (
                                        <TableRow
                                            key={row.referenceCode}
                                            hover
                                        >
                                            <TableCell>
                                                <Chip
                                                    label={row.referenceCode}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.68rem',
                                                        '& .MuiChip-label': { px: 0.75 }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight={400} color="primary" fontSize="13px">
                                                    {row.supplierName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={`${row.items.length} sản phẩm`}
                                                    color="info"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.68rem',
                                                        '& .MuiChip-label': { px: 0.75 }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    fontWeight={700}
                                                    color="error"
                                                    fontSize="13px"
                                                >
                                                    {formatCurrency(row.totalAmount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontSize={"13px"}>
                                                    {formatDate(row.createAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    color={row.note ? "text.primary" : "text.secondary"}
                                                    fontSize={"13px"}
                                                    sx={{
                                                        fontStyle: row.note ? 'normal' : 'italic',
                                                        maxWidth: 150,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    title={row.note || 'Không có ghi chú'}
                                                >
                                                    {row.note || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Thao tác */}
                                            <TableCell align="center">
                                                <Tooltip title="Xem chi tiết" disableInteractive>
                                                    <IconButton size="small" color="primary" onClick={() => handleOpenEditStockIn(row)}>
                                                        <FaEye />
                                                    </IconButton>
                                                </Tooltip>


                                                <Tooltip title="Xóa" disableInteractive>
                                                    <IconButton size="small" color="error">
                                                        <MdDelete />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
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


            <Modal
                open={openInventory}
            >
                <InventoryModal onClose={handleCloseInventory} initialData={selectedReceipt} />
            </Modal>

            <Modal
                open={transactionModal}
                onClose={handleCloseTransactionModal}
            >
                <TransactionModal productId={selectedIdTransac} />
            </Modal>

        </>
    )
}