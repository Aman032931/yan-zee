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

// Get all stores owned by the logged-in shop owner
export const useMyStores = () =>
  useQuery({
    queryKey: ["stores"],
    queryFn: getMyStores,
  })

// Get a single store
export const useStore = (id) =>
  useQuery({
    queryKey: ["store", id],
    queryFn: () => getStoreById(id),
    enabled: !!id,
  })

// Create store
export const useCreateStore = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ logoFile, ...payload }) => {
      const store = await createStore(payload)

      if (!logoFile) return store

      try {
        return await uploadStoreLogo(store.id, logoFile)
      } catch {
        // Store exists even if logo upload fails
        return store
      }
    },

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["stores"],
      }),
  })
}

// Update store details
export const useUpdateStore = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ storeId, changes }) =>
      updateStore(storeId, changes),

    onSuccess: (_data, { storeId }) =>
      Promise.all([
        qc.invalidateQueries({
          queryKey: ["stores"],
        }),
        qc.invalidateQueries({
          queryKey: ["store", storeId],
        }),
      ]),
  })
}

// Delete store
export const useDeleteStore = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteStore,

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["stores"],
      }),
  })
}

// Upload store logo
export const useUploadStoreLogo = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ storeId, file }) =>
      uploadStoreLogo(storeId, file),

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["stores"],
      }),
  })
}

// Publish / Unpublish store
export const useToggleStorePublish = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: toggleStorePublish,

    onSuccess: async (updatedStore, storeId) => {
      // Handle the store returned by the API.
      if (
        updatedStore &&
        updatedStore.id === storeId &&
        typeof updatedStore.isPublished === "boolean"
      ) {
        // Update the individual store cache.
        qc.setQueryData(["store", storeId], (old) => ({
          ...(old ?? {}),
          ...updatedStore,
        }))

        // Update the selected store in the stores list.
        qc.setQueryData(["stores"], (old) => {
          if (!Array.isArray(old)) return old

          return old.map((store) =>
            store.id === storeId
              ? { ...store, ...updatedStore }
              : store
          )
        })
      }

      // Fetch the latest values from the backend.
      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["stores"],
        }),
        qc.invalidateQueries({
          queryKey: ["store", storeId],
        }),
      ])
    },
  })
}