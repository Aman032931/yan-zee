
import { apiRequest } from "./api";

const toQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

const storeHeaders = (storeId) => {
  if (!storeId) {
    throw new Error("Please select a store before managing products.");
  }

  return { "x-store-id": String(storeId) };
};

// Public product listing.
export const getPublicProducts = (params) =>
  apiRequest(`/products/public${toQuery(params)}`, {
    auth: false,
  });

// Seller product operations.
export const getMyProducts = (params, storeId) =>
  apiRequest(`/products${toQuery(params)}`, {
    headers: storeHeaders(storeId),
  });

export const getProductById = (id, storeId) =>
  apiRequest(`/products/${id}`, {
    headers: storeHeaders(storeId),
  });

// Upload a product image.
export const uploadProductImage = async (file, storeId) => {
  if (!(file instanceof File)) {
    throw new Error("Please choose an image file.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await apiRequest("/images/products", {
    method: "POST",
    body: formData,
    headers: storeHeaders(storeId),
  });

  if (response?.success !== true || !response?.data?.url) {
    throw new Error(
      response?.error?.message ||
        response?.message ||
        "Image upload failed. Please try again."
    );
  }

  return response;
};

// Create a product.
export const createProduct = (payload, storeId) =>
  apiRequest("/products", {
    method: "POST",
    body: payload,
    headers: storeHeaders(storeId),
  });

// Update general product details.
export const updateProductGeneral = (id, payload, storeId) =>
  apiRequest(`/products/${id}/general`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  });

// Update price, quantity, weight and inventory-related fields.
export const updateProductInventory = (id, payload, storeId) =>
  apiRequest(`/products/${id}/inventory`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  });

// Update product status separately.
export const updateProductStatus = (id, status, storeId) => {
  const validStatuses = ["ACTIVE", "DRAFT", "ARCHIVED"];

  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid product status "${status}". Use ACTIVE, DRAFT or ARCHIVED.`
    );
  }

  return apiRequest(`/products/${id}/status`, {
    method: "PATCH",
    body: { status },
    headers: storeHeaders(storeId),
  });
};

// Keep the existing updateProduct export for compatibility.
export const updateProduct = (id, payload, storeId) =>
  updateProductGeneral(id, payload, storeId);

// Delete a product.
export const deleteProduct = (id, storeId) =>
  apiRequest(`/products/${id}`, {
    method: "DELETE",
    headers: storeHeaders(storeId),
  });
