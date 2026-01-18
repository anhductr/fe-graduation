import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

export default function SalesTable() {
  return (
    <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
      <div className="font-semibold text-gray-900 text-[20px] mb-4">
        Thống kê doanh số
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Sản phẩm</TableCell>
              <TableCell align="right">Doanh thu</TableCell>
              <TableCell align="right">Số đơn</TableCell>
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
