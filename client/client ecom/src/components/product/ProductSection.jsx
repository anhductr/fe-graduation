import { useContext, useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
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
    console.log("products: ", products);
    const uniqueId = title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

    const swiperRef = useRef(null);

    return (
        <div className="w-full bg-white relative px-15 rounded-xl my-4 cursor-pointer">
            <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-2">
                <h2 className="font-bold text-[22px] text-gray-800 uppercase flex items-center gap-2">
                    {icon && <span className="text-red-600">{icon}</span>}
                    {title}
                </h2>
                <Link to="/search" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                    Xem tất cả <IoIosArrowForward />
                </Link>
            </div>

            <div className="relative group/swiper">
                <Swiper
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

                <button
                    id={`prev-${uniqueId}`}
                    onClick={() => swiperRef.current?.swiper?.slidePrev()}  // nếu dùng ref thì giữ, nếu dùng id navigation thì bỏ onClick
                    className="
                        absolute left-[-30px] top-1/2 -translate-y-1/2 z-10
                        w-10 h-10 rounded-full bg-black/40 text-white 
                        flex items-center justify-center
                        opacity-0 group-hover/swiper:opacity-100 
                        transition-opacity duration-300
                        hover:bg-black/60
                    "
                >
                    <IoIosArrowBack size={24} />
                </button>

                <button
                    id={`next-${uniqueId}`}
                    onClick={() => swiperRef.current?.swiper?.slideNext()}
                    className="
                        absolute right-[-30px] top-1/2 -translate-y-1/2 z-10
                        w-10 h-10 rounded-full bg-black/40 text-white 
                        flex items-center justify-center
                        opacity-0 group-hover/swiper:opacity-100 
                        transition-opacity duration-300
                        hover:bg-black/60
                    "
                >
                    <IoIosArrowForward size={24} />
                </button>
            </div>
        </div>
    );
};

export default ProductSection;
