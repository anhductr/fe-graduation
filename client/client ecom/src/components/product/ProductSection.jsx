import { useContext, useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useQuery } from "@tanstack/react-query";
import { getSearchSuggestionsFull, searchProducts } from "../../services/searchApi";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";

const ProductSection = ({ tabs, sortType = "DEFAULT" }) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const activeTab = tabs[activeTabIndex];
    const navigate = useNavigate();

    // 1. Fetch category ID using autocomplete based on keyword
    const { data: suggestionData } = useQuery({
        queryKey: ["categorySearch", activeTab.keyword],
        queryFn: () => getSearchSuggestionsFull(activeTab.keyword),
        staleTime: 5 * 60 * 1000, // cache for 5 mins
    });

    // Extract category ID (find item with autoCompletedType === 'CATEGORY')
    const categoryId = suggestionData?.result?.find(
        (item) => item.autoCompletedType === "CATEGORY"
    )?.id;

    // 2. Fetch products using the resolved category ID
    const { data: apiResponse, isLoading, error } = useQuery({
        queryKey: ["products", categoryId, sortType],
        queryFn: () => searchProducts({
            category: categoryId, // Use ID as requested
            sortType: sortType,
            page: 1,
            size: 10,
        }),
        enabled: !!categoryId, // Only fetch if we have a valid category ID
        keepPreviousData: true,
    });

    const products = apiResponse?.result?.productGetVMList || apiResponse?.productGetVMList || [];

    // Generate a unique ID for Swiper navigation
    const uniqueId = activeTab.title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

    const swiperRef = useRef(null);

    return (
        <>
            <div className="w-full bg-white relative px-15 py-4 my-4">
                {/* Header / Tabs */}
                <div className="flex flex-col mb-4">
                    {/* Tabs Titles */}
                    <div className="flex items-center mb-2">
                        {tabs.map((tab, index) => (
                            <h2
                                key={index}
                                onClick={() => setActiveTabIndex(index)}
                                className={`
                                cursor-pointer text-[20px] font-bold uppercase pb-2 transition-all border-b-2 px-15
                                ${activeTabIndex === index
                                        ? "text-[#03A9F4] bg-gradient-to-t from-[#03A9F4]/10 to-transparent"
                                        : "text-gray-500 border-transparent hover:text-gray-700"}
                            `}
                            >
                                {tab.title}
                            </h2>
                        ))}

                        {/* Spacer to push "Xem tất cả" to the right if needed, or absolute pos */}
                    </div>

                    {/* Second Row: Brands (Display Only) & See All Link */}
                    <div className="flex items-center justify-between py-2">
                        {/* Brand List */}
                        <div className="flex flex-wrap gap-2">
                            {activeTab.brands && activeTab.brands.map((brand, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-1 rounded-full text-sm text-gray-700 border border-gray-300"
                                >
                                    {brand}
                                </span>
                            ))}
                        </div>

                        {/* See All */}
                        <Link
                            to="/search"
                            state={{ keyword: activeTab.keyword }}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium whitespace-nowrap ml-4"
                        >
                            Xem tất cả <IoIosArrowForward />
                        </Link>
                    </div>
                </div>

                {/* Product Swiper */}
                <div className="relative group/swiper">
                    <Swiper
                        key={uniqueId} // Remount swiper when tab changes to reset position/state
                        loop={true}
                        spaceBetween={16}
                        slidesPerView={2}
                        ref={swiperRef}
                        breakpoints={{
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                        }}
                        navigation={{
                            nextEl: `#next-${uniqueId}`,
                            prevEl: `#prev-${uniqueId}`,
                        }}
                        className="!pl-1 !pr-1 !py-2"
                    >
                        {products.map((product, index) => (
                            <SwiperSlide key={index}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <button
                        id={`prev-${uniqueId}`}
                        className="
                        absolute left-[-20px] top-1/2 -translate-y-1/2 z-10
                        w-10 h-10 rounded-full bg-black/40 shadow-md text-white border border-gray-200
                        flex items-center justify-center
                        opacity-0 group-hover/swiper:opacity-100 
                        transition-all duration-300
                        hover:bg-black/60 
                    "
                    >
                        <IoIosArrowBack size={20} />
                    </button>

                    <button
                        id={`next-${uniqueId}`}
                        className="
                        absolute right-[-20px] top-1/2 -translate-y-1/2 z-10
                        w-10 h-10 rounded-full bg-black/40 shadow-md text-white border border-gray-200
                        flex items-center justify-center
                        opacity-0 group-hover/swiper:opacity-100 
                        transition-all duration-300
                        hover:bg-black/60 
                    "
                    >
                        <IoIosArrowForward size={20} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProductSection;
