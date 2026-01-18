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
                keyword: "Tablet",
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
                title: "MÀN HÌNH MÁY TÍNH",
                keyword: "Màn hình",
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
                title: "Loa",
                keyword: "Loa",
              },
              {
                title: "Tai nghe",
                keyword: "Tai nghe",
              },
              {
                title: "Chuột",
                keyword: "Chuột",
              },
              {
                title: "Bàn phím",
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
