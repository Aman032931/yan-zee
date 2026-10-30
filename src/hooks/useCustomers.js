import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService"

// The list is cached per shop and per page/limit, so switching shops never
// shows another shop's customers.
export const useCustomers = (params, storeId) =>
  useQuery({
    queryKey: ["customers", storeId, params],
    queryFn: () => getCustomers(params, storeId),
    enabled: !!storeId,
    placeholderData: (previous) => previous, // keep old page visible while loading the next
  })

export const useCustomer = (id, storeId) =>
  useQuery({
    queryKey: ["customer", storeId, id],
    queryFn: () => getCustomerById(id, storeId),
    enabled: !!id && !!storeId,
  })

// Refresh every cached customers list for this shop.
const refreshList = (qc, storeId) =>
  qc.invalidateQueries({ queryKey: ["customers", storeId] })

export const useCreateCustomer = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => createCustomer(payload, storeId),
    onSuccess: () => refreshList(qc, storeId),
  })
}

export const useUpdateCustomer = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, changes }) => updateCustomer(id, changes, storeId),
    onSuccess: (_data, { id }) =>
      Promise.all([
        refreshList(qc, storeId),
        qc.invalidateQueries({ queryKey: ["customer", storeId, id] }),
      ]),
  })
}

export const useDeleteCustomer = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteCustomer(id, storeId),
    onSuccess: () => refreshList(qc, storeId),
  })
}