import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../services/orderService";

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
  } = filters;

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
  });
};

export const useOrder = (storeId, orderId) =>
  useQuery({
    queryKey: ["order", storeId, orderId],
    queryFn: () => getOrderById(storeId, orderId),
    enabled: Boolean(storeId && orderId),
    staleTime: 30 * 1000,
  });

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, orderId, body }) =>
      updateOrderStatus(storeId, orderId, body),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.storeId],
      });

      queryClient.invalidateQueries({
        queryKey: ["order", variables.storeId, variables.orderId],
      });
    },
  });
};