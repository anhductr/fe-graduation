import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Banner from "../components/Banner";
import BestSellerProductsList from "../components/BestSellerProductsList";
import PhoneProductsList from "../components/PhoneProductsList";
import CategoriesList from "../components/CategoriesList";
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
