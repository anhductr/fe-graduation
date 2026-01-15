import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { FaStar } from "react-icons/fa6"; // Or use the stars similar to the image if needed
import ProductCard from "./ProductCard";

// Mock Data
const MOCK_PRODUCTS = Array(10).fill(null).map((_, index) => ({
    id: `mock-${index}`,
    name: `iPhone 17 Pro Max ${index + 1}TB | Chính hãng`,
    price: 37690000 + (index * 1000000),
    listPrice: 40000000 + (index * 1000000),
    thumbnailUrl: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max.png", // Placeholder image path
    avgRating: 5,
}));

export default function RecommendProduct() {
    const swiperRef = useRef(null);
    const uniqueId = "recommend-product";

    // Use mock data
    const products = MOCK_PRODUCTS;

    return (
        <div className="w-full relative px-15 my-8">
            {/* Main Container with Pink Gradient Border/Background */}
            {/* Main Container */}
            <div className="relative rounded-[20px] p-[2px] bg-[#6fa6ff] shadow-sm">
                {/* bg-gradient-to-l from-[#ffe8e8] to-[#ffdbdb] */}
                {/* Content Container */}
                <div
                    className="relative rounded-[18px] px-2 pb-6 pt-15"
                    style={{
                        backgroundImage: "linear-gradient(90deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
                        backgroundSize: "300% 300%",
                        animation: "colorAnim 12s infinite linear alternate",
                    }}
                >
                    <style jsx global>{`
                        @keyframes colorAnim {
                        0% { background-position: 100% 50%; }
                        50% { background-position: 0% 50%; }
                        100% { background-position: 100% 50%; }
                        }
                    `}</style>

                    {/* Header Pill */}
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10 w-[35%]">
                        <div className="bg-[#6fa6ff] text-white h-[45px] rounded-b-[25px] flex items-center justify-center gap-2 font-bold uppercase text-xl shadow-sm">
                            <span className="text-yellow-300 text-2xl">✨</span>
                            GỢI Ý CHO BẠN
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
                                hover:bg-white hover:text-blue-600
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
                                hover:bg-white hover:text-blue-600
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
