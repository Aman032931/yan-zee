
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

// Public product listing.
export const getPublicProducts = (params) =>
  apiRequest(`/products/public${toQuery(params)}`, {
    auth: false,
  })

// Seller product operations.
export const getMyProducts = (params, storeId) =>
  apiRequest(`/products${toQuery(params)}`, {
    headers: storeHeaders(storeId),
  })

export const getProductById = (id, storeId) =>
  apiRequest(`/products/${id}`, {
    headers: storeHeaders(storeId),
  })

// Shared image upload.
const uploadImage = async (path, file, storeId) => {
  if (!(file instanceof File)) {
    throw new Error("Please choose an image file.")
  }

  const formData = new FormData()
  formData.append("image", file)

  const response = await apiRequest(path, {
    method: "POST",
    body: formData,
    headers: storeHeaders(storeId),
  })

  if (response?.success !== true || !response?.data?.url) {
    throw new Error(
      response?.error?.message ||
        response?.message ||
        "Image upload failed. Please try again."
    )
  }

  return response
}

// Product gallery image.
export const uploadProductImage = (file, storeId) =>
  uploadImage("/images/products", file, storeId)

// Product SEO preview image.
export const uploadProductSeoImage = (file, storeId) =>
  uploadImage("/images/product-seo", file, storeId)

// Create a product.
export const createProduct = (payload, storeId) =>
  apiRequest("/products", {
    method: "POST",
    body: payload,
    headers: storeHeaders(storeId),
  })

// Update general product details.
export const updateProduct = (id, payload, storeId) =>
  apiRequest(`/products/${id}/general`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  })

// Compatibility alias for existing code.
export const updateProductGeneral = (id, payload, storeId) =>
  updateProduct(id, payload, storeId)

// Inventory update.
export const updateProductInventory = (id, payload, storeId) =>
  apiRequest(`/products/${id}/inventory`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  })

// Product status.
export const updateProductStatus = (id, status, storeId) =>
  apiRequest(`/products/${id}/status`, {
    method: "PATCH",
    body: { status },
    headers: storeHeaders(storeId),
  })

// Custom product data.
export const updateProductCustom = (id, payload, storeId) =>
  apiRequest(`/products/${id}/custom`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  })

// SEO data.
export const updateProductSeo = (id, payload, storeId) =>
  apiRequest(`/products/${id}/seo`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  })

// Delete a product.
export const deleteProduct = (id, storeId) =>
  apiRequest(`/products/${id}`, {
    method: "DELETE",
    headers: storeHeaders(storeId),
  })
