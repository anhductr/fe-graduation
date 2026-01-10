import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Checkbox from '@mui/material/Checkbox';
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import { useCart } from "../context/CartContext";

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    totalPrice: cartTotalPrice,
    updateCart,
    deleteItems,
    isCartLoading
  } = useCart();

  const [selected, setSelected] = useState([]);

  // Initialize selection state based on items
  useEffect(() => {
    if (items && items.length > 0) {
      // By default, maybe existing logic or preserve selection.
      // For now, reset selection when items change or init.
      // Or keep track of selected item IDs.
      setSelected(new Array(items.length).fill(false));
    } else {
      setSelected([]);
    }
  }, [items]);

  const handleChangeCheckedAll = (event) => {
    setSelected(new Array(items.length).fill(event.target.checked));
  };

  const handleChangeChecked = (event, idx) => {
    const checked = event.target.checked;
    setSelected((prev) => {
      const updated = [...prev];
      updated[idx] = checked;
      return updated;
    });
  };

  const handleDeleteSelected = async () => {
    const selectedIds = items.filter((_, idx) => selected[idx]).map(item => item.id);
    if (selectedIds.length === 0) return;

    if (window.confirm("Bạn có chắc muốn xóa các sản phẩm đã chọn?")) {
      await deleteItems(selectedIds);
      // Selection state will be reset by useEffect when items change
    }
  };

  const handleUpdateQuantity = async (e, idx, itemId, currentQty) => {
    const val = e.target.value;
    if (val === "" || isNaN(val)) return;

    const newQty = parseInt(val);
    if (newQty < 1) return; // Prevent < 1 if manually typed

    if (newQty !== currentQty) {
      // Find sku from item. The API needs sku and quantity.
      // Assuming item has sku.
      const item = items[idx];
      await updateCart({ sku: item.sku, quantity: newQty });
    }
  };

  const increaseQty = async (item) => {
    await updateCart({ sku: item.sku, quantity: item.quantity + 1 });
  };

  const decreaseQty = async (item) => {
    if (item.quantity > 1) {
      await updateCart({ sku: item.sku, quantity: item.quantity - 1 });
    } else {
      // Maybe ask to remove? Or just do nothing.
    }
  };

  // Calculate selected subtotal if we only want to checkout selected items.
  // BUT the API flow for checkout is usually "checkout cart". 
  // If the requirement is to checkout ONLY selected items, the CreateOrder API needs to support passing items.
  // The current Create Order API takes a list of items. 
  // So yes, we can filter.
  // HOWEVER, the logic in CheckoutPage uses `useCart()` which likely returns ALL items.
  // If we want to checkout subset, we might need to pass them to checkout page or update cart before checkout.
  // For simplicity based on typical flows (and provided Checkout implementation), let's assume we proceed with the whole cart OR 
  // we filter in CheckoutPage. 
  // Current `CheckoutPage.jsx` uses `const { cart, items, totalPrice } = useCart();` --> takes everything.
  // So "Select" checkboxes here might strictly be for "Deleting" or UI calculation, unless we pass state.
  // Let's implement visual calculation for selected items.

  const selectedItems = items.filter((_, idx) => selected[idx]);
  const selectedTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // If nothing selected, show cart total? Or 0?
  // Usually if nothing selected, "Buy" might specific "Please select items".
  // Let's stick to simple "Checkout Cart" logic for now if user selects nothing?
  // Or better: disabling checkout if nothing selected is common in platforms like Shopee.
  // BUT `CheckoutPage` uses global cart. 
  // I will make the "Checkout" button navigate to /checkout. `CheckoutPage` will just load the user's cart.
  // So the checkboxes here technically don't affect `CheckoutPage` unless we implement "Checkout Specific Items" flow which is more complex (requires storing selected items in context/state).
  // Given the time, I will assume CheckoutPage processes the *entire* cart for now, as implemented in `CheckoutPage.jsx`.
  // I will note this limitation or just allow deleting.

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isCartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <Navbar />
      <div className="min-h-screen bg-gray-100 px-15">
        <Breadcrumbs pagename="Giỏ Hàng" product={null} />

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow mt-4">
            <p className="text-xl text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="mx-auto flex gap-10 ">
            {/* Left content */}
            <div className="flex-1 bg-white rounded-lg p-6">
              <label className="flex items-center mb-4 space-x-3">
                <Checkbox
                  checked={selected.length > 0 && selected.every(Boolean)}
                  onChange={handleChangeCheckedAll}
                />
                <span className="text-gray-900 font-medium">
                  Chọn tất cả ({items.length})
                </span>
                <button
                  aria-label="Xóa tất cả"
                  className="ml-auto text-gray-400 hover:text-gray-600 transition"
                  onClick={handleDeleteSelected}
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

              {/* List items */}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between w-full border border-gray-200 rounded-lg p-4 gap-4">
                    <label className="flex items-start">
                      <Checkbox
                        checked={selected[idx] || false}
                        onChange={(e) => handleChangeChecked(e, idx)}
                      />
                    </label>

                    <img
                      src={item.image || "https://dummyimage.com/100x100/eeeeee/999999&text=No+Image"}
                      alt={item.productName}
                      className="h-20 w-20 object-cover rounded-md"
                    />

                    <div className="flex-1">
                      <h3 className="text-black font-semibold text-sm leading-tight">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                    </div>

                    {/* Price */}
                    <div className="text-red-600 flex flex-col text-lg font-semibold text-right">
                      {formatPrice(item.price)}
                    </div>

                    <div className="flex flex-shrink-0 items-center space-x-2 border border-gray-300 rounded">
                      <button
                        aria-label="Giảm số lượng"
                        onClick={() => decreaseQty(item)}
                        className="px-3 py-1 bg-white hover:bg-gray-100 border-r border-gray-300 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(e, idx, item.id, item.quantity)} // Note: handling manual input needs debounce or special handling
                        className="w-12 text-center border-none focus:ring-0 outline-none appearance-none"
                        readOnly // Simple implementation: readOnly to force buttons usage, or improve logic for input
                      />
                      <button
                        aria-label="Tăng số lượng"
                        onClick={() => increaseQty(item)}
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
            <div className="w-full max-w-sm bg-white rounded-lg p-6 sticky top-20 h-fit">
              <div>
                <h2 className="font-semibold text-lg mb-4">Thông tin đơn hàng</h2>

                <dl className="space-y-3">
                  <div className="flex justify-between border-b border-dashed border-gray-300 pb-1 font-semibold text-red-600 text-lg">
                    <dt>Tổng tiền</dt>
                    <dd>{formatPrice(cartTotalPrice)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="mt-6 w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition"
                  onClick={handleCheckout}
                >
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
