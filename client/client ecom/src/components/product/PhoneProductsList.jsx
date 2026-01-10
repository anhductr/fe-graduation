import { useContext, useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { getAllBrands } from "../../services/catalogueApi";
import { useQuery } from "@tanstack/react-query";
import { searchProducts, getSearchSuggestionsQuick } from "../../services/searchApi";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";

const PhoneProductsList = () => {
  let backendSortType = "DEFAULT";
  let categoryId = null;

  useEffect(() => {
    const fetchCategoryId = async () => {
      // type = 'phone' hoặc 'laptop'
      try {
        const res = await getSearchSuggestionsQuick("Điện thoại");
        console.log('res tìm kiếm: ', res);
      } catch (error) {
        console.error(`Failed to fetch data:`, error);
        return null;
      }
    };

    fetchCategoryId()
  }, []);

  const { data: rawApiData, isLoading, error } = useQuery({
    queryKey: [
      categoryId ?? null,
      backendSortType,
    ],
    queryFn: () => searchProducts({
      category: categoryId || null,
      sortType: backendSortType,
      page: 1,
      size: 20,
    }),
    // enabled: !!(keyword || categoryId || brand || minPrice !== null || maxPrice !== null),
    // staleTime: 1000 * 60 * 5,
  });

  const products = rawApiData || [];


  return (
    <>
      <div className="w-full bg-white relative px-15">
        <div className="flex flex-wrap gap-2 justify-between font-semibold text-[14px] py-5">
          <h2 className="font-semibold text-[27px]">ĐIỆN THOẠI</h2>
        </div>
        <div className="relative px-1 py-2 border-l border-r border-gray-140">
          <Swiper
            loop={true}
            spaceBetween={34}
            slidesPerView={5}
            navigation={{
              nextEl: "#phone-next",
              prevEl: "#phone-prev",
            }}
            modules={[Navigation]}
            className="!pl-1 !pr-1 !py-2"
          >
            {products.map((product, index) => (
              <SwiperSlide key={index}>
                <Link to={`/${product.nameSlug}`}>
                  <ProductCard product={product} />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          <button id="phone-prev" className="absolute left-[-2px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-black/32 top-1/2 w-[36px] h-19 rounded-r-full flex items-center justify-center shadow transition-transform duration-300 ease-in-out hover:scale-110">
            <IoIosArrowBack className="text-white" />
          </button>

          <button id="phone-next" className="absolute right-[-2px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-black/32 top-1/2 w-[36px] h-19 rounded-l-full flex items-center justify-center shadow transition-transform duration-300 ease-in-out hover:scale-110">
            <IoIosArrowForward className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default PhoneProductsList;
