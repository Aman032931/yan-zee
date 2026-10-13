import { useEffect, useRef, useState } from "react";
import { getCategories } from "../../services/categoryService";
import { uploadProductImage } from "../../services/productService";

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function toForm(product) {
  const existingImages = Array.isArray(product?.imageUrls)
    ? product.imageUrls
    : product?.image
      ? [product.image]
      : [];

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
    crossedPrice:
      product?.crossedPrice ?? product?.discountPrice ?? "",
    quantity: product?.quantity ?? product?.totalStock ?? "",
    weight: product?.weight ?? "",
    imageUrls: existingImages.join("\n"),
    productDescription:
      product?.productDescription ?? product?.description ?? "",
    longDescription: product?.longDescription ?? "",
  };
}

// The confirmed backend response is:
// { success: true, data: { url: "https://res.cloudinary.com/..." } }
function extractUploadedImageUrl(response) {
  if (response?.success === false) {
    throw new Error(
      response?.error?.message ||
        response?.message ||
        "The server could not upload the image.",
    );
  }

  const url =
    response?.data?.url ??
    response?.url ??
    response?.data?.imageUrl ??
    response?.imageUrl;

  if (
    typeof url !== "string" ||
    !/^https?:\/\/\S+$/i.test(url.trim())
  ) {
    throw new Error(
      "The server did not return a valid image URL.",
    );
  }

  return url.trim();
}

export default function ProductFormModal({
  initialData,
  onSave,
  onClose,
  storeId,
}) {
  const [form, setForm] = useState(() => toForm(initialData));
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // Create and clean up the local image preview.
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  // Load categories belonging to the selected store.
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      if (!storeId) {
        setCategories([]);
        setCategoryError(
          "Store ID is missing. Please select your store.",
        );
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
          payload?.categories ?? payload?.data?.categories;

        if (!Array.isArray(items)) {
          throw new Error(
            "Unexpected categories response from the server.",
          );
        }

        if (!cancelled) {
          setCategories(items);
        }
      } catch (err) {
        if (!cancelled) {
          setCategories([]);
          setCategoryError(
            err?.message || "Unable to load categories.",
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

  // Validate the image before displaying its preview.
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const sellingPrice = Number(form.sellingPrice);

    const crossedPrice =
      form.crossedPrice === ""
        ? null
        : Number(form.crossedPrice);

    const quantity = Number(form.quantity);

    const weight =
      form.weight === "" ? null : Number(form.weight);

    // Validate required fields.
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
      (!Number.isFinite(crossedPrice) ||
        crossedPrice < sellingPrice)
    ) {
      setError(
        "Crossed-out price must be at least the selling price.",
      );
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

    const selectedCategory = categories.find(
      (category) => category.id === form.categoryId,
    );

    if (!selectedCategory) {
      setError(
        "The selected category was not found. Reload the form.",
      );
      return;
    }

    if (selectedCategory.isAvailable === false) {
      setError(
        "This category is unavailable. Enable it through your category management first.",
      );
      return;
    }

    if (!storeId) {
      setError("Please select your store before saving.");
      return;
    }

    setSaving(true);

    try {
      // Preserve existing images if no replacement was selected.
      let imageUrls = form.imageUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean);

      // Upload a selected image before saving the product.
      if (selectedImage) {
        setUploadingImage(true);

        try {
          const response = await uploadProductImage(
            selectedImage,
            storeId,
          );

          const uploadedUrl = extractUploadedImageUrl(response);

          // Save the exact URL returned by the backend.
          imageUrls = [uploadedUrl];
        } finally {
          setUploadingImage(false);
        }
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
        payload.productDescription =
          form.productDescription.trim();
      }

      if (form.longDescription.trim()) {
        payload.longDescription = form.longDescription.trim();
      }

      if (weight !== null) {
        payload.weight = weight;
      }

      // The parent decides whether to create or update.
      await onSave(payload);
    } catch (err) {
      setError(err?.message || "Unable to save the product.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const currentImage =
    form.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .find(Boolean) || "";

  const displayedImage = imagePreview || currentImage;

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
                  <option
                    key={audience.value}
                    value={audience.value}
                  >
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
              <label className={labelClass}>
                Selling price (Nrs) *
              </label>
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
              <label className={labelClass}>
                Crossed-out price (Nrs)
              </label>
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
            <label className={labelClass}>Product image</label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 transition hover:border-gray-500">
              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt="Product preview"
                  className="mb-3 h-32 w-32 rounded-md bg-gray-50 object-contain"
                />
              ) : (
                <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
              )}

              <span className="text-sm font-medium text-gray-800">
                {selectedImage
                  ? "Choose a different image"
                  : "Choose image"}
              </span>

              <span className="mt-1 text-xs text-gray-500">
                Select an image file · Maximum 5 MB
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>

            {selectedImage && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-gray-500">
                  {selectedImage.name}
                </p>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="shrink-0 text-xs font-medium text-red-600 hover:underline"
                >
                  Remove selection
                </button>
              </div>
            )}

            {!selectedImage && currentImage && (
              <p className="mt-1 text-xs text-gray-500">
                The current image will be kept unless you choose
                a replacement.
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Product description
            </label>
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
              disabled={saving}
              className="cursor-pointer px-4 py-2 text-xs font-semibold text-gray-600 transition hover:text-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingCategories ||
                Boolean(categoryError)
              }
              className="cursor-pointer rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingImage
                ? "Uploading image..."
                : saving
                  ? "Saving..."
                  : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
