import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
// import CartContext from "../context/CartContext";
// import { ProductContext } from "../context/ProductContext";
// import { WishlistContext } from "../context/WishlistContext";
import axios from "axios";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { RiPlayCircleLine } from "react-icons/ri"; // Remix Icon - play (outlined)
import { AiOutlineStar } from "react-icons/ai";    // Ant Design - star (outlined)
import { FaHeart } from "react-icons/fa";
import ProductCard from "../components/product/ProductCard";
import Breadcrumbs from "../components/common/Breadcrumbs";
import ReactPlayer from "react-player";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { Box, IconButton, Typography } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import { IoMdRemove } from "react-icons/io";
import { MdCheck } from "react-icons/md";


import { IoStar } from "react-icons/io5";
import Button from '@mui/material/Button';

import { FaCheck, FaCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import SpecsPopup from '../components/product/SpecsPopup';
import ProductViewDetails from "../components/product/ProductViewDetails";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";


const ProductPage = () => {
  // const {category, name, productId} = useParams();
  useEffect(() => {
    // Nhảy ngay lên đầu trang
    window.scrollTo(0, 0);
  }, []);

  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [productFromDBState, setProductFromDBState] = useState(null);
  const [clickedIndex, setClickedIndex] = useState(0);

  const openProductDetails = (product) => {
    setProductFromDBState(product);
    setIsViewDetailsOpen(true);
  };

  const [openSpecsPopup, setOpenSpecsPopup] = useState(false);

  const productFromDB = {
    id: 1,
    name: "iPhone 16 Pro Max 256GB",
    brand: "Apple",
    category: "Điện thoại",
    video: "https://www.youtube.com/watch?v=bPkenYE4qzw",
    images: [
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-2.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-3.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-4.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-5.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-6.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-7.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-8.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-10.png",
      },
      {
        alt: "Thumbnail side view of iPhone 16 Pro Max",
        src: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:1200/q:100/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-9.png",
      },
    ],
  };

  const product = {
    ...productFromDB,
    images: [{}, {}, ...productFromDB.images],
  };

  const products = [
    {
      discount: "4%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/43192908-db04-4e3b-7bb9-2b7ad489df28.jpg",
      alt: "Samsung Galaxy A26 5G 8GB 128GB black smartphone front and back",
      name: "Samsung Galaxy A26 5G 8GB 128GB",
      sellPrice: 6690000,
      listPrice: 6990000,
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      avgRating: 5,
    },
    {
      discount: "18%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/6cb3261a-1bad-4d8f-c134-c79a95562e6d.jpg",
      alt: "Samsung Galaxy S25 Ultra 512GB silver smartphone with S Pen",
      name: "Samsung Galaxy S25 Ultra 512GB",
      sellPrice: "30.890.000",
      listPrice: "37.490.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      avgRating: 5,
    },
    {
      discount: "17%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/a94271fd-9a47-498b-01ed-06d880cd2015.jpg",
      alt: "TECNO CAMON 40 Pro 8GB 256GB white and blue smartphone front and back",
      name: "TECNO CAMON 40 Pro 8GB 256GB",
      sellPrice: 5790000,
      listPrice: 6990000,
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      avgRating: 5,
    },
    {
      discount: "15%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/b9d765ec-448b-4567-e60a-b8faab27be47.jpg",
      alt: "TECNO CAMON 40 8GB 256GB black and silver smartphone front and back",
      name: "TECNO CAMON 40 8GB 256GB",
      sellPrice: 5490000,
      listPrice: 6490000,
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      avgRating: 5,
    },
    {
      discount: "13%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/9d1de0bd-535a-4e49-f314-5c7000b5a6b9.jpg",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      sellPrice: 3490000,
      listPrice: 3990000,
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      avgRating: 4.5,
    },
    {
      discount: "13%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-a36.2.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      sellPrice: 3490000,
      listPrice: 3990000,
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      avgRating: 4.5,
    },
    {
      discount: "13%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_2__2.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      sellPrice: 3490000,
      listPrice: 3990000,
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      avgRating: 4.5,
    },
  ];

  //cập nhật ảnh về sản phẩm
  const [currentImg, setCurrentImg] = useState(0);

  const swiperRef = useRef(null); // Reference to control Swiper instance

  // Sync Swiper with currentImg
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(currentImg); // Move Swiper to currentImg index
    }
  }, [currentImg]);

  const handleSlideChange = (swiper) => {
    setCurrentImg(swiper.realIndex); // Update currentImg when Swiper changes
  };

  const swiperThumb = useRef(null); // Reference to control Swiper instance

  useEffect(() => {
    if (swiperThumb.current) {
      swiperThumb.current.slideTo(currentImg); // Move Swiper to currentImg index
    }
  }, [currentImg]);

  const handleThumbChange = (swiper) => {
    setCurrentImg(swiper.realIndex); // Update currentImg when Swiper changes
  };

  const prevSlide = () => {
    setCurrentImg((prev) => Math.max(prev - 1, 0));
    // console.log("prev: ", currentImg);
  };

  const nextSlide = () => {
    setCurrentImg((prev) => Math.min(prev + 1, product.images.length - 1));
    // console.log("next: ", currentImg);
  };

  // cho phần zoom 2
  const lensSize = 150;
  const zoomWidth = 570;
  const zoomHeight = 570;
  const scale = 3.8; // mức phóng — bạn đang dùng *5
  // const zoomFactor = 5; // mức phóng — bạn đang dùng *5

  const [zoomImage, setZoomImage] = useState(null);
  const [lensPosition, setLensPosition] = useState({
    display: "none",
    left: 0,
    top: 0,
  });

  const handleMouseMove = (e, imageUrl) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // vị trí lens (góc trái)
    let lensX = x - lensSize / 2;
    let lensY = y - lensSize / 2;

    // giới hạn lens trong ảnh
    lensX = Math.max(0, Math.min(rect.width - lensSize, lensX));
    lensY = Math.max(0, Math.min(rect.height - lensSize, lensY));

    setLensPosition({
      display: "block",
      left: lensX,
      top: lensY,
    });

    setZoomImage({
      display: "block",
      url: imageUrl.src,
      // Thay vì percentX/percentY 0-100%, dùng pixel offset tương ứng
      backgroundPositionX: -(lensX * scale),
      backgroundPositionY: -(lensY * scale),
      backgroundSize: `${rect.width * scale}px ${rect.height * scale}px`,
      width: zoomWidth,
      height: zoomHeight,
    });
  };

  const handleMouseOut = () => {
    setLensPosition({ display: "none", left: 0, top: 0 });
    setZoomImage(null);
  };

  const style = {
    width: "100%",
    height: "530px",
    backgroundImage:
      "linear-gradient(90deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
    backgroundSize: "300% 300%",
    animation: "colorAnim 12s infinite linear alternate",
  };


  //quantity select
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleDecrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  return (
    <>
      <ProductViewDetails
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        product={productFromDBState}
        clickedIndex={clickedIndex}
      />
      <Navbar />
      <div className="px-15 bg-white text-gray-900 py-2">
        {/* Breadcrumb */}
        <Breadcrumbs pagename="product" product={product} />

        <div className="py-6">
          <div className="relative flex gap-10 border-b-2 pb-4 border-gray-200">
            {/* Left side: Image and features */}
            <div className="w-6/11 rounded-lg overflow-hidden relative ">
              <div className="relative group">
                <div
                  onClick={() => {
                    openProductDetails(productFromDB);
                    if (currentImg >= 1)
                      setClickedIndex(currentImg);
                    // console.log("Clicked index:", currentImg);
                  }}
                  className="w-full overflow-hidden rounded-lg border border-[#ccc]"
                >
                  <Swiper
                    loop={false}
                    spaceBetween={0}
                    slidesPerView={1}
                    modules={[Navigation]}
                    onSlideChange={handleSlideChange} // Sync Swiper changes with currentImg
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper; // Store Swiper instance
                    }}
                  >
                    {product.images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <div
                          className={`w-full transform transition-transform duration-300 ease-in-out rounded-lg shadow-lg flex items-center justify-center px-4 h-[530px] ${index === 0
                            ? "gap-6"
                            : "bg-white"
                            }`}
                          style={(index === 0) ? style : undefined}
                        ><style>{`
                          @keyframes colorAnim {
                            0%   { background-position: 100% 50%; }
                            50%  { background-position: 0% 50%; }
                            100% { background-position: 100% 50%; }
                          }
                          `}</style>
                          {/* bg-gradient-to-r from-pink-500 to-orange-300  */}
                          {index === 0 ? (
                            <div className="flex gap-2">
                              <div className="rounded-[10px] flex items-center justify-center max-w-[280px]">
                                <img
                                  alt="iPhone 16 Pro Max gold color front and back view"
                                  className="rounded-[10px] h-full w-full object-cover flex-shrink-0"
                                  loading="lazy"
                                  src={product.images[2].src}
                                />
                              </div>
                              <div className="flex flex-col justify-center items-center text-white p-3">
                                <h2 className="font-bold mb-3 text-lg">
                                  TÍNH NĂNG NỔI BẬT
                                </h2>
                                <ul className="list-disc list-inside space-y-2 text-[13px]">
                                  <li>
                                    Màn hình Super Retina XDR 6,9 inch lớn hơn có
                                    viền mỏng hơn, đem đến cảm giác tuyệt vời khi
                                    cầm trên tay.
                                  </li>
                                  <li>
                                    Điều khiển Camera - Chỉ cần trượt ngón tay để
                                    điều chỉnh camera giúp chụp ảnh hoặc quay
                                    video đẹp hoàn hảo và siêu nhanh.
                                  </li>
                                  <li>
                                    iPhone 16 Pro Max có thiết kế titan cấp 5 với
                                    lớp hoàn thiện mới, tinh tế được xử lý bề mặt
                                    vi điểm.
                                  </li>
                                  <li>
                                    iPhone 16 Pro Max được cài đặt sẵn hệ điều
                                    hành iOS 18.
                                  </li>
                                </ul>
                              </div>
                            </div>
                          ) : index === 1 ? (
                            <div className="">
                              <ReactPlayer
                                controls={true}
                                playing={currentImg === 1 ? true : false}
                                volume={1}
                                muted={true}
                                height={"530px"}
                                width={"739px"}
                                url={product.video}
                              />
                            </div>
                          ) : (
                            //zoom
                            <div
                              onMouseMove={(e) => handleMouseMove(e, img)}
                              onMouseLeave={handleMouseOut}
                              className="relative w-[530px] h-[530px] cursor-pointer"
                            >
                              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />

                              <div
                                className="absolute border border-[#0096FF] rounded-[10px] bg-white/20 pointer-events-none transition-opacity duration-150"
                                style={{
                                  display: lensPosition.display,
                                  width: lensSize,
                                  height: lensSize,
                                  top: lensPosition.top,
                                  left: lensPosition.left,
                                  opacity: lensPosition.display === "block" ? 1 : 0,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                {/* Nút chuyển slide */}
                {currentImg !== 0 && (
                  <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-0 -translate-y-1/2 z-10 text-white text-3xl opacity-0 group-hover:opacity-100 transition bg-black/20 w-10 h-20 rounded-r-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out hover:scale-110"
                  >
                    <IoIosArrowBack />
                  </button>
                )}

                {currentImg !== product.images.length - 1 && (
                  <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-0 -translate-y-1/2 z-10 text-white text-3xl opacity-0 group-hover:opacity-100 transition bg-black/20 w-10 h-20 rounded-l-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out hover:scale-110"
                  >
                    <IoIosArrowForward />
                  </button>
                )}
              </div>

              {/* ảnh thumbnails ở dưới */}
              <div className="flex gap-3 mt-3 overflow-hidden py-1 px-4 relative group">
                <Swiper
                  loop={false}
                  spaceBetween={10}
                  slidesPerView={8}
                  modules={[Navigation]}
                  onSlideChange={handleThumbChange} // Sync Swiper changes with currentImg
                  onSwiper={(swiper) => {
                    swiperThumb.current = swiper; // Store Swiper instance
                  }}
                >
                  {product.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      {index === 0 ? (
                        <button
                          className={`text-[13px] hover:border-[#0096FF] hover:border-2 flex flex-col gap-1 w-[76px] h-[80px] items-center justify-center text-xs text-black font-semibold border rounded-[10px] ${currentImg === index
                            ? "border-[#0096FF] border-2"
                            : "border-[#ccc]"
                            }`}
                          onClick={() => setCurrentImg(index)}
                        >
                          <AiOutlineStar className="text-[21px]" />
                          Nổi bật
                        </button>
                      ) : index === 1 ? (
                        <button
                          onClick={() => setCurrentImg(index)}
                          className={`text-[13px] hover:border-[#0096FF] hover:border-2 flex flex-col gap-1 w-[76px] h-[80px] items-center justify-center text-xs text-black font-semibold border rounded-[10px] ${currentImg === index
                            ? "border-[#0096FF] border-2"
                            : "border-[#ccc]"
                            }`}
                        >
                          <RiPlayCircleLine className="text-[21px]" />
                          Video
                        </button>
                      ) : (
                        <img
                          onClick={() => setCurrentImg(index)}
                          className={`w-[80px] h-[80px] hover:border-[#0096FF] hover:border-2  border rounded-[10px] ${currentImg === index
                            ? "border-[#0096FF] border-2"
                            : "border-[#ccc]"
                            }`}
                          loading="lazy"
                          src={img.src}
                          alt={img.alt}
                        />
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Nút trái */}
                {currentImg !== 0 && (
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-[50%] -translate-y-1/2 transition bg-black/20 text-white p-2 rounded-r-full shadow-md z-10 opacity-0 group-hover:opacity-100 transition-transform duration-300 ease-in-out hover:scale-110"
                  >
                    <IoIosArrowBack />
                  </button>
                )}

                {/* Nút phải */}
                {currentImg !== product.images.length - 1 && (
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-[50%] -translate-y-1/2 transition bg-black/20 text-white p-2 rounded-l-full shadow-md z-10 opacity-0 group-hover:opacity-100 transition-transform duration-300 ease-in-out hover:scale-110"
                  >
                    <IoIosArrowForward />
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Options and pricing */}
            <div className="relative w-5/11 space-y-4 pl-[50px]">
              {zoomImage && (
                <div
                  className="absolute right-0 z-40 rounded-[10px] border border-[#ccc] shadow-xl overflow-hidden bg-white"
                  style={{
                    width: zoomWidth,
                    height: zoomHeight,
                  }}
                >
                  <div
                    className="w-full h-full pointer-events-none rounded-[10px]"
                    style={{
                      display: zoomImage.display,
                      backgroundImage: `url(${zoomImage.url})`,
                      backgroundPosition: `${zoomImage.backgroundPositionX}px ${zoomImage.backgroundPositionY}px`,
                      backgroundSize: zoomImage.backgroundSize,
                    }}
                  ></div>
                </div>
              )}


              {/* Title and avgRating */}
              <div className="flex flex-wrap items-center gap-4 border-gray-200">
                <h1 className="font-bold text-gray-900 text-[30px]">
                  {product.name}
                </h1>
                <Button variant="outlined" className="!text-[#0096FF] !border-[#0096FF] !text-[11px] !px-2 !py-1 !normal-case">
                  + So sánh
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center gap-1 text-[16px]">
                  <IoStar className="text-yellow-500" />
                  <span className="text-gray-600 ">4.8</span>
                </div>
                <span className="text-gray-600 text-[16px]">289 đánh giá</span>
                <span className="text-gray-600 text-[16px]" onClick={() => setOpenSpecsPopup(true)}>Thông số kĩ thuật</span>
              </div>

              {/* Storage options */}
              <div className="flex">
                <p className="w-[18%] text-[16px] font-semibold">Dung lượng</p>
                <div className="w-[82%] flex gap-4 text-center text-[14px] text-gray-700">
                  <button className="border border-[#ccc] rounded p-2">
                    <div className="font-semibold">256 GB</div>
                  </button>
                  <button className="border border-[#ccc] rounded p-2">
                    <div className="font-semibold">512 GB</div>
                  </button>
                  <button className="relative border border-[#0096FF] border-2 rounded p-2">
                    <div className="font-semibold">1 TB</div>
                    {/* Tam giác góc phải */}
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[17px] border-t-[17px] border-l-transparent !border-t-[#0096FF] "></div>
                    <MdCheck className="absolute top-0 right-0 text-white text-[9px]" />
                  </button>
                </div>
              </div>

              {/* Color selection */}
              <div className="flex">
                <p className="w-[18%] text-[16px] font-semibold">Màu sắc</p>
                <div className="w-[82%] flex flex-wrap text-[14px] gap-4">
                  <button className="flex items-center justify-center gap-2 border border-[#ccc] rounded p-2">
                    <img
                      alt="Titan Đen color thumbnail"
                      className="rounded-[10px]"
                      loading="lazy"
                      src="https://cdn2.cellphones.com.vn/insecure/rs:fill:50:50/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-titan-den.png"
                      height="35"
                      width="35"
                    />
                    <div className="font-semibold text-gray-900">Titan Đen</div>
                  </button>
                  <button className="relative flex items-center justify-center gap-2 border border-2 rounded p-2 border-[#0096FF]">
                    <img
                      alt="Titan Sa Mạc color thumbnail"
                      className="rounded-[10px]"
                      loading="lazy"
                      src="https://cdn2.cellphones.com.vn/insecure/rs:fill:50:50/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-titan-sa-mac.png"
                      height="35"
                      width="35"
                    />
                    <div className="font-semibold">Titan Sa Mạc</div>
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[17px] border-l-transparent border-t-[17px] !border-t-[#0096FF] "></div>
                    <MdCheck className="absolute top-0 right-0 text-white text-[9px]" />

                  </button>
                  <button className="flex items-center justify-center gap-2 border border-[#ccc] rounded p-2">
                    <img
                      alt="Titan Trắng color thumbnail"
                      className="rounded-[10px]"
                      loading="lazy"
                      src="https://cdn2.cellphones.com.vn/insecure/rs:fill:50:50/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-titan-trang.png"
                      height="35"
                      width="35"
                    />
                    <div className="font-semibold text-gray-900">
                      Titan Trắng
                    </div>
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-[#ccc] rounded p-2">
                    <img
                      alt="Titan Tự Nhiên color thumbnail"
                      className="rounded-[10px]"
                      loading="lazy"
                      src="https://cdn2.cellphones.com.vn/insecure/rs:fill:50:50/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max-titan-tu-nhien.png"
                      height="35"
                      width="35"
                    />

                    <div className="font-semibold text-gray-900">
                      Titan Tự Nhiên
                    </div>
                  </button>
                </div>
              </div>

              {/* sellPrice box */}
              <div className="flex items-center gap-6 justify-start py-2">
                <div className="py-2 text-red-600 font-semibold text-4xl">
                  30.490.000₫
                </div>

                <div className="py-2 line-through text-gray-500 text-xl">
                  34.990.000₫
                </div>

                <div className="border border-[2px] border-red-600 rounded-[10px] text-sm py-1 px-4 text-red-600 font-semibold">
                  -5%
                </div>
              </div>

              <div className="flex gap-3 items-center text-[#27ae60]">
                <div className="relative w-[25px] h-[25px] rounded-full bg-[#27ae60] group flex items-center justify-center">
                  {/* Icon trung tâm */}
                  <div className="bg-white rounded-full w-[20px] h-[20px] z-[2] text-[11px] transition-all duration-150 ease-linear flex items-center justify-center">
                    <FaCheck className="" />
                  </div>

                  {/* Sóng ánh sáng lan tỏa */}
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#27ae60] z-[1]"
                    initial={{ scale: 0.95, opacity: 0.1 }}
                    animate={{
                      scale: [1, 1.2, 1.6],
                      opacity: [0.7, 0.4, 0.1],
                      boxShadow: [
                        "0 0 8px 4px rgba(46,204,113,0.3)",
                        "0 0 15px 8px rgba(46,204,113,0.25)",
                        "0 0 30px 15px rgba(46,204,113,0)",
                      ],
                    }}
                    transition={{
                      duration: 1.25,
                      repeat: Infinity,
                      repeatDelay: 0.1,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <h1 className="text-[16px]">Còn 96 sản phẩm</h1>
              </div>

              {/* buying options */}
              <div className="flex justify-between gap-4">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  border="1px solid #ccc"
                  borderRadius="10px"
                  px={1}
                  py={0.5}
                  width="25%"
                  marginY={"9px"}
                >
                  <IconButton size="small" className="!text-black" onClick={handleDecrease}>
                    <IoMdRemove />
                  </IconButton>
                  <Typography>{quantity}</Typography>
                  <IconButton size="small" className="!text-black" onClick={handleIncrease}>
                    <IoMdAdd />
                  </IconButton>
                </Box>

                <Button variant="contained" className="!bg-gray-200 !text-gray-900 !rounded-[10px] !my-[10px] !w-[70%]">THÊM VÀO GIỎ HÀNG</Button>

                <Button variant="outlined" className="!bg-white !text-gray-900 !border-[#ccc] !rounded-[10px] !my-[10px] !py-[18px] !w-[5%]">
                  <FaHeart className="text-[24px]" />
                </Button>
              </div>

              <Button variant="contained" className="!text-[20px] !bg-white !font-semibold !text-gray-900 !rounded-[10px] !px-6 !py-4 !my-[10px] !w-full ![box-shadow:rgba(60,64,67,0.3)_0px_1px_2px_0px,rgba(60,64,67,0.15)_0px_2px_6px_2px]">mua ngay</Button>

            </div>
          </div>

          <SpecsPopup openSpecsPopup={openSpecsPopup} setOpenSpecsPopup={setOpenSpecsPopup} />

          <div className="py-5 border-b-2 border-gray-200 flex flex-col gap-8">
            <h1 className="font-bold text-gray-900 text-lg text-[30px]">
              Sản phẩm tương tự
            </h1>
            <div className="relative">
              <Swiper
                loop={true}
                spaceBetween={34}
                slidesPerView={5}
                navigation={{
                  nextEl: ".relate-next",
                  prevEl: ".relate-prev",
                }}
                modules={[Navigation]}
                className="!pl-1 !pr-1 !py-2"
              >
                {products.map((product, index) => (
                  <SwiperSlide key={index}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* Nút trái */}
              <button className="relate-prev absolute left-[-4px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-white/70 top-1/2 w-10 h-20 rounded-r-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out hover:scale-110">
                <IoIosArrowBack />
              </button>

              {/* Nút phải */}
              <button className="relate-next absolute right-[-4px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-white/70 top-1/2 w-10 h-20 rounded-l-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out hover:scale-110">
                <IoIosArrowForward />
              </button>
            </div>
          </div>

          {/* đánh giá, commnet và thông số kỹ thuật*/}
          <div className="flex py-6">
            {/* đánh giá, commnet*/}
            <div className="w-full rounded-lg border border-gray-200 shadow-sm p-4">
              {/* Header Title */}
              <h2 className="font-semibold text-sm mb-4">
                Đánh giá &amp; nhận xét iPhone 16 Pro Max 256GB | Chính hãng VN/A
              </h2>

              <div className="flex flex-col md:flex-row md:space-x-8 border border-gray-200 rounded-md p-4 mb-6">
                {/* Left side: avgRating summary */}
                <div className="flex flex-col items-center md:items-start md:w-1/3 border-b md:border-b-0 md:border-r border-[#ccc] pb-4 md:pb-0 md:pr-6">
                  <div className="text-3xl font-semibold leading-none">
                    4.9
                    <span className="text-gray-500 text-xl">/5</span>
                  </div>
                  <div className="flex space-x-1 mt-1 text-yellow-400 text-lg">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                  <a
                    href="#"
                    className="mt-1 text-blue-700 text-sm font-semibold underline"
                  >
                    290 đánh giá
                  </a>
                </div>

                {/* Right side: avgRating bars */}
                <div className="flex-1 pt-4 md:pt-0">
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <span className="w-4 font-semibold">5</span>
                    <i className="fas fa-star text-yellow-400"></i>
                    <div className="flex-1 h-3 rounded-full bg-gray-300 overflow-hidden">
                      <div
                        className="h-3 bg-red-700 rounded-full"
                        style={{ width: "80%" }}
                      ></div>
                    </div>
                    <span className="w-20 text-right text-xs text-gray-600">
                      258 đánh giá
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <span className="w-4 font-semibold">4</span>
                    <i className="fas fa-star text-yellow-400"></i>
                    <div className="flex-1 h-3 rounded-full bg-gray-300 overflow-hidden">
                      <div
                        className="h-3 bg-red-700 rounded-full"
                        style={{ width: "20%" }}
                      ></div>
                    </div>
                    <span className="w-20 text-right text-xs text-gray-600">
                      32 đánh giá
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <span className="w-4 font-semibold">3</span>
                    <i className="fas fa-star text-yellow-400"></i>
                    <div className="flex-1 h-3 rounded-full bg-gray-300 overflow-hidden">
                      <div
                        className="h-3 bg-red-700 rounded-full"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                    <span className="w-20 text-right text-xs text-gray-600">
                      0 đánh giá
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <span className="w-4 font-semibold">2</span>
                    <i className="fas fa-star text-yellow-400"></i>
                    <div className="flex-1 h-3 rounded-full bg-gray-300 overflow-hidden">
                      <div
                        className="h-3 bg-red-700 rounded-full"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                    <span className="w-20 text-right text-xs text-gray-600">
                      0 đánh giá
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <span className="w-4 font-semibold">1</span>
                    <i className="fas fa-star text-yellow-400"></i>
                    <div className="flex-1 h-3 rounded-full bg-gray-300 overflow-hidden">
                      <div
                        className="h-3 bg-red-700 rounded-full"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                    <span className="w-20 text-right text-xs text-gray-600">
                      0 đánh giá
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default ProductPage;
