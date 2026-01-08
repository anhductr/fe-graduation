import React, {
  useState,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";
// import { ProductContext } from "../context/ProductContext";
import ProductCard from "./components/product/ProductCard";
import { create } from "zustand";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import Breadcrumbs from "./components/common/Breadcrumbs";
import Button from '@mui/material/Button';
import { MdClose } from "react-icons/md";
import { IoFilter } from "react-icons/io5";

const PhoneProduct = () => {
  const products = [
    {
      id: 1,
      discount: "4%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max.png",
      alt: "iPhone 16 Pro Max 256GB | Chính hãng VN/A",
      name: "iPhone 16 Pro Max 256GB",
      nameSlug: "iphone-16-pro-max-256gb",
      price: 30490000,
      oldPrice: "34.990.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      rating: 5,
      os: "iOS", //hệ điều hành
    },
    {
      id: 2,
      discount: "18%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/6cb3261a-1bad-4d8f-c134-c79a95562e6d.jpg",
      alt: "Samsung Galaxy S25 Ultra 512GB silver smartphone with S Pen",
      name: "Samsung Galaxy S25 Ultra 512GB",
      price: 30890000,
      oldPrice: "37.490.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      rating: 5,
      os: "Android", //hệ điều hành
    },
    {
      id: 3,
      discount: "17%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/a94271fd-9a47-498b-01ed-06d880cd2015.jpg",
      alt: "TECNO CAMON 40 Pro 8GB 256GB white and blue smartphone front and back",
      name: "TECNO CAMON 40 Pro 8GB 256GB",
      price: 15_790_000,
      oldPrice: "6.990.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      rating: 5,
      os: "Android", //hệ điều hành
    },
    {
      id: 4,
      discount: "15%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/b9d765ec-448b-4567-e60a-b8faab27be47.jpg",
      alt: "TECNO CAMON 40 8GB 256GB black and silver smartphone front and back",
      name: "TECNO CAMON 40 8GB 256GB",
      price: 5_490_000,
      oldPrice: "6.490.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      rating: 5,
      os: "Android", //hệ điều hành
    },
    {
      id: 5,
      discount: "13%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-zte-blade-a55.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      price: 1_990_000,
      oldPrice: "3.990.000",
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      rating: 4.5,
      os: "Android", //hệ điều hành
    },
    {
      id: 6,
      discount: "13%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-a36.2.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      price: 7_990_000,
      oldPrice: "3.990.000",
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      rating: 4.5,
      os: "Android", //hệ điều hành
    },
    {
      id: 7,
      discount: "13%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_2__2.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      price: 4_790_000,
      oldPrice: "3.490.000",
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      rating: 4.5,
      os: "Android", //hệ điều hành
    },
    {
      id: 8,
      discount: "13%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-nubia-neo-3-gt-12gb-256gb.1.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      price: 6_590_000,
      oldPrice: "3.490.000",
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      rating: 2,
      os: "Android", //hệ điều hành
    },
  ];

  const priceOptions = [
    { label: "Dưới 2 triệu", range: [0, 2000000] },
    { label: "Từ 2 - 4 triệu", range: [2000000, 4000000] },
    { label: "Từ 4 - 7 triệu", range: [4000000, 7000000] },
    { label: "Từ 7 - 13 triệu", range: [7000000, 13000000] },
    { label: "Từ 13 - 20 triệu", range: [13000000, 20000000] },
    { label: "Trên 20 triệu", range: [20000000, Infinity] },
  ];

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

  function FilterToggle({ title, children }) {
    const [open, setOpen] = useState(true);
    const contentRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState("0px");

    useEffect(() => {
      if (open && contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      } else {
        setMaxHeight("0px");
      }
    }, [open]);

    return (
      <section className="mb-6">
        <div
          className="flex justify-between items-center mb-1 cursor-pointer select-none"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          role="button"
          tabIndex={-1}
        >
          <span className="font-semibold text-[12px]">{title}</span>
          <i
            className={`fas fa-chevron-${open ? "up" : "down"} text-[12px]`}
            aria-hidden="true"
          ></i>
          {/* Animated container */}
        </div>

        {/* Animated content */}
        <div
          ref={contentRef}
          style={{ maxHeight }}
          className="transition-all duration-700 ease-in-out overflow-hidden"
        >
          {children}
        </div>
      </section>
    );
  }

  const useFilterStore = create((set) => ({
    priceRange: ["all"],
    os: [],
    rom: [],
    connection: [],
    priceRangeSlider: [],

    togglePrice: (
      range //range gồm 2 phần tử: [min, max] nằm trong mảng priceRange
    ) =>
      set((state) => {
        // Nếu đang chọn tất cả và chọn thêm option => bỏ 'all', thêm option
        if (state.priceRange.includes("all")) {
          return { priceRange: [range] };
        }

        // Nếu không chọn 'all' và chọn thêm option thì kiểm tra xem đã có option đó chưa
        const exists = state.priceRange.some(
          //some nghĩa là ít nhất 1 phần tử thỏa mãn điều kiện thì true
          (r) => r[0] === range[0] && r[1] === range[1] //so sánh đầu cuối [0, 20000]
        );

        const updated = exists
          ? state.priceRange.filter(
            (r) => r[0] !== range[0] || r[1] !== range[1]
          )
          : [...state.priceRange, range];

        // Nếu đã chọn hết mọi option => reset về ['all']
        if (updated.length === priceOptions.length || updated.length === 0) {
          return { priceRange: ["all"] };
        }

        return { priceRange: updated };
      }),

    toggleAllPrices: () => set({ priceRange: ["all"] }),

    setPriceRangeSlider: (range) => set({ priceRangeSlider: range }),

    toggleOs: (value) =>
      // Hàm set đến từ Zustand, dùng để cập nhật state. Bạn truyền vào một callback nhận state hiện tại, và trả về một đối tượng mới đại diện cho state mới.
      set((state) => ({
        // cập nhật giá trị mới cho os, theo nguyên tắc toggle: nếu đã có value thì loại ra, nếu chưa có thì thêm vào
        os: state.os.includes(value)
          ? state.os.filter((v) => v !== value) //Người dùng click lại giá trị lần nữa → nghĩa là bỏ chọn, không muốn lọc theo Android nữa.
          : [...state.os, value], //Người dùng chọn thêm hệ điều hành mới → ta thêm value vào mảng
      })),

    toggleRom: (value) =>
      set((state) => ({
        rom: state.rom.includes(value)
          ? state.rom.filter((v) => v !== value)
          : [...state.rom, value],
      })),

    toggleConnection: (value) =>
      set((state) => ({
        connection: state.connection.includes(value)
          ? state.connection.filter((v) => v !== value)
          : [...state.connection, value],
      })),

    resetFilters: () =>
      set({
        priceRange: ["all"],
        os: [],
        rom: [],
        connection: [],
      }),
  }));

  function LeftFilter() {
    const {
      os,
      toggleOs,
      priceRange,
      togglePrice,
      toggleAllPrices,
      setPriceRangeSlider,
    } = useFilterStore();

    const isAllChecked = priceRange.includes("all");

    const [minValue, setMinValue] = useState(min);
    const [maxValue, setMaxValue] = useState(max);
    const [minValueTemp, setMinValueTemp] = useState(min);
    const [maxValueTemp, setMaxValueTemp] = useState(max);
    const [percentMin, setPercentMin] = useState(0);
    const [percentMax, setPercentMax] = useState(100);

    const [isCheckBox, setIsCheckBox] = useState(true);

    return (
      <aside
        aria-label="Bộ lọc tìm kiếm"
        className="bg-white rounded-[10px] shadow-md p-4 w-full md:w-[280px]"
      >
        <h3 className="font-semibold text-[14px] mb-3 flex items-center gap-1">
          <IoFilter aria-hidden="true" /> Bộ lọc tìm kiếm
        </h3>
        <FilterToggle title="Mức giá">
          <ul className="space-y-1 mb-2 text-[12px]">
            <li>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-[#0096FF]"
                  checked={isAllChecked}
                  onChange={toggleAllPrices}
                />
                <span>Tất cả</span>
              </label>
            </li>
            {priceOptions.map(({ label, range }, i) => (
              <li key={i}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      !isAllChecked &&
                      priceRange.some(
                        (r) => r[0] === range[0] && r[1] === range[1]
                      )
                    }
                    onChange={() => {
                      togglePrice(range);
                      setPriceRangeSlider([min * 1000, max * 1000]);
                      setMinValue(min);
                      setMinValueTemp(min);
                      setMaxValue(max);
                      setMaxValueTemp(max);
                      setPercentMin(0);
                      setPercentMax(100);
                      setIsCheckBox(false); // toggle để re-render slider
                      isSliderDefault.current = false; // reset cờ khi click checkbox
                    }}
                    className="w-4 h-4 border-gray-300 rounded focus:ring-[#0096FF]"
                  />
                  <span>{label}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="text-[11px] mb-2 font-semibold">
            Hoặc nhập khoảng giá phù hợp với bạn:
          </p>
          <DoublePriceRangeSlider
            min={min}
            max={max}
            minValue={minValue}
            maxValue={maxValue}
            setMinValue={setMinValue}
            setMaxValue={setMaxValue}
            minValueTemp={minValueTemp}
            maxValueTemp={maxValueTemp}
            setMinValueTemp={setMinValueTemp}
            setMaxValueTemp={setMaxValueTemp}
            percentMin={percentMin}
            percentMax={percentMax}
            setPercentMin={setPercentMin}
            setPercentMax={setPercentMax}
            setPriceRangeSlider={setPriceRangeSlider}
            toggleAllPrices={toggleAllPrices}
            isCheckBox={isCheckBox}
            setIsCheckBox={setIsCheckBox}
            isSliderDefault={isSliderDefault}
          ></DoublePriceRangeSlider>
        </FilterToggle>
        <FilterToggle title="Hệ điều hành">
          <div className="flex gap-2" role="group" aria-label="Hệ điều hành">
            {["iOS", "Android"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleOs(value)}
                className={`border border-gray-300 rounded px-3 py-[3px] text-[12px] ${os.includes(value)
                  ? "bg-gray-100 text-[#0096FF] font-semibold"
                  : ""
                  } hover:bg-gray-100`}
              >
                {value}
              </button>
            ))}
          </div>
        </FilterToggle>
        <FilterToggle title="Dung lượng ROM">
          <div
            className="grid grid-cols-3 gap-2 text-[12px] p-1"
            role="group"
            aria-label="Dung lượng ROM"
          >
            <button
              type="button"
              className="border border-gray-300 rounded px-2 py-[3px] text-gray-600 "
            >
              ≤128 GB
            </button>
            <button
              type="button"
              className="border border-gray-300 rounded px-2 py-[3px] text-gray-600 "
            >
              256 GB
            </button>
            <button
              type="button"
              className="border border-gray-300 rounded px-2 py-[3px] text-gray-600 "
            >
              512 GB
            </button>
            <button
              type="button"
              className="border border-gray-300 rounded px-2 py-[3px] text-gray-600"
              disabled
            >
              1 TB
            </button>
          </div>
        </FilterToggle>
        <FilterToggle title="Kết nối">
          <div
            className="flex flex-wrap gap-2 text-[12px]"
            role="group"
            aria-label="Kết nối"
          >
            <button
              type="button"
              className="border border-gray-300 rounded px-3 py-[3px] text-gray-600 hover:bg-gray-100"
            >
              NFC
            </button>
            <button
              type="button"
              className="border border-gray-300 rounded px-3 py-[3px] text-gray-600 hover:bg-gray-100"
            >
              Bluetooth
            </button>
          </div>
        </FilterToggle>
      </aside>
    );
  }

  function RightContent() {
    const {
      os,
      rom,
      connection,
      toggleOs,
      resetFilters,
      priceRange,
      togglePrice,
      priceRangeSlider,
      setPriceRangeSlider,
    } = useFilterStore();

    const [sortOrder, setSortOrder] = useState(null); // "asc" | "desc" | null
    const [originalProducts] = useState(products);

    const sortedProducts =
      sortOrder === "asc"
        ? [...originalProducts].sort((a, b) => a.price - b.price)
        : sortOrder === "desc"
          ? [...originalProducts].sort((a, b) => b.price - a.price)
          : originalProducts;

    //hàm filter lặp qua từng phần tử, phần tử nào đúng điều kiện(true) thì giữ và stick vào hàm mới
    const filteredProducts = sortedProducts.filter((product) => {
      // Giả sử dữ liệu sản phẩm có các trường: os, rom, connection
      // nếu os(người dùng chưa chọn gì) thì length = 0 luôn true và ko sang vế phải, nếu chọn r thì lọc với product
      const matchOs = os.length === 0 || os.includes(product.os);
      const matchRom = rom.length === 0 || rom.includes(product.rom);
      const matchConn =
        connection.length === 0 ||
        connection.some((c) => product.connection?.includes(c));

      const matchPrice =
        priceRange.includes("all") ||
        priceRange.some(
          ([min, max]) => product.price >= min && product.price <= max
        );

      const matchPriceSlider =
        product.price >= priceRangeSlider[0] &&
        product.price <= priceRangeSlider[1];

      return matchPrice && matchOs && matchRom && matchConn && matchPriceSlider;
    });

    return (
      <main className="flex-1 flex flex-col gap-2">
        {/* hiển thị người dùng chọn gì */}
        <div className="flex flex-wrap items-center gap-2">
          {os.length > 0 &&
            os.map((value, index) => (
              <div
                className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full pl-3 pr-2 py-1 text-[13px] select-none transition-transform duration-300 ease-in-out hover:scale-110"
                key={index}
                onClick={() => toggleOs(value)}
              >
                {" "}
                {value}
                <button aria-label="Remove iOS" class="ml-1 flex rounded-full">
                  <MdClose size={20} className="text-gray-600" />
                </button>
              </div>
            ))}

          {priceRange.length > 0 &&
            !priceRange.includes("all") &&
            priceRange.map((range, index) => (
              <div
                className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full pl-3 pr-2 py-1 text-[13px] font-medium select-none transition-transform duration-300 ease-in-out hover:scale-110"
                key={index}
                onClick={() => togglePrice(range)}
              >
                {" "}
                {
                  priceOptions.find(
                    (option) =>
                      option.range[0] === range[0] &&
                      option.range[1] === range[1]
                  )?.label
                }
                <button aria-label="Remove iOS" class="ml-1 flex rounded-full">
                  <MdClose size={20} className="text-gray-600" />
                </button>
              </div>
            )
            )}

          {priceRangeSlider.length > 0 && isSliderDefault.current && (
            <div
              className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full pl-3 pr-2 py-1 text-[13px] font-medium select-none transition-transform duration-300 ease-in-out hover:scale-110"
              onClick={() => {
                setPriceRangeSlider([min * 1000, max * 1000]);
                isSliderDefault.current = false; // Đánh dấu là thay đổi do click
              }} // reset về giá trị mặc định
            >
              {" "}
              {`Từ ${priceRangeSlider[0]
                .toString()
                .replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  "."
                )}đ đến ${priceRangeSlider[1]
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`}
              <button aria-label="Remove iOS" class="ml-1 flex rounded-full">
                <MdClose size={20} className="text-gray-600" />
              </button>
            </div>
          )}

          {(os.length > 0 ||
            (priceRange.length > 0 && !priceRange.includes("all"))) && (
              <button
                class="text-[#0096FF] text-[13px] font-semibold transition-transform duration-300 ease-in-out hover:text-[15px]"
                type="button"
                onClick={resetFilters}
              >
                Xóa tất cả
              </button>
            )}
        </div>

        <div className="mb-1 text-[15px] flex flex-wrap items-center gap-3">
          <span>
            Tìm thấy{" "}
            <span className="font-semibold">{filteredProducts.length}</span> kết
            quả
          </span>
          <nav
            className="flex gap-3 ml-auto text-[15px] text-gray-500"
            aria-label="Sort options"
          >
            <button
              type="button"
              className={sortOrder === null ? "text-[#0096FF] font-semibold" : ""}
              onClick={() => setSortOrder(null)}
            >
              Nổi bật
            </button>
            <span>•</span>
            <button
              type="button"
              className={
                sortOrder === "asc" ? "text-[#0096FF] font-semibold" : ""
              }
              onClick={() => setSortOrder("asc")}
            >
              Giá tăng dần
            </button>
            <span>•</span>
            <button
              type="button"
              className={
                sortOrder === "desc" ? "text-[#0096FF] font-semibold" : ""
              }
              onClick={() => setSortOrder("desc")}
            >
              Giá giảm dần
            </button>
          </nav>
        </div>


        <div className="grid grid-cols-4 gap-5">
          {filteredProducts.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
      </main>
    );
  }

  const DoublePriceRangeSlider = ({
    min,
    max,
    minValue,
    maxValue,
    setMinValue,
    setMaxValue,
    minValueTemp,
    maxValueTemp,
    setMinValueTemp,
    setMaxValueTemp,
    percentMin,
    percentMax,
    setPercentMin,
    setPercentMax,
    setPriceRangeSlider,
    toggleAllPrices,
    isCheckBox,
    setIsCheckBox,
    isSliderDefault,
  }) => {
    const [changeBySlider, setChangeBySlider] = useState(true);

    useEffect(() => {
      setPriceRangeSlider([minValue * 1000, maxValue * 1000]);
    }, []);

    //giải pháp như con cặc
    useEffect(() => {
      if (!isSliderDefault.current) {
        setMinValue(min);
        setMinValueTemp(min);
        setMaxValue(max);
        setMaxValueTemp(max);
        setPercentMin(0);
        setPercentMax(100);
      }
    }, [isSliderDefault]);

    const handleClickTrack = (e) => {
      e.stopPropagation();
      isSliderDefault.current = true; // Đánh dấu là thay đổi do click
      const track = document.getElementById("track");
      const stackRect = track.getBoundingClientRect();
      let percent = Math.round(
        ((e.clientX - stackRect.left) * 100) / stackRect.width
      );
      if (Math.abs(percent - percentMin) <= Math.abs(percent - percentMax)) {
        setPercentMin(percent);
      } else {
        setPercentMax(percent);
      }

      resetCheckBox();
    };

    // giá trị nhập thay đổi khi slider thay đổi
    useEffect(() => {
      const activeTrack = document.getElementById("track-active");
      let realMinValue = sliderToRealValue(percentMin);
      let realMaxValue = sliderToRealValue(percentMax);

      // console.log('dit me useEffect');

      // chỉ cập nhật minValueTemp nếu thay đổi đến từ slider
      if (changeBySlider) {
        setMinValueTemp(realMinValue);
        setMaxValueTemp(realMaxValue);
        if (percentMax <= percentMin)
          setPriceRangeSlider([realMaxValue * 1000, realMinValue * 1000]);
        else setPriceRangeSlider([realMinValue * 1000, realMaxValue * 1000]);
      }
      setMinValue(realMinValue);
      setMaxValue(realMaxValue);

      if (percentMax <= percentMin) {
        activeTrack.style.left = `${percentMax}%`;
        activeTrack.style.right = `${100 - percentMin}%`;
        // setPriceRangeSlider([realMaxValue * 1000, realMinValue * 1000]);
      } else {
        activeTrack.style.left = `${percentMin}%`;
        activeTrack.style.right = `${100 - percentMax}%`;
      }

      // reset lại cờ sau khi xử lý
      setChangeBySlider(true);
    }, [percentMin, percentMax]);

    // khi giá trị nhập thay đổi thì slider thay đổi
    useEffect(() => {
      setPercentMin(realToSliderValue(minValue));
      setPercentMax(realToSliderValue(maxValue));
      // toggleAllPrices(); // reset về 'all' khi giá trị nhập thay đổi
    }, [minValue, maxValue]);

    function realToSliderValue(realValue) {
      const sMin = 0;
      const sMax = 100;

      // Ánh xạ tuyến tính và làm tròn
      const sliderValue = Math.round(
        ((realValue - min) * (sMax - sMin)) / (max - min)
      );

      return Math.max(sMin, Math.min(sMax, sliderValue)); // Đảm bảo giá trị trong [0, 100]
    }

    function sliderToRealValue(sliderValue) {
      const sMin = 0;
      const sMax = 100;

      // Ánh xạ ngược
      const realValue = min + (sliderValue * (max - min)) / (sMax - sMin);
      return Math.round(realValue); // Làm tròn để được giá trị nguyên
    }

    const handleMinInputChange = (e) => {
      let raw = e.target.value.replace(/[^\d]/g, ""); // chỉ lấy số
      if (percentMax <= percentMin) {
        setMaxValueTemp(raw); // cập nhật giá trị đang gõ
      } else {
        setMinValueTemp(raw); // cập nhật giá trị đang gõ
      }
    };

    const handleMaxInputChange = (e) => {
      const raw = e.target.value.replace(/[^\d]/g, ""); // chỉ lấy số
      if (percentMax <= percentMin) {
        setMinValueTemp(raw); // cập nhật giá trị đang gõ
      } else {
        setMaxValueTemp(raw); // cập nhật giá trị đang gõ
      }
    };

    const handleMinInputBlur = () => {
      setChangeBySlider(false); // đánh dấu là giá trị nhập thay đổi không phải do slider
      let parsed;

      //đang đúng
      if (minValueTemp > max) {
        setMinValueTemp(max);
      }

      if (percentMax <= percentMin) {
        // nếu giá trị nhập đang ở max thì không cần parse
        if (maxValueTemp === "") {
          setMaxValueTemp(max);
          setMaxValue(max);
        } else {
          if (maxValueTemp > max) setMaxValueTemp(max);

          parsed = parseInt(maxValueTemp, 10);
          if (!isNaN(parsed)) {
            setMaxValue(parsed);
          } // cập nhật giá trị chính thức
        }
        setPriceRangeSlider([+maxValueTemp * 1000, +minValueTemp * 1000]);
      } else {
        if (minValueTemp === "") {
          setMinValueTemp(min);
          setMinValue(min);
        } else {
          if (minValueTemp < min) setMinValueTemp(min);

          parsed = parseInt(minValueTemp, 10);
          if (!isNaN(parsed)) {
            setMinValue(parsed);
          } // cập nhật giá trị chính thức
          console.log("minValueTemp", minValueTemp);
          setPriceRangeSlider([+minValueTemp * 1000, +maxValueTemp * 1000]);
        }
      }
      resetCheckBox();
      isSliderDefault.current = true;
    };

    const handleMaxInputBlur = () => {
      setChangeBySlider(false); // đánh dấu là giá trị nhập thay đổi không phải do slider
      let parsed;
      if (percentMax <= percentMin) {
        if (minValueTemp === "") {
          setMinValueTemp(min);
          setMinValue(min);
        } else {
          if (minValueTemp < min) setMinValueTemp(min);

          parsed = parseInt(minValueTemp, 10);
          if (!isNaN(parsed)) {
            setMinValue(parsed);
          } // cập nhật giá trị chính thức
        }
      } else {
        if (maxValueTemp === "") {
          setMaxValueTemp(max);
          setMaxValue(max);
        } else {
          if (maxValueTemp > max) setMaxValueTemp(max);

          parsed = parseInt(maxValueTemp, 10);
          if (!isNaN(parsed)) {
            setMaxValue(parsed);
          } // cập nhật giá trị chính thức
        }
      }
      resetCheckBox();
      isSliderDefault.current = true;
    };

    const formatNumberWithDot = (num) => {
      if (!num) return "";
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const resetCheckBox = () => {
      if (!isCheckBox) {
        setIsCheckBox(true);
        toggleAllPrices();
      }
    };
    return (
      <div className="h-[65px]">
        <div className="flex w-full justify-center gap-2 text-[11px] mb-3 relative">
          <input
            aria-label="Giá từ"
            type="text"
            inputMode="numeric"
            value={
              percentMin >= percentMax
                ? formatNumberWithDot(maxValueTemp)
                : formatNumberWithDot(minValueTemp)
            }
            className="text-right pr-[40px] w-[95px] border border-gray-300 rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#0096FF]"
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.target.blur(); // bỏ focus để kích hoạt onBlur luôn
              }
            }}
          />
          <span className="absolute left-[70px] top-1/2 -translate-y-1/2 text-[12px] text-gray-500 pointer-events-none">
            .000đ
          </span>
          <span className="text-[26px]">~</span>
          <input
            aria-label="Giá đến"
            type="text"
            inputMode="numeric"
            value={
              percentMin >= percentMax
                ? formatNumberWithDot(minValueTemp)
                : formatNumberWithDot(maxValueTemp)
            }
            className="text-right pr-[39px] w-[95px] border border-gray-300 rounded px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-[#0096FF]"
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.target.blur(); // bỏ focus để kích hoạt onBlur luôn
              }
            }}
          />
          <span className="absolute right-[19px] top-1/2 -translate-y-1/2 text-[12px] text-gray-500 pointer-events-none">
            .000đ
          </span>
        </div>
        <div className="relative flex flex-col items-center justify-center">
          <style>{`
            input[type="range"]::-webkit-slider-runnable-track {
              -webkit-appearance: none;
              height: 5px;
            }
            
            input[type="range"]::-moz-range-track {
              -moz-appearance: none;
              height: 5px;
            }
            
            input[type="range"]::-ms-track {
              appearance: none;
              height: 5px;
            }

            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 1.5rem;
              height: 1.5rem;
              background-color: white;
              border: solid 1px #ccc;
              border-radius: 0.75rem;
              margin-top: -0.5rem;
              pointer-events: auto;
              cursor: grab;
            }
            input[type="range"]::-webkit-slider-thumb:active { 
              -webkit-appearance: none;
              width: 2rem;
              height: 2rem;
              background-color: white;
              border: solid 5px rgb(144, 211, 255);
              border-radius: 1rem;
              margin-top: -0.7rem;
              pointer-events: auto;
              cursor: grab;
            }

            input[type="range"]::-moz-range-thumb {
              -moz-appearance: none;
              width: 1.5rem;
              height: 1.5rem;
              background-color: white;
              border: solid 1px #ccc;
              border-radius: 0.75rem;
              margin-top: -0.5rem;
              pointer-events: auto;
              cursor: grab;
            }
            input[type="range"]::-moz-range-thumb:active { 
              -moz-appearance: none;
              width: 2rem;
              height: 2rem;
              background-color: white;
              border: solid 5px rgb(144, 211, 255);
              border-radius: 1rem;
              margin-top: -0.7rem;
              pointer-events: auto;
              cursor: grab;
            }

            input[type="range"]::-ms-thumb {
              appearance: none;
              width: 1.5rem;
              height: 1.5rem;
              background-color: white;
              border: solid 1px #ccc;
              border-radius: 0.75rem;
              margin-top: -0.5rem;
              pointer-events: auto;
              cursor: grab;
            }
            input[type="range"]::-ms-thumb:active { 
              appearance: none;
              width: 2rem;
              height: 2rem;
              background-color: white;
              border: solid 5px rgb(144, 211, 255);
              border-radius: 1rem;
              margin-top: -0.7rem;
              pointer-events: auto;
              cursor: grab;
            }
          `}</style>
          <div
            id="track"
            onClick={handleClickTrack}
            className="slider-track h-[5px] w-full bg-gray-300 absolute top-0 bottom-0 rounded-full"
          ></div>
          <div
            id="track-active"
            onClick={handleClickTrack}
            className="slider-track-active h-[5px] bg-black absolute top-0 bottom-0 rounded-full"
          ></div>
          <input
            value={percentMin}
            type="range"
            max={100}
            min={0}
            step={1}
            className="w-full absolute appearance-none pointer-events-none top-0 bottom-0"
            onChange={(e) => {
              setPercentMin(+e.target.value);
              resetCheckBox();
              isSliderDefault.current = true;
            }}
          ></input>
          <input
            value={percentMax}
            type="range"
            max={100}
            min={0}
            step={1}
            className="w-full absolute appearance-none pointer-events-none top-0 bottom-0"
            onChange={(e) => {
              setPercentMax(+e.target.value);
              resetCheckBox();
              isSliderDefault.current = true;
            }}
          ></input>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100">
      <div className="mx-15">
        <Breadcrumbs pagename={"Điện thoại"} />
      </div>
      <div className="px-15 py-2">
        <BrandButtons />
        <div className="flex flex-row gap-10 items-start">
          <LeftFilter />
          <RightContent />
        </div>
      </div>
    </div>
  );
};

export default PhoneProduct;