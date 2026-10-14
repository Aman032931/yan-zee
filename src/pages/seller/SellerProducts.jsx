import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Package, Plus } from "lucide-react"

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

// Product editing is enabled.
const EDIT_ENABLED = true

const STATUS_TONES = {
  ACTIVE: "green",
  DRAFT: "gray",
  OUT_OF_STOCK: "red",
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
  if (value === null || value === undefined || value === "") return fallback
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

  // Category names for products that only return category IDs.
  const { data: categories = [] } = useCategories(shop?.id, {
    page: 1,
    limit: 100,
  })

  const categoryNames = Object.fromEntries(
    categories.map((category) => [category.id, category.name]),
  )

  const list = useListControls(
    products,
    (p) => `${p.name ?? ""} ${p.category ?? ""}`,
  )

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [actionError, setActionError] = useState("")
  const [deletingId, setDeletingId] = useState(null)

  // Open Add Product modal.
  const openAdd = () => {
    setEditingProduct(null)
    setActionError("")
    setShowForm(true)
  }

  // Open Edit Product modal.
  const openEdit = (product) => {
    setEditingProduct(product)
    setActionError("")
    setShowForm(true)
  }

  // Create or update a product.
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

  // Delete a product.
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
        subtitle={`Manage products for ${formatText(shop?.name, "your store")}.`}
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
        count={loading ? undefined : products.length}
        search={{
          value: list.query,
          onChange: list.setQuery,
          placeholder: "Search products",
        }}
      >
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
            title={`No results for "${list.query.trim()}"`}
            text="Try a different product name."
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

                const status = formatText(product.status, "UNKNOWN").toUpperCase()

                // Resolve the product's category name.
                const categoryName =
                  product.category ||
                  categoryNames[product.categoryIds?.[0]] ||
                  "Uncategorized"

                // Dynamic route for this product.
                const productUrl = `/seller/products/${product.id ?? product._id}`

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
                      ) : (
                        "Price unavailable"
                      )}
                    </Td>

                    <Td className="text-zinc-600">
                      {formatText(product.totalStock)}
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
                        <RowButton disabled title="Editing is not available yet">
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