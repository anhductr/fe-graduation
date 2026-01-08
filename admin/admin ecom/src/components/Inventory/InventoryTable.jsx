import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Pagination,
} from "@mui/material";

const InventoryTable = ({
  inventory,
  page,
  count,
  onChangePage,
  onOpenTransactionModal,
}) => {
  const getStatus = (invData) => {
    if (invData.quantity === 0) {
      return (
        <Chip
          label="Hết hàng"
          color="error"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.68rem",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      );
    } else if (invData.quantity <= 5) {
      return (
        <Chip
          label="Sắp hết hàng"
          color="warning"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.68rem",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      );
    } else {
      return (
        <Chip
          label="Còn hàng"
          color="success"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.68rem",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      );
    }
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
        <Table sx={{ width: "100%" }}>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ width: "20%", fontWeight: "bold" }}>
                SKU
              </TableCell>
              <TableCell sx={{ width: "30%", fontWeight: "bold" }}>
                Tên sản phẩm
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: "15%", fontWeight: "bold" }}
              >
                Số lượng
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: "20%", fontWeight: "bold" }}
              >
                Trạng thái
              </TableCell>
              <TableCell sx={{ width: "15%" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory?.map((inv) => (
              <TableRow key={inv.id} hover>
                <TableCell>{inv.sku}</TableCell>
                <TableCell>{inv.productName || "N/A"}</TableCell>
                <TableCell align="center">{inv.quantity}</TableCell>
                <TableCell align="center">{getStatus(inv)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    className="!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
                    sx={{ borderRadius: "6px", textTransform: "none" }}
                    onClick={() => {
                      onOpenTransactionModal(inv.sku);
                    }}
                  >
                    <span className="ml-1 text-[12px]">Lịch sử GD</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!inventory || inventory.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
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

export default InventoryTable;
