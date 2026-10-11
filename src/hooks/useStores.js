import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getMyStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  uploadStoreLogo,
  toggleStorePublish,
} from "../services/storeService"

export const useMyStores = () =>
  useQuery({ queryKey: ["stores"], queryFn: getMyStores })

export const useStore = (id) =>
  useQuery({
    queryKey: ["store", id],
    queryFn: () => getStoreById(id),
    enabled: !!id,
  })

export const useCreateStore = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ logoFile, ...payload }) => {
      const store = await createStore(payload)
      if (!logoFile) return store
      try {
        return await uploadStoreLogo(store.id, logoFile)
      } catch {
        return store // the store exists even if the logo failed
      }
    },
    // returning the promise makes the mutation wait for the refreshed list
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  })
}

export const useUpdateStore = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ storeId, changes }) => updateStore(storeId, changes),
    onSuccess: (_data, { storeId }) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["stores"] }),
        qc.invalidateQueries({ queryKey: ["store", storeId] }),
      ]),
  })
}

export const useDeleteStore = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteStore,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  })
}

export const useUploadStoreLogo = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ storeId, file }) => uploadStoreLogo(storeId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  })
}

export const useToggleStorePublish = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleStorePublish,
    onSuccess: (_data, storeId) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ["stores"] }),
        qc.invalidateQueries({ queryKey: ["store", storeId] }),
      ]),
  })
}
