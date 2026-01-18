import { useContext, useState, useEffect, useRef } from "react";
import { getCateUnderRoot } from "../../services/searchApi";
import { useQuery } from "@tanstack/react-query";

export default function CategoriesList() {
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

  return (
    <>
      <div
        className="w-full bg-white relative px-15 my-5"
      >
        <div className="flex items-center gap-8 justify-center">
          {categories.map((category, i) => (
            <div key={category.id || i} className="group rounded-xl [box-shadow:rgba(14,30,37,0.12)_2px_2px_4px_0px,rgba(14,30,37,0.32)_4px_4px_16px_0px] w-[160px] h-[160px] relative flex flex-col items-center justify-center gap-5">
              <img
                src={category.imageUrl}
                width={"65px"}
                height={"65px"}
                className="transition-transform duration-300 group-hover:-translate-y-2"
                alt={category.name}
              >
              </img>
              <span className="font-semibold text-[13px]">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

