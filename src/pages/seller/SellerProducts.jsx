
import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

import { useManagedProducts } from "../../hooks/useManagedProducts";
import { useCategories } from "../../hooks/useCategories";
import ProductFormModal from "../../components/shared/ProductFormModal";

// Product editing is enabled.
const EDIT_ENABLED = true;

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-gray-100 text-gray-600",
  OUT_OF_STOCK: "bg-red-50 text-red-700",
};

function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "—";
  }

  return price.toLocaleString();
}

function formatText(value, fallback = "—") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function formatStatus(status) {
  return formatText(status, "UNKNOWN").replace(/_/g, " ");
}

export default function SellerProducts() {
  const { shop } = useOutletContext();

  const {
    products = [],
    loading,
    error,
    addProduct,
    editProduct,
    removeProduct,
  } = useManagedProducts(shop?.id, Boolean(shop?.id));

  // Category names for products that only return category IDs.
  const { data: categories = [] } = useCategories(shop?.id, {
    page: 1,
    limit: 100,
  });

  const categoryNames = Object.fromEntries(
    categories.map((category) => [category.id, category.name])
  );

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Open Add Product modal.
  const openAdd = () => {
    setEditingProduct(null);
    setActionError("");
    setShowForm(true);
  };

  // Open Edit Product modal.
  const openEdit = (product) => {
    setEditingProduct(product);
    setActionError("");
    setShowForm(true);
  };

  // Create or update a product.
  const handleSave = async (data) => {
    setActionError("");

    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, data);
      } else {
        await addProduct(data);
      }

      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      setActionError(err?.message || "Could not save the product.");
      throw err;
    }
  };

  // Delete a product.
  const handleDelete = async (product) => {
    const productName = formatText(product.name, "this product");

    if (!window.confirm(`Delete "${productName}"?`)) {
      return;
    }

    setActionError("");
    setDeletingId(product.id);

    try {
      await removeProduct(product.id);
    } catch (err) {
      setActionError(err?.message || "Could not delete the product.");
    } finally {
      setDeletingId(null);
    }
  };

  const displayedError = actionError || error;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage products for {formatText(shop?.name, "your store")}.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="self-start rounded bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          + Add Product
        </button>
      </div>

      {/* Error message */}
      {displayedError && (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700"
        >
          <p className="font-medium">Something went wrong</p>

          <p className="mt-1">{displayedError}</p>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
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
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No products found for this store.

                  <p className="mt-1 text-xs text-gray-400">
                    Add a product to get started.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product, index) => {
                const id = product.id ?? product._id ?? index;

                const price = Number(product.price);
                const discountPrice = Number(product.discountPrice);

                const hasDiscount =
                  Number.isFinite(price) &&
                  Number.isFinite(discountPrice) &&
                  discountPrice > 0 &&
                  discountPrice < price;

                const status = formatText(
                  product.status,
                  "UNKNOWN"
                ).toUpperCase();

                // Resolve the product's category name.
                const categoryName =
                  product.category ||
                  categoryNames[product.categoryIds?.[0]] ||
                  "Uncategorized";

                // Dynamic route for this product.
                const productUrl = `/seller/products/${product.id ?? product._id}`;

                return (
                  <tr
                    key={id}
                    className="border-t border-gray-100"
                  >
                    {/* Product image and name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to={productUrl}
                          className="shrink-0"
                          aria-label={`View ${formatText(
                            product.name,
                            "Product"
                          )} details`}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={formatText(product.name, "Product")}
                              className="h-10 w-10 rounded bg-gray-50 object-contain transition hover:opacity-75"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 transition hover:bg-gray-200">
                              <span className="text-xs text-gray-400">
                                N/A
                              </span>
                            </div>
                          )}
                        </Link>

                        <Link
                          to={productUrl}
                          className="line-clamp-2 max-w-xs font-medium text-gray-900 hover:text-blue-600 hover:underline"
                        >
                          {formatText(product.name, "Unnamed product")}
                        </Link>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-gray-500">
                      {String(categoryName).replace(/_/g, " ")}

                      <span className="block text-[11px] text-gray-400">
                        {formatText(
                          product.audience,
                          "All audiences"
                        )}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 font-semibold">
                      {hasDiscount ? (
                        <>
                          Nrs {formatPrice(discountPrice)}

                          <span className="ml-1 text-xs font-normal text-gray-400 line-through">
                            {formatPrice(price)}
                          </span>
                        </>
                      ) : (
                        <>
                          {Number.isFinite(price)
                            ? `Nrs ${formatPrice(price)}`
                            : "Price unavailable"}
                        </>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-gray-600">
                      {formatText(product.totalStock)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                          STATUS_STYLES[status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {formatStatus(status)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {/* View product details */}
                      <Link
                        to={productUrl}
                        className="mr-3 text-xs font-medium text-gray-700 hover:text-blue-600 hover:underline"
                      >
                        View
                      </Link>

                      {/* Edit product */}
                      {EDIT_ENABLED ? (
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="mr-3 cursor-pointer text-xs font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="Editing is not available yet"
                          className="mr-3 cursor-not-allowed text-xs font-medium text-gray-300"
                        >
                          Edit
                        </button>
                      )}

                      {/* Delete product */}
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="cursor-pointer text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === product.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <ProductFormModal
          initialData={editingProduct}
          storeId={shop.id}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
            setActionError("");
          }}
        />
      )}
    </div>
  );
}
