import React, {
    useState,
    useContext,
    useRef,
    useCallback,
    useEffect,
} from "react";
import { useFilterStore } from "../api, function/searchPageFunction";
import { priceOptions } from "../api, function/searchPageFunction";
import DoublePriceRangeSlider from "./DoublePriceRangeSlider";
import { IoFilter } from "react-icons/io5";
import { IoIosArrowUp } from "react-icons/io";
import { specFilters } from "../api, function/searchPageFunction";

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
                <IoIosArrowUp
                    className={`text-[12px] transition-transform duration-200 ease-in-out ${open ? "rotate-0" : "rotate-180"
                        }`}
                />
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

export default function LeftFilter({ isSliderDefault, min, max, isClearChip, setIsClearChip, cateType }) {
    const {
        os,
        toggleOs,
        priceRange,
        togglePrice,
        toggleAllPrices,
        setPriceRangeSlider
    } = useFilterStore();

    const isAllChecked = priceRange.includes("all");

    const [isCheckBox, setIsCheckBox] = useState(true);

    // THÊM STATE NÀY ĐỂ ĐIỀU KHIỂN SLIDER
    const [sliderValue, setSliderValue] = useState([min, max]); // [0, 46990]

    const currentSpecs = specFilters[cateType] || specFilters.default;

    // Hàm reset slider khi tick checkbox
    const resetSliderToDefault = useCallback(() => {
        setSliderValue([min, max]);
        setPriceRangeSlider([min * 1000, max * 1000]);
        isSliderDefault.current = false;
        setIsCheckBox(false);
    }, [setPriceRangeSlider]);

    useEffect(() => {
        if (isClearChip) {
            resetSliderToDefault();
            setIsClearChip(false);
        }
    }, [isClearChip, resetSliderToDefault]);

    // Khi tick checkbox giá
    const handlePriceCheckboxChange = (range) => {
        togglePrice(range);
        resetSliderToDefault();
    };

    useEffect(() => {
        if (isClearChip) {
            resetSliderToDefault();
        }
    }, [isClearChip, resetSliderToDefault]);

    // Khi slider thay đổi
    const handleSliderChange = useCallback(
        (event, newValue) => {
            setSliderValue(newValue);
            setPriceRangeSlider([newValue[0] * 1000, newValue[1] * 1000]);

            if (!isCheckBox) {
                setIsCheckBox(true);
                toggleAllPrices();
            }
            isSliderDefault.current = true;
        },
        [setPriceRangeSlider, isCheckBox, toggleAllPrices]
    );
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
                                        isAllChecked
                                            ? false // Khi "Tất cả" được chọn thì các ô khác không checked
                                            : priceRange.length === 1 &&
                                            priceRange.some(
                                                (r) => r[0] === range[0] && r[1] === range[1]
                                            )
                                    }
                                    onChange={() => handlePriceCheckboxChange(range)} // dùng hàm mới
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
                    value={sliderValue}           // truyền state từ LeftFilter
                    onChange={handleSliderChange} // truyền callback
                    toggleAllPrices={toggleAllPrices}
                    isCheckBox={isCheckBox}
                    setIsCheckBox={setIsCheckBox}
                />
            </FilterToggle>
            {currentSpecs.map((specGroup) => (
                <FilterToggle key={specGroup.key} title={specGroup.group}>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                        {specGroup.options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className="border border-gray-300 rounded px-2 py-[3px] text-gray-600 hover:bg-gray-100"
                            // TODO: sau này sẽ thêm toggle logic cho từng spec
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </FilterToggle>
            ))}
        </aside>
    );
}