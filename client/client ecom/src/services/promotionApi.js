import axiosClient from "./axiosClient";

export const promotionApi = {
  getVouchers: (params) =>
    axiosClient.get("/promotion-service/promotion/voucher", { params }),
};