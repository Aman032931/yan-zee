import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getOutlets,
  createOutlet,
  updateOutlet,
  deleteOutlet,
  toggleOutletStatus,
} from "../services/outletService"

// the store id is part of the key, so switching stores loads that store's outlets
export const useOutlets = (storeId, params) =>
  useQuery({
    queryKey: ["outlets", storeId, params],
    queryFn: () => getOutlets(storeId, params),
    enabled: !!storeId,
  })

export const useCreateOutlet = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => createOutlet(storeId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outlets", storeId] }),
  })
}

export const useUpdateOutlet = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ outletId, ...changes }) =>
      updateOutlet(storeId, outletId, changes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outlets", storeId] }),
  })
}

export const useDeleteOutlet = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (outletId) => deleteOutlet(storeId, outletId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outlets", storeId] }),
  })
}

export const useToggleOutletStatus = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (outletId) => toggleOutletStatus(storeId, outletId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outlets", storeId] }),
  })
}