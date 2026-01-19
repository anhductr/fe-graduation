import { useMemo, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Select, MenuItem } from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

/* =======================
   YEAR OPTIONS
======================= */
const currentYear = dayjs().year();
const YEAR_OPTIONS = [
  currentYear - 3,
  currentYear - 2,
  currentYear - 1,
  currentYear,
];

/* =======================
   COMPONENT
======================= */
export default function OrdersChart() {
  const [year, setYear] = useState(currentYear);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     API FETCH
  ======================= */
  async function fetchOrders(payload) {
    setLoading(true);
    try {
      const res = await fetch(
        "/analysis-service/analysis/statitis",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (json.code === 200) {
        const mapped = json.result.map((item) => ({
          time: item.label,
          completed: item.completed,
          cancelled: item.cancelled,
        }));
        setRawData(mapped);
      } else {
        setRawData([]);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }

  /* =======================
     RANGE MODE
  ======================= */
  useEffect(() => {
    if (startDate && endDate) {
      fetchOrders({
        periodType: "RANGE",
        fromDate: startDate.format("YYYY-MM-DD"),
        toDate: endDate.format("YYYY-MM-DD"),
      });
    }
  }, [startDate, endDate]);

  /* =======================
     YEAR MODE (INIT)
  ======================= */
  useEffect(() => {
    fetchOrders({
      periodType: "YEAR",
      year,
    });
  }, []);

  /* =======================
     ECHART OPTION
  ======================= */
  const option = useMemo(() => {
    const colors = ["#5470C6", "#EE6666"];

    const times = rawData.map((d) => d.time);
    const completed = rawData.map((d) => d.completed);
    const cancelled = rawData.map((d) => d.cancelled);

    return {
      color: colors,

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        formatter: (params) => {
          const completedVal = params.find(p => p.seriesName === "Đơn hoàn thành")?.data ?? 0;
          const cancelledVal = params.find(p => p.seriesName === "Đơn hủy")?.data ?? 0;

          return `
            <b>${startDate && endDate
              ? dayjs(params[0].axisValue).format("DD/MM/YYYY")
              : `Tháng ${dayjs(params[0].axisValue).month() + 1}`
            }</b><br/>
            <span style="color:${colors[0]}">● Hoàn thành:</span> ${completedVal}<br/>
            <span style="color:${colors[1]}">● Hủy:</span> ${cancelledVal}
          `;
        },
      },

      legend: {
        data: ["Đơn hoàn thành", "Đơn hủy"],
      },

      grid: {
        top: 70,
        bottom: 60,
        left: 50,
        right: 30,
      },

      xAxis: {
        type: "category",
        axisTick: { alignWithLabel: true },
        data: times,
        axisLabel: {
          formatter: (value) => {
            // RANGE MODE
            if (startDate && endDate) {
              return dayjs(value).format("DD/MM");
            }

            // YEAR MODE
            return `Tháng ${dayjs(value).month() + 1}`;
          },
        },
      },


      yAxis: {
        type: "value",
      },

      series: [
        {
          name: "Đơn hoàn thành",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          emphasis: { focus: "series" },
          data: completed,
        },
        {
          name: "Đơn hủy",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          emphasis: { focus: "series" },
          data: cancelled,
        },
      ],
    };
  }, [rawData, startDate, endDate]);

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-gray-900 text-[20px]">
          Thống kê đơn hàng
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

              fetchOrders({
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

      <ReactECharts
        option={option}
        style={{ height: 360 }}
        showLoading={loading}
      />
    </div>
  );
}
