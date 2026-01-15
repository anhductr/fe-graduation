import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import Banner from "../components/common/Banner";
import CategoriesList from "../components/product/CategoriesList";
import ProductSection from "../components/product/ProductSection";
import RecommendProduct from "../components/product/RecommendProduct";
import FlashSaleProduct from "../components/product/FlashSaleProduct";
import { FaFire } from "react-icons/fa";
import { MdPhoneIphone } from "react-icons/md";
import { FaLaptop } from "react-icons/fa";
import { useEffect } from "react";

function Home() {
  useEffect(() => {
    // Nhảy ngay lên đầu trang
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen pb-10">
        <Banner />
        <div className="mx-auto px-1">
          <FlashSaleProduct />
        </div>
        
        <div className="mx-auto px-1">
          <RecommendProduct />
        </div>


        <div className="mx-auto px-1">
          <ProductSection
            tabs={[
              {
                title: "ĐIỆN THOẠI",
                keyword: "Điện thoại",
                brands: ["Apple", "Samsung", "Xiaomi", "OPPO", "TECNO", "HONOR", "Nubia", "Sony", "Nokia", "Infinix"]
              },
              {
                title: "MÁY TÍNH BẢNG",
                keyword: "Tablet",
                brands: ["iPad", "Samsung", "Xiaomi", "Lenovo", "OPPO", "Huawei"]
              }
            ]}
            icon={<MdPhoneIphone />}
          />

          <ProductSection
            tabs={[
              {
                title: "LAPTOP",
                keyword: "Laptop",
                brands: ["MacBook", "ASUS", "Lenovo", "MSI", "Acer", "HP", "Dell", "LG", "Gigabyte", "Masstel"]
              },
              {
                title: "MÀN HÌNH MÁY TÍNH",
                keyword: "Màn hình",
                brands: ["Samsung", "LG", "ASUS", "Dell", "ViewSonic", "AOC", "MSI", "Xiaomi"]
              },
              {
                title: "PC",
                keyword: "PC",
                brands: ["E-Power", "iMac", "ASUS", "Lenovo", "HP", "MSI"]
              },
              {
                title: "PHỤ KIỆN MÁY TÍNH",
                keyword: "Phụ kiện Laptop",
                brands: ["Chuột", "Bàn phím", "Balo", "Webcam", "USB", "Ổ cứng"]
              }
            ]}
            icon={<FaLaptop />}
          />
        </div>

        <CategoriesList />
      </div>
      <Footer />
    </>
  );
}
export default Home;
