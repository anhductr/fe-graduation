import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from "@mui/material";
import { useState, useEffect } from 'react';
import { FaRegSave } from "react-icons/fa";
import axios from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa";
import Autocomplete from '@mui/material/Autocomplete';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, MenuItem, Select,
    InputLabel, FormControl, InputAdornment
} from '@mui/material';
import InvAddTableRow from "./InvAddTableRow";

import debounce from 'lodash.debounce';
import { useMemo } from 'react';
import { CircularProgress } from "@mui/material";
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { viVN } from '@mui/x-date-pickers/locales';
dayjs.locale('vi');

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    maxWidth: '95vw',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '12px',
    maxHeight: '90vh',           // giới hạn chiều cao
    overflow: 'hidden',          // bắt buộc
    display: 'flex',
    flexDirection: 'column',
};


export default function InventoryModal({ onClose, initialData = null }) {
    const [items, setItems] = useState([]);
    const queryClient = useQueryClient();
    const isWatchMode = !!initialData; // ← biết đang xem hay tạo mới

    const [referenceCode, setReferenceCode] = useState(initialData?.referenceCode || "");
    const [supplierName, setSupplierName] = useState(initialData?.supplierName || "");
    const [note, setNote] = useState(initialData?.note || "");
    const token = localStorage.getItem("token");

    // Load danh sách items từ initialData (nếu có)
    useEffect(() => {
        if (initialData?.items && initialData.items.length > 0) {
            const loadItemsWithColor = async () => {
                const loadedItems = await Promise.all(
                    initialData.items.map(async (item) => {
                        const color = await fetchColorBySku(item.sku);
                        return {
                            id: `edit-${Date.now()}-${Math.random()}`,
                            productId: item.productId,
                            productName: item.productName || item.variantName || "",
                            selectedProduct: {
                                id: item.productId,
                                label: item.productName || item.variantName || item.productId
                            },
                            sku: item.sku || '',
                            quantity: item.quantity,
                            unitCost: item.unitCost,
                            totalCost: item.totalCost || item.quantity * item.unitCost,
                            color: color  // thêm trường color để hiển thị ở chế độ xem
                        };
                    })
                );
                setItems(loadedItems);
            };
            loadItemsWithColor();
        }
    }, [initialData]);

    const fetchColorBySku = async (sku) => {
        if (!sku) return '-';
        console.log(sku);
        try {
            const res = await axios.get(`/api/v1/inventory-service/inventory/get`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { sku }
            });
            // Giả sử backend trả về color trong result (ví dụ: result.color hoặc result.variant.color)
            return res.data.result?.color || res.data.result?.variant?.color || '-';
        } catch (err) {
            console.error("Lỗi lấy màu từ sku:", err);
            return '-';
        }
    };

    // Xóa dòng
    const handleRemoveItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleAddItem = () => {
        setItems([...items, {
            id: Date.now().toString() + Math.random(),
            productId: null,
            productName: '',
            selectedProduct: null,
            sku: '',
            quantity: '',
            unitCost: 0,
            totalCost: 0,
            color: '-'  // mặc định
        }]);
    };

    const onItemChange = (rowId, field, value) => {
        setItems(prevItems => prevItems.map(item =>
            item.id === rowId
                ? (() => {
                    const updated = { ...item };
                    if (field === 'quantity') {
                        updated.quantity = Math.max(1, Number(value) || 1);
                    } else if (field === 'unitCost') {
                        updated.unitCost = Number(value) || 0;
                    }
                    return updated;
                })()
                : item
        ));
    };

    const createStockInMutation = useMutation({
        mutationFn: (payload) =>
            axios.post("/api/v1/inventory-service/stock-in/create", payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }),

        onSuccess: (response) => {
            console.log("Tạo phiếu nhập kho thành công:", response.data);

            // Tự động refetch danh sách lịch sử + tồn kho
            queryClient.invalidateQueries({ queryKey: ["stockins"] });
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            onClose();
        },

        onError: (error) => {
            console.error("Lỗi tạo phiếu nhập kho:", error);
            const msg = error.response?.data?.message || error.message || "Có lỗi xảy ra";
        }
    });

    const handleSubmit = () => {
        // Validation như cũ
        if (items.length === 0) {
            alert("Vui lòng thêm ít nhất một sản phẩm!");
            return;
        }
        if (!referenceCode.trim()) {
            alert("Vui lòng nhập mã hóa đơn!");
            return;
        }
        if (!supplierName.trim()) {
            alert("Vui lòng nhập tên nhà cung cấp!");
            return;
        }

        const payload = {
            supplierName: supplierName.trim(),
            referenceCode: referenceCode.trim(),
            note: note.trim() || null,
            items: items
                .filter(item => item.quantity > 0 && item.unitCost >= 0)
                .map(item => ({
                    sku: item.sku,
                    quantity: Number(item.quantity),
                    unitCost: Number(item.unitCost)
                }))
        };

        if (payload.items.length === 0) {
            alert("Không có sản phẩm hợp lệ để nhập kho!");
            return;
        }

        console.log("payload: ", payload);

        // Gửi dữ liệu qua mutation
        createStockInMutation.mutate(payload);
    };

    useEffect(() => {
        console.log("item: ", items);
    }, [items])

    return (
        <>
            <Box sx={style}>
                <div className='bg-[#1D1E21] p-[10px]'>
                    <h3 className="text-[27px] font-semibold text-white">
                        {isWatchMode ? "Xem chi tiết phiếu nhập kho" : "Nhập thêm hàng"}
                    </h3>
                </div>

                <div className="px-5 overflow-y-auto py-3">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-3">
                            <Typography variant="h6" fontWeight="bold">
                                Thông tin
                            </Typography>
                            <div className="grid grid-cols-2 w-full gap-4 px-1 auto-rows-max">
                                <div className="flex gap-2">
                                    <h6 className="w-[30%]">Mã hóa đơn</h6>
                                    <input disabled={isWatchMode} value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} type='text' className="w-[70%] bg-[#fafafa] pl-[15px] rounded-[5px] h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"></input>
                                </div>

                                <div className="flex gap-2">
                                    <h6 className="w-[30%]">Nhà cung cấp</h6>
                                    <input disabled={isWatchMode} value={supplierName} onChange={(e) => setSupplierName(e.target.value)} type='text' className="w-[70%] bg-[#fafafa] pl-[15px] rounded-[5px] h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"></input>
                                </div>

                                <div className='flex gap-2'>
                                    <h6 className="w-[30%]">Ghi chú</h6>
                                    <textarea disabled={isWatchMode} value={note}
                                        onChange={(e) => setNote(e.target.value)} className="w-[70%] bg-[#fafafa] pl-[15px] py-[10px] rounded-[5px] text-[15px] border-[rgba(0,0,0,0.1)] border border-solid" rows={5} cols={10}></textarea>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Danh sách hàng nhập
                                </Typography>
                                {!isWatchMode && (
                                    <Button
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#4caf50',
                                            '&:hover': { bgcolor: '#388e3c' },
                                            textTransform: 'none'
                                        }}
                                        onClick={handleAddItem}
                                    >
                                        Thêm mặt hàng
                                    </Button>
                                )}
                            </Box>

                            <TableContainer component={Paper} sx={{
                                borderTop: "1px solid #e0e0e0",
                                borderRight: "1px solid #e0e0e0",
                                borderLeft: "1px solid #e0e0e0",
                            }}>
                                <Table
                                    sx={{
                                        '& .MuiTableCell-body': {
                                            fontSize: '13px'
                                        },
                                        // Quan trọng: override fontSize cho các input/select bên trong TableCell
                                        '& .MuiInputBase-root': {
                                            fontSize: '15px',
                                        },
                                        '& .MuiSelect-select': {
                                            fontSize: '15px',
                                        },
                                        '& .MuiAutocomplete-input': {
                                            fontSize: '13px',
                                        }
                                    }}

                                >
                                    <TableHead
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            '& .MuiTableCell-root': {
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: '#333',
                                            },
                                        }}
                                    >
                                        <TableRow>
                                            <TableCell sx={{ width: "30%" }}>Tên sản phẩm</TableCell>
                                            <TableCell sx={{ width: "16%" }} align="center">Màu</TableCell>
                                            <TableCell sx={{ width: "8%" }} align="center">Số lượng</TableCell>
                                            <TableCell sx={{ width: "16%" }} align="center">Giá đơn vị</TableCell>
                                            {!isWatchMode && (
                                                <TableCell align="center" sx={{ fontWeight: 'bold', width: "14%" }}>Thao tác</TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                                    Chưa có sản phẩm nào. Nhấn ‘Thêm sản phẩm’ để bắt đầu.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <InvAddTableRow
                                                        item={item}
                                                        isWatchMode={isWatchMode}
                                                        onItemChange={(field, value) => {
                                                            setItems(prev => prev.map(i =>
                                                                i.id === item.id ? { ...i, [field]: value } : i
                                                            ));
                                                        }}
                                                        onRemove={() => handleRemoveItem(item.id)}
                                                        token={token}
                                                    />
                                                </TableRow>
                                            ))

                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </div>
                </div>
                <DialogActions sx={{ pt: 2, }}>
                    <Button onClick={onClose} variant="outlined">
                        {isWatchMode ? "Thoát" : "Hủy"}
                    </Button>
                    {!isWatchMode && (
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            sx={{
                                bgcolor: '#00bcd4',
                                '&:hover': { bgcolor: '#0097a7' },
                                textTransform: 'none'
                            }}
                        >
                            Chấp nhận
                        </Button>
                    )}
                </DialogActions>
            </Box>
            {createStockInMutation.isPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-pulse">
                        <CircularProgress size={48} thickness={5} color="primary" />
                        <p className="text-lg font-semibold text-gray-800">
                            Đang tạo phiếu nhập kho...
                        </p>
                        <p className="text-sm text-gray-600">Vui lòng đợi một chút</p>
                    </div>
                </div>
            )}
        </>
    );
}


