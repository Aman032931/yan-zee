import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

const PAGE_SIZE = 50;

// Pull the category out of whichever shape the API returns:
// category / categories[] / categories[{ category }] / categoryIds[]
function readCategory(product) {
  const candidates = [
    ...(Array.isArray(product.categories) ? product.categories : []),
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
      .map((c) => c?.id ?? c?.categoryId ?? c?.category?.id)
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
  const { name: categoryName, categoryIds } = readCategory(product);

  return {
    ...product,

    id: product.id ?? product._id,
    name: product.name ?? "Unnamed product",

    // sellingPrice is the actual selling price.
    price: Number(product.sellingPrice ?? product.price ?? 0),

    // crossedPrice is the original/crossed-out price.
    discountPrice: Number(product.crossedPrice ?? product.discountPrice ?? 0),

    // quantity is the available stock.
    totalStock: Number(product.quantity ?? product.totalStock ?? 0),

    // imageUrls is an array.
    image: product.image ?? product.imageUrls?.[0] ?? "",

    // empty name means the page should resolve it from categoryIds
    category: categoryName,
    categoryIds,

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

// The list endpoint does not include categories, weight or descriptions,
// so fill them in from the detail endpoint.
// TEMPORARY: remove this once the backend list response includes categories.
async function withDetails(items, storeId) {
  return Promise.all(
    items.map(async (item) => {
      try {
        const res = await getProductById(item.id, storeId);
        const full = res?.data?.product ?? {};
        return normalizeProduct({ ...item, ...full });
      } catch {
        return item; // keep the list data if the detail call fails
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

    const remainingProducts = remainingResponses.flatMap((response) =>
      extractPage(response).products.map(normalizeProduct),
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
    // no store selected (or disabled) = no request, no state juggling
    enabled: Boolean(storeId) && enabled,
  });

  // Reload products after creating, editing, or deleting.
  const reload = () => qc.invalidateQueries({ queryKey });

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
    products: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? "",
    addProduct,
    editProduct,
    removeProduct,
    reload,
  };
}