import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Catalogue from "../product/Catalogue";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

const Banner = () => {
  // Xử lý ảnh qcao
  const slides = [
    {
      image: "/img/z7419634625950_4018dbc50ab44591330de611b8c2e275.jpg",
      title: "MACBOOK AIR M4",
      description: "Lên đời nhận AirPods4",
    },
    {
      image: "/img/z7419702514523_af9aed6e095eb5f450e9ba7fe1f69037.jpg",
      title: "POCO X7 PRO",
      description: "Chỉ có tại CPS",
    },
    {
      image: "/img/z7419947063738_deb57d0a678310116fef122f2f863afc.jpg",
      title: "GALAXY S25 ULTRA",
      description: "Giá tốt chốt ngay",
    },
  ];

  const swiperRef = useRef(null);

  return (
    <div
      className="w-full relative overflow-hidden shadow"
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
  `}</style>
      <div className="mx-auto flex items-stretch justify-between gap-6 py-4 px-15 h-[570px]">
        {/* Center big banner */}
        <div className="w-[75%] max-w-[calc(100%-240px)] flex gap-2 h-full">
          {/* Main Slider */}
          <div className="rounded-xl shadow-sm overflow-hidden relative group h-full">
            <Swiper
              spaceBetween={0}
              centeredSlides={true}
              loop={true}
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
              {slides.map((slide, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
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
            </Swiper>
          </div>
        </div>

        {/* Right Banners - Static */}
        <div className="flex flex-col justify-between gap-2 w-[25%] h-full">
          <div className="h-1/3 w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <img
              alt="Right Banner 3"
              className="w-full h-full object-cover"
              src="/img/z7420085612895_cfbb273d99708ea471a5eb37dc2dada5.jpg"
            />
          </div>
          <div className="h-1/3 w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <img
              alt="Right Banner 1"
              className="w-full h-full object-cover"
              src="/img/z7419947075316_aebb7a663e993ea349d9897493072a08.jpg"
            />
          </div>
          <div className="h-1/3 w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <img
              alt="Right Banner 2"
              className="w-full h-full object-cover"
              src="/img/z7419947058763_8044d5aa2c593ac5c0fe07066f1df367.jpg"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Banner;