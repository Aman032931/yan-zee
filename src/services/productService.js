import { apiRequest } from "./api"

const toQuery = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value)
    }
  })
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

// ---------- public (no login) ----------
// params: { page, limit, search, category, minPrice, maxPrice }
export const getPublicProducts = (params) =>
  apiRequest(`/products/public${toQuery(params)}`, { auth: false })

// ---------- seller (logged in as SHOP_OWNER) ----------
export const getMyProducts = (params) =>
  apiRequest(`/products${toQuery(params)}`)

export const getProductById = (id) => apiRequest(`/products/${id}`)

export const createProduct = (payload) =>
  apiRequest("/products", { method: "POST", body: payload })

export const updateProduct = (id, payload) =>
  apiRequest(`/products/${id}`, { method: "PATCH", body: payload })

export const deleteProduct = (id) =>
  apiRequest(`/products/${id}`, { method: "DELETE" })
