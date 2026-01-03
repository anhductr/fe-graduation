import { useContext, useState, useEffect, useRef } from "react";
// import { ProductContext } from "../context/ProductContext";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { searchProducts } from "../api, function/searchApi";

export default function BestSellerProductsList() {
  const phones_n_tablets = [
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
      sellPrice: 30890000,
      listPrice: 37490000,
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

  const laptops = [
    {
      discount: "4%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/m/image_1396_1.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook_11_1.png",
      alt: "Samsung Galaxy S25 Ultra 512GB silver smartphone with S Pen",
      name: "Samsung Galaxy S25 Ultra 512GB",
      sellPrice: 30890000,
      listPrice: 37490000,
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      avgRating: 5,
    },
    {
      discount: "17%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook_7_1.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_d_i_5_9.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_509_-_2024-07-31t162730.053.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_12__4_7.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_509_49_.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      sellPrice: 3490000,
      listPrice: 3990000,
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      avgRating: 4.5,
    },
  ];

  const furnitures = [
    {
      discount: "4%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/u/sung-massage-cam-tay-philips-fascial-gun-ppm7323.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/may-hut-bui-giuong-nem-deerma-cm800-1.png",
      alt: "Samsung Galaxy S25 Ultra 512GB silver smartphone with S Pen",
      name: "Samsung Galaxy S25 Ultra 512GB",
      sellPrice: 30890000,
      listPrice: 37490000,
      desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
      avgRating: 5,
    },
    {
      discount: "17%",
      imgSrc:
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/u/sung-massage-cam-tay-philips-fascial-gun-ppm7323.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/n/_/n_i_chi_n_kh_ng_d_u_gaabor_af65t-bk01a_6.5l.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/h/2/h2ofloss-hf-9p.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/q/u/quat-thap-hoi-nuoc-fujihome-ac-18le-ksp.png",
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
        "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/q/u/quat-khong-canh-tich-hop-loc-khong-khi-fujihome-bf308dc.png",
      alt: "realme C61 6GB 128GB green smartphone front",
      name: "realme C61 6GB 128GB",
      sellPrice: 3490000,
      listPrice: 3990000,
      desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
      avgRating: 4.5,
    },
  ];

  const swiperRef = useRef(null);

  const [toggleState, setToggleState] = useState(1);
  const toggleTab = (index) => {
    setToggleState(index);
  };
  return (
    <>
      <div
        className="w-full bg-white relative px-15"
      >
        <div className="flex flex-wrap gap-2 justify-between font-semibold text-[14px] py-5">
          <h1 className="text-[30px]">BÁN CHẠY NHẤT</h1>

          <div className="flex flex-wrap gap-5">
            <button
              className={`${toggleState === 1 ? "text-[#03A9F4]" : "text-black"}`}
              type="button"
              onClick={() => toggleTab(1)}
            >
              Điện thoại, Tablet
            </button>
            <button
              className={`${toggleState === 2 ? "text-[#03A9F4]" : "text-black"}`}
              type="button"
              onClick={() => toggleTab(2)}
            >
              Phụ kiện, PC
            </button>
            <button
              className={`${toggleState === 3 ? "text-[#03A9F4]" : "text-black"}`}
              type="button"
              onClick={() => toggleTab(3)}
            >
              Gia dụng, Điện máy
            </button>
          </div>
        </div>


        <div className="relative px-0">
          <Swiper
            ref={swiperRef}
            // centeredSlides={true}
            loop={true}
            spaceBetween={34}
            slidesPerView={5}
            navigation={{
              nextEl: ".dis-next",
              prevEl: ".dis-prev",
            }}
            modules={[Navigation]}
            className="!pl-1 !pr-1 !py-2"
          >
            {toggleState === 1 &&
              phones_n_tablets.map((product, index) => (
                <SwiperSlide key={index}>
                  <Link to={`/${product.nameSlug}`}>
                    <ProductCard product={product} />
                  </Link>
                </SwiperSlide>
              ))}

            {toggleState === 2 &&
              laptops.map((product, index) => (
                <SwiperSlide key={index}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}

            {toggleState === 3 &&
              furnitures.map((product, index) => (
                <SwiperSlide key={index}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
          </Swiper>

          <button className="dis-prev absolute left-[-2px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-black/32 top-1/2 w-[36px] h-19 rounded-r-full flex items-center justify-center shadow transition-transform duration-300 ease-in-out hover:scale-110">
            <IoIosArrowBack className="text-white" />
          </button>

          <button className="dis-next absolute right-[-2px] -translate-y-1/2 z-10 text-gray-700 text-3xl transition bg-black/32 top-1/2 w-[36px] h-19 rounded-l-full flex items-center justify-center shadow transition-transform duration-300 ease-in-out hover:scale-110">
            <IoIosArrowForward className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
};

