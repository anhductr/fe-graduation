import PageTitle from "./PageTitle";
import AnalysisBoxes from "./AnalysisBoxes";

import SalesChart from "./SalesChart";
import OrdersChart from "./OrdersChart";
import SalesTable from "./SalesTable";
import OrdersTable from "./OrdersTable";

export default function Analysis() {
  return (
    <div className="py-[10px] px-[100px]">
      <PageTitle />
      <AnalysisBoxes />

      <SalesChart />
      <OrdersChart />

      <SalesTable />
      <OrdersTable />
    </div>
  );
}
