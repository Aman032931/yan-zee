
import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductInventory,
  updateProductStatus,
  updateProductCustom,
  updateProductSeo,
  deleteProduct,
} from "../services/productService"

const PAGE_SIZE = 50

const STATUS_VALUES = [
  "ACTIVE",
  "DRAFT",
  "ARCHIVED",
  "OUT_OF_STOCK",
]

function getProductImage(product) {
  if (!product) return ""

  if (typeof product.image === "string" && product.image.trim()) {
    return product.image.trim()
  }

  if (typeof product.imageUrl === "string" && product.imageUrl.trim()) {
    return product.imageUrl.trim()
  }

  if (Array.isArray(product.imageUrls)) {
    const image = product.imageUrls.find(
      (url) => typeof url === "string" && url.trim()
    )

    if (image) return image.trim()
  }

  if (Array.isArray(product.images)) {
    const image = product.images.find((item) => {
      if (typeof item === "string") {
        return item.trim()
      }

      return typeof item?.url === "string" && item.url.trim()
    })

    if (typeof image === "string") return image.trim()
    if (image?.url) return image.url.trim()
  }

  return ""
}

function readCategory(product) {
  const candidates = [
    ...(Array.isArray(product.categories) ? product.categories : []),
    product.category,
  ].filter(Boolean)

  const first = candidates[0]

  const name =
    typeof first === "string"
      ? first
      : first?.name ?? first?.category?.name ?? ""

  let categoryIds = Array.isArray(product.categoryIds)
    ? product.categoryIds.filter(Boolean)
    : []

  if (categoryIds.length === 0) {
    categoryIds = candidates
      .map(
        (category) =>
          category?.id ??
          category?.categoryId ??
          category?.category?.id
      )
      .filter(Boolean)
  }

  if (categoryIds.length === 0 && product.categoryId) {
    categoryIds = [product.categoryId]
  }

  return { name, categoryIds }
}

function normalizeProduct(product) {
  const { name: categoryName, categoryIds } = readCategory(product)

  const variants = Array.isArray(product.variants)
    ? product.variants
    : []

  const variantPrices = variants
    .map((variant) => Number(variant.sellingPrice))
    .filter((value) => Number.isFinite(value) && value > 0)

  const variantStock = variants.reduce(
    (sum, variant) => sum + (Number(variant.quantity) || 0),
    0
  )

  const topPrice = Number(product.sellingPrice ?? product.price)
  const topStock = Number(product.quantity ?? product.totalStock)

  return {
    ...product,
    id: product.id ?? product._id,
    name: product.name ?? "Unnamed product",

    // Product price or cheapest variant price.
    price:
      topPrice > 0
        ? topPrice
        : variantPrices.length > 0
          ? Math.min(...variantPrices)
          : 0,

    discountPrice: Number(
      product.crossedPrice ?? product.discountPrice ?? 0
    ),

    // Sum variant stock when variants exist.
    totalStock:
      variants.length > 0
        ? variantStock
        : Number.isFinite(topStock)
          ? topStock
          : 0,

    image: getProductImage(product),
    category: categoryName,
    categoryIds,
    status: product.status ?? "UNKNOWN",
    audience: product.audience ?? "ALL",
  }
}

function extractPage(response) {
  const payload = response?.data ?? response

  if (Array.isArray(payload)) {
    return {
      products: payload,
      pagination: {},
    }
  }

  const products = Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload?.data?.products)
      ? payload.data.products
      : []

  const pagination =
    payload?.pagination ??
    payload?.data?.pagination ??
    response?.pagination ??
    {}

  return {
    products,
    pagination,
  }
}

async function withDetails(items, storeId) {
  return Promise.all(
    items.map(async (item) => {
      try {
        const response = await getProductById(item.id, storeId)
        const full = response?.data?.product ?? {}

        const listImage = getProductImage(item)
        const detailImage = getProductImage(full)

        const mergedProduct = {
          ...item,
          ...full,
          image: detailImage || listImage,
          imageUrls:
            Array.isArray(full.imageUrls) && full.imageUrls.length > 0
              ? full.imageUrls
              : item.imageUrls,
        }

        return normalizeProduct(mergedProduct)
      } catch {
        // Keep the list product if fetching details fails.
        return normalizeProduct(item)
      }
    })
  )
}

async function fetchAllMine(storeId) {
  if (!storeId) {
    return []
  }

  const firstResponse = await getMyProducts(
    {
      page: 1,
      limit: PAGE_SIZE,
    },
    storeId
  )

  const firstPage = extractPage(firstResponse)

  let items = firstPage.products.map(normalizeProduct)

  const totalPages = Math.max(
    1,
    Number(firstPage.pagination?.totalPages) || 1
  )

  if (totalPages > 1) {
    const remainingResponses = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        getMyProducts(
          {
            page: index + 2,
            limit: PAGE_SIZE,
          },
          storeId
        )
      )
    )

    const remainingProducts = remainingResponses.flatMap((response) =>
      extractPage(response).products.map(normalizeProduct)
    )

    items = [...items, ...remainingProducts]
  }

  return withDetails(items, storeId)
}

export function useManagedProducts(storeId, enabled = true) {
  const qc = useQueryClient()
  const queryKey = ["managedProducts", storeId]

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAllMine(storeId),
    enabled: Boolean(storeId) && enabled,
  })

  const reload = () => qc.invalidateQueries({ queryKey })

  // Create a product and save SEO separately.
  const addProduct = async ({ payload, seo } = {}) => {
    if (!payload) {
      throw new Error("Product information is missing.")
    }

    const response = await createProduct(payload, storeId)

    const id =
      response?.data?.product?.id ??
      response?.data?.id ??
      response?.product?.id

    let warning = ""

    if (id && seo && Object.keys(seo).length > 0) {
      try {
        await updateProductSeo(id, seo, storeId)
      } catch (err) {
        warning = `Product created, but SEO could not be saved: ${
          err.message || "Unknown error"
        }`
      }
    }

    await reload()

    return { warning }
  }

  // Update only the sections that changed.
  const editProduct = async (
    id,
    { general, status, custom, seo } = {}
  ) => {
    const step = async (label, run) => {
      try {
        await run()
      } catch (err) {
        throw new Error(
          `${label}: ${err.message || "Update failed."}`,
          { cause: err }
        )
      }
    }

    try {
      if (general && Object.keys(general).length > 0) {
        await step("General info", () =>
          updateProduct(id, general, storeId)
        )
      }

      if (status) {
        const normalizedStatus = String(status).toUpperCase()

        if (!STATUS_VALUES.includes(normalizedStatus)) {
          throw new Error("Invalid product status.")
        }

        await step("Status", () =>
          updateProductStatus(id, normalizedStatus, storeId)
        )
      }

      if (custom && Object.keys(custom).length > 0) {
        await step("Tags / release date", () =>
          updateProductCustom(id, custom, storeId)
        )
      }

      if (seo && Object.keys(seo).length > 0) {
        await step("SEO", () =>
          updateProductSeo(id, seo, storeId)
        )
      }
    } finally {
      // Refresh even if a later update section fails.
      await reload()
    }
  }

  const removeProduct = async (id) => {
    await deleteProduct(id, storeId)
    await reload()
  }

  return {
    products: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? "",
    addProduct,
    editProduct,
    removeProduct,
    reload,
  }
}
