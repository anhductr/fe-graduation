import { useMemo, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Select, MenuItem } from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const currentYear = dayjs().year();
const YEAR_OPTIONS = [
  currentYear - 3,
  currentYear - 2,
  currentYear - 1,
  currentYear,
];

export default function SalesChart() {
  const [year, setYear] = useState(dayjs().year());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchRevenue(payload) {
    setLoading(true);
    try {
      const res = await fetch(
        "/analysis-service/analysis/revenue",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (json.code === 200) {
        const mapped = json.result.map((item) => ({
          time: item.date,
          sales: item.totalSales,
          import: item.totalStockIn,
        }));
        setRawData(mapped);
      } else {
        setRawData([]);
      }
    } catch (err) {
      console.error("Fetch revenue error:", err);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenue({
        periodType: "RANGE",
        fromDate: startDate.format("YYYY-MM-DD"),
        toDate: endDate.format("YYYY-MM-DD"),
      });
    }
  }, [startDate, endDate]);

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
          formatter: (value) => {
            if (startDate && endDate) {
              return dayjs(value).format("DD/MM");
            }
            return `Tháng ${dayjs(value).month() + 1}`;
          },
        },
      },

      yAxis: {
        type: "value",
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
  }, [rawData]);

  return (
    <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-gray-900 text-[20px]">
          Doanh số & tiền nhập hàng
        </div>

        <div className="flex items-center gap-3">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Từ ngày"
              value={startDate}
              onChange={setStartDate}
              maxDate={dayjs()}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
            <DatePicker
              label="Đến ngày"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
              maxDate={dayjs()}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>

          <Select
            size="small"
            value={year}
            onChange={(e) => {
              const selectedYear = Number(e.target.value);
              setYear(selectedYear);
              setStartDate(null);
              setEndDate(null);
              fetchRevenue({
                periodType: "YEAR",
                year: selectedYear,
              });
            }}
            sx={{ minWidth: 90 }}
          >
            {YEAR_OPTIONS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            className="!normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <ReactECharts option={option} style={{ height: 360 }} />
    </div>
  );
}
