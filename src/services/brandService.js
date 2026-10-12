import { apiRequest } from "./api"

const storeHeader = (storeId) => ({ "x-store-id": storeId })

// GET /brands?page=1&limit=20 -> { data: { brands: [...] } }
export const getBrands = async (storeId, { page = 1, limit = 20 } = {}) => {
  const res = await apiRequest(`/brands?page=${page}&limit=${limit}`, {
    headers: storeHeader(storeId),
  })
  return res.data?.brands ?? []
}

// POST /images/brands (multipart) -> { data: { url } }
// Uploads to a temp location; the URL is then sent in create/update.
export const uploadBrandLogo = async (storeId, file) => {
  const form = new FormData()
  form.append("image", file) // confirm this field name in the Postman Body tab
  const res = await apiRequest("/images/brands", {
    method: "POST",
    body: form,
    headers: storeHeader(storeId),
  })
  return res.data.url
}

// POST /brands  { name, logo, isAvailable } -> { data: { brand: { id, name, slug } } }
export const createBrand = async (storeId, payload) => {
  const res = await apiRequest("/brands", {
    method: "POST",
    body: payload,
    headers: storeHeader(storeId),
  })
  return res.data.brand
}

// PATCH /brands/:id
export const updateBrand = async (storeId, brandId, changes) => {
  const res = await apiRequest(`/brands/${brandId}`, {
    method: "PATCH",
    body: changes,
    headers: storeHeader(storeId),
  })
  return res.data?.brand ?? res.data
}

// DELETE /brands/:id
export const deleteBrand = async (storeId, brandId) => {
  const res = await apiRequest(`/brands/${brandId}`, {
    method: "DELETE",
    headers: storeHeader(storeId),
  })
  return res.data
}

// POST /brands/:id/toggle-availability
export const toggleBrandAvailability = async (storeId, brandId) => {
  const res = await apiRequest(`/brands/${brandId}/toggle-availability`, {
    method: "POST",
    headers: storeHeader(storeId),
  })
  return res.data?.brand ?? res.data
}