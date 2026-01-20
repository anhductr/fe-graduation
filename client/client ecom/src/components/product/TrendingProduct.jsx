import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import ProductCard from "./ProductCard";
import { getTrendingRecommendations } from "../../services/recommendationApi";
import { getSuggestedProductsByIds } from "../../services/searchApi";

export default function TrendingProduct() {
    const swiperRef = useRef(null);
    const uniqueId = "trending-product";
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // 1. Get trending recommendations
                const trendingResponse = await getTrendingRecommendations({
                    limit: 15
                });

                // Check structure. Assuming similar to personalized: returned object might have recommendations list
                // or it might be a direct list. 
                // Adjusting to handle generic "list of items with product_id" or "list of products"

                let productIds = [];
                const rawList = trendingResponse?.recommendations || trendingResponse?.data || trendingResponse || [];

                if (Array.isArray(rawList)) {
                    // Try to extract IDs if they exist
                    productIds = rawList.map(item => item.product_id || item.id).filter(Boolean);
                }

                if (productIds.length > 0) {
                    // 2. Get full product details if we only have IDs or partial info
                    // Using getSuggestedProductsByIds to get full view models
                    const productsResponse = await getSuggestedProductsByIds({
                        productIds,
                        recomentedType: "trending",
                        page: 1,
                        size: 15
                    });

                    // Parse response similar to RecommendProduct
                    const fetchedProducts = productsResponse?.result?.productGetVMList ||
                        productsResponse?.content ||
                        productsResponse?.data ||
                        [];

                    if (Array.isArray(fetchedProducts)) {
                        setProducts(fetchedProducts);
                    } else if (Array.isArray(fetchedProducts.items)) {
                        setProducts(fetchedProducts.items);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch trending products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading) return null;
    if (!products || products.length === 0) return null;

    return (
        <div className="w-full relative px-15 my-8">
            {/* Main Container */}
            <div className="relative rounded-[20px] p-[2px] bg-[#ff6f6f] shadow-sm">

                {/* Content Container */}
                <div
                    className="relative rounded-[18px] px-2 pb-6 pt-15"
                    style={{
                        backgroundImage: "linear-gradient(90deg, #ff9a9e, #fecfef, #feada6)",
                        backgroundSize: "300% 300%",
                        animation: "colorAnim 12s infinite linear alternate"
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
                        <div className="bg-[#ff6f6f] text-white h-[45px] rounded-b-[25px] flex items-center justify-center gap-2 font-bold uppercase text-xl shadow-sm">
                            <span className="text-yellow-300 text-2xl">🔥</span>
                            XU HƯỚNG MUA SẮM
                        </div>
                    </div>

                    {/* Product Swiper */}
                    <div className="relative group/swiper px-4">
                        <Swiper
                            key={uniqueId}
                            loop={products.length > 5}
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
                                <SwiperSlide key={product.id || index}>
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
                                hover:bg-white hover:text-red-500
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
                                hover:bg-white hover:text-red-500
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
