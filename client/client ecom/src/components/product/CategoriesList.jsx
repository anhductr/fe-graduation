import { useContext, useState, useEffect, useRef } from "react";


export default function CategoriesList() {
  const categories = [
    {
      name: "Điện thoại",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-mobile.png",
    },
    {
      name: "Laptop",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-laptop.png",
    },
    {
      name: "Tablet",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-tablet.png",
    },
    {
      name: "Tai nghe",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-headphone.png",
    },
    {
      name: "Đồng hồ",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-smartwatch.png",
    },
    {
      name: "Nhà thông minh",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-smart-home.png",
    },
    {
      name: "Phụ kiện",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-accessory.png",
    },
    {
      name: "PC - Màn hình",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-pc.png",
    },
    {
      name: "TV",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-tv.png",
    },
    {
      name: "Thu cũ",
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/icons/menu/icon-trade-in.png",
    },
  ];

  return (
    <>
      <div className="w-full bg-white relative px-15 my-4">
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {categories.map((category, i) => (
            <div key={i} className="group cursor-pointer rounded-lg hover:shadow-md border border-transparent hover:border-gray-200 transition-all duration-300 w-full h-[100px] flex flex-col items-center justify-center gap-2">
              <div className="bg-gray-100 rounded-full p-3 group-hover:bg-blue-50 transition-colors">
                <img
                  src={category.img}
                  className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
                  alt={category.name}
                />
              </div>
              <span className="font-medium text-[12px] text-center text-gray-700 group-hover:text-blue-600">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

