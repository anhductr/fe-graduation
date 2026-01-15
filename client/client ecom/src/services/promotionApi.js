import { api } from "../libs/axios";

export const promotionApi = {
  getVouchers({ skus, totalAmount, today }) {
    const query =
      `?skus=${encodeURIComponent(skus.join(","))}` +
      `&totalAmount=${totalAmount}` +
      `&today=${today}`;

    const url = `/promotion-service/promotion/voucher${query}`;

    console.log(" [promotionApi] GET", url);

    return api.get(url);
  },
};