import { api } from "../libs/axios";

class CategoryService {
    // Lấy danh sách tất cả category
    getAllCategories() {
        return api.get("/product-service/category/getAll");
    }

    // Xóa danh sách category
    deleteCateByListId(categories) {
        return api.delete("/product-service/category/list", {
            params: { categories: categories.join(",") },
        });
    }

    // Xóa tất cả category
    deleteAll() {
        return api.delete("/product-service/category/all");
    }

    // Xóa category theo ID
    deleteCate(cateId) {
        return api.delete(`/product-service/category/delete/${cateId}`);
    }
}

export default new CategoryService();
