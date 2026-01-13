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
import { FaShoppingCart } from "react-icons/fa";
import { Box, IconButton, Typography, Dialog, DialogContent, DialogActions, DialogTitle } from "@mui/material";
import CommentSection from "../components/product/CommentSection";
import RatingSection from "../components/product/RatingSection";
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
import { useLocation } from "react-router-dom";
import { useProductDetail, productDetailOptions } from "../services/productApi";
import { useProductAutocomplete } from "../services/productApi";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { cartApi } from "../services/cartApi";
import { toast } from "react-toastify"; // Assuming toast is available or use simple verify
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductPage = () => {
  // const {category, name, productId} = useParams();
  useEffect(() => {
    // Nhảy ngay lên đầu trang
    window.scrollTo(0, 0);
  }, []);

  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [productFromDBState, setProductFromDBState] = useState(null);
  const [clickedIndex, setClickedIndex] = useState(0);
  const [showCartSuccessModal, setShowCartSuccessModal] = useState(false);
  const navigate = useNavigate();
  const { refetchCart } = useCart();


  ////////////////////////////////// xử lý tìm kiếm ////////////////////////////////// 
  const getSearchKeyword = (productName) => {
    if (!productName) return "";

    // Tách và loại bỏ phần dung lượng GB ở cuối
    return productName
      .replace(/\s*\d+\s*GB$/i, "")          // bỏ " 256GB", "512GB",...
      .replace(/\s*\d+\s*TB$/i, "")          // bỏ " 1TB" nếu có
      .replace(/\s*\d+\s*GB\s*/i, " ")       // trường hợp GB ở giữa (ít xảy ra)
      .trim();
  };

  const { state } = useLocation();
  const productIdFromState = state?.productId;
  const productNameFromState = getSearchKeyword(state?.productName);

  const { data: suggestions = [], isLoading: isSuggestLoading } = useProductAutocomplete(productNameFromState);
  useEffect(() => {
    if (productNameFromState) {
      console.log("Tìm kiếm autocomplete với từ khóa:", productNameFromState);
      console.log("Kết quả gợi ý:", suggestions);
    }
  }, [productNameFromState, suggestions]);

  const filteredProductIds = useMemo(() => {
    if (!suggestions?.length || !productNameFromState) return [];

    // Chuẩn hóa keyword để so sánh (không phân biệt hoa thường, loại bỏ khoảng trắng thừa)
    const normalizedKeyword = productNameFromState
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    return suggestions
      .filter(item => item.autoCompletedType === 'PRODUCT')
      .filter(item => {
        const valueLower = item.value.toLowerCase().trim();

        // Regex logic:
        // ^keyword : Bắt đầu bằng keyword
        // \s+      : Có khoảng trắng
        // \d+      : Số dung lượng (e.g. 128, 256)
        // \s*      : Có thể có khoảng trắng
        // (gb|tb)$ : Kết thúc bằng GB hoặc TB
        // Flag 'i' : Case insensitive (không phân biệt hoa thường)

        // Ví dụ: keyword = "iphone 17 pro"
        // DONE: "iphone 17 pro 128gb" -> MARK MATCH
        // FAIL: "iphone 17 pro max 128gb" -> NO MATCH (vì sau 'pro' là ' max' chứ không phải số dung lượng ngay)

        const regex = new RegExp(`^${normalizedKeyword}\\s+\\d+\\s*(gb|tb)$`, 'i');
        return regex.test(valueLower);
      })
      .map(item => item.id);
  }, [suggestions, productNameFromState]);

  useEffect(() => {
    if (filteredProductIds.length > 0) {
      console.log("Các product ID phù hợp với keyword:", productNameFromState);
      console.log(filteredProductIds);
    }
  }, [filteredProductIds]);

  const productDetailQueries = useQueries({
    queries: filteredProductIds.map(id => ({
      ...productDetailOptions(id),           // spread toàn bộ config từ options helper
      queryKey: ["productDetail", id],   // đảm bảo key riêng biệt
      enabled: !!id && filteredProductIds.length > 0,
    })),
  });

  // Lấy danh sách sản phẩm đã load thành công
  const similarProducts = productDetailQueries
    .filter(q => q.isSuccess && q.data)
    .map(q => q.data);

  // Debug (có thể xóa sau khi test xong)
  useEffect(() => {
    if (similarProducts.length > 0) {
      console.log("Sản phẩm tương tự đã load xong:", similarProducts);
    }
  }, [similarProducts]);


  const openProductDetails = (product) => {
    setProductFromDBState(product);
    setIsViewDetailsOpen(true);
  };

  const [openSpecsPopup, setOpenSpecsPopup] = useState(false);

  const location = useLocation();
  const productName = location.state?.productName;


  // 1. Fetch data
  const { data: productData, isLoading, isError } = useProductDetail(productIdFromState);

  // --- LOGIC XỬ LÝ DUNG LƯỢNG ĐỘNG (DYNAMIC STORAGE) ---

  // Helper: Trích xuất số GB/TB từ tên hoặc specs để sắp xếp
  const getCapacityValue = (product) => {
    if (!product) return 0;

    // 1. Prioritize explicit Storage keys
    const explicitRom = product.specifications?.find(s => {
      const key = (s.name || s.key || '').toLowerCase();
      const group = (s.group || s.attributeGroup || '').toLowerCase();

      // Exclude RAM/Battery groups just in case
      if (group.includes('ram') || group.includes('pin') || group.includes('battery')) return false;

      return ['rom', 'bộ nhớ trong'].includes(key);
    });

    if (explicitRom) {
      const val = (explicitRom.value || '').toLowerCase();
      if (val.includes('tb')) return parseFloat(val) * 1024;
      if (val.includes('gb')) return parseFloat(val);
    }

    // 2. Be careful with generic "Dung lượng" key (often used for RAM or Battery too)
    const genericSpec = product.specifications?.find(s => {
      const key = (s.name || s.key || '').toLowerCase();
      return key === 'dung lượng';
    });

    if (genericSpec) {
      const val = (genericSpec.value || '').toLowerCase();
      let num = 0;
      if (val.includes('tb')) num = parseFloat(val) * 1024;
      else if (val.includes('gb')) num = parseFloat(val);

      // Heuristic: RAM usually <= 32GB, Storage usually >= 64GB (for modern phones)
      // If it's small, it's likely RAM -> Ignore
      if (num > 32) return num;
    }

    // 3. Fallback: Parse from product name (Highest reliability for variants)
    // "iPhone 16 Pro Max 256GB"
    const match = product.name?.match(/(\d+)\s*(gb|tb)/i);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      return unit === 'tb' ? num * 1024 : num;
    }

    return 0; // Not found
  };

  // State: Sản phẩm đang được hiển thị (có thể là productData ban đầu HOẶC một trong các similarProducts)
  const [displayedProduct, setDisplayedProduct] = useState(null);

  // List tất cả các phiên bản (Bản thân nó + Các bản tương tự) -> Sắp xếp tăng dần theo dung lượng
  const allVersions = useMemo(() => {
    if (!productData) return [];
    // Gộp bản thân nó và các bản tìm được
    // Cần lọc trùng id để chắc chắn
    const uniqueMap = new Map();
    uniqueMap.set(productData.id, productData);

    similarProducts.forEach(p => {
      if (p && p.id) uniqueMap.set(p.id, p);
    });

    const list = Array.from(uniqueMap.values());
    // Sort theo dung lượng
    return list.sort((a, b) => getCapacityValue(a) - getCapacityValue(b));
  }, [productData, similarProducts]);

  // Effect: Khi load xong productData thì set mặc định 
  useEffect(() => {
    if (productData && !displayedProduct) {
      setDisplayedProduct(productData);
    }
  }, [productData]);

  // 2. State for selected color/variant (Của sản phẩm ĐANG HIỂN THỊ)
  const [selectedVariant, setSelectedVariant] = useState(null);

  // 3. Effect set default variant khi displayedProduct thay đổi
  useEffect(() => {
    if (displayedProduct && displayedProduct.variants?.length > 0) {
      // Nếu trước đó đang chọn màu, thử tìm màu tương ứng ở bản mới (Logic giữ màu)
      if (selectedVariant) {
        const sameColorVariant = displayedProduct.variants.find(v =>
          // Logic so sánh màu: theo tên màu hoặc thumbnail giống nhau? 
          // Thường là theo tên màu (color) hoặc variantName
          (v.color && v.color === selectedVariant.color)
        );
        if (sameColorVariant) {
          setSelectedVariant(sameColorVariant);
          return;
        }
      }

      // Fallback: Chọn cái đầu tiên nếu không tìm thấy màu tương ứng
      setSelectedVariant(displayedProduct.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [displayedProduct]); // Chạy lại khi đổi sản phẩm hiển thị


  // 4. Map API data to UI structure (Safe) -> Dùng displayedProduct thay vì productData
  const activeProductData = displayedProduct || productData; // Fallback an toàn

  const rawImages = activeProductData?.imageList?.length > 0
    ? activeProductData.imageList.map(url => ({ src: url, alt: activeProductData.name }))
    : activeProductData?.variants?.map(v => ({ src: v.thumbnail, alt: v.variantName })) || [];

  const displayImages = [
    {}, // Index 0: Feature/Highlight
    {}, // Index 1: Video
    ...rawImages
  ];

  const currentProduct = {
    ...activeProductData,
    name: activeProductData?.name,
    images: displayImages,
    // Use hardcoded video if API doesn't have it (API response example has no video field)
    video: "https://www.youtube.com/watch?v=bPkenYE4qzw",
    specifications: activeProductData?.specifications || []
  };

  console.log("ProductPage DEBUG - currentProduct.specifications:", currentProduct.specifications);

  // Derived price/discount from selected variant
  const sellPrice = selectedVariant?.sellPrice || 0;
  const listPrice = selectedVariant?.price || 0;
  const discountPercentage = listPrice > sellPrice
    ? Math.round(((listPrice - sellPrice) / listPrice) * 100)
    : 0;

  // Re-declare empty products array or keep it if needed for compatibility
  const products = [];

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
  };

  const nextSlide = () => {
    setCurrentImg((prev) => Math.min(prev + 1, currentProduct.images.length - 1));
  };

  // cho phần zoom 2
  const lensSize = 150;
  const zoomWidth = 570;
  const zoomHeight = 570;
  const scale = 3.8; // mức phóng — bạn đang dùng *5

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

  const handleAddToCart = async () => {
    try {
      // User requested: "thêm sku của variant currentProduct"
      // currentProduct here is the displayed product (specific storage). 
      // selectedVariant is the specific color variant of that product.
      // We prioritize selectedVariant.sku because that's the actual buyable item (SKU usually ties to physical item)

      console.log("=== ADD TO CART DEBUG ===");
      console.log("selectedVariant:", selectedVariant);
      console.log("currentProduct:", currentProduct);
      console.log("quantity:", quantity);

      const targetSku = selectedVariant?.sku || currentProduct?.sku;

      if (!targetSku) {
        alert("Lỗi: Không tìm thấy SKU sản phẩm!");
        return;
      }

      const payload = {
        sku: targetSku,
        quantity: quantity || 1
      };

      console.log("✅ Final payload to send:", payload);
      console.log("Payload structure matches CartItemRequest:", {
        sku: typeof payload.sku === 'string',
        quantity: typeof payload.quantity === 'number'
      });

      await cartApi.addToCart(payload);
      console.log("✅ Cart API call successful!");
      await refetchCart(); // Immediately refresh cart data to update icon
      setShowCartSuccessModal(true); // Show modal instead of alert
    } catch (error) {
      console.error("❌ Add to cart error:", error);
      console.error("Error response:", error.response?.data);
      alert("Thêm vào giỏ hàng thất bại: " + (error.response?.data?.message || error.message));
    }
  };

  const handleViewCart = async () => {
    setShowCartSuccessModal(false);
    navigate('/cart'); // Navigate to cart page
  };

  // Handle loading/error (Simple fallback for now)
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!productData) return <div className="min-h-screen flex items-center justify-center">Error loading product</div>;

  return (
    <>
      <SpecsPopup
        openSpecsPopup={openSpecsPopup}
        setOpenSpecsPopup={setOpenSpecsPopup}
        specifications={currentProduct.specifications}
      />
      <ProductViewDetails
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        product={productFromDBState}
        clickedIndex={clickedIndex}
      />

      <Dialog
        open={showCartSuccessModal}
        onClose={() => setShowCartSuccessModal(false)}
        maxWidth="xs"
        PaperProps={{
          style: {
            backgroundColor: '#383e42', // Dark background color from image
            color: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            minWidth: '400px'
          },
        }}
      >
        <DialogContent className="flex flex-col items-center justify-center p-0 overflow-hidden">
          <div className="mb-4">
            {/* Green shopping cart icon */}
            <FaShoppingCart className="text-[#00c853] text-[50px]" />
            <div className="text-[#00c853] absolute ml-6 mt-[-15px] bg-white rounded-full border border-[#383e42]">
              <FaCheck className="text-[12px] m-1" strokeWidth="2" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-6">
            Sản phẩm đã được thêm vào giỏ hàng
          </h2>

          <Button
            onClick={handleViewCart}
            variant="contained"
            className="!bg-white !text-gray-800 !px-8 !py-2 !rounded-full !font-medium !normal-case hover:!bg-gray-100"
          >
            Xem giỏ hàng
          </Button>
        </DialogContent>
      </Dialog>
      <Navbar />
      <div className="px-15 bg-white text-gray-900 py-2">
        {/* Breadcrumb */}
        <Breadcrumbs pagename="product" product={currentProduct} />

        <div className="py-6">
          <div className="relative flex gap-10 border-b-2 pb-4 border-gray-200">
            {/* Left side: Image and features */}
            <div className="w-6/11 rounded-lg overflow-hidden relative ">
              <div className="relative group">
                <div
                  onClick={() => {
                    // Pass clean images (rawImages) to popup to avoid empty slots for Feature/Video
                    const popupProduct = { ...currentProduct, images: rawImages };
                    openProductDetails(popupProduct);

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
                    {currentProduct.images.map((img, index) => (
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
                            <div className="flex w-full h-full items-center">
                              <div className="w-1/2 h-full flex items-center justify-center p-4">
                                <img
                                  alt="Feature"
                                  className="max-w-full max-h-full object-contain rounded-[10px]"
                                  loading="lazy"
                                  src={selectedVariant?.thumbnail || "https://via.placeholder.com/300"}
                                />
                              </div>
                              <style>{`
                                .no-scrollbar::-webkit-scrollbar {
                                  display: none;
                                }
                                .no-scrollbar {
                                  -ms-overflow-style: none; /* IE and Edge */
                                  scrollbar-width: none;  /* Firefox */
                                }
                              `}</style>
                              <div className="w-1/2 h-full flex justify-center items-center">
                                <div className="h-[370px] flex flex-col justify-center items-center text-white p-6">
                                  <h2 className="font-bold mb-3 text-lg shrink-0">
                                    TÍNH NĂNG NỔI BẬT
                                  </h2>
                                  <div className="w-full overflow-y-auto no-scrollbar flex-1">
                                    <div
                                      className="text-[13px] space-y-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1 leading-relaxed w-full text-left"
                                      dangerouslySetInnerHTML={{ __html: currentProduct.description }}
                                    />
                                  </div>
                                </div>
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
                                url={currentProduct.video}
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

                {currentImg !== currentProduct.images.length - 1 && (
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
                  {currentProduct.images.map((img, index) => (
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
                {currentImg !== currentProduct.images.length - 1 && (
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
                  {currentProduct.name}
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
                <span className="text-[#0096FF] text-[16px]">289 đánh giá</span>
                <span className="text-[#0096FF] text-[16px]" onClick={() => setOpenSpecsPopup(true)}>Thông số kĩ thuật</span>
              </div>

              {/* Storage options */}
              <div className="flex">
                <p className="w-[18%] text-[16px] font-semibold">Dung lượng</p>
                <div className="w-[82%] flex gap-4 text-center text-[14px] text-gray-700 font-semibold flex-wrap">
                  {allVersions.map((version) => {
                    const capacity = getCapacityValue(version);
                    const label = capacity >= 1024
                      ? `${capacity / 1024} TB`
                      : `${capacity} GB`;

                    const isActive = version.id === currentProduct.id;

                    return (
                      <button
                        key={version.id}
                        onClick={() => setDisplayedProduct(version)}
                        className={`relative border rounded p-2 min-w-[30px] ${isActive
                          ? "border-[#0096FF] border-2"
                          : "border-[#ccc] hover:border-gray-400"
                          }`}
                      >
                        <div className="">{label}</div>

                        {isActive && (
                          <>
                            <div className="absolute top-0 right-0 w-0 h-0 border-l-[17px] border-t-[17px] border-l-transparent !border-t-[#0096FF] "></div>
                            <MdCheck className="absolute top-0 right-0 text-white text-[9px]" />
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color selection */}
              <div className="flex">
                <p className="w-[18%] text-[16px] font-semibold">Màu sắc</p>
                <div className="w-[82%] flex flex-wrap text-[14px] gap-4">
                  {currentProduct.variants?.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`relative flex items-center justify-center gap-2 border rounded p-2 ${selectedVariant?.id === variant.id
                        ? "border-[#0096FF] border-2"
                        : "border-[#ccc]"
                        }`}
                    >
                      <img
                        alt={variant.variantName}
                        className="rounded-[10px]"
                        loading="lazy"
                        src={variant.thumbnail}
                        height="35"
                        width="35"
                      />
                      <div className="font-semibold text-gray-900">{variant.color}</div>

                      {selectedVariant?.id === variant.id && (
                        <>
                          <div className="absolute top-0 right-0 w-0 h-0 border-l-[17px] border-l-transparent border-t-[17px] !border-t-[#0096FF] "></div>
                          <MdCheck className="absolute top-0 right-0 text-white text-[9px]" />
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* sellPrice box */}
              <div className="flex items-center gap-6 justify-start py-2">
                <div className="py-2 text-red-600 font-semibold text-4xl">
                  {sellPrice.toLocaleString('vi-VN')}₫
                </div>

                <div className="py-2 line-through text-gray-500 text-xl">
                  {listPrice.toLocaleString('vi-VN')}₫
                </div>

                {discountPercentage !== 0 && (
                  <div className="border border-[2px] border-red-600 rounded-[10px] text-sm py-1 px-4 text-red-600 font-semibold">
                    -{discountPercentage}
                  </div>
                )}
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
                {/* <Box
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
                </Box> */}

                <Button
                  onClick={handleAddToCart}
                  variant="contained"
                  className="!bg-gray-200 !text-gray-900 !rounded-[10px] !my-[10px] !w-[20%] flex items-center justify-center gap-2"
                >
                  <FaShoppingCart className="text-[22px]" />
                </Button>


                {/* <Button variant="outlined" className="!bg-white !text-gray-900 !border-[#ccc] !rounded-[10px] !my-[10px] !py-[18px] !w-[5%]">
                  <FaHeart className="text-[24px]" />
                </Button> */}
                <Button variant="contained" className="!text-[20px] !bg-white !font-semibold !text-gray-900 !rounded-[10px] !px-6 !py-4 !my-[10px] !w-full ![box-shadow:rgba(60,64,67,0.3)_0px_1px_2px_0px,rgba(60,64,67,0.15)_0px_2px_6px_2px]">mua ngay</Button>
              </div>


            </div>
          </div>



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
            <div className="w-full rounded-lg border border-gray-200 shadow-sm p-4">
              <h2 className="font-semibold text-sm mb-4">
                Đánh giá &amp; nhận xét {currentProduct.name}
              </h2>
              <RatingSection productId={currentProduct.id} productName={currentProduct.name} />
              <div className="border-t border-gray-200 my-6"></div>
              {/* Comment Section */}
              <CommentSection productId={currentProduct.id} />
            </div>
          </div>
        </div>
      </div >
      <Footer />
    </>
  );
};
export default ProductPage;
