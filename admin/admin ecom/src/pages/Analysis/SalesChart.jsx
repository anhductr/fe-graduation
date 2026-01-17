import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Select, MenuItem } from "@mui/material";
import dayjs from "dayjs";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";


/* =======================
   CONSTANTS
======================= */
const YEAR_OPTIONS = [2023, 2024, 2025];

/* =======================
   FAKE RAW DATA
======================= */
function generateRawData(year) {
  return [
    { time: `${year}-01`, sales: 8, import: 5 },
    { time: `${year}-02`, sales: 9, import: 6 },
    { time: `${year}-03`, sales: 9.1, import: 6.2 },
    { time: `${year}-04`, sales: 9.3, import: 6.5 },
    { time: `${year}-05`, sales: 12, import: 8 },
    { time: `${year}-06`, sales: 12.9, import: 9 },
    { time: `${year}-07`, sales: 12.9, import: 9.1 },
    { time: `${year}-08`, sales: 13, import: 9.3 },
    { time: `${year}-09`, sales: 13.2, import: 9.5 },
    { time: `${year}-10`, sales: 13.4, import: 9.8 },
    { time: `${year}-11`, sales: 13.6, import: 10 },
    { time: `${year}-12`, sales: 13.8, import: 10.2 },
  ];
}

/* =======================
   COMPONENT
======================= */
export default function SalesChart() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewType, setViewType] = useState("month");
  const [customRange, setCustomRange] = useState(null);

  function generateRawData(year, viewType) {
    const today = dayjs();

    if (viewType === "week") {
      return Array.from({ length: 7 }, (_, i) => {
        const date = today.subtract(6 - i, "day");
        return {
          time: date.format("YYYY-MM-DD"),
          sales: Math.random() * 10 + 8,
          import: Math.random() * 8 + 5,
        };
      });
    }

    if (viewType === "month") {
      return Array.from({ length: 30 }, (_, i) => {
        const date = today.subtract(29 - i, "day");
        return {
          time: date.format("YYYY-MM-DD"),
          sales: Math.random() * 10 + 8,
          import: Math.random() * 8 + 5,
        };
      });
    }

    // year
    return Array.from({ length: 12 }, (_, i) => ({
      time: `${year}-${String(i + 1).padStart(2, "0")}`,
      sales: Math.random() * 10 + 8,
      import: Math.random() * 8 + 5,
    }));
  }


  const [year, setYear] = useState(dayjs().year());

  const rawData = useMemo(
    () => generateRawData(year, viewType),
    [year, viewType]
  );


  const option = useMemo(() => {
    const times = rawData.map((d) => d.time);
    const sales = rawData.map((d) => d.sales);
    const imports = rawData.map((d) => d.import);

    return {
      grid: {
        left: 50,
        right: 30,
        top: 40,
        bottom: 70,
      },

      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const salesVal = params.find((p) => p.seriesName === "Doanh số")?.data;
          const importVal = params.find((p) => p.seriesName === "Nhập hàng")?.data;
          const profit = (salesVal ?? 0) - (importVal ?? 0);

          return `
          <b>${params[0].axisValue}</b><br/>
          <span style="color:darkgreen">● Doanh số:</span> ${salesVal ?? "-"}<br/>
          <span style="color:#ff4d4f">● Nhập hàng:</span> ${importVal ?? "-"}<br/>
          <hr/>
          <b style="color:${profit >= 0 ? "darkgreen" : "#ff4d4f"}">
            Lợi nhuận: ${profit}
          </b>
        `;
        },
      },

      legend: {
        data: ["Doanh số", "Nhập hàng"],
      },

      xAxis: {
        type: "category",
        data: times,
        axisLabel: {
          interval: viewType === "month" ? 2 : 0,
          formatter: (value) => {
            if (viewType === "year") {
              return `Tháng ${Number(value.split("-")[1])}`;
            }
            return dayjs(value).format("DD/MM");
          },
        },
        splitLine: { show: false }, // (tuỳ chọn) tắt grid dọc
      },

      yAxis: {
        type: "value",
        splitLine: { show: false }, // tắt grid ngang
      },

      series: [
        {
          name: "Doanh số",
          type: "line",
          data: sales,
          smooth: 0.25,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: "darkgreen", width: 2 },
          itemStyle: { color: "darkgreen" },
        },
        {
          name: "Nhập hàng",
          type: "line",
          data: imports,
          smooth: 0.25,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: "#ff4d4f", width: 2 },
          itemStyle: { color: "#ff4d4f" },
        },

        // PROFIT AREA
        {
          type: "line",
          data: sales,
          stack: "profit",
          lineStyle: { opacity: 0 },
          symbol: "none",
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(0,128,0,0.4)" },
                { offset: 1, color: "rgba(0,128,0,0)" },
              ],
            },
          },
        },
        {
          type: "line",
          data: imports,
          stack: "profit",
          lineStyle: { opacity: 0 },
          symbol: "none",
          areaStyle: { color: "transparent" },
        },

        // LOSS AREA
        {
          type: "line",
          data: imports,
          stack: "loss",
          lineStyle: { opacity: 0 },
          symbol: "none",
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(255,77,79,0.4)" },
                { offset: 1, color: "rgba(255,77,79,0)" },
              ],
            },
          },
        },
        {
          type: "line",
          data: sales,
          stack: "loss",
          lineStyle: { opacity: 0 },
          symbol: "none",
          areaStyle: { color: "transparent" },
        },
      ],
    };
  }, [rawData, viewType]);


  return (
    <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-gray-900 text-[20px]">
          Doanh số & tiền nhập hàng
        </div>

        <div className="flex items-center gap-3">
          <Select
            size="small"
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            sx={{ minWidth: 110 }}
          >
            <MenuItem value="week">Theo tuần</MenuItem>
            <MenuItem value="month">Theo tháng</MenuItem>
            <MenuItem value="year">Theo năm</MenuItem>
          </Select>

          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Từ ngày"
              value={startDate}
              onChange={setStartDate}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="Đến ngày"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider> */}

          {viewType !== "week" && (
            <Select
              size="small"
              value={year}
              sx={{
                minWidth: 90,
                cursor: "pointer",
                "& .MuiSelect-select": {
                  cursor: "pointer",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    cursor: "pointer",
                  },
                },
              }}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEAR_OPTIONS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          )}

          <Button
            variant="contained"
            className="!normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* CHART */}
      <ReactECharts option={option} style={{ height: 360 }} />
    </div>
  );
}
