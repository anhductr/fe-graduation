import { api } from "../libs/axios";

class BannerService {
    // Create a new banner
    // Create a new banner
    createBanner(formData) {
        return api.post("/media-service/media/banner", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }

    // Get all banners
    getAllBanners() {
        return api.get("/media-service/media/banner/get");
    }
}

export default new BannerService();
