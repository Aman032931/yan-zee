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

// Every inventory call is scoped to the selected shop via x-store-id.
const storeHeaders = (storeId) => {
  if (!storeId) {
    throw new Error("Please select a store before managing inventory.")
  }
  return { "x-store-id": String(storeId) }
}

// These return the full API response ({ success, message, data }),
// which is what SellerInventory reads (response.data...).

// GET /inventory/overview
export const getInventoryOverview = ({ storeId, ...params } = {}) =>
  apiRequest(`/inventory/overview${toQuery(params)}`, {
    headers: storeHeaders(storeId),
  })

// GET /inventory/stock?page=1&limit=20
export const getInventoryStock = ({ storeId, ...params } = {}) =>
  apiRequest(`/inventory/stock${toQuery(params)}`, {
    headers: storeHeaders(storeId),
  })

// GET /inventory/items/:productId/batches
export const getProductBatches = ({ storeId, productId, ...params } = {}) => {
  if (!productId) throw new Error("Product id is required.")

  return apiRequest(`/inventory/items/${productId}/batches${toQuery(params)}`, {
    headers: storeHeaders(storeId),
  })
}

// GET /inventory/movements?page=1&limit=20
export const getInventoryMovements = ({ storeId, ...params } = {}) =>
  apiRequest(`/inventory/movements${toQuery(params)}`, {
    headers: storeHeaders(storeId),
  })

// POST /inventory/stock-in
// body: { outletId, referenceNumber?, supplierName?, note?,
//         items: [{ productId, variantId?, quantity, unitCost,
//                   supplierLot?, manufactureDate?, expiryDate? }] }
export const stockIn = (payload, storeId) =>
  apiRequest("/inventory/stock-in", {
    method: "POST",
    body: payload,
    headers: storeHeaders(storeId),
  })