import { apiRequest } from "./api"

// Every customer endpoint is scoped to the selected shop via x-store-id.
const storeHeaders = (storeId) => {
  if (!storeId) {
    throw new Error("Please select a store before managing customers.")
  }
  return { "x-store-id": String(storeId) }
}

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

// GET /customers?page=1&limit=10
// returns the whole `data` object: { customers: [...], ...any pagination info }
export const getCustomers = async (params, storeId) => {
  try {
    const res = await apiRequest(`/customers${toQuery(params)}`, {
      headers: storeHeaders(storeId),
    })
    return res.data ?? { customers: [] }
  } catch (err) {
    if (err.status === 404) return { customers: [] } // shop has no customers yet
    throw err
  }
}

// GET /customers/:id -> { id, name, phone, email, createdAt }
export const getCustomerById = async (id, storeId) => {
  const res = await apiRequest(`/customers/${id}`, {
    headers: storeHeaders(storeId),
  })
  return res.data
}

// POST /customers  body: { name, phone, email } -> { id, name }
export const createCustomer = async (payload, storeId) => {
  const res = await apiRequest("/customers", {
    method: "POST",
    body: payload,
    headers: storeHeaders(storeId),
  })
  return res.data
}

// PATCH /customers/:id  body: any of { name, phone, email } -> { id, name }
export const updateCustomer = async (id, changes, storeId) => {
  const res = await apiRequest(`/customers/${id}`, {
    method: "PATCH",
    body: changes,
    headers: storeHeaders(storeId),
  })
  return res.data
}

// DELETE /customers/:id -> { id, name }
export const deleteCustomer = async (id, storeId) => {
  const res = await apiRequest(`/customers/${id}`, {
    method: "DELETE",
    headers: storeHeaders(storeId),
  })
  return res.data
}