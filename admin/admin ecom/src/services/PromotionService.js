import { api } from "../libs/axios";

class PromotionService {
    createPromotion(data) {
        return api.post("/promotion-service/promotion/create", data);
    }

    updatePromotion(data) {
        return api.put("/promotion-service/promotion/update", data);
    }

    getPromotionById(promotionId) {
        return api.get(`/promotion-service/promotion/getPromotion/${promotionId}`);
    }

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

    getAllAutoPromotions({ page = 1, size = 10 } = {}) {
        return api.get("/promotion-service/promotion/auto/getAll", {
            params: { page, size }
        });
    }

    getAllFlashSales({ page = 1, size = 10 } = {}) {
        return api.get("/promotion-service/promotion/flash-sale/getAll", {
            params: { page, size }
        });
    }

    deletePromotion(promotionId) {
        return api.delete(`/promotion-service/promotion/delete/${promotionId}`);
    }

    // API mới: Tạo Flash Sale (đồng bộ với backend Java)
    createFlashSale(data) {
        return api.post("/promotion-service/promotion/flashSale", data);
    }

    /**
     * Tạo mới Promotion Campaign
     * @param {Object} data - PromotionCampaignRequest
     */
    createCampaign(data) {
        return api.post("/promotion-service/campaign", data);
    }

    /**
     * Cập nhật Promotion Campaign
     * @param {Object} data - PromotionCampaignRequest (thường chứa id)
     */
    updateCampaign(data) {
        return api.put("/promotion-service/campaign", data);
    }

    /**
     * Lấy danh sách tất cả Promotion Campaigns
     * @returns {Promise} ApiResponse<List<PromotionCampaignResponse>>
     */
    getAllCampaigns() {
        return api.get("/promotion-service/campaign");
    }

    /**
     * Xóa một Promotion Campaign theo ID
     * @param {string} id - ID của campaign
     */
    deleteCampaignById(id) {
        return api.delete("/promotion-service/campaign/id", {
            params: { id }
        });
    }

    /**
     * Xóa TẤT CẢ Promotion Campaigns
     * CẢNH BÁO: API này rất mạnh, nên có confirm 2 lớp ở frontend!
     */
    deleteAllCampaigns() {
        return api.delete("/promotion-service/campaign/all");
    }

    /**
     * Delete media by ownerId (for Campaign banner cleanup)
     * @param {string} ownerId - ID of the owner (campaign ID)
     * @param {string} mediaOwnerType - Type of media owner (e.g., "CAMPAIGN")
     */
    deleteMediaByOwnerId(ownerId, mediaOwnerType) {
        return api.delete("/media-service/media/delete/ownerId", {
            data: {
                ownerId,
                mediaOwnerType
            }
        });
    }

    /**
     * Get all banners
     * @returns {Promise} ApiResponse<List<BannerResponse>>
     */
    getAllBanners() {
        return api.get("/media-service/media/banner/get");
    }

    /**
     * Delete media by URL
     * @param {string} url - URL of the media to delete
     */
    deleteMediaByUrl(url) {
        return api.delete("/media-service/media/delete/url", {
            data: { url }
        });
    }

}

export default new PromotionService();
