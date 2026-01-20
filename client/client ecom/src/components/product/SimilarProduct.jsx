import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import ProductCard from "./ProductCard";
import { getSimilarProducts } from "../../services/recommendationApi";
import { getSuggestedProductsByIds } from "../../services/searchApi";
import { useAuth } from "../../context/AuthContext";

export default function SimilarProduct({ productId }) {
    const swiperRef = useRef(null);
    const uniqueId = `similar-product-${productId}`; // Ensure uniqueness if multiple instances
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isUserLoading } = useAuth();

    useEffect(() => {
        if (!productId || isUserLoading) return;

        const fetchSimilar = async () => {
            try {
                // 1. Get similar products recommendations
                const response = await getSimilarProducts(productId, {
                    limit: 10,
                    user_id: user?.id
                });

                // Check structure. Assuming returns list of recommendations with product_id
                const rawList = response?.recommendations || response?.data || response || [];
                let productIds = [];

                if (Array.isArray(rawList)) {
                    productIds = rawList.map(item => item.product_id || item.id).filter(Boolean);
                }

                if (productIds.length > 0) {
                    // 2. Get full product details
                    const productsResponse = await getSuggestedProductsByIds({
                        productIds,
                        recomentedType: "similar",
                        page: 1,
                        size: 10
                    });

                    // Parse response similar to RecommendProduct/TrendingProduct
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
                console.error("Failed to fetch similar products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilar();
    }, [productId, isUserLoading, user?.id]);

    if (loading) return null; // Or skeleton
    if (!products || products.length === 0) return null;

    return (
        <div className="w-full relative py-6">
            <div className="flex flex-col gap-4">
                <h1 className="font-bold text-gray-900 text-lg text-[30px] border-l-4 border-blue-500 pl-3">
                    Sản phẩm tương tự
                </h1>

                <div className="relative group/swiper px-2">
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

                    {/* Navigation Buttons - styled similar to other sections but maybe simpler as per ProductPage style */}
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
    );
}
