import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { FaBolt } from "react-icons/fa"; // Lightning icon
import ProductCard from "./ProductCard";

// Mock Data
const MOCK_PRODUCTS = Array(10).fill(null).map((_, index) => ({
    id: `flash-${index}`,
    name: `iPhone 17 Pro Max ${index + 1}TB | Flash Sale`,
    price: 35000000 + (index * 1000000), // Slightly cheaper for mock flash sale
    listPrice: 42000000 + (index * 1000000),
    thumbnailUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max.png",
    avgRating: 5,
}));

export default function FlashSaleProduct() {
    const swiperRef = useRef(null);
    const uniqueId = "flash-sale-product";

    // Use mock data
    const products = MOCK_PRODUCTS;

    return (
        <div className="w-full relative px-15 my-8">
            {/* Main Container */}
            <div className="relative rounded-[20px] p-[2px] bg-[#d32f2f] shadow-sm">

                {/* Content Container */}
                <div className="relative bg-gradient-to-b from-[#ffcdd2] to-[#ffeba1] rounded-[18px] px-2 pb-6 pt-15">

                    {/* Header Pill */}
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10 w-[35%]">
                        <div className="bg-[#d32f2f] text-white h-[45px] rounded-b-[25px] flex items-center justify-center gap-2 font-bold uppercase text-xl shadow-sm">
                            <span className="text-yellow-300 text-2xl"><FaBolt /></span>
                            FLASH SALE
                            <span className="text-yellow-300 text-2xl"><FaBolt /></span>
                        </div>
                    </div>

                    {/* Product Swiper */}
                    <div className="relative group/swiper px-4">
                        <Swiper
                            key={uniqueId}
                            loop={true}
                            spaceBetween={12}
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
                            className="!py-2"
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
                            id={`next-${uniqueId}`}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
