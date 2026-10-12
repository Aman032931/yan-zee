import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandLogo,
  toggleBrandAvailability,
} from "../services/brandService"

// the store id is part of the key, so switching stores loads that store's brands
export const useBrands = (storeId, params) =>
  useQuery({
    queryKey: ["brands", storeId, params],
    queryFn: () => getBrands(storeId, params),
    enabled: !!storeId,
  })

export const useCreateBrand = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ logoFile, ...payload }) => {
      // upload first: create needs the logo URL
      const logo = logoFile ? await uploadBrandLogo(storeId, logoFile) : undefined
      return createBrand(storeId, {
        ...payload,
        ...(logo ? { logo } : {}),
        isAvailable: payload.isAvailable ?? true,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands", storeId] }),
  })
}

export const useUpdateBrand = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ brandId, logoFile, ...changes }) => {
      const logo = logoFile ? await uploadBrandLogo(storeId, logoFile) : undefined
      return updateBrand(storeId, brandId, {
        ...changes,
        ...(logo ? { logo } : {}),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands", storeId] }),
  })
}

export const useDeleteBrand = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (brandId) => deleteBrand(storeId, brandId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands", storeId] }),
  })
}

export const useToggleBrandAvailability = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (brandId) => toggleBrandAvailability(storeId, brandId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brands", storeId] }),
  })
}