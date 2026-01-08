import React from "react";
import { Link } from "react-router-dom";
import { RxChevronRight } from "react-icons/rx";

const Breadcrumbs = ({ pagename, product }) => {
  return (
    <>
      <nav className="flex items-center space-x-2 text-sm !text-gray-800 py-5">
        <Link className="text-gray-800" to="/">
          <i className="fas fa-home mr-1"></i>Trang chủ
        </Link>
        {pagename === "product" ? (
          <>
            <RxChevronRight className="text-gray-800"/>
            <Link to="/phones">{product.category}</Link>
            <RxChevronRight className="text-gray-800"/>
            <Link>{product.brand}</Link>
            <RxChevronRight className="text-gray-800"/>
            <div>{product.name}</div>
          </>
        ) : (
          <>
            <RxChevronRight className="text-gray-800"></RxChevronRight>
            <div>{pagename}</div>
          </>
        )}
      </nav>
    </>
  );
};

export default Breadcrumbs;
