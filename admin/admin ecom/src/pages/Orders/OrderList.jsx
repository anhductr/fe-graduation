import { useState, useRef } from "react";
import Pagination from "@mui/material/Pagination";
import Boxes from "../../components/common/Boxes";
import { api } from "../../libs/axios";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { FaRegUser } from "react-icons/fa6";
import { MdCardMembership } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function OrderList() {
    const inputSearchRef = useRef(null);
    const queryClient = useQueryClient();

    /* ================= STATE ================= */
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(5);
    const [status, setStatus] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [isToggleFilter, setIsToggleFilter] = useState(false);

    /* ================= STATUS MAP ================= */
    const statusColorMap = {
        PENDING: "info",
        PROCESSING: "warning",
        DELIVERED: "success",
        CANCELLED: "error",
    };

    const statusMap = {
        PENDING: "Chờ thanh toán",
        PROCESSING: "Đang xử lý",
        DELIVERED: "Hoàn thành",
        CANCELLED: "Đã hủy",
    };

    const statusStyleMap = {
        PENDING: {
            bg: "#e3f2fd",
            color: "#1976d2",
        },
        PROCESSING: {
            bg: "#fff3e0",
            color: "#ed6c02",
        },
        DELIVERED: {
            bg: "#e8f5e9",
            color: "#2e7d32",
        },
        CANCELLED: {
            bg: "#fdecea",
            color: "#d32f2f",
        },
    };

    const defaultStatusStyle = {
        bg: "#eeeeee",
        color: "#616161",
    };

    const filterStatusStyle =
        statusStyleMap[status] || defaultStatusStyle;


    /* ================= FETCH ORDERS ================= */
    const fetchOrders = async ({ queryKey }) => {
        const [_key, { status, page, size }] = queryKey;

        const res = await api.get("/order-service/order/get/status", {
            params: { status, page, size },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        return res.data?.result ?? { data: [], totalElements: 0 };
    };


    /* ================= QUERY ================= */
    const { data, isLoading } = useQuery({
        queryKey: ["orders", { status, page, size, searchTerm }],
        queryFn: fetchOrders,
        keepPreviousData: true,
    });

    /* ================= MUTATION: UPDATE STATUS ================= */
    const updateStatusMutation = useMutation({
        mutationFn: ({ orderId, status }) =>
            api.post(
                `/order-service/order/status`,
                null,
                {
                    params: { orderId, status },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            ),
        onSuccess: () => {
            queryClient.invalidateQueries(["orders"]);
        },
    });

    /* ================= DATA MAPPING ================= */
    const orders =
        data?.data?.map((order) => ({
            orderId: order.orderId,
            fullName: `${order.firstName} ${order.lastName}`,
            totalAmount: order.totalPrice,
            statusKey: order.Status,
            statusLabel: statusMap[order.Status] || order.Status,
            createdAt: order.orderDate,
        })) || [];

    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true;

        const keyword = searchTerm.toLowerCase();

        return (
            order.orderId.toLowerCase().includes(keyword) ||
            order.fullName.toLowerCase().includes(keyword) ||
            order.statusLabel.toLowerCase().includes(keyword) ||
            order.totalAmount.toString().includes(keyword) ||
            order.createdAt?.toLowerCase().includes(keyword)

        );
    });

    const totalPages = Math.ceil((data?.totalElements || 0) / size);

    const getOrderStatusChip = (statusKey) => (
        <Chip
            label={statusMap[statusKey]}
            color={statusColorMap[statusKey]}
            size="small"
            sx={{ fontWeight: 500 }}
        />
    );

    /* ================= RENDER ================= */
    return (
        <div className="py-[10px] px-[100px]">
            <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                Quản lý đơn hàng
            </h3>

            {/* SEARCH + FILTER */}
            <div className="shadow p-5 bg-white rounded-[10px] mb-6">
                <div className="flex gap-4 items-center">
                    <TextField
                        inputRef={inputSearchRef}
                        size="small"
                        placeholder="Tìm theo mã đơn / tên khách hàng"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        sx={{ width: 300 }}
                    />

                    <Button
                        variant="outlined"
                        onClick={() => setIsToggleFilter((prev) => !prev)}
                    >
                        Bộ lọc
                    </Button>

                    {isToggleFilter && (
                        <Box className="mt-4">
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                {/* <InputLabel>Trạng thái</InputLabel> */}
                                <Select
                                    size="small"
                                    value={status}
                                    label="Trạng thái"
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        setPage(1);
                                    }}
                                    sx={{
                                        minWidth: 150,
                                        fontWeight: 600,
                                        borderRadius: "20px",
                                        backgroundColor: filterStatusStyle.bg,
                                        color: filterStatusStyle.color,

                                        "& .MuiSelect-icon": {
                                            color: filterStatusStyle.color,
                                        },

                                        "& .MuiOutlinedInput-notchedOutline": {
                                            border: "none",
                                        },
                                    }}
                                >
                                    <MenuItem value="ALL">Tất cả</MenuItem>
                                    <MenuItem value="PENDING">Chờ thanh toán</MenuItem>
                                    <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
                                    <MenuItem value="DELIVERED">Hoàn thành</MenuItem>
                                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </div>
            </div>

            {/* TABLE */}
            <div className="shadow p-5 bg-white rounded-[10px]">
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell align="center">Mã đơn</TableCell>
                                <TableCell align="center">Người dùng</TableCell>
                                <TableCell align="center">Tổng tiền</TableCell>
                                <TableCell align="center">Trạng thái</TableCell>
                                <TableCell align="center">Ngày tạo</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredOrders.map((order) => {
                                const statusStyle =
                                    statusStyleMap[order.statusKey] || defaultStatusStyle;

                                return (
                                    <TableRow key={order.orderId}>
                                        <TableCell align="center">{order.orderId}</TableCell>
                                        <TableCell align="center">{order.fullName}</TableCell>
                                        <TableCell align="center">
                                            {order.totalAmount.toLocaleString()}₫
                                        </TableCell>

                                        {/* TRẠNG THÁI */}
                                        <TableCell align="center">
                                            <Select
                                                size="small"
                                                value={order.statusKey}
                                                onChange={(e) =>
                                                    updateStatusMutation.mutate({
                                                        orderId: order.orderId,
                                                        status: e.target.value,
                                                    })
                                                }
                                                sx={{
                                                    minWidth: 150,
                                                    fontWeight: 600,
                                                    borderRadius: "20px",
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.color,

                                                    "& .MuiSelect-icon": {
                                                        color: statusStyle.color,
                                                    },

                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: "none",
                                                    },
                                                }}
                                            >
                                                <MenuItem value="PENDING">Chờ thanh toán</MenuItem>
                                                <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
                                                <MenuItem value="DELIVERED">Hoàn thành</MenuItem>
                                                <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                                            </Select>
                                        </TableCell>

                                        <TableCell align="center">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleString("vi-VN")
                                                : "—"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* PAGE SIZE */}
                <div className="flex justify-between items-center mt-6">
                    <Typography>
                        Tổng {data?.totalElements || 0} đơn hàng
                    </Typography>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Số dòng</InputLabel>
                        <Select
                            value={size}
                            label="Số dòng"
                            onChange={(e) => {
                                setSize(e.target.value);
                                setPage(1);
                            }}
                        >
                            <MenuItem value={5}>5 / trang</MenuItem>
                            <MenuItem value={10}>10 / trang</MenuItem>
                            <MenuItem value={20}>20 / trang</MenuItem>
                            <MenuItem value={50}>50 / trang</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-center mt-6">
                    <Pagination
                        page={page}
                        count={totalPages}
                        onChange={(e, value) => setPage(value)}
                    />
                </div>
            </div>
        </div>
    );
}
