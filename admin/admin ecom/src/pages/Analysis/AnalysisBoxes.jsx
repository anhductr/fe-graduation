import Boxes from "../../components/Inventory/Boxes";
import { MdCardMembership } from "react-icons/md";
import { TbCubePlus } from "react-icons/tb";

export default function AnalysisBoxes() {
  return (
    <div className="flex flex-wrap gap-[26px] w-full mb-6">
      <Boxes
        color="#81faf8ff"
        header="Tổng doanh thu"
        icon={<MdCardMembership />}
      />
      <Boxes
        color="#e8806bff"
        header="Tổng đơn hàng"
        icon={<TbCubePlus />}
      />
    </div>
  );
}
