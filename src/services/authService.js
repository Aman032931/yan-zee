import { apiRequest } from "./api";

export const registerUser = (payload) =>
  apiRequest("/auth/register", { method: "POST", body: payload, auth: false });

export const loginUser = async (credentials) => {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
  });
  return res.data; // { accessToken, refreshToken, user }
};

export const logoutUser = () =>
  apiRequest("/auth/logout", {
    method: "POST",
    body: { refreshToken: localStorage.getItem("yanzee_refresh_token") },
  });