import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import Banner from "../components/common/Banner";
import CategoriesList from "../components/product/CategoriesList";
import ProductSection from "../components/product/ProductSection";
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
      <div className="bg-gray-50 min-h-screen pb-10">
        <Banner />
        <CategoriesList />

        <div className="max-w-7xl mx-auto px-1">
          <ProductSection
            title="SẢN PHẨM MỚI & NỔI BẬT"
            icon={<FaFire />}
            sortType="YEAR_DESC"
          />

          <ProductSection
            title="ĐIỆN THOẠI"
            icon={<MdPhoneIphone />}
            keyword="Điện thoại"
          />

          <ProductSection
            title="LAPTOP"
            icon={<FaLaptop />}
            keyword="Laptop"
          />
        </div>

        <div className="h-10"></div>
      </div>
      <Footer />
    </>
  );
}
export default Home;
