import ProductView from "../components/ProductView";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ProductViewDetails from "../components/ProductViewDetails";

const ProductPage = () => {
  // const {category, name, productId} = useParams();
   useEffect(() => {
    // Nhảy ngay lên đầu trang
    window.scrollTo(0, 0);
  }, []);

  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [productFromDB, setProductFromDB] = useState(null);
  const [clickedIndex, setClickedIndex] = useState(0);
  const openProductDetails = (product) => {
    setProductFromDB(product);
    setIsViewDetailsOpen(true);
  };
  // console.log(clickedIndex);
  
  return (
    <>
      <ProductViewDetails
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        product={productFromDB}
        clickedIndex={clickedIndex}
      />
      <Navbar></Navbar>
      <ProductView setClickedIndex={setClickedIndex} openProductDetails={openProductDetails}></ProductView>
      <Footer></Footer>
    </>
  );
};
export default ProductPage;
