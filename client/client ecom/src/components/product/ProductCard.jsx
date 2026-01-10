import { useContext, useState, useEffect, useRef } from "react";
import Card from '@mui/material/Card';
import { TiStar } from "react-icons/ti";
import { BiSolidBarChartAlt2 } from "react-icons/bi";
import { motion } from "framer-motion";
import { CiCircleCheck } from "react-icons/ci";
import { MdOutlineShoppingCart } from "react-icons/md";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { useCart } from "../../context/CartContext";
import { Snackbar, Alert } from "@mui/material";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleAddToCart = async () => {
    try {
      await addToCart(product.sku, 1);
      setSnackbar({ open: true, message: "Đã thêm vào giỏ hàng!", severity: "success" });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: "Thêm vào giỏ thất bại.", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  function StarRating({ rating }) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <TiStar key={"full" + i} className="fas fa-star text-[22px]"></TiStar>
        ))}
        {halfStar && <i className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <TiStar key={"empty" + i} className="far fa-star text-[22px]"></TiStar>
        ))}
      </div>
    );
  }

  // Tùy chỉnh tooltip giống HyperOS / iOS
  const HyperTooltip = styled(({ className, ...props }) => (
    <Tooltip
      {...props}
      arrow
      classes={{ popper: className }}
      PopperProps={{
        // [skidding, distance] – đây là chìa khóa!
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -6],  // -8 = dịch lên sát nút hơn (có thể thử -6, -10 tùy ý)
            },
          },
        ],
      }}
    />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: 'rgba(30, 30, 30, 0.95)',
      color: '#fff',
      fontSize: 10,
      fontWeight: 500,
      padding: '6px 12px',
      borderRadius: 8,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: 'rgba(30, 30, 30, 0.95)',
    },
  }));

  return (
    <div className="relative group rounded-xl bg-white [box-shadow:rgba(60,64,67,0.15)_0px_1px_2px_0px,rgba(60,64,67,0.1)_0px_2px_6px_2px] pt-4 min-w-[255px] max-w-[255px] pb-6 relative flex flex-col justify-between transition-all duration-300 hover:[box-shadow:rgba(60,64,67,0.3)_0px_2px_8px_2px,rgba(60,64,67,0.2)_0px_4px_12px_4px] hover:-translate-y-1">

      {/* ICONS FLOATING */}
      <div className="
            absolute top-[155px] left-1/2 -translate-x-1/2 
            flex items-center justify-center gap-4
            opacity-0 scale-50 
            group-hover:opacity-100 group-hover:scale-100
            transition-all duration-600 z-10
          "
      >
        <HyperTooltip
          title="Thêm vào giỏ"
          placement="top"
          arrow
          disableInteractive={true}
        >
          <button
            onClick={handleAddToCart}
            className="bg-white hover:bg-[#03A9F4] hover:text-white rounded-full p-3 shadow-md"
          >
            <MdOutlineShoppingCart size={21} />
          </button>
        </HyperTooltip>

        <HyperTooltip
          title="So sánh"
          placement="top"
          arrow
          disableInteractive={true}
        >
          <button className="bg-white hover:bg-[#03A9F4] hover:text-white rounded-full p-3 shadow-md">
            <BiSolidBarChartAlt2 size={21} />
          </button>
        </HyperTooltip>
      </div>


      {/* IMAGE */}
      <div className="flex justify-center px-4">
        <img
          src={product.thumbnailUrl}
          alt={product.alt}
          className="rounded-t-lg object-contain w-full h-[180px] transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <div className="text-[14px] text-gray-800 h-[38px] overflow-hidden">
          {product.name}
        </div>

        <div className="flex items-center text-[12px] text-gray-500 select-none">
          {/* <StarRating rating={product.avgRating} /> */}
        </div>

        <div className="text-[14px] font-bold text-[#d60000]">
          {/* giá sell */}
          {/* {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(product.price)} */}
          {/* giá thật */}
          {/* <span className="line-through text-gray-400 ml-1">
            {product.listPrice.toLocaleString().replace(/,/g, '.')}đ
          </span> */}
          <span className="text-gray-400 ml-1">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price)}
          </span>
        </div>
      </div>

      {/* EXTRA INFO (Hiện khi hover) */}
      <div className="absolute bottom-[0px] mx-[1px] bg-white flex gap-2 px-4 text-green-600 mb-2 max-h-0 opacity-0 transition-all duration-600 ease-out group-hover:max-h-10 group-hover:opacity-100">
        {/* Icon tích có hiệu ứng sóng */}
        <div className="relative w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">

          {/* Icon check — nằm trên cùng */}
          <CiCircleCheck className="absolute z-20 text-[18px] text-[#27ae60]" />

          {/* Lớp nền nhỏ để che animation xuyên qua icon */}
          <div className="
            absolute z-10 
            w-[14px] h-[14px] 
            rounded-full 
            bg-white 
          "
          ></div>

          {/* Vòng animation */}
          <motion.span
            className="absolute inset-0 rounded-full bg-[#27ae60] z-0"
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

        <span className="text-[13px] leading-5">Còn 96 sản phẩm</span>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductCard;