import { Button } from "@mui/material";

export default function OrdersChart() {
  return (
    <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-gray-900 text-[20px]">
          Số lượng đơn hàng theo thời gian
        </div>

        <Button
          variant="contained"
          className="!normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
        >
          Xuất báo cáo
        </Button>
      </div>

      <div className="h-[320px] flex items-center justify-center text-gray-400">
        Area Chart – Orders
      </div>
    </div>
  );
}
