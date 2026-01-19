import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import Banner from "../components/common/Banner";
import CategoriesList from "../components/product/CategoriesList";
import ProductSection from "../components/product/ProductSection";
import RecommendProduct from "../components/product/RecommendProduct";
import FlashSaleProduct from "../components/product/FlashSaleProduct";
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
              },
              {
                title: "MÁY TÍNH BẢNG",
                keyword: "Máy tính bảng",
              }
            ]}
          />

          <ProductSection
            tabs={[
              {
                title: "LAPTOP",
                keyword: "Laptop",
              },
              {
                title: "MÀN HÌNH RỜI",
                keyword: "Màn hình rời",
              },
              {
                title: "PC",
                keyword: "PC",
              },
            ]}
          />

          <ProductSection
            tabs={[
              {
                title: "LOA",
                keyword: "Loa",
              },
              {
                title: "TAI NGHE",
                keyword: "Tai nghe",
              },
              {
                title: "CHUỘT",
                keyword: "Chuột",
              },
              {
                title: "BÀN PHÍM",
                keyword: "Bàn phím",
              },
            ]}
          />
        </div>

        <CategoriesList />
      </div>
      <Footer />
    </>
  );
}
export default Home;
