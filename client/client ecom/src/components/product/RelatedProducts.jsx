import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import ProductCard from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../../services/searchApi";

export default function RelatedProducts({ categoryId }) {
    const swiperRef = useRef(null);

    console.log("DEBUG: RelatedProducts mounted with categoryId:", categoryId);

    // Fetch related products
    // Fetch 10 products based on categoryId
    const { data: apiResponse, isLoading, error } = useQuery({
        queryKey: ["relatedProducts", categoryId],
        queryFn: () => searchProducts({ category: categoryId, size: 10 }),
        enabled: !!categoryId,
    });

    console.log("DEBUG: RelatedProducts API Response:", apiResponse);
    console.log("DEBUG: RelatedProducts API Error:", error);

    const products = apiResponse?.productGetVMList || [];
    console.log("DEBUG: RelatedProducts Final List:", products);

    if (isLoading || !products || products.length === 0) {
        return null;
    }

    return (
        <div className="py-5 border-b-2 border-gray-200 flex flex-col gap-8">
            <h1 className="font-bold text-gray-900 text-lg text-[30px]">
                Sản phẩm tương tự
            </h1>
            <div className="relative group/related px-2">
                <Swiper
                    loop={products.length > 5}
                    spaceBetween={34}
                    slidesPerView={5}
                    modules={[Navigation]}
                    className="!pl-1 !pr-1 !py-2"
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    breakpoints={{
                        640: { slidesPerView: 3, spaceBetween: 20 },
                        768: { slidesPerView: 4, spaceBetween: 25 },
                        1024: { slidesPerView: 5, spaceBetween: 34 },
                    }}
                >
                    {products.map((product, index) => (
                        <SwiperSlide key={index}>
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Nút trái */}
                <button
                    onClick={() => swiperRef.current?.slidePrev()}
                    className="relate-prev absolute left-[-4px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-white/70 top-1/2 w-10 h-20 rounded-r-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
                >
                    <IoIosArrowBack />
                </button>

                {/* Nút phải */}
                <button
                    onClick={() => swiperRef.current?.slideNext()}
                    className="relate-next absolute right-[-4px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-white/70 top-1/2 w-10 h-20 rounded-l-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
                >
                    <IoIosArrowForward />
                </button>
            </div>
        </div>
    );
}
