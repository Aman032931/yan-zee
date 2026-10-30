import { useQuery } from "@tanstack/react-query"
import {
  getInventoryStock,
  getInventoryMovements,
} from "../services/inventoryService"

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
      getInventoryStock({
        storeId,
        page,
        limit,
        search,
        status,
        outletId,
      }),
    enabled: Boolean(storeId),
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
      getInventoryMovements({
        storeId,
        page,
        limit,
        outletId,
        type,
        from,
        to,
      }),
    enabled: Boolean(storeId),
    staleTime: 30 * 1000,
  })
}
