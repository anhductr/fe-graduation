import { api } from "../libs/axios";

export const getAllBanners = async () => {
    const response = await api.get("media-service/media/banner/get");
    return response.data;
};





