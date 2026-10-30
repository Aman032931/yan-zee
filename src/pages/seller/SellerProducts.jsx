import { useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Package, Plus, SlidersHorizontal } from "lucide-react"

import { useManagedProducts } from "../../hooks/useManagedProducts"
import { useCategories } from "../../hooks/useCategories"
import { useListControls } from "../../hooks/useListControls"
import ProductFormModal from "../../components/shared/ProductFormModal"
import {
  DataCard,
  DataTable,
  EmptyState,
  EntityCell,
  ErrorBanner,
  LoadingRows,
  PageHeader,
  PageShell,
  PrimaryButton,
  RowButton,
  RowLink,
  StatusPill,
  TableFooter,
  TableRow,
  Td,
} from "../../components/seller/SellerUI"

const EDIT_ENABLED = true

const STATUS_TONES = {
  ACTIVE: "green",
  DRAFT: "gray",
  ARCHIVED: "red",
}

const COLUMNS = [
  { label: "Product" },
  { label: "Category" },
  { label: "Audience" },
  { label: "Price" },
  { label: "Stock" },
  { label: "Status" },
  { label: "Actions", align: "right" },
]

function formatPrice(value) {
  const price = Number(value)
  if (!Number.isFinite(price)) return "—"
  return price.toLocaleString()
}

function formatText(value, fallback = "—") {
  if (value === null || value === undefined || value === "") {
    return fallback
  }

  return String(value)
}

function formatStatus(status) {
  return formatText(status, "UNKNOWN").replace(/_/g, " ")
}

function formatAudience(value) {
  return formatText(value, "All audiences")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}

function getProductStatus(product) {
  return formatText(product.status, "UNKNOWN").toUpperCase()
}

function getProductCategoryId(product) {
  return (
    product.categoryIds?.[0] ??
    product.categories?.[0]?.id ??
    product.category?.id ??
    ""
  )
}

function getProductPrice(product) {
  // Match the price shown in the product table.
  const price = Number(product.price)
  const discountPrice = Number(product.discountPrice)

  if (
    Number.isFinite(price) &&
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < price
  ) {
    return discountPrice
  }

  if (Number.isFinite(price)) return price

  // Fallback for products using API field names.
  const sellingPrice = Number(product.sellingPrice)
  return Number.isFinite(sellingPrice) ? sellingPrice : null
}

function getProductStock(product) {
  const stock = Number(product.totalStock ?? product.quantity)

  return Number.isFinite(stock) ? stock : null
}

export default function SellerProducts() {
  const { shop } = useOutletContext()

  const {
    products = [],
    loading,
    error,
    addProduct,
    editProduct,
    removeProduct,
  } = useManagedProducts(shop?.id, Boolean(shop?.id))

  const { data: categories = [] } = useCategories(shop?.id, {
    page: 1,
    limit: 100,
  })

  const categoryNames = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [
          String(category.id),
          category.name,
        ]),
      ),
    [categories],
  )

  // Filter selections.
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [stockFilter, setStockFilter] = useState("ALL")
  const [priceSort, setPriceSort] = useState("DEFAULT")

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [actionError, setActionError] = useState("")
  const [deletingId, setDeletingId] = useState(null)

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // 1. Filter by status.
    if (statusFilter !== "ALL") {
      result = result.filter(
        (product) => getProductStatus(product) === statusFilter,
      )
    }

    // 2. Filter by category.
    if (categoryFilter !== "ALL") {
      result = result.filter(
        (product) =>
          String(getProductCategoryId(product)) === categoryFilter,
      )
    }

    // 3. Filter by stock.
    if (stockFilter !== "ALL") {
      result = result.filter((product) => {
        const stock = getProductStock(product)

        // Unknown stock is not assumed to be in stock.
        if (stock === null) return false

        if (stockFilter === "IN_STOCK") return stock > 0
        if (stockFilter === "OUT_OF_STOCK") return stock <= 0

        return true
      })
    }

    // 4. Sort by displayed product price.
    if (priceSort !== "DEFAULT") {
      result.sort((a, b) => {
        const priceA = getProductPrice(a)
        const priceB = getProductPrice(b)

        // Products with unknown prices go to the end.
        if (priceA === null && priceB === null) return 0
        if (priceA === null) return 1
        if (priceB === null) return -1

        return priceSort === "LOW_TO_HIGH"
          ? priceA - priceB
          : priceB - priceA
      })
    }

    return result
  }, [products, statusFilter, categoryFilter, stockFilter, priceSort])

  // Search and pagination work on the filtered products.
  const list = useListControls(
    filteredProducts,
    (product) =>
      `${product.name ?? ""} ${product.category ?? ""} ${
        categoryNames[String(getProductCategoryId(product))] ?? ""
      }`,
  )

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    stockFilter !== "ALL" ||
    priceSort !== "DEFAULT"

  const resetFilters = () => {
    setStatusFilter("ALL")
    setCategoryFilter("ALL")
    setStockFilter("ALL")
    setPriceSort("DEFAULT")
  }

  const openAdd = () => {
    setEditingProduct(null)
    setActionError("")
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setActionError("")
    setShowForm(true)
  }

  const handleSave = async (data) => {
    setActionError("")

    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, data)
      } else {
        await addProduct(data)
      }

      setShowForm(false)
      setEditingProduct(null)
    } catch (err) {
      setActionError(err?.message || "Could not save the product.")
      throw err
    }
  }

  const handleDelete = async (product) => {
    const productName = formatText(product.name, "this product")

    if (!window.confirm(`Delete "${productName}"?`)) return

    setActionError("")
    setDeletingId(product.id)

    try {
      await removeProduct(product.id)
    } catch (err) {
      setActionError(err?.message || "Could not delete the product.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="My Products"
        subtitle={`Manage products for ${formatText(
          shop?.name,
          "your store",
        )}.`}
        action={
          <PrimaryButton onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Product
          </PrimaryButton>
        }
      />

      <ErrorBanner>{actionError || error}</ErrorBanner>

      <DataCard
        icon={Package}
        title="All products"
        count={loading ? undefined : filteredProducts.length}
        search={{
          value: list.query,
          onChange: list.setQuery,
          placeholder: "Search products",
        }}
      >
        {/* Product filters */}
        <div className="border-b border-yz-border px-4 py-4 sm:px-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* Status filter */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-yz-border bg-white px-3 text-sm text-zinc-700 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-600/10"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>

            {/* Category filter */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                Category
              </span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-yz-border bg-white px-3 text-sm text-zinc-700 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-600/10"
              >
                <option value="ALL">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {formatText(category.name, "Unnamed category")}
                  </option>
                ))}
              </select>
            </label>

            {/* Stock filter */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                Stock
              </span>
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-yz-border bg-white px-3 text-sm text-zinc-700 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-600/10"
              >
                <option value="ALL">All stock levels</option>
                <option value="IN_STOCK">In stock</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
              </select>
            </label>

            {/* Price sorting */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                Sort by price
              </span>
              <select
                value={priceSort}
                onChange={(event) => setPriceSort(event.target.value)}
                className="h-10 w-full rounded-lg border border-yz-border bg-white px-3 text-sm text-zinc-700 outline-none focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-600/10"
              >
                <option value="DEFAULT">Default order</option>
                <option value="LOW_TO_HIGH">Price: Low to High</option>
                <option value="HIGH_TO_LOW">Price: High to Low</option>
              </select>
            </label>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-zinc-500">
                {filteredProducts.length} product
                {filteredProducts.length === 1 ? "" : "s"} match the selected
                filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-brand-red-600 transition hover:text-brand-red-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingRows />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found for this store"
            text="Add a product to get started."
          />
        ) : list.total === 0 ? (
          <EmptyState
            icon={Package}
            title="No matching products"
            text="Try changing your search or clearing some filters."
          />
        ) : (
          <>
            <DataTable columns={COLUMNS} minWidth="min-w-[820px]">
              {list.pageItems.map((product, index) => {
                const id = product.id ?? product._id ?? index
                const price = Number(product.price)
                const discountPrice = Number(product.discountPrice)

                const hasDiscount =
                  Number.isFinite(price) &&
                  Number.isFinite(discountPrice) &&
                  discountPrice > 0 &&
                  discountPrice < price

                const status = getProductStatus(product)

                const categoryId = getProductCategoryId(product)
                const categoryName =
                  product.category?.name ??
                  (typeof product.category === "string"
                    ? product.category
                    : null) ??
                  categoryNames[String(categoryId)] ??
                  "Uncategorized"

                const productUrl = `/seller/products/${
                  product.id ?? product._id
                }`

                const displayedStock =
                  product.totalStock ?? product.quantity

                return (
                  <TableRow key={id}>
                    <Td>
                      <EntityCell
                        image={product.image}
                        icon={Package}
                        name={formatText(product.name, "Unnamed product")}
                        to={productUrl}
                        fit="contain"
                      />
                    </Td>

                    <Td className="text-zinc-600">
                      {String(categoryName).replace(/_/g, " ")}
                    </Td>

                    <Td className="text-zinc-600">
                      {formatAudience(product.audience)}
                    </Td>

                    <Td className="font-semibold text-zinc-900">
                      {hasDiscount ? (
                        <>
                          Nrs {formatPrice(discountPrice)}
                          <span className="ml-1 text-xs font-normal text-zinc-400 line-through">
                            {formatPrice(price)}
                          </span>
                        </>
                      ) : Number.isFinite(price) ? (
                        `Nrs ${formatPrice(price)}`
                      ) : Number.isFinite(Number(product.sellingPrice)) ? (
                        `Nrs ${formatPrice(product.sellingPrice)}`
                      ) : (
                        "Price unavailable"
                      )}
                    </Td>

                    <Td className="text-zinc-600">
                      {formatText(displayedStock)}
                    </Td>

                    <Td>
                      <StatusPill tone={STATUS_TONES[status] ?? "gray"}>
                        {formatStatus(status)}
                      </StatusPill>
                    </Td>

                    <Td align="right" className="whitespace-nowrap">
                      <RowLink to={productUrl}>View</RowLink>

                      {EDIT_ENABLED ? (
                        <RowButton onClick={() => openEdit(product)}>
                          Edit
                        </RowButton>
                      ) : (
                        <RowButton
                          disabled
                          title="Editing is not available yet"
                        >
                          Edit
                        </RowButton>
                      )}

                      <RowButton
                        danger
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product)}
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </RowButton>
                    </Td>
                  </TableRow>
                )
              })}
            </DataTable>

            <TableFooter
              from={list.from}
              to={list.to}
              total={list.total}
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
            />
          </>
        )}
      </DataCard>

      {/* Add / Edit modal */}
      {showForm && (
        <ProductFormModal
          initialData={editingProduct}
          storeId={shop.id}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditingProduct(null)
            setActionError("")
          }}
        />
      )}
    </PageShell>
  )
}