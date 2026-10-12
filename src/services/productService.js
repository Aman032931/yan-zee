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

const storeHeaders = (storeId) => {
  if (!storeId) {
    throw new Error("Please select a store before managing products.")
  }

  return { "x-store-id": String(storeId) }
}

// Public listing: this endpoint must exist in the backend
// before the homepage can use it.
export const getPublicProducts = (params) =>
  apiRequest(`/products/public${toQuery(params)}`, { auth: false })

// Seller operations: all require the selected store ID.
export const getMyProducts = (params, storeId) =>
  apiRequest(`/products${toQuery(params)}`, {
    headers: storeHeaders(storeId),
  })

export const getProductById = (id, storeId) =>
  apiRequest(`/products/${id}`, {
    headers: storeHeaders(storeId),
  })

export const createProduct = (payload, storeId) =>
  apiRequest("/products", {
    method: "POST",
    body: payload,
    headers: storeHeaders(storeId),
  })

export const updateProduct = (id, payload, storeId) =>
  apiRequest(`/products/${id}`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  })

export const deleteProduct = (id, storeId) =>
  apiRequest(`/products/${id}`, {
    method: "DELETE",
    headers: storeHeaders(storeId),
  })
