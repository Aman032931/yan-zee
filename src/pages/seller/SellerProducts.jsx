import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { useManagedProducts } from "../../hooks/useManagedProducts"
import ProductFormModal from "../../components/shared/ProductFormModal"

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-gray-100 text-gray-600",
  OUT_OF_STOCK: "bg-red-50 text-red-700",
}

export default function SellerProducts() {
  const { shop } = useOutletContext()
  const { products, loading, error, addProduct, editProduct, removeProduct } =
    useManagedProducts(true)

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [actionError, setActionError] = useState("")

  const openAdd = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  // the modal shows any error thrown here and stays open
  const handleSave = async (data) => {
    if (editingProduct) {
      await editProduct(editingProduct.id, data)
    } else {
      await addProduct(data)
    }
    setShowForm(false)
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    setActionError("")
    try {
      await removeProduct(product.id)
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-xs text-gray-500">{shop.name}</p>
        </div>
        <button
          onClick={openAdd}
          className="cursor-pointer rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
        >
          + Add Product
        </button>
      </div>

      {(error || actionError) && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          ⚠ {error || actionError}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  No products yet. Add your first one.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded bg-gray-50 object-contain"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100" />
                      )}
                      <span className="line-clamp-1 max-w-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.category.replace(/_/g, " ")}
                    <span className="block text-[11px] text-gray-400">
                      {p.audience}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {p.discountPrice > 0 && p.discountPrice < p.price ? (
                      <>
                        Nrs {p.discountPrice.toLocaleString()}
                        <span className="ml-1 text-xs font-normal text-gray-400 line-through">
                          {p.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <>Nrs {p.price.toLocaleString()}</>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.totalStock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-[2px] text-[11px] font-medium ${
                        STATUS_STYLES[p.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="space-x-3 px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(p)}
                      className="cursor-pointer text-xs font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="cursor-pointer text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductFormModal
          initialData={editingProduct}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}