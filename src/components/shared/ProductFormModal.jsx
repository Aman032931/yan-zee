
import { useEffect, useRef, useState } from "react";
import { getCategories } from "../../services/categoryService";
import { useCreateCategory } from "../../hooks/useCategories";
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
  { value: "ARCHIVED", label: "Archived" },
];

const inputClass =
  "w-full min-w-0 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black";

const labelClass = "mb-1 block text-xs font-medium text-gray-600";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const createEmptyVariant = () => ({
  size: "",
  colorName: "",
  colorCode: "#000000",
  sellingPrice: "",
  crossedPrice: "",
  quantity: "",
  weight: "",
});

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
    crossedPrice: product?.crossedPrice ?? product?.discountPrice ?? "",
    quantity: product?.quantity ?? product?.totalStock ?? "",
    weight: product?.weight ?? "",
    imageUrls: existingImages.join("\n"),
    productDescription:
      product?.productDescription ?? product?.description ?? "",
    longDescription: product?.longDescription ?? "",
  };
}

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

  if (typeof url !== "string" || !/^https?:\/\/\S+$/i.test(url.trim())) {
    throw new Error("The server did not return a valid image URL.");
  }

  return url.trim();
}

function extractCategories(response) {
  const payload = response?.data ?? response;
  const items = payload?.categories ?? payload?.data?.categories;

  if (!Array.isArray(items)) {
    throw new Error("Unexpected categories response from the server.");
  }

  return items;
}

function extractCreatedCategory(response) {
  const payload = response?.data ?? response;
  const category = payload?.category ?? payload?.data?.category ?? payload;

  return category && typeof category === "object" && category.id != null
    ? category
    : null;
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

  // Inline category creation.
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [newCategoryPreview, setNewCategoryPreview] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");

  const createCategoryMutation = useCreateCategory(storeId);
  const creatingCategory = createCategoryMutation.isPending;

  // Product variants.
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([createEmptyVariant()]);

  const fileInputRef = useRef(null);
  const categoryFileInputRef = useRef(null);
  const isEditing = Boolean(initialData);

  // Product image preview.
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  // Category image preview.
  useEffect(() => {
    if (!newCategoryImage) {
      setNewCategoryPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(newCategoryImage);
    setNewCategoryPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [newCategoryImage]);

  // Load categories for the selected store.
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

        const items = extractCategories(response);

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

  const refreshCategories = async (preferredCategoryId = null) => {
    const response = await getCategories(storeId, {
      page: 1,
      limit: 100,
    });

    const items = extractCategories(response);
    setCategories(items);
    setCategoryError("");

    if (preferredCategoryId != null) {
      const created = items.find(
        (category) =>
          String(category.id) === String(preferredCategoryId),
      );

      if (created && created.isAvailable !== false) {
        setForm((previous) => ({
          ...previous,
          categoryId: String(created.id),
        }));
      }
    }

    return items;
  };

  const resetNewCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewCategoryImage(null);
    setNewCategoryError("");

    if (categoryFileInputRef.current) {
      categoryFileInputRef.current.value = "";
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setNewCategoryError("");

    const name = newCategoryName.trim();
    const description = newCategoryDescription.trim();

    if (!name) {
      setNewCategoryError("Category name is required.");
      return;
    }

    if (!storeId) {
      setNewCategoryError(
        "Store ID is missing. Please select your store.",
      );
      return;
    }

    if (
      newCategoryImage &&
      !newCategoryImage.type.startsWith("image/")
    ) {
      setNewCategoryError("Please select a valid image file.");
      return;
    }

    if (newCategoryImage && newCategoryImage.size > MAX_IMAGE_SIZE) {
      setNewCategoryError("Category image must be 5 MB or smaller.");
      return;
    }

    try {
      const response = await createCategoryMutation.mutateAsync({
        name,
        ...(description ? { description } : {}),
        imageFile: newCategoryImage,
        isAvailable: true,
      });

      const createdCategory = extractCreatedCategory(response);
      const items = await refreshCategories(createdCategory?.id);

      if (!createdCategory?.id) {
        const matchingCategory = items.find(
          (category) =>
            category.name?.trim().toLowerCase() === name.toLowerCase() &&
            category.isAvailable !== false,
        );

        if (matchingCategory) {
          setForm((previous) => ({
            ...previous,
            categoryId: String(matchingCategory.id),
          }));
        }
      }

      resetNewCategoryForm();
      setShowNewCategory(false);
    } catch (err) {
      setNewCategoryError(
        err?.message || "Unable to create category.",
      );
    }
  };

  const handleChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const updateVariant = (index, field, value) => {
    setVariants((previous) =>
      previous.map((variant, variantIndex) =>
        variantIndex === index
          ? { ...variant, [field]: value }
          : variant,
      ),
    );
  };

  const addVariant = () => {
    setVariants((previous) => [
      ...previous,
      createEmptyVariant(),
    ]);
  };

  const removeVariant = (index) => {
    setVariants((previous) =>
      previous.filter((_, variantIndex) => variantIndex !== index),
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    const selectedCategory = categories.find(
      (category) =>
        String(category.id) === String(form.categoryId),
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

    let sellingPrice;
    let crossedPrice = null;
    let quantity;
    let weight = null;
    let preparedVariants;

    if (hasVariants && !isEditing) {
      if (variants.length === 0) {
        setError("Add at least one product variant.");
        return;
      }

      preparedVariants = [];

      for (let index = 0; index < variants.length; index += 1) {
        const variant = variants[index];
        const size = variant.size.trim();
        const colorName = variant.colorName.trim();
        const variantPrice = Number(variant.sellingPrice);
        const variantCrossedPrice =
          variant.crossedPrice === ""
            ? null
            : Number(variant.crossedPrice);
        const variantQuantity = Number(variant.quantity);
        const variantWeight =
          variant.weight === "" ? null : Number(variant.weight);

        if (!size || !colorName) {
          setError(
            `Variant ${index + 1}: enter both size and color.`,
          );
          return;
        }

        if (!/^#[0-9a-fA-F]{6}$/.test(variant.colorCode)) {
          setError(`Variant ${index + 1}: select a valid color.`);
          return;
        }

        if (!Number.isFinite(variantPrice) || variantPrice <= 0) {
          setError(
            `Variant ${index + 1}: selling price must be greater than 0.`,
          );
          return;
        }

        if (
          variantCrossedPrice !== null &&
          (!Number.isFinite(variantCrossedPrice) ||
            variantCrossedPrice < variantPrice)
        ) {
          setError(
            `Variant ${index + 1}: crossed-out price must be at least its selling price.`,
          );
          return;
        }

        if (
          !Number.isInteger(variantQuantity) ||
          variantQuantity < 0
        ) {
          setError(
            `Variant ${index + 1}: quantity must be a whole number of 0 or more.`,
          );
          return;
        }

        if (
          variantWeight !== null &&
          (!Number.isFinite(variantWeight) || variantWeight < 0)
        ) {
          setError(
            `Variant ${index + 1}: weight must be 0 or greater.`,
          );
          return;
        }

        const duplicate = preparedVariants.some(
          (item) =>
            item.size.toLowerCase() === size.toLowerCase() &&
            item.name.split(" - ")[0].toLowerCase() ===
              colorName.toLowerCase(),
        );

        if (duplicate) {
          setError(
            `Variant ${index + 1}: this size and color combination already exists.`,
          );
          return;
        }

        const preparedVariant = {
          name: `${colorName} - ${size}`,
          size,
          colorCodes: [variant.colorCode],
          sellingPrice: variantPrice,
          quantity: variantQuantity,
        };

        if (variantCrossedPrice !== null) {
          preparedVariant.crossedPrice = variantCrossedPrice;
        }

        if (variantWeight !== null) {
          preparedVariant.weight = variantWeight;
        }

        preparedVariants.push(preparedVariant);
      }
    } else {
      sellingPrice = Number(form.sellingPrice);
      crossedPrice =
        form.crossedPrice === "" ? null : Number(form.crossedPrice);
      quantity = Number(form.quantity);
      weight = form.weight === "" ? null : Number(form.weight);

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
    }

    setSaving(true);

    try {
      let imageUrls = form.imageUrls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean);

      if (selectedImage) {
        setUploadingImage(true);

        try {
          const response = await uploadProductImage(
            selectedImage,
            storeId,
          );

          imageUrls = [extractUploadedImageUrl(response)];
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
      };

      if (hasVariants && !isEditing) {
        payload.variants = preparedVariants;
      } else {
        payload.sellingPrice = sellingPrice;
        payload.quantity = quantity;
        payload.crossedPrice = crossedPrice;
        payload.weight = weight;
      }

      if (form.productDescription.trim()) {
        payload.productDescription = form.productDescription.trim();
      }

      if (form.longDescription.trim()) {
        payload.longDescription = form.longDescription.trim();
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-lg sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="break-words rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          {categoryError && (
            <div
              role="alert"
              className="break-words rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
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

          {/* Category, Audience and Status remain aligned in one row. */}
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="min-w-0">
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
                    value={String(category.id)}
                    disabled={category.isAvailable === false}
                  >
                    {category.name}
                    {category.isAvailable === false
                      ? " (Unavailable)"
                      : ""}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setShowNewCategory((previous) => !previous);
                  setNewCategoryError("");
                  setError("");
                }}
                disabled={!storeId || creatingCategory}
                className="mt-2 text-xs font-semibold text-gray-900 hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showNewCategory
                  ? "− Cancel adding category"
                  : "+ Add new category"}
              </button>

              {loadingCategories && (
                <p className="mt-1 text-xs text-gray-500">
                  Loading your store categories...
                </p>
              )}
            </div>

            <div className="min-w-0">
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

            <div className="min-w-0">
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

          {/* Full-width category form, outside the three-column grid. */}
          {showNewCategory && (
            <section className="w-full min-w-0 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Create category
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Add a category name, description, and optional photo.
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className={labelClass}>
                    Category name *
                  </label>
                  <input
                    autoFocus
                    required
                    maxLength={100}
                    value={newCategoryName}
                    onChange={(event) =>
                      setNewCategoryName(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setShowNewCategory(false);
                        resetNewCategoryForm();
                      }
                    }}
                    placeholder="e.g. Running shoes"
                    className={inputClass}
                    disabled={creatingCategory}
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={newCategoryDescription}
                    onChange={(event) =>
                      setNewCategoryDescription(event.target.value)
                    }
                    placeholder="Briefly describe this category"
                    className={`${inputClass} resize-none`}
                    disabled={creatingCategory}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className={labelClass}>Category photo</label>

                <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 transition hover:border-gray-500">
                  {newCategoryPreview ? (
                    <img
                      src={newCategoryPreview}
                      alt="Category preview"
                      className="mb-3 h-24 w-24 rounded-lg border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
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
                    {newCategoryImage
                      ? "Choose another photo"
                      : "Upload photo"}
                  </span>

                  <span className="mt-1 text-center text-xs text-gray-500">
                    Optional · Maximum 5 MB
                  </span>

                  <input
                    ref={categoryFileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={creatingCategory}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;

                      if (!file.type.startsWith("image/")) {
                        setNewCategoryError(
                          "Please select a valid image file.",
                        );
                        event.target.value = "";
                        return;
                      }

                      if (file.size > MAX_IMAGE_SIZE) {
                        setNewCategoryError(
                          "Category image must be 5 MB or smaller.",
                        );
                        event.target.value = "";
                        return;
                      }

                      setNewCategoryError("");
                      setNewCategoryImage(file);
                    }}
                  />
                </label>

                {newCategoryImage && (
                  <div className="mt-3 flex min-w-0 items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p
                        title={newCategoryImage.name}
                        className="truncate text-xs font-medium text-gray-800"
                      >
                        {newCategoryImage.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {(newCategoryImage.size / 1024).toFixed(0)} KB
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewCategoryImage(null);
                        if (categoryFileInputRef.current) {
                          categoryFileInputRef.current.value = "";
                        }
                      }}
                      disabled={creatingCategory}
                      className="shrink-0 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {newCategoryError && (
                <p
                  role="alert"
                  className="break-words text-xs text-red-600"
                >
                  {newCategoryError}
                </p>
              )}

              <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory(false);
                    resetNewCategoryForm();
                  }}
                  disabled={creatingCategory}
                  className="rounded border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={
                    creatingCategory ||
                    !newCategoryName.trim() ||
                    !storeId
                  }
                  className="rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingCategory
                    ? "Creating category..."
                    : "Create category"}
                </button>
              </div>
            </section>
          )}

          {!isEditing && (
            <div className="rounded-lg border border-gray-200 p-3">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(event) => {
                    setHasVariants(event.target.checked);
                    setError("");
                  }}
                  className="mt-0.5 h-4 w-4 accent-black"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    This product has variants
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    Use this for products with different sizes or colors.
                    Each combination has its own price and stock.
                  </span>
                </span>
              </label>
            </div>
          )}

          {hasVariants && !isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Size and color combinations
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add one row for each combination you sell.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="shrink-0 rounded border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                >
                  + Add variant
                </button>
              </div>

              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">
                      Variant {index + 1}
                    </p>

                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="min-w-0">
                      <label className={labelClass}>Size *</label>
                      <input
                        required
                        value={variant.size}
                        onChange={(event) =>
                          updateVariant(index, "size", event.target.value)
                        }
                        placeholder="S, M, L or XL"
                        className={inputClass}
                      />
                    </div>

                    <div className="min-w-0">
                      <label className={labelClass}>Color name *</label>
                      <input
                        required
                        value={variant.colorName}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "colorName",
                            event.target.value,
                          )
                        }
                        placeholder="Black"
                        className={inputClass}
                      />
                    </div>

                    <div className="min-w-0">
                      <label className={labelClass}>Color *</label>
                      <div className="flex h-[38px] items-center gap-2 rounded border border-gray-300 px-2">
                        <input
                          type="color"
                          value={variant.colorCode}
                          onChange={(event) =>
                            updateVariant(
                              index,
                              "colorCode",
                              event.target.value,
                            )
                          }
                          aria-label={`Variant ${index + 1} color`}
                          className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="text-xs text-gray-600">
                          {variant.colorCode.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className={labelClass}>
                        Selling price (Nrs) *
                      </label>
                      <input
                        required
                        type="number"
                        min="0.01"
                        step="any"
                        value={variant.sellingPrice}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "sellingPrice",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="min-w-0">
                      <label className={labelClass}>
                        Crossed-out price (Nrs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variant.crossedPrice}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "crossedPrice",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="min-w-0">
                      <label className={labelClass}>Quantity *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="1"
                        value={variant.quantity}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="min-w-0">
                      <label className={labelClass}>Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variant.weight}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "weight",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
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

                <div className="min-w-0">
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

              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="min-w-0">
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

                <div className="min-w-0">
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
            </>
          )}

          <div className="min-w-0">
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
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
              )}

              <span className="text-sm font-medium text-gray-800">
                {selectedImage ? "Choose a different image" : "Choose image"}
              </span>

              <span className="mt-1 text-center text-xs text-gray-500">
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
              <div className="mt-3 flex min-w-0 items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2">
                <p
                  title={selectedImage.name}
                  className="min-w-0 flex-1 truncate text-xs text-gray-600"
                >
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
                The current image will be kept unless you choose a replacement.
              </p>
            )}
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

          {isEditing && (
            <p className="text-xs text-gray-500">
              Variant inventory is managed separately from general product
              information.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || creatingCategory}
              className="cursor-pointer rounded px-4 py-2 text-xs font-semibold text-gray-600 transition hover:text-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                uploadingImage ||
                creatingCategory ||
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
