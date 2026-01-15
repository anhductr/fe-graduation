import { api } from "../libs/axios";

class UserService {
    // Lấy danh sách sản phẩm (có phân trang)
    getAllUsers({ page = 1, size = 10 } = {}) {
        return api.get("/product-service/product/getAll", {
            params: { page, size },
        });
    }

    // Xóa sản phẩm theo ID
    deleteUser(productId) {
        return api.delete(`/product-service/product/${productId}`);
    }

    // Mở khóa người dùng 
    unlockUser(userId) {
        return api.put(`/product-service/product/${userId}`);
    }

    // Lấy thông tin id 
    getUserById(userId) {
        return api.get(`/profile-service/profile/admin?userId=${userId}`);
    }
}

export default new UserService();
