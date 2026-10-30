
import { useQuery } from "@tanstack/react-query"
import { getOrders } from "../services/orderService"

export const useOrders = (filters = {}) => {
  const {
    storeId,
    page = 1,
    limit = 20,
    search = "",
    status = "",
    channel = "",
    from = "",
    to = "",
  } = filters

  return useQuery({
    queryKey: [
      "orders",
      storeId,
      page,
      limit,
      search,
      status,
      channel,
      from,
      to,
    ],
    queryFn: () =>
      getOrders({
        storeId,
        page,
        limit,
        search,
        status,
        channel,
        from,
        to,
      }),
    enabled: Boolean(storeId),
    staleTime: 30 * 1000,
  })
}
