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
            <RxChevronRight className="text-gray-800" />
            {/* Render Category Tree */}
            {product.categories && product.categories.length > 0 ? (
              product.categories
                .filter(cat => {
                  const name = (cat.name || cat).toLowerCase();
                  const slug = (cat.slug || '').toLowerCase();
                  return name !== 'trang chủ' && name !== 'root' && slug !== 'root';
                })
                .map((cat, index) => (
                  <React.Fragment key={index}>
                    <Link to={`/category/${cat.slug || cat.id || '#'}`}>{cat.name || cat}</Link>
                    <RxChevronRight className="text-gray-800" />
                  </React.Fragment>
                ))
            ) : (
              <>
                {product.category && (
                  <>
                    <Link to="/phones">{product.category}</Link>
                    <RxChevronRight className="text-gray-800" />
                  </>
                )}
              </>
            )}

            <Link>{product.brand}</Link>
            <RxChevronRight className="text-gray-800" />
            <div className="font-semibold text-gray-900 truncate max-w-[300px]" title={product.name}>{product.name}</div>
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
