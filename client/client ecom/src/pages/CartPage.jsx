import React, { useState, useEffect } from "react";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import PaymentSuccessModal from "../components/common/PaymentSuccessModal";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";

const productData = [
  {
    id: 1,
    name: "iPhone 16 Pro Max 256GB Titan Sa Mạc MYWX3VN/A",
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1d12afe4-71a3-41fc-988f-1d08fd64ce60.png",
    colorOptions: "Titan Sa Mạc",
    price: 30090000,
    originalPrice: 34290000,
  },
  {
    id: 2,
    name: "iPhone 16 Pro Max 256GB Titan Sa Mạc MYWX3VN/A",
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1d12afe4-71a3-41fc-988f-1d08fd64ce60.png",
    colorOptions: "Bạc",
    price: 30090000,
    originalPrice: 34290000,
  },
  {
    id: 3,
    name: "iPhone 16 Pro Max 256GB Titan Sa Mạc MYWX3VN/A",
    image:
      "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1d12afe4-71a3-41fc-988f-1d08fd64ce60.png",
    colorOptions: "Đen",
    price: 30090000,
    originalPrice: 34290000,
  },
];

const formatPrice = (p) =>
  p.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export default function CartPage() {
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(false);
  const [color, setColor] = useState(productData[0].colorOptions[0]);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const [selected, setSelected] = useState([]);
  const [quantity, setQuantity] = useState([]);

  useEffect(() => {
    setSelected(new Array(productData.length).fill(false));
    setQuantity(new Array(productData.length).fill(1));
  }, []);

  const handleChangeCheckedAll = (event) => {
    setSelected(new Array(productData.length).fill(event.target.checked));
  };

  const handleChangeChecked = (event, idx) => {
    const checked = event.target.checked;
    setSelected((prev) => {
      const updated = [...prev];
      updated[idx] = checked;
      return updated;
    });
  };

  const handleChangeQuantity = (e, idx) => {
    const val = e.target.value;

    // Nếu người dùng đang xóa hết, cho phép chuỗi rỗng
    if (val === "") {
      setQuantity((prev) => {
        const newQuantity = [...prev];
        newQuantity[idx] = ""; // cho phép trống
        return newQuantity;
      });
      return;
    }

    // Nếu không trống, chuyển sang số
    const num = Number(val);
    if (!isNaN(num)) {
      setQuantity((prev) => {
        const newQuantity = [...prev];
        newQuantity[idx] = num;
        return newQuantity;
      });
    }
  };


  const totalPrice =
    productData.reduce((sum, product) => {
      return sum + product.price * (quantity[product.id - 1] || 1);
    }, 0) +
    (selectedCombo ? selectedCombo.price : 0);

  const totalOriginalPrice =
    productData.reduce((sum, product) => {
      return sum + product.originalPrice * (quantity[product.id - 1] || 1);
    }, 0) +
    (selectedCombo ? selectedCombo.originalPrice || selectedCombo.price : 0);

  const totalDiscount = totalOriginalPrice - totalPrice;

  function toggleCombo(id) {
    if (selectedCombo && selectedCombo.id === id) {
      setSelectedCombo(null);
    } else {
      const c = productData.combos.find((c) => c.id === id);
      setSelectedCombo(c);
    }
  }

  return (
    <div className="component-container">
      <Navbar />
      <PaymentSuccessModal
        open={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
      />
      <div className="min-h-screen bg-gray-100 px-15">
        <Breadcrumbs pagename="Giỏ Hàng" product={null} />
        {/* Breadcrumb */}

        <div className="mx-auto flex gap-10 ">
          {/* Left content */}
          <div className="flex-1 bg-white rounded-lg p-6">
            <label className="flex items-center mb-4 space-x-3">
              <Checkbox
                checked={selected.length > 0 && selected.every(Boolean)} // tất cả đều true thì tick hết
                onChange={handleChangeCheckedAll}
              />
              <span className="text-gray-900 font-medium">
                Chọn tất cả ({selected.filter(Boolean).length})
              </span>
              <button
                aria-label="Xóa tất cả"
                className="ml-auto text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </label>

            {/* Single product */}
            <div className="space-y-4">
              {productData.map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between w-full border border-gray-200 rounded-lg p-4 gap-4">
                  <label className="flex items-start">
                    <Checkbox
                      checked={selected[idx] || false}
                      onChange={(e) => handleChangeChecked(e, idx)}
                    />
                  </label>

                  <img
                    src={product.image}
                    alt="iPhone 16 Pro Max 256GB Titan Sa Mạc front view"
                    className="h-20 w-20 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9bfea6ad-ba7b-44bf-b93e-1233ff983880.png";
                    }}
                  />

                  <div className="">
                    <h3 className="text-black font-semibold text-sm leading-tight">
                      {product.name}
                    </h3>

                    <div
                      className="mt-1 px-2 py-1 rounded bg-gray-200 text-gray-800 text-sm w-fit"
                    >
                      {product.colorOptions}
                    </div>
                  </div>

                  {/* Price and quantity */}
                  <div className="text-red-600 flex flex-col text-lg font-semibold text-right">
                    {formatPrice(productData[0].price)}{" "}
                    <span className="line-through text-gray-400 text-sm font-normal">
                      {formatPrice(productData[0].originalPrice)}
                    </span>
                  </div>

                  <div className="flex flex-shrink-0 items-center space-x-2 border border-gray-300 rounded">
                    <button
                      aria-label="Giảm số lượng"
                      onClick={() =>
                        setQuantity((prev) => {
                          const newQuantity = [...prev]; // tạo bản sao
                          newQuantity[idx] = Math.max(1, newQuantity[idx] - 1); // giảm 1, nhưng không dưới 1
                          return newQuantity;
                        })
                      }
                      className="px-3 py-1 bg-white hover:bg-gray-100 border-r border-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity[idx]}
                      onChange={(e) => handleChangeQuantity(e, idx)}
                      onBlur={() => {
                        setQuantity((prev) => {
                          const newQuantity = [...prev];
                          if (!newQuantity[idx] || Number(newQuantity[idx]) < 1)
                            newQuantity[idx] = 1;
                          return newQuantity;
                        });
                      }}
                      className="w-12 text-center border-none focus:ring-0 outline-none appearance-none 
                        [&::-webkit-inner-spin-button]:appearance-none 
                        [&::-webkit-outer-spin-button]:appearance-none"
                    />

                    <button
                      aria-label="Tăng số lượng"
                      onClick={() =>
                        setQuantity((prev) => {
                          const newQuantity = [...prev]; // tạo bản sao
                          newQuantity[idx] = Math.max(1, newQuantity[idx] + 1); // tăng 1
                          return newQuantity;
                        })
                      }
                      className="px-3 py-1 bg-white hover:bg-gray-100 border-l border-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right content */}
          <div className="w-full max-w-sm bg-white rounded-lg p-6 sticky top-20">
            <div className="flex items-center justify-between mb-3 border border-gray-200 rounded p-3 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <span className="text-gray-800 font-medium">
                  Chọn hoặc nhập ưu đãi
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div className="flex items-center space-x-2 border border-gray-200 rounded p-3 mb-6 text-yellow-600 bg-yellow-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
              </svg>
              <span>Đăng ký thành viên để kích hoạt điểm thưởng</span>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-4">Thông tin đơn hàng</h2>

              <dl className="space-y-3">
                <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                  <dt>Tổng tiền</dt>
                  <dd>{formatPrice(totalOriginalPrice)}</dd>
                </div>

                <div className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                  <dt>Tổng khuyến mãi</dt>
                  <dd className="text-gray-500">
                    {formatPrice(totalDiscount)}
                  </dd>
                </div>

                <div className="flex justify-between border-b border-dashed border-gray-300 pb-1 font-semibold text-red-600 text-lg">
                  <dt>Cần thanh toán</dt>
                  <dd>{formatPrice(totalPrice)}</dd>
                </div>

                <div className="flex justify-between items-center text-yellow-600">
                  <dt>Điểm thưởng</dt>
                  <dd className="flex items-center space-x-1 font-medium">
                    <span>+7,522</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path
                        d="M12 6v6l4 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                className="mt-6 w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition"
                onClick={() => setOpenSuccessModal(true)}
              >
                Xác nhận đơn
              </button>

              <button
                type="button"
                className="mt-3 w-full bg-gray-100 text-gray-700 font-medium py-2 rounded hover:bg-gray-200 transition"
                onClick={() => setShowMoreInfo((v) => !v)}
              >
                {showMoreInfo ? "Thu gọn" : "Xem chi tiết"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`inline-block h-5 w-5 ml-1 transition-transform ${showMoreInfo ? "rotate-180" : "rotate-0"
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7 7"
                  />
                </svg>
              </button>

              {showMoreInfo && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Thông tin chi tiết hơn về đơn hàng hoặc điểm thưởng có thể
                    xuất hiện tại đây.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
