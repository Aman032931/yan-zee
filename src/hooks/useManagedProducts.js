
import { useState, useEffect, useCallback } from "react";

import {
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

const PAGE_SIZE = 50;

// Find a usable image URL from the product data.
function getProductImage(product) {
  if (
    typeof product.image === "string" &&
    product.image.trim()
  ) {
    return product.image.trim();
  }

  if (
    typeof product.imageUrl === "string" &&
    product.imageUrl.trim()
  ) {
    return product.imageUrl.trim();
  }

  if (Array.isArray(product.imageUrls)) {
    const image = product.imageUrls.find(
      (url) => typeof url === "string" && url.trim(),
    );

    if (image) {
      return image.trim();
    }
  }

  if (Array.isArray(product.images)) {
    const image = product.images.find((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      return (
        typeof item?.url === "string" && item.url.trim()
      );
    });

    if (typeof image === "string") {
      return image.trim();
    }

    if (image?.url) {
      return image.url.trim();
    }
  }

  return "";
}

// Pull the category out of whichever shape the API returns.
function readCategory(product) {
  const candidates = [
    ...(Array.isArray(product.categories)
      ? product.categories
      : []),
    product.category,
  ].filter(Boolean);

  const first = candidates[0];

  const name =
    typeof first === "string"
      ? first
      : (first?.name ?? first?.category?.name ?? "");

  let categoryIds = Array.isArray(product.categoryIds)
    ? product.categoryIds.filter(Boolean)
    : [];

  if (categoryIds.length === 0) {
    categoryIds = candidates
      .map(
        (category) =>
          category?.id ??
          category?.categoryId ??
          category?.category?.id,
      )
      .filter(Boolean);
  }

  if (categoryIds.length === 0 && product.categoryId) {
    categoryIds = [product.categoryId];
  }

  return { name, categoryIds };
}

// Convert the backend product format into the format
// expected by SellerProducts.jsx and ProductFormModal.
function normalizeProduct(product) {
  const { name: categoryName, categoryIds } =
    readCategory(product);

  return {
    ...product,

    id: product.id ?? product._id,
    name: product.name ?? "Unnamed product",

    // Actual selling price.
    price: Number(
      product.sellingPrice ?? product.price ?? 0,
    ),

    // Original/crossed-out price.
    discountPrice: Number(
      product.crossedPrice ?? product.discountPrice ?? 0,
    ),

    // Available stock.
    totalStock: Number(
      product.quantity ?? product.totalStock ?? 0,
    ),

    // Use the first valid image URL.
    image: getProductImage(product),

    // Resolve category names from category IDs when needed.
    category: categoryName,
    categoryIds,

    status: product.status ?? "UNKNOWN",
    audience: product.audience ?? "ALL",
  };
}

// Extract products and pagination from common API response formats.
function extractPage(response) {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return {
      products: payload,
      pagination: {},
    };
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

  return {
    products,
    pagination,
  };
}

// Merge list and detail data without losing existing images
// when the detail endpoint omits them or returns empty values.
async function withDetails(items, storeId) {
  return Promise.all(
    items.map(async (item) => {
      try {
        const response = await getProductById(
          item.id,
          storeId,
        );

        const full = response?.data?.product ?? {};

        const listImage = getProductImage(item);
        const detailImage = getProductImage(full);

        const mergedProduct = {
          ...item,
          ...full,

          // Prefer the detail image, then the list image.
          image: detailImage || listImage,

          // Keep list images if the detail response has none.
          imageUrls:
            Array.isArray(full.imageUrls) &&
            full.imageUrls.length > 0
              ? full.imageUrls
              : item.imageUrls,
        };

        return normalizeProduct(mergedProduct);
      } catch {
        // Keep the list product if fetching details fails.
        return normalizeProduct(item);
      }
    }),
  );
}

// Fetch every page of products belonging to the selected store.
async function fetchAllMine(storeId) {
  if (!storeId) {
    return [];
  }

  const firstResponse = await getMyProducts(
    {
      page: 1,
      limit: PAGE_SIZE,
    },
    storeId,
  );

  const firstPage = extractPage(firstResponse);

  let items = firstPage.products.map(normalizeProduct);

  const totalPages = Math.max(
    1,
    Number(firstPage.pagination?.totalPages) || 1,
  );

  if (totalPages > 1) {
    const remainingResponses = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        getMyProducts(
          {
            page: index + 2,
            limit: PAGE_SIZE,
          },
          storeId,
        ),
      ),
    );

    const remainingProducts = remainingResponses.flatMap(
      (response) =>
        extractPage(response).products.map(normalizeProduct),
    );

    items = [...items, ...remainingProducts];
  }

  return withDetails(items, storeId);
}

export function useManagedProducts(storeId, enabled = true) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reload products after creating, editing, or deleting.
  const reload = useCallback(async () => {
    if (!storeId || !enabled) {
      setProducts([]);
      return;
    }

    setError("");

    try {
      const items = await fetchAllMine(storeId);
      setProducts(items);
    } catch (err) {
      setError(
        err?.message || "Unable to load products.",
      );
      throw err;
    }
  }, [storeId, enabled]);

  // Load products whenever the selected store changes.
  useEffect(() => {
    let cancelled = false;

    if (!enabled || !storeId) {
      setProducts([]);
      setError("");
      setLoading(false);

      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError("");

    fetchAllMine(storeId)
      .then((items) => {
        if (!cancelled) {
          setProducts(items);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setProducts([]);
          setError(
            err?.message || "Unable to load products.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storeId, enabled]);

  // Create a product for the selected store.
  const addProduct = async (payload) => {
    await createProduct(payload, storeId);
    await reload();
  };

  // Update a product belonging to the selected store.
  const editProduct = async (id, payload) => {
    await updateProduct(id, payload, storeId);
    await reload();
  };

  // Delete a product belonging to the selected store.
  const removeProduct = async (id) => {
    await deleteProduct(id, storeId);
    await reload();
  };

  return {
    products,
    loading,
    error,
    addProduct,
    editProduct,
    removeProduct,
    reload,
  };
}
