import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Catalogue from "../product/Catalogue";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Banner = () => {
  // Xử lý ảnh qcao
  const slides = [
    {
      image:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/m4-len-doi-tang-airpods-4.jpg",
      title: "MACBOOK AIR M4",
      description: "Lên đời nhận AirPods4",
    },
    {
      image:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/poco-x7-moi-home.jpg",
      title: "POCO X7 PRO",
      description: "Chỉ có tại CPS",
    },
    {
      image:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/s25-home-moi.png",
      title: "GALAXY S25 ULTRA",
      description: "Giá tốt chốt ngay",
    },
    {
      image:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/vivo-v50-home.png",
      title: "VIVO V50 LITE",
      description: "Giá chỉ 10.69 triệu",
    },
    {
      image:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://dashboard.cellphones.com.vn/storage/ai-hay-home.jpg",
      title: "ĐĂNG KÝ S-EDU",
      description: "Nhận ngay gói Ai Hay",
    },
  ];

  const swiperRef = useRef(null);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto flex items-start gap-3 py-4 px-1">
        {/* Left Catalogue - Hero Menu */}
        <div className="w-[230px] hidden lg:block shadow-lg rounded-lg overflow-hidden bg-white z-10 h-[380px]">
          <Catalogue />
        </div>

        {/* Center big banner */}
        <div className="flex-1 w-full max-w-[calc(100%-240px)] flex gap-2">

          {/* Main Slider */}
          <div className="flex-1 w-[70%] h-[380px] rounded-xl shadow-md overflow-hidden relative group">
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
              navigation={true}
              modules={[Autoplay, Pagination, Navigation]}
              className="mySwiper h-full w-full"
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
            </Swiper>
          </div>

          {/* Right Banners - Static */}
          <div className="hidden xl:flex flex-col gap-2 w-[30%] h-[380px]">
            <div className="h-1/3 w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <img
                alt="Right Banner 1"
                className="w-full h-full object-cover"
                src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:10/plain/https://dashboard.cellphones.com.vn/storage/m55-6990-right-banner.png"
              />
            </div>
            <div className="h-1/3 w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <img
                alt="Right Banner 2"
                className="w-full h-full object-cover"
                src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:10/plain/https://dashboard.cellphones.com.vn/storage/RightBanner-iPadAirM3%20(2).jpg"
              />
            </div>
            <div className="h-1/3 w-full rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <img
                alt="Right Banner 3"
                className="w-full h-full object-cover"
                src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:10/plain/https://dashboard.cellphones.com.vn/storage/s-edu-2-0-right-laptop.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;

// <div className="max-w-7xl mx-auto flex items-center gap-8 py-7 px-1">
//   {/* Left Catalogue */}
//   <div className="w-72">
//     <Catalogue></Catalogue>
//   </div>
//   {/* Center big banner */}
//   <div className="flex flex-col justify-between w-[850px] max-w-full border border-gray-150 rounded-xl shadow-xl overflow-hidden font-sans cursor-pointer">
//     {/* Slider ảnh */}
//     <div className="relative group">
//       {/* Dùng flex để render tất cả ảnh và trượt bằng translateX */}
//       <div className="flex">
//         <Swiper
//           ref={swiperRefAuto} // Attach Swiper instance to the ref
//           loop={false}
//           spaceBetween={0}
//           slidesPerView={1}
//           modules={[Navigation]}
//           onSlideChange={handleSlideChange} // Sync Swiper changes with currentImg
//           onSwiper={(swiper) => {
//             swiperRef.current = swiper; // Store Swiper instance
//           }}
//         >
//           {slides.map((slide, index) => (
//             <SwiperSlide key={index}>
//               <img
//                 draggable="false"
//                 className="h-full w-full object-cover flex-shrink-0"
//                 src={slide.image}
//                 alt={slide.title}
//               />
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>
//       {/* Nút chuyển slide trái */}
//       {currentSlide !== 0 && (
//         <button
//           onClick={prevSlide}
//           className="absolute top-1/2 left-0 -translate-y-1/2 z-10 text-white text-3xl opacity-0 group-hover:opacity-100 transition bg-black/20 w-10 h-20 rounded-r-full flex items-center justify-center shadow-md"
//         >
//           <i className="fas fa-chevron-left"></i>
//         </button>
//       )}
//       {/* Nút chuyển slide phải */}
//       {currentSlide !== slides.length - 1 && (
//         <button
//           onClick={nextSlide}
//           className="absolute -translate-y-1/2 z-10 text-white text-3xl opacity-0 group-hover:opacity-100 transition bg-black/20 right-0 top-1/2 w-10 h-20 rounded-l-full flex items-center justify-center shadow-md"
//         >
//           <i className="fas fa-chevron-right"></i>
//         </button>
//       )}
//     </div>

//     {/* Dòng caption và điều hướng nhỏ dưới ảnh */}
//     <div className="flex justify-between items-center text-[12px] text-gray-700 font-sans">
//       {slides.map((slide, index) => (
//         <div
//           key={index}
//           onClick={() => handleThumbnailClick(index)}
//           className={`hover:bg-gray-100 w-[300px] h-[65px] relative flex-1 text-center flex flex-col items-center justify-center ${
//             currentSlide === index
//               ? "after:absolute after:top-9 after:left-0 after:right-0 after:h-[2px] border-b-2 border-red-600"
//               : ""
//           }`}
//         >
//           <div className={`${currentSlide === index ? "font-bold" : ""}`}>
//             {slide.title}
//           </div>
//           <div className={currentSlide === index ? "font-bold" : ""}>
//             {slide.description}
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
//   {/* Right banners */}
//   <div className="flex flex-col gap-5">
//     <div className="w-64 border border-gray-300 rounded-xl shadow-xl overflow-hidden cursor-pointer">
//       <img
//         alt="Samsung Galaxy M55 5G banner with 8GB 256GB specs, price 6.99 triệu, S-Teacher and S-Student discount 600K"
//         className="w-full h-full object-cover"
//         src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:10/plain/https://dashboard.cellphones.com.vn/storage/m55-6990-right-banner.png"
//       />
//     </div>
//     <div className="w-64 border border-gray-300 rounded-xl shadow-xl overflow-hidden cursor-pointer">
//       <img
//         alt="Apple iPad Air banner with Apple M3 chip text on blue and pink gradient background"
//         className="w-full h-full object-cover"
//         src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:10/plain/https://dashboard.cellphones.com.vn/storage/RightBanner-iPadAirM3%20(2).jpg"
//       />
//     </div>
//     <div className="w-64 border border-gray-300 rounded-xl shadow-xl overflow-hidden cursor-pointer">
//       <img
//         alt="Say Hi! S-STUDENT S-TEACHER Laptop banner with 3% discount up to 400K and CellphoneS bag 600K on turquoise background"
//         className="w-full h-full object-cover"
//         src="https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:10/plain/https://dashboard.cellphones.com.vn/storage/s-edu-2-0-right-laptop.jpg"
//       />
//     </div>
//   </div>
// </div>
