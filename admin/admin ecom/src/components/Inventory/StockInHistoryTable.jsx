import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Pagination,
} from "@mui/material";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const StockInHistoryTable = ({
  historyData,
  onOpenEditStockIn,
  page,
  count,
  onChangePage,
  onDeleteStockIn,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-3">
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          borderTop: "1px solid #e0e0e0",
          borderRight: "1px solid #e0e0e0",
          borderLeft: "1px solid #e0e0e0",
        }}
      >
        <Table
          sx={{
            "& .MuiTableCell-root": {
              fontSize: "13px",
            },
          }}
        >
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: "14%" }}>
                Mã phiếu
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: "16%" }}>
                Nhà cung cấp
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: "14%" }} align="center">
                Số mặt hàng
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: "14%" }} align="right">
                Tổng tiền
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: "14%" }}>
                Ngày nhập
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: "14%" }}>
                Ghi chú
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: "14%" }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historyData?.map((row) => (
              <TableRow key={row.id || row.referenceCode} hover>
                <TableCell>
                  <Chip
                    label={row.referenceCode}
                    color="primary"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: "0.68rem",
                      "& .MuiChip-label": { px: 0.75 },
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
                    label={`${row.items ? row.items.length : 0} sản phẩm`}
                    color="info"
                    sx={{
                      height: 20,
                      fontSize: "0.68rem",
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={700} color="error" fontSize="13px">
                    {formatCurrency(row.totalAmount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography fontSize={"13px"}>
                    {formatDate(row.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={row.note ? "text.primary" : "text.secondary"}
                    fontSize={"13px"}
                    sx={{
                      fontStyle: row.note ? "normal" : "italic",
                      maxWidth: 150,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={row.note || "Không có ghi chú"}
                  >
                    {row.note || "—"}
                  </Typography>
                </TableCell>

                {/* Thao tác */}
                <TableCell align="center">
                  <Tooltip title="Xem chi tiết" disableInteractive>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onOpenEditStockIn(row)}
                    >
                      <FaEye />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Xóa" disableInteractive>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Bạn có chắc chắn muốn xóa phiếu nhập này?"
                          )
                        ) {
                          onDeleteStockIn(row.referenceCode);
                        }
                      }}
                    >
                      <MdDelete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {(!historyData || historyData.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="flex justify-center pb-[20px] pt-[30px]">
        <Pagination
          count={count || 1}
          page={page}
          onChange={onChangePage}
          sx={{
            "& .MuiPaginationItem-root.Mui-selected": {
              background: "linear-gradient(to right, #4a2fcf, #6440F5)",
              color: "#fff",
            },
          }}
        />
      </div>
    </div>
  );
};

export default StockInHistoryTable;
