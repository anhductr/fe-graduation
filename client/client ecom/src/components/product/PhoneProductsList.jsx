import { useContext, useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const PhoneProductsList = () => {
  const products = [
    {
      id: 1,
      discount: "4%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-16-pro-max.png",
      alt: "iPhone 16 Pro Max 256GB | Chính hãng VN/A",
      name: "iPhone 16 Pro Max 256GB",
      nameSlug: "iphone-16-pro-max-256gb",
      price: "30.490.000",
      oldPrice: "34.990.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      rating: 5,
    },
    {
      id: 2,
      discount: "18%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/6cb3261a-1bad-4d8f-c134-c79a95562e6d.jpg",
      alt: "Samsung Galaxy S25 Ultra 512GB silver smartphone with S Pen",
      name: "Samsung Galaxy S25 Ultra 512GB",
      price: "30.890.000",
      oldPrice: "37.490.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      rating: 5,
    },
    {
      id: 3,
      discount: "17%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/a94271fd-9a47-498b-01ed-06d880cd2015.jpg",
      alt: "TECNO CAMON 40 Pro 8GB 256GB white and blue smartphone front and back",
      name: "TECNO CAMON 40 Pro 8GB 256GB",
      price: "5.790.000",
      oldPrice: "6.990.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      rating: 5,
    },
    {
      id: 4,
      discount: "15%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/b9d765ec-448b-4567-e60a-b8faab27be47.jpg",
      alt: "TECNO CAMON 40 8GB 256GB black and silver smartphone front and back",
      name: "TECNO CAMON 40 8GB 256GB",
      price: "5.490.000",
      oldPrice: "6.490.000",
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      rating: 5,
    },
    {
      id: 5,
      discount: "13%",
      imgSrc:
        "https://storage.googleapis.com/a1aa/image/9d1de0bd-535a-4e49-f314-5c7000b5a6b9.jpg",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      price: "3.490.000",
      oldPrice: "3.990.000",
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      rating: 4.5,
    },
    {
      id: 6,
      discount: "13%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-a36.2.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      price: "3.490.000",
      oldPrice: "3.990.000",
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      rating: 4.5,
    },
    {
      id: 7,
      discount: "13%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-xiaomi-redmi-note-14_2__2.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      price: "3.490.000",
      oldPrice: "3.990.000",
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      rating: 4.5,
    },
  ];

  const brands = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "OPPO",
    "vivo",
    "realme",
    "ASUS",
    "TECNO",
    "Nokia",
    "Infinix",
    "Nothing",
    "Xem tất cả",
  ];

  const swiperRef = useRef(null);

  // Tự động lướt slide sau mỗi 4s
  useEffect(() => {
    const interval = setInterval(() => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.slideNext();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="py-4 px-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3 md:gap-0">
          <h2 className="font-semibold text-[27px]">ĐIỆN THOẠI</h2>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand, i) => (
              <button
                key={i}
                className="text-[13px] border border-[#ccc] rounded-lg px-2 py-2 leading-none hover:bg-gray-100"
                type="button"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
        <div className="relative px-1 py-2 border-l border-r border-gray-140">
          <Swiper
            ref={swiperRef}
            loop={true}
            spaceBetween={8}
            slidesPerView={5}
            navigation={{
              nextEl: ".phone-next",
              prevEl: ".phone-prev",
            }}
            modules={[Navigation]}
          >
            {products.map((product, index) => (
              <SwiperSlide key={index}>
                <Link to={`/${product.nameSlug}`}>
                  <ProductCard product={product} />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="absolute phone-prev left-[-4px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-black/50 top-1/2 w-10 h-20 rounded-r-full flex items-center justify-center shadow-md">
            <i className="fas fa-chevron-left" />
          </button>

          <button className="absolute phone-next right-[-4px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-black/50 top-1/2 w-10 h-20 rounded-l-full flex items-center justify-center shadow-md">
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </>
  );
};

export default PhoneProductsList;
