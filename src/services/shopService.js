import { apiRequest } from "./api";

export const createShop = async (payload) => {
  const res = await apiRequest("/shops", { method: "POST", body: payload });
  return res.data.shop;
};

// Resolves to the shop, or null if this owner has no shop yet.
export const getMyShop = async () => {
  try {
    const res = await apiRequest("/shops/my");
    return res.data?.shop ?? null;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
};