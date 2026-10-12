import { apiRequest } from "./api"

const toQuery = (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value)
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ""
}

const storeHeaders = (storeId) => {
  if (!storeId) {
    throw new Error("Store ID is missing. Please load your shop first.")
  }

  return {
    "x-store-id": storeId,
  }
}

export const getCategories = (storeId, params = {}) =>
  apiRequest(`/categories${toQuery(params)}`, {
    headers: storeHeaders(storeId),
  })

export const createCategory = (storeId, payload) =>
  apiRequest("/categories", {
    method: "POST",
    body: payload,
    headers: storeHeaders(storeId),
  })

export const updateCategory = (storeId, id, payload) =>
  apiRequest(`/categories/${id}`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  })

export const deleteCategory = (storeId, id) =>
  apiRequest(`/categories/${id}`, {
    method: "DELETE",
    headers: storeHeaders(storeId),
  })

export const toggleCategoryAvailability = (storeId, id) =>
  apiRequest(`/categories/${id}/toggle-availability`, {
    method: "POST",
    headers: storeHeaders(storeId),
  })

// POST /images/categories (multipart) -> { data: { url } }
// Same pattern as brands: uploads to a temp location, the URL is then sent
// in create/update. The endpoint path and "image" field are guessed from the
// brand upload; confirm both in Postman (upload category image).
export const uploadCategoryImage = async (storeId, file) => {
  const form = new FormData()
  form.append("image", file)

  const res = await apiRequest("/images/categories", {
    method: "POST",
    body: form,
    headers: storeHeaders(storeId),
  })

  return res.data.url
}
