import { useState, useEffect } from "react";

const products = [
  {
    discount: "4%",
    imgSrc: "https://storage.googleapis.com/a1aa/image/43192908-db04-4e3b-7bb9-2b7ad489df28.jpg",
    alt: "Samsung Galaxy A26 5G",
    title: "Samsung Galaxy A26 5G 8GB 128GB",
    price: "6.690.000",
    oldPrice: "6.990.000",
    desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
    rating: 5,
  },
  {
    discount: "18%",
    imgSrc: "https://storage.googleapis.com/a1aa/image/6cb3261a-1bad-4d8f-c134-c79a95562e6d.jpg",
    alt: "Samsung Galaxy S25 Ultra",
    title: "Samsung Galaxy S25 Ultra 512GB",
    price: "30.890.000",
    oldPrice: "37.490.000",
    desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
    rating: 5,
  },
  {
    discount: "17%",
    imgSrc: "https://storage.googleapis.com/a1aa/image/a94271fd-9a47-498b-01ed-06d880cd2015.jpg",
    alt: "TECNO CAMON 40 Pro",
    title: "TECNO CAMON 40 Pro 8GB 256GB",
    price: "5.790.000",
    oldPrice: "6.990.000",
    desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
    rating: 5,
  },
  {
    discount: "15%",
    imgSrc: "https://storage.googleapis.com/a1aa/image/b9d765ec-448b-4567-e60a-b8faab27be47.jpg",
    alt: "TECNO CAMON 40",
    title: "TECNO CAMON 40 8GB 256GB",
    price: "5.490.000",
    oldPrice: "6.490.000",
    desc: "Không phí chuyển đổi khi trả góp 0% qua thẻ tín dụng kỳ hạn 3-6...",
    rating: 5,
  },
  {
    discount: "13%",
    imgSrc: "https://storage.googleapis.com/a1aa/image/9d1de0bd-535a-4e49-f314-5c7000b5a6b9.jpg",
    alt: "realme C61",
    title: "realme C61 6GB 128GB",
    price: "3.490.000",
    oldPrice: "3.990.000",
    desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
    rating: 4.5,
  },
  {
    discount: "13%",
    imgSrc: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-samsung-galaxy-a36.2.png",
    alt: "realme C61",
    title: "realme C61 6GB 128GB",
    price: "3.490.000",
    oldPrice: "3.990.000",
    desc: "Trả góp 0% lãi suất, không trả trước, không phụ phí qua Shinha...",
    rating: 4.5,
  },
];

const getItemsPerPage = () => {
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 4;
};

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  const totalSlides = Math.ceil(products.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    window.addEventListener("resize", handleResize);

    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [itemsPerPage]);

  const startIndex = currentSlide * itemsPerPage;
  const visibleItems = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="relative w-full max-w-6xl mx-auto p-4">
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-0 -translate-y-1/2 z-20 text-gray-700 text-2xl bg-white/80 w-10 h-20 rounded-r-full flex items-center justify-center shadow-md"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500">
        {visibleItems.map((item, idx) => (
          <div
            key={idx}
            className="border rounded-lg shadow-sm p-2 bg-white hover:shadow-lg transition"
          >
            <img
              src={item.imgSrc}
              alt={item.alt}
              className="w-full h-40 object-contain mb-2"
            />
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-green-600 font-bold">₫ {item.price}</p>
            <p className="text-gray-500 line-through text-sm">
              ₫ {item.oldPrice}
            </p>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-0 -translate-y-1/2 z-20 text-gray-700 text-2xl bg-white/80 w-10 h-20 rounded-l-full flex items-center justify-center shadow-md"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Carousel;
