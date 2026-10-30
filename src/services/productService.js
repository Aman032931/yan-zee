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

// Shared image upload: POST (multipart) -> { success, data: { url } }
const uploadImage = async (path, file, storeId) => {
  if (!(file instanceof File)) {
    throw new Error("Please choose an image file.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await apiRequest(path, {
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

// Product gallery image.
export const uploadProductImage = (file, storeId) =>
  uploadImage("/images/products", file, storeId);

// Image used for the product's SEO preview.
export const uploadProductSeoImage = (file, storeId) =>
  uploadImage("/images/product-seo", file, storeId);

// Create a product (variants, tags, images...). -> { data: { product: { id, name, slug } } }
export const createProduct = (payload, storeId) =>
  apiRequest("/products", {
    method: "POST",
    body: payload,
    headers: storeHeaders(storeId),
  });

// General info: name, channel, audience, isAvailable, brandId, categoryIds,
// productDescription, longDescription, slug, imageUrls.
export const updateProduct = (id, payload, storeId) =>
  apiRequest(`/products/${id}/general`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  });

// Status: ACTIVE | DRAFT | OUT_OF_STOCK
export const updateProductStatus = (id, status, storeId) =>
  apiRequest(`/products/${id}/status`, {
    method: "PATCH",
    body: { status },
    headers: storeHeaders(storeId),
  });

// Custom data: tags, releaseDate, similarProductIds.
export const updateProductCustom = (id, payload, storeId) =>
  apiRequest(`/products/${id}/custom`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  });

// SEO: seoTitle, seoDescription, seoImage.
export const updateProductSeo = (id, payload, storeId) =>
  apiRequest(`/products/${id}/seo`, {
    method: "PATCH",
    body: payload,
    headers: storeHeaders(storeId),
  });

// Delete a product.
export const deleteProduct = (id, storeId) =>
  apiRequest(`/products/${id}`, {
    method: "DELETE",
    headers: storeHeaders(storeId),
  });

// TODO: updateProductInventory (PATCH /products/:id/inventory) once the 500 is fixed.