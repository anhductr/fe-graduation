import PageTitle from "./PageTitle";
import AnalysisBoxes from "./AnalysisBoxes";

import SalesChart from "./SalesChart";
import OrdersChart from "./OrdersChart";
import BadSellingTable from "./BadSellingTable";
import BestSellingTable from "./BestSellingTable";

export default function Analysis() {
  return (
    <div className="py-[10px] px-[100px]">
      <PageTitle />
      <AnalysisBoxes />

      <SalesChart />
      <OrdersChart />

      <BestSellingTable />
      <BadSellingTable />
    </div>
  );
}
