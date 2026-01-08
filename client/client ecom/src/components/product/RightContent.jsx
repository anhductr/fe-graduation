import { priceOptions } from "../../utils/searchHelpers";
import { useFilterStore } from "../../utils/searchHelpers";
import React, {
    useState,
    useContext,
    useRef,
    useCallback,
    useEffect,
} from "react";
import ProductCard from "./ProductCard";
import { MdClose } from "react-icons/md";

export default function RightContent({ products, isSliderDefault, min, max, setIsClearChip }) {
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
        sortType,        // Lấy từ store
        setSortType,
    } = useFilterStore();

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

                {priceRangeSlider.length > 0 && isSliderDefault.current && (priceRangeSlider[0] !== min * 1000 || priceRangeSlider[1] !== max * 1000) && (
                    <div
                        className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full pl-3 pr-2 py-1 text-[13px] font-medium select-none transition-transform duration-300 ease-in-out hover:scale-110"
                        onClick={() => {
                            setPriceRangeSlider([min * 1000, max * 1000]);
                            isSliderDefault.current = false;
                            setIsClearChip(true);
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
                        <button aria-label="Remove priceRange" class="ml-1 flex rounded-full">
                            <MdClose size={20} className="text-gray-600" />
                        </button>
                    </div>
                )}

                {(os.length > 1 ||
                    (!priceRange.includes("all") && priceRange.length > 1) ||
                    (!priceRange.includes("all") && (priceRangeSlider[0] !== min * 1000 && priceRangeSlider[1] !== max * 1000)) ||
                    (os.length > 0 && ((priceRangeSlider[0] !== min * 1000 || priceRangeSlider[1] !== max * 1000) || !priceRange.includes("all")))) &&
                    (
                        <button
                            class="text-[#0096FF] text-[13px] font-semibold transition-transform duration-300 ease-in-out hover:text-[15px]"
                            type="button"
                            onClick={() => {
                                resetFilters();
                                setIsClearChip(true);
                            }}
                        >
                            Xóa tất cả
                        </button>
                    )}
            </div>

            <div className="mb-1 text-[15px] flex flex-wrap items-center gap-3">
                <span>
                    Tìm thấy{" "}
                    <span className="font-semibold">{products?.length}</span> kết
                    quả
                </span>
                <nav
                    className="flex gap-3 ml-auto text-[15px] text-gray-500"
                    aria-label="Sort options"
                >
                    <button
                        type="button"
                        className={sortType === "default" ? "text-[#0096FF] font-semibold" : ""}
                        onClick={() => setSortType("default")}
                    >
                        Nổi bật
                    </button>
                    <span>•</span>
                    <button
                        type="button"
                        className={
                            sortType === "asc" ? "text-[#0096FF] font-semibold" : ""
                        }
                        onClick={() => setSortType("asc")}
                    >
                        Giá tăng dần
                    </button>
                    <span>•</span>
                    <button
                        type="button"
                        className={
                            sortType === "desc" ? "text-[#0096FF] font-semibold" : ""
                        }
                        onClick={() => setSortType("desc")}
                    >
                        Giá giảm dần
                    </button>
                </nav>
            </div>


            <div className="grid grid-cols-4 gap-5">
                {products?.map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </main>
    );
}