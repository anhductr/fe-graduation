import { api } from "../libs/axios";

class InventoryService {
  // 1. Lấy thông tin tồn kho theo SKU
  getInventoryBySku(sku) {
    return api.get(`/inventory-service/inventory/get`, { params: { sku } });
  }

  // 2. Kiểm tra sản phẩm còn hàng
  checkInStock(items) {
    return api.post(`/inventory-service/inventory/check-inStock`, { items });
  }

  // 3. Giảm tồn kho (Khi đặt hàng)
  decreaseStock({ sku, quantity, orderId }) {
    return api.post(`/inventory-service/inventory/decrease-stock`, {
      sku,
      quantity,
      orderId,
    });
  }

  // 4. Tăng tồn kho (Khi hoàn hàng)
  increaseStock({ sku, quantity, orderId }) {
    return api.post(`/inventory-service/inventory/increase-stock`, {
      sku,
      quantity,
      orderId,
    });
  }

  // 5. Lấy danh sách toàn bộ tồn kho (Có phân trang)
  getAllInventory({ page = 1, size = 10 } = {}) {
    return api.get(`/inventory-service/inventory/get-all`, {
      params: { page, size },
    });
  }

  // 6. Lấy lịch sử giao dịch tồn kho
  getTransactions({ sku, page = 1, size = 10 }) {
    return api.get(`/inventory-service/inventory/transactions`, {
      params: { sku, page, size },
    });
  }

  // 7. Tạo phiếu nhập hàng
  createStockIn(data) {
    return api.post(`/inventory-service/stock-in/create`, data);
  }

  // 8. Lấy thông tin phiếu nhập theo mã tham chiếu
  getStockInByReferenceCode(referenceCode) {
    return api.get(`/inventory-service/stock-in/get-by-referenceCode/${referenceCode}`);
  }

  // 9. Lấy lịch sử nhập hàng (Có lọc theo ngày)
  // params: { page, size, start, end }
  getStockInHistory(params) {
    return api.get(`/inventory-service/stock-in/get-history`, {
      params,
    });
  }

  // 10. Lấy thông tin phiếu nhập theo ID
  getStockInById(stockInId) {
    return api.get(`/inventory-service/stock-in/get-by-id/${stockInId}`);
  }

  // 11. Xóa phiếu nhập hàng
  deleteStockIn(referenceCode) {
    return api.delete(`/inventory-service/stock-in/delete/${referenceCode}`);
  }
}

export default new InventoryService();
