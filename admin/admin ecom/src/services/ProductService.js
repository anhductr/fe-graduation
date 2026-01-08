import { api } from "../libs/axios";

class ProductService {
  // Lấy danh sách sản phẩm (có phân trang)
  getAllProducts({ page = 1, size = 10 } = {}) {
    return api.get("/product-service/product/getAll", {
      params: { page, size },
    });
  }

  // Xóa sản phẩm theo ID
  deleteProduct(productId) {
    return api.delete(`/product-service/product/${productId}`);
  }

  // Lấy danh sách tất cả category
  getAllCategories() {
    return api.get("/product-service/category/getAll");
  }
}

export default new ProductService();
