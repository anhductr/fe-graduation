import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function OrdersTable() {
  return (
    <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
      <div className="font-semibold text-gray-900 text-[20px] mb-4">
        Thống kê đơn hàng
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Ngày</TableCell>
              <TableCell align="right">Tổng đơn</TableCell>
              <TableCell align="right">Thành công</TableCell>
              <TableCell align="right">Hủy</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* rows */}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
