import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Catalogue from "../product/Catalogue";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { getAllBanners } from "../../services/mediaApi";

const Banner = () => {
  const [leftBanners, setLeftBanners] = useState([]);
  const [rightBanners, setRightBanners] = useState([]);
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await getAllBanners();
        if (response && response.result) { // Assuming response structure { result: [...] }
          const allBanners = response.result;

          // Filter left banners: PROMOTION only
          const leftProps = allBanners.filter(
            (b) => b.mediaOwnerType === "PROMOTION"
          );
          setLeftBanners(leftProps);


          // Filter right banners: BRAND, PRODUCT_VARIANT, CATEGORY, PRODUCT
          const rightProps = allBanners.filter((b) =>
            ["BRAND", "PRODUCT_VARIANT", "CATEGORY", "PRODUCT"].includes(
              b.mediaOwnerType
            )
          );
          // Show all banners, handle overflow in UI
          setRightBanners(rightProps);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };

    fetchBanners();
  }, []);

  const handleBannerClick = (banner) => {
    // Navigate based on banner type and ID
    if (!banner.ownerId) return;

    navigate("/search", {
      state: {
        type: "banner",
        bannerUrl: banner.bannerUrl,
        ownerId: banner.ownerId,
        ownerType: banner.mediaOwnerType,
      }
    });
  };




  return (
    <div
      className="w-full relative overflow-hidden shadow pb-8"
      style={{
        backgroundImage:
          "linear-gradient(90deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
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
    /* Hide scrollbar for Chrome, Safari and Opera */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .no-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
  `}</style>
      <div className="mx-auto flex items-stretch justify-between gap-6 py-4 px-15 h-[570px]">
        {/* Center big banner */}
        <div className="w-[75%] max-w-[calc(100%-240px)] flex gap-2 h-full">
          {/* Main Slider */}
          <div className="rounded-xl shadow-sm overflow-hidden relative group h-full w-full">
            <Swiper
              spaceBetween={0}
              centeredSlides={true}
              loop={false} // Only loop if > 1 slide
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              modules={[Autoplay, Pagination]}
              ref={swiperRef}
              className="mySwiper h-full w-full group"
            >
              {leftBanners.length > 0 ? (
                leftBanners.map((banner, index) => (
                  <SwiperSlide key={banner.id || index}>
                    <img
                      src={banner.bannerUrl}
                      alt={banner.mediaPurpose || "Banner"}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleBannerClick(banner)}
                    />
                  </SwiperSlide>
                ))
              ) : (
                // Fallback/Loading state or keep existing static as placeholder?
                // For now, empty or basic placeholder if no data
                <SwiperSlide>
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Loading Banners...
                  </div>
                </SwiperSlide>
              )}

              {leftBanners.length > 1 && (
                <>
                  {/* Nút điều hướng custom - chỉ hiện khi hover */}
                  <button
                    onClick={() => swiperRef.current?.swiper?.slidePrev()}
                    className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 
                    w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/60"
                  >
                    <IoIosArrowBack size={24} />
                  </button>

                  <button
                    onClick={() => swiperRef.current?.swiper?.slideNext()}
                    className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 
                    w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/60"
                  >
                    <IoIosArrowForward size={24} />
                  </button>
                </>
              )}
            </Swiper>
          </div>
        </div>

        {/* Right Banners - Dynamic */}
        <div className="flex flex-col gap-2 w-[25%] h-full overflow-y-auto no-scrollbar">
          {rightBanners.map((banner, index) => (
            <div
              key={banner.id || index}
              className="min-h-[calc((100%-16px)/3)] w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
              onClick={() => handleBannerClick(banner)}
            >
              <img
                alt={banner.mediaPurpose || "Right Banner"}
                className="w-full h-full object-cover"
                src={banner.bannerUrl}
              />
            </div>
          ))}

          {/* Fallback placeholders if not enough right banners */}
          {[...Array(Math.max(0, 3 - rightBanners.length))].map((_, i) => (
            <div key={`placeholder-${i}`} className="min-h-[calc((100%-16px)/3)] w-full rounded-xl overflow-hidden shadow-sm bg-gray-100 flex-shrink-0">
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Banner;