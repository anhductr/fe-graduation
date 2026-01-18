import { time } from "framer-motion";
import React, { useState, useEffect } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { getCateUnderRoot } from "../../services/searchApi";
import { getAllBrands, getCategoryById } from "../../services/catalogueApi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Catalogue = () => {
  const navigate = useNavigate();
  const [subscreen, setSubscreen] = useState(1);

  // Use React Query for category fetching with caching
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'root'],
    queryFn: async () => {
      const response = await getCateUnderRoot();
      return response?.result?.categoryGetVM || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const categories = categoriesData || [];
  const selectedCategory = categories[subscreen - 1]; // Category đang hover

  // Use React Query for catalogue data fetching with caching
  const { data: catalogueData = [] } = useQuery({
    queryKey: ['catalogue', selectedCategory?.id || 'none'],
    queryFn: async () => {
      if (!selectedCategory) {
        return [];
      }

      try {
        const brandsResp = await getAllBrands();
        const brands = brandsResp.result || [];

        const dataPromises = brands.map(async (brand) => {
          const categoryIds = Array.isArray(brand.categoryId) ? brand.categoryId : [];

          // Fetch tất cả categories của brand
          const categoryPromises = categoryIds.map((id) => getCategoryById(id));
          const categoriesResponses = await Promise.all(categoryPromises);

          // Tìm category có name khớp với category đang hover
          const matchedCategory = categoriesResponses.find((res) => {
            if (!res?.result?.name) return false;
            return res.result.name.toLowerCase() === selectedCategory.name.toLowerCase();
          });

          // Nếu không tìm thấy category phù hợp, bỏ qua brand này
          if (!matchedCategory?.result?.childrenId) return null;

          // Lấy childrenId (các brand nodes như iPhone, Samsung, etc.)
          const brandNodes = matchedCategory.result.childrenId;

          // Tìm brand node khớp với tên brand
          const matchedBrandNode = brandNodes.find((node) => {
            if (!node.name) return false;
            const nodeName = node.name.toLowerCase();
            const brandName = brand.name.toLowerCase();

            console.log('node name: ', nodeName)
            console.log('brand name: ', brandName)

            // Special cases
            if (brandName === "apple") {
              return nodeName.includes("iphone") || nodeName.includes("macbook") || nodeName.includes("ipad");
            }
            if (brandName === nodeName) {
              return nodeName.includes(nodeName);
            }

            return nodeName.includes(brandName);
          });

          // Nếu không tìm thấy brand node, bỏ qua
          if (!matchedBrandNode) return null;

          // Hàm đệ quy để lấy tất cả leaf nodes (childrenId === null hoặc [])
          const collectLeafNodes = (nodes) => {
            const leafNodes = [];

            if (!Array.isArray(nodes)) return leafNodes;

            for (const node of nodes) {
              // Nếu node không có children hoặc children rỗng -> đây là leaf node
              if (!node.childrenId || node.childrenId.length === 0) {
                leafNodes.push({
                  name: node.name || '',
                  id: node.id || ''
                });
              } else {
                // Nếu còn children, tiếp tục đệ quy
                leafNodes.push(...collectLeafNodes(node.childrenId));
              }
            }

            return leafNodes;
          };

          // Lấy tất cả leaf nodes CHỈ từ brand node này
          const items = collectLeafNodes(matchedBrandNode.childrenId || []);

          // Nếu không có items, bỏ qua brand này
          if (items.length === 0) return null;

          return {
            title: brand.name,
            items: items
          };
        });

        const fetchedData = (await Promise.all(dataPromises)).filter(Boolean);
        return fetchedData;
      } catch (error) {
        console.error('Failed to fetch catalogue data:', error);
        return [];
      }
    },
    enabled: !!selectedCategory, // Chỉ fetch khi có selectedCategory
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Sử dụng catalogueData trực tiếp - data được fetch dựa trên selectedCategory
  const groupedData = catalogueData;

  return (
    <>
      <div className="h-[460px] w-full bg-white px-15 flex shadow">
        {/* Left Sidebar */}
        <div className="w-[23%]">
          <ul className="">
            {categories.map((item, idx) => (
              <li
                key={item.id || idx}
                onMouseEnter={() => {
                  setSubscreen(idx + 1);
                }}
                className={`${subscreen === idx + 1 ? "text-[#03A9F4] [box-shadow:rgba(50,50,93,0.25)_0px_13px_27px_-5px,rgba(0,0,0,0.3)_0px_8px_16px_-8px] translate-x-2 scale-x-100 origin-left" : "text-black"
                  } flex items-center justify-between p-3 cursor-pointer transition-all duration-100 transform rounded-full`}
              >
                <span className="text-[17px]">{item.name}</span>
                <IoIosArrowForward />
              </li>
            ))}
          </ul>
        </div>


        {/* Content */}
        <div className="w-[67%] flex flex-col flex-1 p-6">
          {/* Brands + Categories lists */}
          <div className="flex justify-between text-gray-800 max-full overflow-y-auto">
            {groupedData.map((group, groupIndex) => (
              <div key={groupIndex} className="flex flex-col">
                <div key={group.title} className="mb-2">
                  <h3 className="font-bold mb-2 !text-[20px] flex items-center justify-center cursor-pointer text-gray-900 hover:underline">
                    {group.title}
                  </h3>
                  <div>
                    <ul className="space-y-1 !text-[18px]">
                      {group.items.map((item) => (
                        <li
                          key={item.id}
                          className="cursor-pointer hover:underline"
                          onClick={() => navigate("/search", {
                            state: {
                              type: "category",
                              categoryId: item.id,
                              cateType: selectedCategory?.name || 'phone'
                            }
                          })}
                        >
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Catalogue;
