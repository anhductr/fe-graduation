import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RxChevronRight } from "react-icons/rx";
import { getCategoryPathToRoot } from "../../services/searchApi";

const Breadcrumbs = ({ pagename, product }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [categoryPath, setCategoryPath] = useState([]);

  useEffect(() => {
    // Logic: chỉ gọi API này khi state có type (hoặc searchType) là "category"
    const isCategorySearch = state?.type === "category" || state?.searchType === "category";
    const categoryId = state?.categoryId;

    if (isCategorySearch && categoryId) {
      const fetchPath = async () => {
        try {
          const res = await getCategoryPathToRoot(categoryId);
          console.log("Category Path to Root:", res);
          // Assuming result.categoryGetVM is the list ordered from Root -> Leaf based on analysis
          if (res?.result?.categoryGetVM) {
            setCategoryPath(res.result.categoryGetVM);
          }
        } catch (error) {
          console.error("Error fetching category path:", error);
        }
      };
      fetchPath();
    } else {
      setCategoryPath([]);
    }
  }, [state]);

  const handleCategoryClick = (category) => {
    navigate("/search", {
      state: {
        type: "category",
        categoryId: category.id,
        // Optional: you might want to pass other state props if needed, e.g. cateType
        // For now, minimal payload as requested
      }
    });
  };

  const renderContent = () => {
    // 1. Trường hợp đang ở trang Product Detail
    if (pagename === "product") {
      const filteredCategories = (product.categories || [])
        .filter(cat => {
          const name = (cat.name || cat || '').toLowerCase();
          const slug = (cat.slug || '').toLowerCase();
          return name !== 'trang chủ' && name !== 'root' && slug !== 'root';
        })
        .reverse();

      return (
        <>
          <RxChevronRight className="text-gray-800" />
          {/* Render Category Tree - REVERSED (Root -> Leaf) */}
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, index) => (
              <React.Fragment key={index}>
                <Link to="/" onClick={(e) => {
                  e.preventDefault();
                  if (typeof cat === 'object' && cat.id) {
                    handleCategoryClick(cat);
                  }
                }}>
                  {cat.name || cat}
                </Link>
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

          {/* Only show brand if it's valid and not redundant */}
          {product.brand && (
            <>
              <Link>{product.brand}</Link>
              <RxChevronRight className="text-gray-800" />
            </>
          )}

          <div className="font-semibold text-gray-900 truncate max-w-[300px]" title={product.name}>{product.name}</div>
        </>
      )
    }

    // 2. Trường hợp đang ở trang Search Result với Type = Category (có path API)
    if (categoryPath.length > 0) {
      return (
        <>
          {categoryPath.map((cat, index) => {
            const isLast = index === categoryPath.length - 1;
            return (
              <React.Fragment key={cat.id || index}>
                <RxChevronRight className="text-gray-800" />
                <div
                  onClick={() => handleCategoryClick(cat)}
                  className={`cursor-pointer hover:text-blue-600 hover:underline ${isLast ? "font-semibold" : ""}`}
                >
                  {cat.name}
                </div>
              </React.Fragment>
            );
          })}
        </>
      )
    }

    // 3. Trường hợp mặc định (Cart, UserInfo, Search Keyword, v.v.)
    return (
      <>
        <RxChevronRight className="text-gray-800" />
        <div>{pagename}</div>
      </>
    );
  }

  return (
    <>
      <nav className="flex items-center space-x-2 !text-gray-800 py-5">
        <Link className="text-gray-800" to="/">
          <i className="fas fa-home mr-1"></i>Trang chủ
        </Link>
        {renderContent()}
      </nav>
    </>
  );
};

export default Breadcrumbs;
