import { useState, useEffect, useCallback } from "react";

import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

const PAGE_SIZE = 50;

// Convert the backend product format into the format
// currently expected by SellerProducts.jsx and ProductFormModal.
function normalizeProduct(product) {
  return {
    ...product,

    id: product.id ?? product._id,
    name: product.name ?? "Unnamed product",

    // The backend uses sellingPrice for the actual selling price.
    price: Number(product.sellingPrice ?? product.price ?? 0),

    // The backend uses crossedPrice for the original/crossed-out price.
    discountPrice: Number(
      product.crossedPrice ?? product.discountPrice ?? 0
    ),

    // The backend uses quantity for available stock.
    totalStock: Number(
      product.quantity ?? product.totalStock ?? 0
    ),

    // The backend returns imageUrls as an array.
    image:
      product.image ??
      product.imageUrls?.[0] ??
      "",

    // The provided product response does not include category.
    category:
      product.category?.name ??
      product.category ??
      "Uncategorized",

    status: product.status ?? "UNKNOWN",
    audience: product.audience ?? "ALL",
  };
}

// Supports common API response formats:
// { success: true, data: { products: [], pagination: {} } }
// { data: { products: [], pagination: {} } }
// { products: [], pagination: {} }
// { data: [] }
// []
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
      Array.from(
        { length: totalPages - 1 },
        (_, index) =>
          getMyProducts(
            {
              page: index + 2,
              limit: PAGE_SIZE,
            },
            storeId
          )
      )
    );

    const remainingProducts = remainingResponses.flatMap(
      (response) =>
        extractPage(response).products.map(normalizeProduct)
    );

    items = [...items, ...remainingProducts];
  }

  return items;
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
        err?.message || "Unable to load products."
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
            err?.message || "Unable to load products."
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
