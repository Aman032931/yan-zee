import { apiRequest } from "./api"

const buildParams = ({ page = 1, limit = 20, search = "", status = "", outletId = "" } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (search.trim()) params.set("search", search.trim())
  if (status) params.set("status", status)
  if (outletId) params.set("outletId", outletId)

  return params.toString()
}

export const getInventoryStock = ({
  storeId,
  page = 1,
  limit = 20,
  search = "",
  status = "",
  outletId = "",
} = {}) => {
  if (!storeId) {
    throw new Error("Please select a store first.")
  }

  const params = buildParams({ page, limit, search, status, outletId })

  return apiRequest(`/inventory/stock?${params}`, {
    method: "GET",
    headers: {
      "x-store-id": storeId,
    },
  })
}

export const getInventoryMovements = ({
  storeId,
  page = 1,
  limit = 20,
  outletId = "",
  type = "",
  from = "",
  to = "",
} = {}) => {
  if (!storeId) {
    throw new Error("Please select a store first.")
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (outletId) params.set("outletId", outletId)
  if (type) params.set("type", type)
  if (from) params.set("from", from)
  if (to) params.set("to", to)

  return apiRequest(`/inventory/movements?${params.toString()}`, {
    method: "GET",
    headers: {
      "x-store-id": storeId,
    },
  })
}

export const getProductInventoryBatches = ({
  storeId,
  productId,
  page = 1,
  limit = 20,
  variantId = "",
} = {}) => {
  if (!storeId) throw new Error("Please select a store first.")
  if (!productId) throw new Error("Product ID is required.")

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (variantId) params.set("variantId", variantId)

  return apiRequest(
    `/inventory/items/${encodeURIComponent(productId)}/batches?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "x-store-id": storeId,
      },
    }
  )
}

export const stockInInventory = (storeId, body) => {
  if (!storeId) throw new Error("Please select a store first.")

  return apiRequest("/inventory/stock-in", {
    method: "POST",
    body,
    headers: {
      "x-store-id": storeId,
    },
  })
}