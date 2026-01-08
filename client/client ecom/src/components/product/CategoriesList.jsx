import { useContext, useState, useEffect, useRef } from "react";


export default function CategoriesList() {
  const categories = [
    {
      name: "Tablet",
      img: "https://ecommax.risingbamboo.com/wp-content/uploads/2024/05/cat-1.png",
    },
    {
      name: "Tablet",
      img: "https://ecommax.risingbamboo.com/wp-content/uploads/2024/05/cat-1.png",
    },
    {
      name: "Tablet",
      img: "https://ecommax.risingbamboo.com/wp-content/uploads/2024/05/cat-1.png",
    },
    {
      name: "Tablet",
      img: "https://ecommax.risingbamboo.com/wp-content/uploads/2024/05/cat-1.png",
    },
    {
      name: "Tablet",
      img: "https://ecommax.risingbamboo.com/wp-content/uploads/2024/05/cat-1.png",
    },
    {
      name: "Tablet",
      img: "https://ecommax.risingbamboo.com/wp-content/uploads/2024/05/cat-1.png",
    },
    {
      name: "Tablet",
      img: "https://ecommax.risingbamboo.com/wp-content/uploads/2024/05/cat-1.png",
    },
    {
      name: "Tablet",
      img: "https://ecommax.risingbamboo.com/wp-content/uploads/2024/05/cat-1.png",
    },
  ];
  
  return (
    <>
      <div
        className="w-full bg-white relative px-15 my-15"
      >
        <div className="flex items-center justify-between">
          {categories.map((category, i) => (
            <div key={i} className="group rounded-xl [box-shadow:rgba(14,30,37,0.12)_2px_2px_4px_0px,rgba(14,30,37,0.32)_4px_4px_16px_0px] w-[160px] h-[160px] relative flex flex-col items-center justify-center gap-5">
              <img 
                src={category.img} 
                width={"65px"}
                height={"65px"}
                className="transition-transform duration-300 group-hover:-translate-y-2"
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

