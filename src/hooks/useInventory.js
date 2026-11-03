import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getInventoryOverview,
  getInventoryStock,
  getProductBatches,
  getInventoryMovements,
  stockIn,
} from "../services/inventoryService"

export const useInventoryOverview = (filters = {}) => {
  const { storeId, outletId = "" } = filters

  return useQuery({
    queryKey: ["inventory-overview", storeId, outletId],
    queryFn: () => getInventoryOverview({ storeId, outletId }),
    enabled: Boolean(storeId),
    staleTime: 30 * 1000,
  })
}

export const useInventoryStock = (filters = {}) => {
  const {
    storeId,
    page = 1,
    limit = 20,
    search = "",
    status = "",
    outletId = "",
  } = filters

  return useQuery({
    queryKey: [
      "inventory-stock",
      storeId,
      page,
      limit,
      search,
      status,
      outletId,
    ],
    queryFn: () =>
      getInventoryStock({ storeId, page, limit, search, status, outletId }),
    enabled: Boolean(storeId),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  })
}

export const useProductBatches = (filters = {}) => {
  const { storeId, productId, page = 1, limit = 20 } = filters

  return useQuery({
    queryKey: ["inventory-batches", storeId, productId, page, limit],
    queryFn: () => getProductBatches({ storeId, productId, page, limit }),
    enabled: Boolean(storeId && productId),
    staleTime: 30 * 1000,
  })
}

export const useInventoryMovements = (filters = {}) => {
  const {
    storeId,
    page = 1,
    limit = 20,
    outletId = "",
    type = "",
    from = "",
    to = "",
  } = filters

  return useQuery({
    queryKey: [
      "inventory-movements",
      storeId,
      page,
      limit,
      outletId,
      type,
      from,
      to,
    ],
    queryFn: () =>
      getInventoryMovements({ storeId, page, limit, outletId, type, from, to }),
    enabled: Boolean(storeId),
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  })
}

// Adding stock changes the overview, stock list, batches, movement history
// and the stock shown on the products list, so refresh all of them.
export const useStockIn = (storeId) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload) => stockIn(payload, storeId),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["inventory-overview", storeId] }),
        qc.invalidateQueries({ queryKey: ["inventory-stock", storeId] }),
        qc.invalidateQueries({ queryKey: ["inventory-batches", storeId] }),
        qc.invalidateQueries({ queryKey: ["inventory-movements", storeId] }),
        qc.invalidateQueries({ queryKey: ["managedProducts", storeId] }),
      ]),
  })
}