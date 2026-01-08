import React, { useContext, useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { MdClose } from "react-icons/md";


const ProductViewDetails = ({ clickedIndex, isOpen, onClose, product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null); // Reference to control Swiper instance

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  // Sync Swiper with currentImg
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(currentIndex); // Move Swiper to currentIndex index
    }
  }, [currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    console.log("prev: ", currentIndex);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, product.images.length - 1));
    console.log("next: ", currentIndex);
  };

  const handleSlideChange = (swiper) => {
    setCurrentIndex(swiper.realIndex); // Update currentImg when Swiper changes
  };

  //zoom
  const [isPanEnabled, setIsPanEnabled] = useState(false);

  const [tab, setTab] = useState("image-product");

  if (!isOpen) return null;

  return (
    <div className="sticky inset-0 z-50 relative mx-auto py-2 bg-white flex flex-col justify-start h-screen">
      {/* Header */}
      <div className="flex items-center justify-between my-[0px] px-4">
        <div className="font-semibold text-xl leading-5">iPhone 16 Pro Max</div>
        <div className="flex space-x-4 text-gray-600 text-xl">
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus:outline-none"
          >
            <MdClose className="text-[24px] transition-transform duration-300 ease-in-out hover:scale-110"/> 
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`${tab === "image-product" ? "" : "flex flex-col gap-14"}`}>
        <nav
          className={`flex justify-center space-x-10 border-b border-gray-300 text-xs sm:text-sm`}
        >
          <button className="text-gray-500 hover:text-gray-700 py-2">
            Nổi bật
          </button>
          <button
            onClick={() => setTab("video-product")}
            className={`${tab === "video-product"
                ? "text-[#0096FF] border-b-2 border-[#0096FF]"
                : "text-gray-500"
              } font-medium py-2 hover:text-[#0096FF] hover:border-b-2 hover:border-[#0096FF]`}
          >
            Video
          </button>
          <button
            onClick={() => setTab("image-product")}
            className={`${tab === "image-product"
                ? "text-[#0096FF] border-b-2 border-[#0096FF]"
                : "text-gray-500"
              } font-medium py-2 hover:text-[#0096FF] hover:border-b-2 hover:border-[#0096FF]`}
          >
            Ảnh sản phẩm
          </button>
        </nav>

        {tab === "image-product" && (
          <div className="h-screen">
            <div className="flex justify-center">
              <div className="relative w-full h-full">
                <Swiper
                  initialSlide={clickedIndex - 2}
                  loop={false}
                  spaceBetween={0}
                  slidesPerView={1}
                  modules={[Navigation]}
                  onSlideChange={handleSlideChange} // Sync Swiper changes with currentImg
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper; // Store Swiper instance
                  }}
                  allowTouchMove={false}
                >
                  {product.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div
                        className={`flex items-center justify-center ${isPanEnabled ? "cursor-move" : "cursor-pointer"
                          }`}
                      >
                        <TransformWrapper
                          doubleClick={{
                            disabled: false,
                            mode: "toggle",
                            step: 1,
                          }}
                          centerOnInit
                          centerZoomedOut
                          wheel={{ disabled: false }}
                          panning={{ disabled: !isPanEnabled }}
                          onZoomStop={({ state }) => {
                            setIsPanEnabled(state.scale > 2);
                          }}
                          limitToBounds={true}
                        >
                          <TransformComponent>
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="mx-auto object-cover w-[500px] h-[500px]"
                              draggable={false}
                            />
                          </TransformComponent>
                        </TransformWrapper>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {currentIndex !== 0 && (
                  <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-[400px] -translate-y-1/2 z-10 text-white text-3xl transition bg-black/50 w-10 h-20 rounded-r-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out hover:scale-110"
                  >
                    <IoIosArrowBack/>
                  </button>
                )}

                {currentIndex !== product.images.length - 1 && (
                  <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-[400px] -translate-y-1/2 z-10 text-white text-3xl transition bg-black/50 w-10 h-20 rounded-l-full flex items-center justify-center shadow-md transition-transform duration-300 ease-in-out hover:scale-110"
                  >
                    <IoIosArrowForward/>
                  </button>
                )}
              </div>
            </div>

            <div className="text-center w-[75px] rounded-full mx-auto border border-gray-400 text-xs text-gray-500 my-[11px]">
              Hình {currentIndex + 1}/{product.images.length}
            </div>

            {/* thumbnails */}
            <div className="w-[1200px] h-[90px] mx-auto flex items-center justify-center space-x-4 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  aria-label={`Thumbnail ${index + 1}`}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex justify-center rounded-md border-2 p-[2px] ${index === currentIndex
                      ? "border-gray-600"
                      : "opacity-60 border-transparent"
                    }`}
                >
                  <img
                    draggable="false"
                    src={img.src}
                    alt={img.alt}
                    className="object-cover w-[70px] h-[70px]"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === "video-product" && (
          <div className="flex h-[500px] items-center justify-center">
            <ReactPlayer
              controls
              volume={1}
              muted
              height="500px"
              width="800px"
              url={product.video}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductViewDetails;
