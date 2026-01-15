import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { Checkbox, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/Navbar";
import { useCart } from "../context/CartContext";
import { IoTrashOutline } from "react-icons/io5";

const formatPrice = (p) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    totalPrice: cartTotalPrice,
    updateCart,
    deleteItems,
    isCartLoading,
  } = useCart();

  const [selected, setSelected] = useState({});

  useEffect(() => {
    if (items && items.length > 0) {
      const currentIds = new Set(items.map((i) => i.cartItemId));
      setSelected((prev) => {
        const cleaned = {};
        Object.keys(prev).forEach((id) => {
          if (currentIds.has(id)) cleaned[id] = prev[id];
        });
        return cleaned;
      });
    } else {
      setSelected({});
    }
  }, [items]);

  const handleChangeCheckedAll = (e) => {
    const checked = e.target.checked;
    const next = {};
    items.forEach((i) => (next[i.cartItemId] = checked));
    setSelected(next);
  };

  const handleChangeChecked = (id, checked) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteTargetIds, setBulkDeleteTargetIds] = useState([]);

  const handleDeleteSelected = () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    setBulkDeleteTargetIds(ids);
    setBulkDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) await deleteItems([deleteTargetId]);
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteTargetIds.length > 0)
      await deleteItems(bulkDeleteTargetIds);
    setBulkDeleteModalOpen(false);
    setBulkDeleteTargetIds([]);
  };

  const increaseQty = async (item) => {
    await updateCart({ sku: item.sku, quantity: item.quantity + 1 });
  };

  const decreaseQty = async (item) => {
    if (item.quantity > 1) {
      await updateCart({ sku: item.sku, quantity: item.quantity - 1 });
    }
  };

  const selectedItems = items.filter((i) => selected[i.cartItemId]);
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + i.sellPrice * i.quantity,
    0
  );

  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        source: "cart",
        selectedItems,
        subtotal: selectedTotal,
      },
    });
  };


  if (isCartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="mx-auto flex gap-10">
            <div className="flex-1 bg-white rounded-lg p-6">
              <label className="flex items-center mb-4 space-x-3">
                <Checkbox
                  checked={
                    items.length > 0 &&
                    items.every((i) => selected[i.cartItemId])
                  }
                  indeterminate={
                    items.some((i) => selected[i.cartItemId]) &&
                    !items.every((i) => selected[i.cartItemId])
                  }
                  onChange={handleChangeCheckedAll}
                />
                <span className="font-medium">
                  Chọn tất cả ({items.length})
                </span>

                <button
                  onClick={handleDeleteSelected}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </label>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-center gap-4 border rounded-lg p-4"
                  >
                    <Checkbox
                      checked={selected[item.cartItemId] || false}
                      onChange={(e) =>
                        handleChangeChecked(item.cartItemId, e.target.checked)
                      }
                    />

                    <img
                      src={item.thumbnail}
                      alt={item.variantName}
                      className="w-20 h-20 object-cover rounded"
                    />

                    <div className="flex-1">
                      <p className="font-semibold">{item.variantName}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    </div>

                    <div className="text-red-600 font-semibold">
                      {formatPrice(item.sellPrice)}
                    </div>

                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => decreaseQty(item)}
                        disabled={item.quantity <= 1}
                        className="px-3"
                      >
                        -
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button onClick={() => increaseQty(item)} className="px-3">
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setDeleteTargetId(item.cartItemId);
                        setDeleteModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <IoTrashOutline size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-sm bg-white rounded-lg p-6 sticky top-20 h-fit">
              <h2 className="text-lg font-semibold mb-4">
                Thông tin đơn hàng
                {selectedItems.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({selectedItems.length} sản phẩm)
                  </span>
                )}
              </h2>

              {selectedItems.length > 0 && (
                <div className="mb-4 max-h-60 overflow-y-auto space-y-3">
                  {selectedItems.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex gap-3 border-b pb-2"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.variantName}
                        className="w-12 h-12 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">
                          {item.variantName}
                        </p>
                        <p className="text-xs text-gray-500">
                          SL: {item.quantity}
                        </p>
                      </div>
                      <div className="text-red-600 text-sm font-semibold">
                        {formatPrice(item.sellPrice * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3 flex justify-between text-lg font-semibold text-red-600">
                <span>Tổng tiền</span>
                <span>
                  {selectedItems.length > 0
                    ? formatPrice(selectedTotal)
                    : formatPrice(cartTotalPrice)}
                </span>
              </div>

              <button
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
                className="mt-6 w-full bg-[#0096FF] text-white py-3 rounded font-bold disabled:opacity-50"
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogContent>Bạn muốn xoá sản phẩm này khỏi giỏ hàng?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
      >
        <DialogContent>Bạn muốn xoá các sản phẩm đã chọn khỏi giỏ hàng?</DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteModalOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmBulkDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

            {/* Right content */}
            <div className="w-full max-w-sm bg-white rounded-lg p-6 sticky top-20 h-fit">
              <div>
                <h2 className="font-semibold text-lg mb-4">Thông tin đơn hàng</h2>

                <dl className="space-y-3">
                  <div className="flex justify-between border-b border-dashed border-gray-300 pb-1 font-semibold text-red-600 text-lg">
                    <dt>Tổng tiền</dt>
                    <dd>{formatPrice(selectedTotal)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="mt-6 w-full bg-[#0096FF] text-white font-bold py-3 rounded hover:bg-[#0096FF] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                >
                  Thanh toán ({selectedItems.length})
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
