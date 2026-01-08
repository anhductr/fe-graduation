import { api } from "../libs/axios";

class PromotionService {
    // 1. Create Promotion
    createPromotion(data) {
        return api.post("/promotion-service/promotion/create", data);
    }

    // 2. Update Promotion
    updatePromotion(data) {
        return api.put("/promotion-service/promotion/update", data);
    }

    // 3. Get Promotion by ID
    getPromotionById(promotionId) {
        return api.get(`/promotion-service/promotion/getPromotion/${promotionId}`);
    }

    // 4. Get All Promotions (Auto promotions) -> Wait, the user said "Get All (Auto promotions)" but typical admin list usually gets ALL.
    // However, looking at PromotionList, it fetches ALL. 
    // The API doc says: 
    // 4) Get All (Auto promotions) -> /promotion/getAll
    // 5) Get All Vouchers (paged) -> /promotion/voucher/getAll
    // Let's stick to what the List page likely needs. The List page shows both?
    // In the current code `PromotionList.jsx` it just calls `/api/v1/promotion-service/promotion/getAll`.
    // I will expose both methods just in case.
    
    getAllPromotions({ page = 1, size = 10 } = {}) {
        return api.get("/promotion-service/promotion/getAll", {
            params: { page, size }
        });
    }

    getAllVouchers({ page = 1, size = 10 } = {}) {
        return api.get("/promotion-service/promotion/voucher/getAll", {
            params: { page, size }
        });
    }

    // 6. Delete Promotion
    deletePromotion(promotionId) {
        return api.delete(`/promotion-service/promotion/delete/${promotionId}`);
    }
}

export default new PromotionService();
