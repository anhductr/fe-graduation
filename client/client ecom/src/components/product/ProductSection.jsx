import { useContext, useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../../services/searchApi";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";

const ProductSection = ({ title, keyword, sortType = "DEFAULT", icon }) => {

    // Fetch products using search API
    const { data: apiResponse, isLoading, error } = useQuery({
        queryKey: ["products", keyword, sortType],
        queryFn: () => searchProducts({
            keyword: keyword,
            sortType: sortType,
            page: 1,
            size: 10,
        }),
    });

    // API Response wrapper: { code, message, result: { productGetVMList, ... } }
    const products = apiResponse?.result?.productGetVMList || apiResponse?.productGetVMList || [];

    const uniqueId = title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

    return (
        <div className="w-full bg-white relative px-4 md:px-15 rounded-xl my-4">
            <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-2">
                <h2 className="font-bold text-[22px] text-gray-800 uppercase flex items-center gap-2">
                    {icon && <span className="text-red-600">{icon}</span>}
                    {title}
                </h2>
                <Link to="/search" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                    Xem tất cả <IoIosArrowForward />
                </Link>
            </div>

            <div className="relative group">
                <Swiper
                    loop={true}
                    spaceBetween={16}
                    slidesPerView={2}
                    breakpoints={{
                        640: { slidesPerView: 3 },
                        768: { slidesPerView: 4 },
                        1024: { slidesPerView: 5 },
                    }}
                    navigation={{
                        nextEl: `#next-${uniqueId}`,
                        prevEl: `#prev-${uniqueId}`,
                    }}
                    modules={[Navigation]}
                    className="!py-2"
                >
                    {products.map((product, index) => (
                        <SwiperSlide key={index}>
                            <Link to={`/${product.id}`}>
                                <ProductCard product={product} />
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <button id={`prev-${uniqueId}`} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-md flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-blue-600 border border-gray-100">
                    <IoIosArrowBack className="text-xl" />
                </button>

                <button id={`next-${uniqueId}`} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-md flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-blue-600 border border-gray-100">
                    <IoIosArrowForward className="text-xl" />
                </button>
            </div>
        </div>
    );
};

export default ProductSection;
