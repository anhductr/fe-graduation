import { api } from "../libs/axios";

class BrandService {
    // Lấy danh sách tất cả brand
    getAllBrands() {
        return api.get("/product-service/brand/get-all");
    }

    // Xóa danh sách brand
    deleteList(brands) {
        return api.delete("/product-service/brand/list", {
            params: { brands: brands.join(",") },
        });
    }

    // Xóa tất cả brand
    deleteAll() {
        return api.delete("/product-service/brand/all");
    }

    // Xóa brand theo tên
    deleteBrand(brandName) {
        return api.delete(`/product-service/brand/delete/${brandName}`);
    }
}

export default new BrandService();
