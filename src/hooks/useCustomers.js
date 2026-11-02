
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService"

export const useCustomers = (params, storeId) =>
  useQuery({
    queryKey: ["customers", storeId, params],
    queryFn: () => getCustomers(params, storeId),
    enabled: Boolean(storeId),
  })

export const useCustomer = (id, storeId) =>
  useQuery({
    queryKey: ["customer", storeId, id],
    queryFn: () => getCustomerById(id, storeId),
    enabled: Boolean(id && storeId),
  })

const refreshList = (queryClient, storeId) =>
  queryClient.invalidateQueries({
    queryKey: ["customers", storeId],
  })

export const useCreateCustomer = (storeId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => createCustomer(payload, storeId),
    onSuccess: () => refreshList(queryClient, storeId),
  })
}

export const useUpdateCustomer = (storeId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, changes }) =>
      updateCustomer(id, changes, storeId),

    onSuccess: (_data, { id }) =>
      Promise.all([
        refreshList(queryClient, storeId),
        queryClient.invalidateQueries({
          queryKey: ["customer", storeId, id],
        }),
      ]),
  })
}

export const useDeleteCustomer = (storeId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => deleteCustomer(id, storeId),
    onSuccess: () => refreshList(queryClient, storeId),
  })
}
