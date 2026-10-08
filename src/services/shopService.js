import { apiRequest } from "./api";

export const uploadShopImage = (file) => {
  const formData = new FormData();

  formData.append("image", file);

  return apiRequest("/images/store", {
    method: "POST",
    body: formData,
    auth: true,
  });
};

export const createShop = (payload) =>
  apiRequest("/stores", {
    method: "POST",
    body: payload,
    auth: true,
  });

export const getMyShop = () =>
  apiRequest("/store", {
    method: "GET",
    auth: true,
  });
