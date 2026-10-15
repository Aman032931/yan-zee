import { apiRequest } from "./api"

const storeHeaders = (storeId) => {
  if (!storeId) {
    throw new Error("Please select a store before managing outlets.")
  }

  return { "x-store-id": String(storeId) }
}

// GET /outlets?page=1&limit=100 -> { data: { outlets: [...], pagination } }
export const getOutlets = async (storeId, { page = 1, limit = 100 } = {}) => {
  const res = await apiRequest(`/outlets?page=${page}&limit=${limit}`, {
    headers: storeHeaders(storeId),
  })
  return res.data?.outlets ?? []
}

// GET /outlets/:id -> { data: { outlet } }
export const getOutletById = async (storeId, outletId) => {
  const res = await apiRequest(`/outlets/${outletId}`, {
    headers: storeHeaders(storeId),
  })
  return res.data.outlet
}

// POST /outlets  { name, address, contactPerson, contactPhone } -> { data: { outlet: { id, name } } }
export const createOutlet = async (storeId, payload) => {
  const res = await apiRequest("/outlets", {
    method: "POST",
    body: payload,
    headers: storeHeaders(storeId),
  })
  return res.data.outlet
}

// PATCH /outlets/:id  (partial body) -> { data: { outlet: { id, name } } }
export const updateOutlet = async (storeId, outletId, changes) => {
  const res = await apiRequest(`/outlets/${outletId}`, {
    method: "PATCH",
    body: changes,
    headers: storeHeaders(storeId),
  })
  return res.data.outlet
}

// PATCH /outlets/:id/toggle-status -> { data: { outlet: { id, name, isActive } } }
export const toggleOutletStatus = async (storeId, outletId) => {
  const res = await apiRequest(`/outlets/${outletId}/toggle-status`, {
    method: "PATCH",
    headers: storeHeaders(storeId),
  })
  return res.data.outlet
}

// DELETE /outlets/:id -> { data: { deletedOutlet: { id, name } } }
export const deleteOutlet = async (storeId, outletId) => {
  const res = await apiRequest(`/outlets/${outletId}`, {
    method: "DELETE",
    headers: storeHeaders(storeId),
  })
  return res.data.deletedOutlet
}