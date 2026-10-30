
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMyProducts,
  getProductById,
  createProduct,
  updateProductGeneral,
  updateProductInventory,
  updateProductStatus,
  deleteProduct,
} from "../services/productService";

const PAGE_SIZE = 50;

const INVENTORY_FIELDS = [
  "sellingPrice",
  "crossedPrice",
  "costPrice",
  "quantity",
  "weight",
  "sku",
  "hsCode",
  "altBarcode",
  "isAvailable",
];

const STATUS_VALUES = ["ACTIVE", "DRAFT", "ARCHIVED"];

function getProductImage(product) {
  if (typeof product.image === "string" && product.image.trim()) {
    return product.image.trim();
  }

  if (typeof product.imageUrl === "string" && product.imageUrl.trim()) {
    return product.imageUrl.trim();
  }

  if (Array.isArray(product.imageUrls)) {
    const image = product.imageUrls.find(
      (url) => typeof url === "string" && url.trim()
    );

    if (image) return image.trim();
  }

  if (Array.isArray(product.images)) {
    const image = product.images.find((item) => {
      if (typeof item === "string") return item.trim();

      return typeof item?.url === "string" && item.url.trim();
    });

    if (typeof image === "string") return image.trim();
    if (image?.url) return image.url.trim();
  }

  return "";
}

function readCategory(product) {
  const candidates = [
    ...(Array.isArray(product.categories) ? product.categories : []),
    product.category,
  ].filter(Boolean);

  const first = candidates[0];

  const name =
    typeof first === "string"
      ? first
      : first?.name ?? first?.category?.name ?? "";

  let categoryIds = Array.isArray(product.categoryIds)
    ? product.categoryIds.filter(Boolean)
    : [];

  if (categoryIds.length === 0) {
    categoryIds = candidates
      .map(
        (category) =>
          category?.id ??
          category?.categoryId ??
          category?.category?.id
      )
      .filter(Boolean);
  }

  if (categoryIds.length === 0 && product.categoryId) {
    categoryIds = [product.categoryId];
  }

  return { name, categoryIds };
}

function normalizeProduct(product) {
  const { name: categoryName, categoryIds } = readCategory(product);

  return {
    ...product,
    id: product.id ?? product._id,
    name: product.name ?? "Unnamed product",
    price: Number(product.sellingPrice ?? product.price ?? 0),
    discountPrice: Number(
      product.crossedPrice ?? product.discountPrice ?? 0
    ),
    totalStock: Number(product.quantity ?? product.totalStock ?? 0),
    image: getProductImage(product),
    category: categoryName,
    categoryIds,
    status: product.status ?? "UNKNOWN",
    audience: product.audience ?? "ALL",
  };
}

function extractPage(response) {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return { products: payload, pagination: {} };
  }

  const products = Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload?.data?.products)
      ? payload.data.products
      : [];

  const pagination =
    payload?.pagination ??
    payload?.data?.pagination ??
    response?.pagination ??
    {};

  return { products, pagination };
}

async function withDetails(items, storeId) {
  return Promise.all(
    items.map(async (item) => {
      try {
        const response = await getProductById(item.id, storeId);
        const full = response?.data?.product ?? {};

        const listImage = getProductImage(item);
        const detailImage = getProductImage(full);

        const mergedProduct = {
          ...item,
          ...full,
          image: detailImage || listImage,
          imageUrls:
            Array.isArray(full.imageUrls) && full.imageUrls.length > 0
              ? full.imageUrls
              : item.imageUrls,
        };

        return normalizeProduct(mergedProduct);
      } catch {
        return normalizeProduct(item);
      }
    })
  );
}

async function fetchAllMine(storeId) {
  if (!storeId) return [];

  const firstResponse = await getMyProducts(
    { page: 1, limit: PAGE_SIZE },
    storeId
  );

  const firstPage = extractPage(firstResponse);
  let items = firstPage.products.map(normalizeProduct);

  const totalPages = Math.max(
    1,
    Number(firstPage.pagination?.totalPages) || 1
  );

  if (totalPages > 1) {
    const remainingResponses = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        getMyProducts(
          { page: index + 2, limit: PAGE_SIZE },
          storeId
        )
      )
    );

    const remainingProducts = remainingResponses.flatMap((response) =>
      extractPage(response).products.map(normalizeProduct)
    );

    items = [...items, ...remainingProducts];
  }

  return withDetails(items, storeId);
}

export function useManagedProducts(storeId, enabled = true) {
  const qc = useQueryClient();
  const queryKey = ["managedProducts", storeId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAllMine(storeId),
    enabled: Boolean(storeId) && enabled,
  });

  const reload = () => qc.invalidateQueries({ queryKey });

  const addProduct = async (payload) => {
    await createProduct(payload, storeId);
    await reload();
  };

  // Update general details, inventory and status separately.
  const editProduct = async (id, payload) => {
    const {
      status,
      ...remainingPayload
    } = payload;

    const inventoryPayload = {};
    const generalPayload = {};

    Object.entries(remainingPayload).forEach(([key, value]) => {
      if (INVENTORY_FIELDS.includes(key)) {
        // Keep null values so optional fields can be cleared if supported.
        if (value !== undefined) {
          inventoryPayload[key] = value;
        }
      } else if (value !== undefined) {
        generalPayload[key] = value;
      }
    });

    // General details such as name and category.
    if (Object.keys(generalPayload).length > 0) {
      await updateProductGeneral(id, generalPayload, storeId);
    }

    // Price and stock fields.
    if (Object.keys(inventoryPayload).length > 0) {
      await updateProductInventory(id, inventoryPayload, storeId);
    }

    // Product status has its own endpoint and accepted values.
    if (status !== undefined && status !== null && status !== "") {
      const normalizedStatus = String(status).toUpperCase();

      if (!STATUS_VALUES.includes(normalizedStatus)) {
        throw new Error(
          "Invalid product status. Choose Active, Draft or Archived."
        );
      }

      await updateProductStatus(id, normalizedStatus, storeId);
    }

    await reload();
  };

  const removeProduct = async (id) => {
    await deleteProduct(id, storeId);
    await reload();
  };

  return {
    products: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? "",
    addProduct,
    editProduct,
    removeProduct,
    reload,
  };
}
