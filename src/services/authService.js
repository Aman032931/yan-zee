import { apiRequest } from "./api"

export const registerUser = (payload) =>
  apiRequest("/auth/register", { method: "POST", body: payload, auth: false })

export const loginUser = async (credentials) => {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
    auth: false,
  })
  return res.data // { accessToken, refreshToken, user }
}

export const logoutUser = () =>
  apiRequest("/auth/logout", {
    method: "POST",
    body: { refreshToken: localStorage.getItem("yanzee_refresh_token") },
  })

export const getMe = async () => {
  const res = await apiRequest("/auth/me")
  return res.data // the user itself: { id, email, fullName, phone, profileImg, isActive, role }
}
