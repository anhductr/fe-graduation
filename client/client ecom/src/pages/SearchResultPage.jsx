import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";
// import { ProductContext } from "../context/ProductContext";
import Breadcrumbs from "../components/common/Breadcrumbs";
import LeftFilter from "../components/product/LeftFilter";
import RightContent from "../components/product/RightContent";
import { useSearchKeyword } from "../context/SearchContext";
import { searchProducts, getProductByBanner } from "../services/searchApi"; // Correct path based on your structure (searchApi.js)
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "../utils/searchHelpers";
import { sortTypeMap } from "../utils/searchHelpers";
import { useLocation } from "react-router-dom";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";

export default function SearchResultPage() {
  /////// xử lý state truyền từ các page khác ///////
  const location = useLocation();
  const { state } = location;  // Lấy state từ navigate
  const [bannerUrl, setBannerUrl] = useState(null);

  const { currentKeyword, setCurrentKeyword } = useSearchKeyword(); // vẫn giữ context cho keyword

  // Xác định loại luồng và giá trị tương ứng
  const searchType = state?.type || (currentKeyword ? "keyword" : null);
  const keyword = searchType === "keyword" ? (state?.keyword || currentKeyword) : null;
  const categoryId = searchType === "category" ? state?.categoryId : null;
  const brand = searchType === "brand" ? state?.brand : null;
  const cateType = searchType === "category" ? state?.cateType || "phone" : "phone";

  // Banner specific state
  const ownerId = searchType === "banner" ? state?.ownerId : null;
  const ownerType = searchType === "banner" ? state?.ownerType : null;

  useEffect(() => {
    if (searchType === "banner" && state?.bannerUrl) {
      setBannerUrl(state.bannerUrl);
    } else {
      setBannerUrl(null);
    }
  }, [searchType, state]);


  const {
    storage,            // Dung lượng ROM
    connectivity,       // Hỗ trợ mạng
    display,            // Kích thước màn hình
    operatingSystem,    // Hệ điều hành (iOS/Android)
    ram,
    priceRange,
    priceRangeSlider,
    sortType,
    resetFilters,
  } = useFilterStore();

  // Reset filters when unmounting (leaving page)
  useEffect(() => {
    return () => {
      resetFilters();
    };
  }, [resetFilters]);

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
      value: value
    });
  });

  ////////////// xử lý attribute //////////////  
  // Hỗ trợ mạng (Connectivity)
  connectivity.forEach((value) => {
    attributes.push({
      key: "Hỗ trợ mạng",
      value: value
    });
  });

  // Kích thước màn hình (Display)
  display.forEach((value) => {
    attributes.push({
      key: "Kích thước màn hình",
      value: value
    });
  });

  // RAM
  ram.forEach((value) => {
    attributes.push({
      key: "Dung lượng",
      value: value
    });
  });

  // Hệ điều hành (OperatingSystem)
  operatingSystem.forEach((value) => {
    attributes.push({
      key: "Tên OS",
      value: value
    });
  });

  // Use useQuery to fetch products
  // Conditional query based on searchType
  const { data: rawApiData, isLoading, error } = useQuery({
    queryKey: [
      searchType === "banner" ? "getProductByBanner" : "searchProducts",
      keyword ?? null,
      categoryId ?? null,
      brand ?? null,
      ownerId ?? null,
      ownerType ?? null,
      minPrice ?? null,
      maxPrice ?? null,
      backendSortType,
      attributes,
    ],
    queryFn: () => {
      if (searchType === "banner") {
        return getProductByBanner({
          page: 1,
          size: 20,
          ownerId,
          ownerType,
          minPrice: minPrice === 0 ? 0 : minPrice || null,
          maxPrice: maxPrice || null,
          sortType: backendSortType,
        });
      }

      return searchProducts({
        keyword: keyword || null,
        category: categoryId || null,
        brandName: brand || null,
        minPrice: minPrice === 0 ? 0 : minPrice || null,
        maxPrice: maxPrice || null,
        sortType: backendSortType,
        attributes,
        page: 1,
        size: 20,
      });
    },
    // enabled: !!(keyword || categoryId || brand || (searchType === "banner" && ownerId && ownerType) || minPrice !== null || maxPrice !== null),
  });


  // API return { result: { productGetVMList: [] } } OR { productGetVMList: [] }
  const products = rawApiData?.result?.productGetVMList || rawApiData?.productGetVMList || rawApiData?.result?.data || [];
  // Note: getProductByBanner might return a different structure, need to verify. 
  // searchApi.js says: return response.data; // ApiResponse<ProductGetListVM> for getProductByBanner
  // getProductFlashSale also returns ApiResponse<ProductGetListVM>
  // searchProducts returns ApiResponse<ProductGetListVM>
  // ProductGetListVM usually has 'data' or 'productGetVMList'. 
  // Let's assume standard structure or handle 'data' which is common for pageable lists.

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

  // State to hold valid specification aggregations.
  // Initialized only once when valid data is received to serve as the filter source.
  const [specAggregations, setSpecAggregations] = useState(null);

  useEffect(() => {
    const aggregations = rawApiData?.result?.specificationAggregations || rawApiData?.specificationAggregations;
    if (aggregations && !specAggregations) {
      setSpecAggregations(aggregations);
    }
  }, [rawApiData, specAggregations]);

  return (
    <div className="component-container">
      <Navbar />
      <div className="bg-gray-100">
        <div className="mx-15">
          <Breadcrumbs pagename={"Điện thoại"} />
        </div>
        <div className="px-15 py-2">
          {/* Banner Image */}
          {bannerUrl && (
            <div className="w-full mb-6 rounded-lg overflow-hidden shadow-sm">
              <img src={bannerUrl} alt="Banner" className="w-full h-auto object-cover" />
            </div>
          )}

          {/* <BrandButtons /> */}
          <div className="flex flex-row gap-10 items-start ">
            <LeftFilter
              min={min}
              max={max}
              isSliderDefault={isSliderDefault}
              isClearChip={isClearChip}
              setIsClearChip={setIsClearChip}
              cateType={cateType}
              specAggregations={searchType === "banner" ? null : specAggregations} // Hide specs if banner
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
      <Footer />
    </div>
  );
}

