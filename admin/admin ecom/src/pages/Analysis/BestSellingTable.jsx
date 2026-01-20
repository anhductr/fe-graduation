import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from "@mui/material";
import axios from "axios";

export default function BestSellingTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "/analysis-service/analysis/bestSelling"
        );

        if (res.data?.code === 200) {
          setRows(res.data.result.slice(0, 10));
        }
      } catch (error) {
        console.error("Fetch best selling failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, []);

  return (
    <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
      <div className="font-semibold text-gray-900 text-[20px] mb-4">
        Top 10 sản phẩm bán chạy
      </div>

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>Ảnh</TableCell>
              <TableCell>Sản phẩm</TableCell>
              <TableCell align="right">Tổng bán</TableCell>
              <TableCell align="right">Doanh số</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            )}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}

            {rows.map((row) => (
              <TableRow key={row.sku}>
                <TableCell>
                  <Avatar
                    src={row.thumbnail || "/images/no-image.png"}
                    variant="rounded"
                    sx={{ width: 48, height: 48 }}
                  />
                </TableCell>

                <TableCell>
                  <div className="font-medium">
                    {row.variantName || "Không có tên"}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {row.sku}
                  </div>
                </TableCell>

                <TableCell align="right">
                  {row.totalSold}
                </TableCell>

                <TableCell align="right">
                  {row.totalRevenue.toLocaleString("vi-VN")} ₫
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
