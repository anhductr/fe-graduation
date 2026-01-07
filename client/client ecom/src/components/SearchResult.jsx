import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";
// import { ProductContext } from "../context/ProductContext";
import Breadcrumbs from "./Breadcrumbs";
import LeftFilter from "./LeftFilter";
import RightContent from "./RightContent";
import { useSearchKeyword } from "../context/SearchContext";
import { searchProducts } from "../api, function/searchApi"; // Correct path based on your structure (searchApi.js)
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "../api, function/searchPageFunction";
import { sortTypeMap } from "../api, function/searchPageFunction";
import { useLocation } from "react-router-dom";

const SearchResult = () => {
  /////// xử lý state truyền từ các page khác ///////
  const location = useLocation();
  const { state } = location;  // Lấy state từ navigate

  const { currentKeyword, setCurrentKeyword } = useSearchKeyword(); // vẫn giữ context cho keyword

  // Xác định loại luồng và giá trị tương ứng
  const searchType = state?.type || (currentKeyword ? "keyword" : null);
  const keyword = searchType === "keyword" ? (state?.keyword || currentKeyword) : null;
  const categoryId = searchType === "category" ? state?.categoryId : null;
  const brand = searchType === "brand" ? state?.brand : null;
  const cateType = searchType === "category" ? state?.cateType || "phone" : "phone";

  const {
    storage,            // Dung lượng ROM
    connectivity,       // Hỗ trợ mạng
    display,            // Kích thước màn hình
    operatingSystem,    // Hệ điều hành (iOS/Android)
    ram,
    priceRange,
    priceRangeSlider,
    sortType,
  } = useFilterStore();

  const [isClearChip, setIsClearChip] = useState(false);


  // Tính minPrice và maxPrice từ slider và checkbox
  let minPrice = null;
  let maxPrice = null;

  // Nếu dùng slider và không phải giá trị mặc định
  // Slider luôn ưu tiên cao nhất
  if (priceRangeSlider[0] > 0 || priceRangeSlider[1] < 46990000) {
    minPrice = priceRangeSlider[0];
    maxPrice = priceRangeSlider[1];
  }
  // Checkbox giá (chỉ chọn tối đa 1 ô)
  else if (!priceRange.includes("all") && priceRange.length === 1) {
    const selectedRange = priceRange[0];

    // Các khoảng giá bình thường (bao gồm cả "Dưới 2 triệu" và các khoảng giữa)
    if (selectedRange[1] !== Infinity) {
      minPrice = selectedRange[0];   // luôn lấy min từ range
      maxPrice = selectedRange[1];   // lấy max từ range (với "Dưới 2 triệu" là 2000000)
    }
    // Chỉ riêng "Trên 20 triệu"
    else {
      minPrice = 20000000;
      maxPrice = 46990000; // giới hạn max của backend
    }
    console.log("minPrice:", minPrice, "maxPrice:", maxPrice);
  }
  const backendSortType = sortTypeMap[sortType] || "DEFAULT";

  const attributes = [];

  // Dung lượng ROM (Storage)
  storage.forEach((value) => {
    attributes.push({
      key: "Dung lượng",
      value: value,          // ví dụ: "256 GB" lấy trực tiếp từ aggregations
      group: "Storage",
      type: "TECH"
    });
  });

  ////////////// xử lý attribute //////////////  
  // Hỗ trợ mạng (Connectivity)
  connectivity.forEach((value) => {
    attributes.push({
      key: "Hỗ trợ mạng",
      value: value,          // ví dụ: "5G"
      group: "Connectivity",
      type: "TECH"
    });
  });

  // Kích thước màn hình (Display) - giờ value là chính xác như "6.3 inch"
  display.forEach((value) => {
    attributes.push({
      key: "Kích thước màn hình",
      value: value,          // ví dụ: "6.3 inch"
      group: "Display",
      type: "TECH"
    });
  });

  // RAM
  ram.forEach((value) => {
    attributes.push({
      key: "Dung lượng",
      value: value,          // ví dụ: "12 GB"
      group: "RAM",
      type: "TECH"
    });
  });

  // Hệ điều hành (OperatingSystem)
  operatingSystem.forEach((value) => {
    attributes.push({
      key: "Tên OS",
      value: value,          // ví dụ: "iOS"
      group: "OperatingSystem",
      type: "TECH"
    });
  });

  // Use useQuery to fetch products based on the keyword
  const { data: rawApiData, isLoading, error } = useQuery({
    queryKey: [
      "searchProducts",
      keyword ?? null,
      categoryId ?? null,
      brand ?? null,
      minPrice ?? null,
      maxPrice ?? null,
      backendSortType,
      attributes,
    ],
    queryFn: () => searchProducts({
      keyword: keyword || null,
      category: categoryId || null,
      brandName: brand || null,
      attributes,
      minPrice: minPrice === 0 ? 0 : minPrice || null,
      maxPrice: maxPrice || null,
      sortType: backendSortType,
      page: 1,
      size: 20,
    }),
    // enabled: !!(keyword || categoryId || brand || minPrice !== null || maxPrice !== null),
    // staleTime: 1000 * 60 * 5,
  });

  const products = rawApiData?.productGetVMList || [];

  // For now, just console.log the response
  useEffect(() => {
    if (rawApiData) {
      console.log("API Response: ", rawApiData);
    }
    if (error) {
      console.error("Error fetching products:", error);
    }
  }, [rawApiData, error]);

  useEffect(() => {
    console.log("🔍 Navigation state từ location:", state);
    console.log("keyword cuối:", keyword);
    console.log("categoryId cuối:", categoryId);
    console.log("brand cuối:", brand);
    console.log("minPrice:", minPrice, "maxPrice:", maxPrice);
    console.log("enabled condition:", !!(keyword || categoryId || brand || minPrice !== null || maxPrice !== null));
  }, [state, keyword, categoryId, brand, minPrice, maxPrice]);

  //cho price slider
  const max = 46990;
  const min = 0;

  //cờ xác định tính mặc định cho slider
  const isSliderDefault = useRef(false);

  function BrandButtons() {
    const brands = [
      {
        label: "iPhone",
        color: "black",
        icon: "https://storage.googleapis.com/a1aa/image/f75693bc-f6a7-4f40-b7a4-8769a907c5e8.jpg",
        iconAlt: "Apple logo black icon",
      },
      { label: "SAMSUNG", color: "#27348b", fontWeight: "bold" },
      { label: "xiaomi", color: "#f57c00", fontWeight: "semibold" },
      { label: "oppo", color: "#3a8e3a", fontWeight: "semibold" },
      {
        label: "HONOR",
        color: "black",
        fontWeight: "semibold",
        tracking: "tracking-widest",
      },
      { label: "TECNO", color: "#007aff", fontWeight: "bold" },
      { label: "realme", color: "#3a3a3a", fontWeight: "normal" },
      {
        label: "ZTE nubia",
        color: "#00a1d6",
        fontWeight: "semibold",
        extraSpan: { text: "nubia", color: "#d91a1a" },
      },
      { label: "NOKIA", color: "#0a2a6e", fontWeight: "bold" },
      {
        label: "inoi",
        color: "#6a2a8a",
        fontWeight: "extrabold",
        tracking: "tracking-widest",
      },
      { label: "viettel", color: "#d91a1a", fontWeight: "semibold" },
      { label: "Masstel", color: "#d94a2a", fontWeight: "semibold" },
      { label: "benco", color: "#d94a4a", fontWeight: "semibold" },
      { label: "TCL", color: "#d91a1a", fontWeight: "bold" },
      {
        label: "mobell",
        color: "black",
        fontWeight: "extrabold",
        tracking: "tracking-wide",
      },
      { label: "itel", color: "#d91a1a", fontWeight: "semibold", italic: true },
    ];

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {brands.map((brand, i) => (
          <button
            key={i}
            className={`bg-white border border-gray-300 rounded px-3 py-1 text-[13px] ${brand.fontWeight ? `font-${brand.fontWeight}` : "font-semibold"
              } ${brand.tracking ? brand.tracking : ""} ${brand.italic ? "italic" : ""
              }`}
            style={{ color: brand.color }}
            type="button"
          >
            {brand.icon && (
              <img
                src={brand.icon}
                alt={brand.iconAlt}
                className="w-[20px] h-[20px] inline-block mr-1"
                width="20"
                height="20"
              />
            )}
            {brand.label.split(" ")[0]}
            {brand.extraSpan && (
              <span style={{ color: brand.extraSpan.color }}>
                {" "}
                {brand.extraSpan.text}
              </span>
            )}
            {brand.label.split(" ").length > 1 && brand.extraSpan === undefined
              ? brand.label.split(" ").slice(1).join(" ")
              : ""}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-100">
        <div className="mx-15">
          <Breadcrumbs pagename={"Điện thoại"} />
        </div>
        <div className="px-15 py-2">
          {/* <BrandButtons /> */}
          <div className="flex flex-row gap-10 items-start ">
            <LeftFilter
              min={min}
              max={max}
              isSliderDefault={isSliderDefault}
              isClearChip={isClearChip}
              setIsClearChip={setIsClearChip}
              cateType={cateType}
              aggregations={rawApiData?.specificationAggregations || {}}
            />
            {!isLoading && (
              <>
                <RightContent
                  min={min}
                  max={max}
                  products={products}
                  isSliderDefault={isSliderDefault}
                  setIsClearChip={setIsClearChip}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchResult;
