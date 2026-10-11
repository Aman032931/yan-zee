
import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";

const AUDIENCES = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "UNISEX", label: "Unisex" },
  { value: "BOY", label: "Boy" },
  { value: "GIRL", label: "Girl" },
  { value: "KIDS_UNISEX", label: "Kids (unisex)" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
];

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black";

const labelClass = "mb-1 block text-xs font-medium text-gray-600";

function toForm(product) {
  return {
    name: product?.name ?? "",
    categoryId:
      product?.categoryIds?.[0] ??
      product?.categories?.[0]?.id ??
      product?.category?.id ??
      "",
    audience: product?.audience ?? "UNISEX",
    status: product?.status ?? "ACTIVE",
    sellingPrice: product?.sellingPrice ?? product?.price ?? "",
    crossedPrice: product?.crossedPrice ?? product?.discountPrice ?? "",
    quantity: product?.quantity ?? product?.totalStock ?? "",
    weight: product?.weight ?? "",
    imageUrls: Array.isArray(product?.imageUrls)
      ? product.imageUrls.join("\n")
      : product?.image ?? "",
    productDescription:
      product?.productDescription ?? product?.description ?? "",
    longDescription: product?.longDescription ?? "",
  };
}

export default function ProductFormModal({
  initialData,
  onSave,
  onClose,
  storeId,
}) {
  const [form, setForm] = useState(() => toForm(initialData));
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      if (!storeId) {
        setCategories([]);
        setCategoryError("Store ID is missing. Please select your store.");
        setLoadingCategories(false);
        return;
      }

      setLoadingCategories(true);
      setCategoryError("");

      try {
        const response = await getCategories(storeId, {
          page: 1,
          limit: 100,
        });

        const payload = response?.data ?? response;
        const items =
          payload?.categories ??
          payload?.data?.categories;

        if (!Array.isArray(items)) {
          throw new Error("Unexpected categories response from the server.");
        }

        if (!cancelled) {
          setCategories(items);
        }
      } catch (err) {
        if (!cancelled) {
          setCategories([]);
          setCategoryError(
            err?.message || "Unable to load categories."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const sellingPrice = Number(form.sellingPrice);
    const crossedPrice =
      form.crossedPrice === "" ? null : Number(form.crossedPrice);
    const quantity = Number(form.quantity);
    const weight = form.weight === "" ? null : Number(form.weight);

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      setError("Selling price must be greater than 0.");
      return;
    }

    if (
      crossedPrice !== null &&
      (!Number.isFinite(crossedPrice) || crossedPrice < sellingPrice)
    ) {
      setError("Crossed-out price must be at least the selling price.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Quantity must be a whole number of 0 or more.");
      return;
    }

    if (
      weight !== null &&
      (!Number.isFinite(weight) || weight < 0)
    ) {
      setError("Weight must be 0 or greater.");
      return;
    }

    const imageUrls = form.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    if (imageUrls.some((url) => !/^https?:\/\/\S+$/i.test(url))) {
      setError("Each image must be a valid HTTP or HTTPS URL.");
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.id === form.categoryId
    );

    if (!selectedCategory) {
      setError("The selected category was not found. Reload the form.");
      return;
    }

    if (selectedCategory.isAvailable === false) {
      setError(
        "This category is unavailable. Enable it through your category management first."
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      channel: "ALL",
      audience: form.audience,
      status: form.status,
      isAvailable: true,
      categoryIds: [form.categoryId],
      imageUrls,
      sellingPrice,
      quantity,
    };

    if (crossedPrice !== null) {
      payload.crossedPrice = crossedPrice;
    }

    if (form.productDescription.trim()) {
      payload.productDescription = form.productDescription.trim();
    }

    if (form.longDescription.trim()) {
      payload.longDescription = form.longDescription.trim();
    }

    if (weight !== null) {
      payload.weight = weight;
    }

    setSaving(true);

    try {
      await onSave(payload);
    } catch (err) {
      setError(err?.message || "Unable to save the product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {initialData ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div
              role="alert"
              className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          {categoryError && (
            <div
              role="alert"
              className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
            >
              {categoryError}
            </div>
          )}

          <div>
            <label className={labelClass}>Name *</label>
            <input
              required
              value={form.name}
              onChange={handleChange("name")}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Category *</label>

              <select
                required
                value={form.categoryId}
                onChange={handleChange("categoryId")}
                className={inputClass}
              >
                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : categoryError
                      ? "Could not load categories"
                      : categories.length
                        ? "Select category"
                        : "No categories found"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                    disabled={category.isAvailable === false}
                  >
                    {category.name}
                    {category.isAvailable === false
                      ? " (Unavailable)"
                      : ""}
                  </option>
                ))}
              </select>

              {loadingCategories && (
                <p className="mt-1 text-xs text-gray-500">
                  Loading your store categories...
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Audience *</label>
              <select
                value={form.audience}
                onChange={handleChange("audience")}
                className={inputClass}
              >
                {AUDIENCES.map((audience) => (
                  <option key={audience.value} value={audience.value}>
                    {audience.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status *</label>
              <select
                value={form.status}
                onChange={handleChange("status")}
                className={inputClass}
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Selling price (Nrs) *</label>
              <input
                required
                type="number"
                min="0.01"
                step="any"
                value={form.sellingPrice}
                onChange={handleChange("sellingPrice")}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Crossed-out price (Nrs)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.crossedPrice}
                onChange={handleChange("crossedPrice")}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Quantity *</label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={handleChange("quantity")}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.weight}
                onChange={handleChange("weight")}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Image URLs</label>
            <textarea
              rows={2}
              placeholder="Enter one image URL per line"
              value={form.imageUrls}
              onChange={handleChange("imageUrls")}
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter one image URL per line.
            </p>
          </div>

          <div>
            <label className={labelClass}>Product description</label>
            <textarea
              rows={2}
              value={form.productDescription}
              onChange={handleChange("productDescription")}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>Long description</label>
            <textarea
              rows={3}
              value={form.longDescription}
              onChange={handleChange("longDescription")}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-xs font-semibold text-gray-600 transition hover:text-gray-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingCategories || Boolean(categoryError)}
              className="cursor-pointer rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
