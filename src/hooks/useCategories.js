import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryAvailability,
  uploadCategoryImage,
  uploadCategorySeoImage,
} from "../services/categoryService"

// the store id is part of the key, so switching stores loads that store's categories
export const useCategories = (storeId, params) =>
  useQuery({
    queryKey: ["categories", storeId, params],
    queryFn: async () => {
      const res = await getCategories(storeId, params)
      // adjust if your response nests the list differently
      return res.data?.categories ?? []
    },
    enabled: !!storeId,
  })

export const useCreateCategory = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ imageFile, seoImageFile, ...payload }) => {
      // upload first: create needs the image URLs
      const [image, seoImage] = await Promise.all([
        imageFile ? uploadCategoryImage(storeId, imageFile) : undefined,
        seoImageFile ? uploadCategorySeoImage(storeId, seoImageFile) : undefined,
      ])
      const res = await createCategory(storeId, {
        ...payload,
        ...(image ? { image } : {}),
        ...(seoImage ? { seoImage } : {}),
        isAvailable: payload.isAvailable ?? true,
      })
      return res.data?.category
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", storeId] }),
  })
}

export const useUpdateCategory = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryId, imageFile, seoImageFile, ...changes }) => {
      const [image, seoImage] = await Promise.all([
        imageFile ? uploadCategoryImage(storeId, imageFile) : undefined,
        seoImageFile ? uploadCategorySeoImage(storeId, seoImageFile) : undefined,
      ])
      const res = await updateCategory(storeId, categoryId, {
        ...changes,
        ...(image ? { image } : {}),
        ...(seoImage ? { seoImage } : {}),
      })
      return res.data?.category ?? res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", storeId] }),
  })
}

export const useDeleteCategory = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (categoryId) => deleteCategory(storeId, categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", storeId] }),
  })
}

export const useToggleCategoryAvailability = (storeId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (categoryId) => toggleCategoryAvailability(storeId, categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories", storeId] }),
  })
}