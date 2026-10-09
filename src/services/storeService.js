import { apiRequest } from "./api"

export const STORE_CATEGORIES = [
  "GENERAL", "FASHION", "BEAUTY", "ELECTRONICS", "GROCERY", "PHARMACY",
  "PET_SUPPLIES", "SPORTS", "RESTAURANTS", "HOME_DECOR", "OTHER",
]

const storeHeader = (storeId) => ({ "x-store-id": storeId })

// the owner's own stores; an owner with no stores yet gets []
export const getMyStores = async () => {
  try {
    const res = await apiRequest("/stores")
    return res.data?.stores ?? []
  } catch (err) {
    if (err.status === 404) return []
    throw err
  }
}

export const getStoreById = async (id) => {
  const res = await apiRequest(`/stores/${id}`)
  return res.data.store
}

export const createStore = async (payload) => {
  const res = await apiRequest("/stores", { method: "POST", body: payload })
  return res.data.store // { id, name, slug }
}

export const updateStore = async (storeId, changes) => {
  const res = await apiRequest("/stores", {
    method: "PATCH",
    body: changes,
    headers: storeHeader(storeId),
  })
  return res.data.updatedStore
}

export const deleteStore = async (storeId) => {
  const res = await apiRequest("/stores", {
    method: "DELETE",
    headers: storeHeader(storeId),
  })
  return res.data.deletedStore
}

export const uploadStoreLogo = async (storeId, file) => {
  const form = new FormData()
  form.append("image", file)
  const res = await apiRequest("/images/store-logo", {
    method: "POST",
    body: form,
    headers: storeHeader(storeId),
  })
  return res.data.store // { id, name, slug, logo }
}

export const toggleStorePublish = async (storeId) => {
  const res = await apiRequest("/stores/toggle-publish", {
    method: "POST",
    headers: storeHeader(storeId),
  })
  return res.data.updatedStore // { id, name, isPublished, updatedAt }
}