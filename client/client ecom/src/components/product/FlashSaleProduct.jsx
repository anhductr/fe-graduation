import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { FaBolt } from "react-icons/fa";
import ProductCard from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import { getProductFlashSale } from "../../services/searchApi";

export default function FlashSaleProduct() {
    const swiperRef = useRef(null);
    const uniqueId = "flash-sale-product";

    // Fetch products from Flash Sale API
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ["flashSaleProducts"],
        queryFn: () => getProductFlashSale({ page: 1, size: 20 }),
        keepPreviousData: true,
    });

    const products = apiResponse?.result?.productGetVMList || [];

    // Don't render if loading or no products
    if (isLoading || !products || products.length === 0) {
        return null;
    }

    return (
        <div className="w-full relative px-15 my-8">
            <style jsx>{`
                @keyframes shake {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(10deg); }
                    50% { transform: rotate(0deg); }
                    75% { transform: rotate(-10deg); }
                    100% { transform: rotate(0deg); }
                }
                .lightning-icon {
                    animation: shake 1.5s infinite ease-in-out;
                }
            `}</style>

            {/* Main Container */}
            <div className="relative rounded-[20px] p-[2px] bg-[#d32f2f] shadow-sm">

                {/* Content Container */}
                <div className="relative bg-gradient-to-b from-[#ffcdd2] to-[#ffeba1] rounded-[18px] px-2 pb-6 pt-15">

                    {/* Header Pill */}
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10 w-[35%]">
                        <div className="bg-[#d32f2f] text-white h-[45px] rounded-b-[25px] flex items-center justify-center gap-2 font-bold uppercase text-xl shadow-sm">
                            <span className="text-yellow-300 text-2xl lightning-icon"><FaBolt /></span>
                            FLASH SALE
                            <span className="text-yellow-300 text-2xl lightning-icon"><FaBolt /></span>
                        </div>
                    </div>

                    {/* Product Swiper */}
                    <div className="relative group/swiper px-4">
                        <Swiper
                            key={uniqueId}
                            loop={products.length > 5} // Loop only if enough items
                            spaceBetween={12}
                            slidesPerView={2}
                            ref={swiperRef}
                            breakpoints={{
                                640: { slidesPerView: 3 },
                                768: { slidesPerView: 4 },
                                1024: { slidesPerView: 5 },
                            }}
                            modules={[Navigation]}
                            className="!py-2"
                        >
                            {products.map((product) => (
                                <SwiperSlide key={product.id}>
                                    <ProductCard product={product} />
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {products.length > 5 && (
                            <>
                                {/* Navigation Buttons */}
                                <button
                                    onClick={() => swiperRef.current?.swiper?.slidePrev()}
                                    className="
                                        absolute left-[-10px] top-1/2 -translate-y-1/2 z-20
                                        w-10 h-10 rounded-full bg-white/80 shadow-md text-gray-700
                                        flex items-center justify-center
                                        opacity-0 group-hover/swiper:opacity-100 
                                        transition-all duration-300
                                        hover:bg-white hover:text-red-600
                                    "
                                >
                                    <IoIosArrowBack size={24} />
                                </button>

                                <button
                                    onClick={() => swiperRef.current?.swiper?.slideNext()}
                                    className="
                                        absolute right-[-10px] top-1/2 -translate-y-1/2 z-20
                                        w-10 h-10 rounded-full bg-white/80 shadow-md text-gray-700
                                        flex items-center justify-center
                                        opacity-0 group-hover/swiper:opacity-100 
                                        transition-all duration-300
                                        hover:bg-white hover:text-red-600
                                    "
                                >
                                    <IoIosArrowForward size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
