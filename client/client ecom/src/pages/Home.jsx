import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import Banner from "../components/common/Banner";
import BestSellerProductsList from "../components/product/BestSellerProductsList";
import PhoneProductsList from "../components/product/PhoneProductsList";
import CategoriesList from "../components/product/CategoriesList";
import { useEffect, useRef, useState } from "react";

function Home() {
  useEffect(() => {
    // Nhảy ngay lên đầu trang
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar></Navbar>
      {/* <Banner></Banner> */}
      <CategoriesList></CategoriesList>
      <BestSellerProductsList></BestSellerProductsList>
      <Footer></Footer>
    </>
  );
}
export default Home;
