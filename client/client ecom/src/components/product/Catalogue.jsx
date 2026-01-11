import { time } from "framer-motion";
import React, { useState, useEffect } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { getAllBrands, getCategoryById } from "../../services/catalogueApi";
import { useNavigate } from "react-router-dom";

const Catalogue = () => {
  const navigate = useNavigate();
  const [subscreen, setSubscreen] = useState(1);
  const [phoneData, setPhoneData] = useState([]);
  const [laptopData, setLaptopData] = useState([]);

  useEffect(() => {
    const fetchCatalogueData = async (type) => {
      // type = 'phone' hoặc 'laptop'
      try {
        const brandsResp = await getAllBrands();
        const brands = brandsResp.result || [];

        const dataPromises = brands.map(async (brand) => {
          const categoryIds = Array.isArray(brand.categoryId) ? brand.categoryId : [];
          const categoryPromises = categoryIds.map((id) => getCategoryById(id));
          const categoriesResponses = await Promise.all(categoryPromises);

          // Lọc category phù hợp với type (phone hoặc laptop)
          const filteredResponses = categoriesResponses.filter((res) => {
            if (!res || !res.result || !res.result.name) return false;

            const catNameLower = res.result.name.toLowerCase();

            if (type === 'phone') {
              // Loại bỏ các category rõ ràng là laptop/tablet
              if (
                catNameLower.includes("macbook") ||
                catNameLower.includes("laptop") ||
                catNameLower.includes("máy tính xách tay") ||
                catNameLower.includes("ipad") ||
                catNameLower.includes("tablet")
              ) {
                return false;
              }
              return true;
            }

            if (type === 'laptop') {
              // Loại bỏ các category rõ ràng là điện thoại
              if (
                catNameLower.includes("điện thoại") ||
                catNameLower.includes("smartphone") ||
                catNameLower.includes("phone")
              ) {
                return false;
              }
              return true;
            }

            return true;
          });

          // Extract series từ childrenId
          const extractSeriesNames = (rootCategory) => {
            if (!rootCategory || !Array.isArray(rootCategory.childrenId)) return [];

            const brandNode = rootCategory.childrenId.find((child) => {
              if (!child.name) return false;
              const childNameLower = child.name.toLowerCase();
              const brandNameLower = brand.name.toLowerCase();

              if (type === 'phone') {
                if (brandNameLower === "apple") return childNameLower.includes("iphone");
                if (brandNameLower === "samsung") return childNameLower.includes("samsung");
                return childNameLower.includes(brandNameLower);
              }

              if (type === 'laptop') {
                if (brandNameLower === "apple") return childNameLower.includes("macbook");
                // Các brand laptop: Lenovo, Dell, HP, MSI,... khớp theo tên
                return childNameLower.includes(brandNameLower);
              }

              return false;
            });

            if (!brandNode || !Array.isArray(brandNode.childrenId)) return [];

            return brandNode.childrenId.map((series) => ({
              name: series.name || '',
              id: series._id || series.id || ''  // ưu tiên _id trước, fallback sang id nếu có
            }));
          };

          const validItems = filteredResponses
            .flatMap((res) => extractSeriesNames(res.result))
            .filter((item) => item); // loại bỏ undefined

          if (validItems.length === 0) return null;

          // Đặt title đẹp hơn cho Apple
          let title = brand.name;
          if (brand.name.toLowerCase() === "apple") {
            title = type === 'phone' ? "Apple (iPhone)" : "Apple (MacBook)";
          }

          return { title, items: validItems };
        });

        const fetchedData = (await Promise.all(dataPromises)).filter(Boolean);
        return fetchedData.length > 0 ? fetchedData : null;
      } catch (error) {
        console.error(`Failed to fetch ${type} data:`, error);
        return null;
      }
    };

    // Fetch dữ liệu cho cả Điện thoại và Laptop
    fetchCatalogueData('phone').then((data) => setPhoneData(data || []));
    fetchCatalogueData('laptop').then((data) => setLaptopData(data || []));
  }, []);

  const data = {
    phone: [
      {
        title: "Apple (iPhone)",
        items: [
          "iPhone 16 Series",
          "iPhone 15 Series",
          "iPhone 14 Series",
          "iPhone 13 Series",
        ],
      },
      {
        title: "Xiaomi",
        items: [
          "Poco Series",
          "Xiaomi Series",
          "Redmi Note Series",
          "Redmi Series",
        ],
      },
      {
        title: "Phổ thông 4G",
        items: ["Nokia", "Itel", "Masstel", "Mobell", "Viettel"],
      },
      {
        title: "Samsung",
        items: [
          "Galaxy AI",
          "Galaxy S Series",
          "Galaxy Z Series",
          "Galaxy A Series",
          "Galaxy M Series",
        ],
      },
      {
        title: "HONOR",
        items: [
          "HONOR 400 Series",
          "HONOR Magic Series",
          "HONOR X Series",
          "HONOR Series",
        ],
      },
      {
        title: "Theo phân khúc giá",
        items: [
          "Dưới 2 triệu",
          "Từ 2 - 4 triệu",
          "Từ 4 - 7 triệu",
          "Từ 7 - 13 triệu",
          "Từ 13 - 20 triệu",
          "Trên 20 triệu",
        ],
      },
      {
        title: "OPPO",
        items: ["OPPO Reno Series", "OPPO A Series", "OPPO Find Series"],
      },
      {
        title: "Thương hiệu khác",
        items: [
          "Tecno",
          "Realme",
          "Vivo",
          "Inoi",
          "Benco",
          "TCL",
          "Nubia - ZTE",
          "RedMagic",
        ],
      },
    ],
    laptop: [
      {
        title: "Thương hiệu khác",
        items: ["Gigabyte", "Huawei", "Masstel", "Colorful"],
      },
      {
        title: "Lenovo",
        items: [
          "Lenovo Gaming LOQ",
          "Lenovo Yoga",
          "Lenovo Legion Gaming",
          "Lenovo ThinkBook",
          "Lenovo ThinkPad",
          "Lenovo IdeaPad",
        ],
      },
      {
        title: "Theo nhu cầu",
        items: [
          "Gaming - Đồ họa",
          "Laptop Al",
          "Sinh viên - Văn phòng",
          "Mòng nhẹ",
        ],
      },
      {
        title: "Dell",
        items: [
          "Dell XPS",
          "Dell Inspiron",
          "Dell Vostro",
          "Dell Latitude",
          "Dell Gaming G Series",
        ],
      },
      {
        title: "HP",
        items: [
          "HP 14/15 - 14s/15s",
          "HP cơ bản",
          "HP Pavilion",
          "HP Envy",
          "HP Victus",
        ],
      },
      {
        title: "MSI",
        items: [
          "MSI Gaming Thin GF / Cyborg",
          "MSI Gaming Katana/ Sword/ Crosshair",
          "MSI Modern",
        ],
      },
    ],
    pc: [
      {
        title: "PC",
        items: ["E-Power", "Apple (iMac)", "Asus", "Lenovo", "HP"],
      },
      {
        title: "Màn hình",
        items: [
          "ASUS",
          "Samsung",
          "MSI",
          "Dell",
          "LG",
          "ViewSonic",
          "AOC",
          "Xiaomi",
          "Apple",
          "Acer",
          "GIGABYTE",
          "Lenovo",
          "Edra",
        ],
      },
    ],
    dienmay: [
      {
        title: "Tivi",
        items: ["Tivi QLED", "Tivi 4K", "Google TV"],
      },
      {
        title: "Máy giặt",
        items: ["Máy giặt cửa trước", "Máy giặt cửa trên", "Máy giặt sấy"],
      },
      {
        title: "Máy lạnh - Điều hòa",
        items: [
          "Máy lạnh - Điều hòa 1 chiều",
          "Máy lạnh - Điều hòa 2 chiều",
          "Máy lạnh - Điều hòa Inverter",
        ],
      },
      {
        title: "Máy sấy",
        items: ["Sấy thông hơi", "Sấy ngưng tụ", "Sấy bơm nhiệt"],
      },
      {
        title: "Tủ lạnh",
        items: [
          "Tủ lạnh Inverter",
          "Tủ lạnh nhiều cửa",
          "Side by side",
          "Mini",
        ],
      },
    ],
    accessories: [
      {
        title: "Âm thanh",
        items: [
          "Tai nghe nhét tai",
          "Tai nghe chụp tai",
          "Tai nghe không dây",
          "Loa Bluetooth",
          "Loa karaoke",
          "Loa vi tính",
        ],
      },
      {
        title: "Gaming Gear",
        items: [
          "Tai nghe",
          "Loa",
          "Chuột",
          "Bàn phím",
          "Loa",
          "Chuột",
          "Bàn phím",
        ],
      },
      {
        title: "Phụ kiện di động",
        items: [
          "Sạc, Cáp",
          "Sạc dự phòng",
          "Bao da, Ốp lưng",
          "Thẻ nhớ",
          "Miếng dán màn hình",
          "Bút cảm ứng",
          "Thiết bị định vị",
          "Gậy chụp ảnh, Gimbal",
        ],
      },
      {
        title: "Thiết bị lưu trữ data",
        items: ["USB", "Thẻ nhớ", "Ổ cứng di động"],
      },
      {
        title: "Phụ kiện Laptop",
        items: [
          "Chuột",
          "Bàn phím",
          "Balo, Túi xách",
          "Bút trình chiếu",
          "Webcam",
          "Giá đỡ",
          "Miếng lót chuột",
          "Hub chuyển đổi",
          "Phù bàn phím",
          "Ổ cứng di động",
          "USB",
        ],
      },
    ],
    chuyenApple: [
      {
        title: "Sản phẩm Apple",
        items: ["iPhone", "iPad", "MacBook", "iMac"],
      },
      {
        title: "Phụ kiện Apple",
        items: [
          "Sạc & Cáp",
          "Ốp lưng & Bao da",
          "Chuột & Trackpad",
          "Bàn phím",
          "Apple Pencil",
          "Airtag",
        ],
      },
    ],
    chuyenSamsung: [
      {
        title: "Sản phẩm Samsung",
        items: [
          "Điện thoại",
          "Máy tính bảng",
          "Galaxy Al",
          "Đồng hồ thông minh",
          "Tủ lạnh",
          "Máy giặt",
          "Màn hình",
          "Tai nghe",
          "TV & AV",
        ],
      },
      {
        title: "Phụ kiện Samsung",
        items: [
          "Sạc & Cáp",
          "Ốp lưng & Bao da",
          "Sạc dự phòng",
          "Thiết bị định vị",
          "Ổ cứng & Thẻ nhớ",
          "Dây đeo đồng hồ",
          "Phụ kiện khác",
        ],
      },
    ],
  };


  let groupedData = [];

  // useEffect(() => {
  //   console.log('groupedData: ', groupedData)
  // }, [groupedData])

  switch (subscreen) {
    case 1:
      groupedData = phoneData.length > 0 ? phoneData : data.phone;
      break;
    case 2:
      groupedData = laptopData.length > 0 ? laptopData : data.laptop;
      break;
    case 3:
      groupedData = data.pc;
      break;
    case 4:
      groupedData = data.dienmay;
      break;
    case 5:
      groupedData = data.accessories;
      break;
    case 6:
      groupedData = data.chuyenApple;
      break;
    case 7:
      groupedData = data.chuyenSamsung;
      break;
    default:
      groupedData = data.phone;
      break;
  }

  const menuItems = [
    {
      text: "Điện thoại",
    },
    {
      text: "Laptop",
    },
    {
      text: "PC, màn hình",
    },
    {
      text: "Điện máy",
    },
    {
      text: "Phụ kiện",
    },
    {
      text: "Chuyên đồ Apple",
    },
    {
      text: "Chuyên đồ Samsung",
    },
    {
      text: "Khuyến mãi",
    },
    // {
    //   text: "Tin công nghệ",
    // },
  ];

  return (
    <>
      <div className="h-[460px] w-full bg-white px-15 flex shadow">
        {/* Left Sidebar */}
        <div className="w-[23%]">
          <ul className="">
            {menuItems.map(({ text }, idx) => (
              <li
                key={idx}
                onMouseEnter={() => {
                  setSubscreen(idx + 1);
                }}
                className={`${subscreen === idx + 1 ? "text-[#03A9F4] [box-shadow:rgba(50,50,93,0.25)_0px_13px_27px_-5px,rgba(0,0,0,0.3)_0px_8px_16px_-8px] translate-x-2 scale-x-100 origin-left" : "text-black"
                  } flex items-center justify-between p-3 cursor-pointer transition-all duration-100 transform rounded-full`}
              >
                <span className="text-[17px]">{text}</span>
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
                              cateType: 'phone'
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
