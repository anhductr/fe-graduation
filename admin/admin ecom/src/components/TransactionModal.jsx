import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from "@mui/material";
import { useState, useEffect, useRef } from 'react';
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
import React from "react";
import debounce from 'lodash.debounce';
import { useMemo } from 'react';
import { CircularProgress } from "@mui/material";
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { viVN } from '@mui/x-date-pickers/locales';
import { data } from "react-router";
import { useQueries } from '@tanstack/react-query';
dayjs.locale('vi');

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900,
    maxWidth: '95vw',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '12px',
    maxHeight: '90vh',           // giới hạn chiều cao
    overflow: 'hidden',          // bắt buộc
    display: 'flex',
    flexDirection: 'column',
};


export default function TransactionModal({ onClose, productId }) {
    const token = localStorage.getItem("token");
    //api function
    const getTransactionData = async (productId) => {
        const res = await axios.get(
            `/api/v1/inventory-service/inventory/transactions?sku=${productId}`,
            {
                headers:
                {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log("res data: ", res.data)
        return res.data.data;
    }

    const getStockInData = async (stockInId) => {
        try {
            const res = await axios.get(
                `/api/v1/inventory-service/stock-in/get-by-id/${stockInId}`,
                {
                    headers:
                    {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log("res stockin: ", res.data.result)
            return res.data.result;
        } catch (err) {
            console.error("Lỗi khi gọi API", err);
            if (err.response) {
                // Lỗi do server trả về
                console.error("Lỗi từ server:", err.response.data);
                console.error("Status code:", err.response.status);
            } else if (err.request) {
                // Request gửi đi nhưng không nhận được phản hồi
                console.error("Không có phản hồi từ server:", err.request);
            } else {
                // Lỗi khác (ví dụ cấu hình sai)
                console.error("Lỗi khi setup request:", err.message);
            }
        }

    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const {
        data: inventData,
        isLoading: isLoadingInvent,
        isError: isErrorInvent,
        error: errorInvent,
    } = useQuery({
        queryKey: ["transactionList"], //thêm productId vào queryKey
        queryFn: () => getTransactionData(productId), //truyền productId vào hàm
        refetchOnMount: "always",
    });
    const transactionData = inventData;

    const stockInQueries = useQueries({
        queries: transactionData
            ?.filter(item => item.transactionType === "IN")
            .map(item => ({
                queryKey: ['stock-in', item.referenceId],
                queryFn: () => getStockInData(item.referenceId),
            })) ?? []
    });

    const stockInDataMap = {};
    stockInQueries.forEach((q, idx) => {
        const item = transactionData.filter(i => i.transactionType === "IN")[idx];
        if (item) {
            stockInDataMap[item.referenceId] = q.data;
        }
    });

    return (
        <>
            <Box sx={style}>
                <div className='bg-[#1D1E21] p-[10px]'>
                    <h3 className="text-[27px] font-semibold text-white">
                        Lịch sử giao dịch
                    </h3>
                </div>

                <div className="px-5 overflow-y-auto py-3">
                    <div>
                        {transactionData?.length === 0 ? (
                            <h6>Chưa có giao dịch nào</h6>
                        ) : (

                            <TableContainer component={Paper} sx={{
                                borderTop: "1px solid #e0e0e0",
                                borderRight: "1px solid #e0e0e0",
                                borderLeft: "1px solid #e0e0e0",
                            }}>
                                <Table>
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
                                            <TableCell sx={{ width: "20%" }} align="center">Số lượng</TableCell>
                                            <TableCell sx={{ width: "20%" }} align="center">Loại giao dịch</TableCell>
                                            <TableCell align="center" sx={{ width: '30%', fontWeight: 'bold' }}>Ngày tạo</TableCell>
                                            <TableCell align="center" sx={{ width: '50%', fontWeight: 'bold' }}>Thông tin chung</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {transactionData?.map((data) => (
                                            <TableRow key={data.id}>
                                                <TableCell align="center">
                                                    <Box>
                                                        <Typography
                                                            fontSize="14px"
                                                            sx={{
                                                                color: data.transactionType === "IN" ? "green" : "red",
                                                                fontWeight: 600
                                                            }}
                                                        >
                                                            {data.transactionType === "IN" ? `+${data.quantity}` : `-${data.quantity}`}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Box>
                                                        <Typography fontSize={"14px"}>
                                                            {data.transactionType === "IN" ? `NHẬP` : `XUẤT`}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Box>
                                                        <Typography fontSize={"13px"}>
                                                            {formatDate(data.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell>
                                                    {data.transactionType !== "IN" ? (
                                                        <Typography fontSize="14px" color="gray">
                                                            —
                                                        </Typography>
                                                    ) : !stockInDataMap[data.referenceId] ? (
                                                        <Typography fontSize="14px">Loading...</Typography>
                                                    ) : (
                                                        <>
                                                            <Typography fontSize="14px">
                                                                <strong>- Mã hóa đơn:</strong> {stockInDataMap[data.referenceId].referenceCode}
                                                            </Typography>
                                                            <Typography fontSize="14px">
                                                                <strong>- Nhà cung cấp: </strong>{stockInDataMap[data.referenceId].supplierName}
                                                            </Typography>
                                                            <Typography
                                                                fontSize="14px"
                                                            >
                                                                <strong>- Tổng tiền: </strong> {formatCurrency(stockInDataMap[data.referenceId].totalAmount)}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </div>
                </div>
            </Box>
        </>
    );
}