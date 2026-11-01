
import { useEffect, useRef, useState } from "react";
import { getCategories } from "../../services/categoryService";
import { useCreateCategory } from "../../hooks/useCategories";
import { useBrands } from "../../hooks/useBrands";
import {
  uploadProductImage,
  uploadProductSeoImage,
} from "../../services/productService";

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

const emptyVariant = () => ({
  size: "",
  colorName: "",
  colorCode: "#000000",
  sellingPrice: "",
  crossedPrice: "",
  costPrice: "",
  quantity: "",
  weight: "",
  sku: "",
  hsCode: "",
  altBarcode: "",
});

const parseTags = (text) => [
  ...new Set(
    String(text)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  ),
];

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

function checkImage(file) {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 5 MB or smaller.";
  }

  return "";
}

function toForm(product) {
  const images =
    Array.isArray(product?.imageUrls) && product.imageUrls.length > 0
      ? product.imageUrls
      : product?.image
        ? [product.image]
        : [];

  return {
    name: product?.name ?? "",
    brandId: product?.brandId ?? product?.brand?.id ?? "",
    categoryId:
      product?.categoryIds?.[0] ??
      product?.categories?.[0]?.id ??
      product?.category?.id ??
      "",
    audience: product?.audience ?? "UNISEX",
    status: product?.status ?? "ACTIVE",
    isAvailable: product?.isAvailable ?? true,
    slug: product?.slug ?? "",
    productDescription:
      product?.productDescription ?? product?.description ?? "",
    longDescription: product?.longDescription ?? "",
    imageUrls: images,
    tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
    releaseDate: product?.releaseDate
      ? String(product.releaseDate).slice(0, 10)
      : "",
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
    seoImage: product?.seoImage ?? "",
    sellingPrice: product?.sellingPrice ?? product?.price ?? "",
    crossedPrice: product?.crossedPrice ?? product?.discountPrice ?? "",
    quantity: product?.quantity ?? product?.totalStock ?? "",
    weight: product?.weight ?? "",
  };
}

function toValues(form) {
  return {
    name: form.name.trim(),
    audience: form.audience,
    isAvailable: form.isAvailable,
    brandId: form.brandId,
    categoryIds: form.categoryId ? [form.categoryId] : [],
    productDescription: form.productDescription.trim(),
    longDescription: form.longDescription.trim(),
    slug: form.slug.trim(),
    imageUrls: form.imageUrls,
    status: form.status,
    tags: parseTags(form.tags),
    releaseDate: form.releaseDate,
    seoTitle: form.seoTitle.trim(),
    seoDescription: form.seoDescription.trim(),
    seoImage: form.seoImage,
  };
}

function pickChanged(now, before, keys) {
  const changed = {};

  keys.forEach((key) => {
    if (JSON.stringify(now[key]) !== JSON.stringify(before[key])) {
      changed[key] = now[key];
    }
  });

  return changed;
}

function buildVariants(variants) {
  if (variants.length === 0) {
    return { error: "Add at least one product variant." };
  }

  const result = [];

  for (let i = 0; i < variants.length; i += 1) {
    const variant = variants[i];
    const label = `Variant ${i + 1}`;

    const size = variant.size.trim();
    const colorName = variant.colorName.trim();
    const sellingPrice = Number(variant.sellingPrice);
    const crossedPrice =
      variant.crossedPrice === "" ? null : Number(variant.crossedPrice);
    const costPrice =
      variant.costPrice === "" ? null : Number(variant.costPrice);
    const quantity = Number(variant.quantity);
    const weight = variant.weight === "" ? null : Number(variant.weight);

    if (!size || !colorName) {
      return { error: `${label}: enter both size and color name.` };
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(variant.colorCode)) {
      return { error: `${label}: select a valid color.` };
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      return { error: `${label}: selling price must be greater than 0.` };
    }

    if (
      crossedPrice !== null &&
      (!Number.isFinite(crossedPrice) || crossedPrice < sellingPrice)
    ) {
      return {
        error: `${label}: crossed-out price must be at least the selling price.`,
      };
    }

    if (costPrice !== null && (!Number.isFinite(costPrice) || costPrice < 0)) {
      return { error: `${label}: cost price must be 0 or greater.` };
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return {
        error: `${label}: quantity must be a whole number of 0 or more.`,
      };
    }

    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      return { error: `${label}: weight must be 0 or greater.` };
    }

    const duplicate = result.some(
      (item) =>
        item.size.toLowerCase() === size.toLowerCase() &&
        item.name.split(" - ")[0].toLowerCase() ===
          colorName.toLowerCase(),
    );

    if (duplicate) {
      return {
        error: `${label}: this size and color combination already exists.`,
      };
    }

    result.push({
      name: `${colorName} - ${size}`,
      size,
      colorCodes: [variant.colorCode],
      sellingPrice,
      quantity,
      ...(crossedPrice !== null && { crossedPrice }),
      ...(costPrice !== null && { costPrice }),
      ...(weight !== null && { weight }),
      ...(variant.sku.trim() && { sku: variant.sku.trim() }),
      ...(variant.hsCode.trim() && { hsCode: variant.hsCode.trim() }),
      ...(variant.altBarcode.trim() && {
        altBarcode: variant.altBarcode.trim(),
      }),
    });
  }

  return { variants: result };
}

function Section({ title, children }) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
      <legend className="px-1 text-xs font-bold tracking-wide text-gray-500 uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export default function ProductFormModal({
  initialData,
  onSave,
  onClose,
  storeId,
}) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState(() => toForm(initialData));
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingSeoImage, setUploadingSeoImage] = useState(false);
  const [error, setError] = useState("");

  // Brand data.
  const { data: brands = [], isLoading: loadingBrands } = useBrands(storeId, {
    page: 1,
    limit: 100,
  });

  // Inline category creation.
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [newCategoryPreview, setNewCategoryPreview] = useState("");
  const [newCategoryError, setNewCategoryError] = useState("");

  const createCategoryMutation = useCreateCategory(storeId);
  const creatingCategory = createCategoryMutation.isPending;

  const categoryFileInputRef = useRef(null);

  // Variants are created with new products.
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([emptyVariant()]);

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

  // Load categories belonging to the selected store.
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

        const items = extractCategories(response);

        if (!cancelled) {
          setCategories(items);
        }
      } catch (err) {
        if (!cancelled) {
          setCategories([]);
          setCategoryError(err?.message || "Unable to load categories.");
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
        (category) => String(category.id) === String(preferredCategoryId),
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
      setNewCategoryError("Store ID is missing. Please select your store.");
      return;
    }

    if (newCategoryImage) {
      const problem = checkImage(newCategoryImage);

      if (problem) {
        setNewCategoryError(problem);
        return;
      }
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
      setNewCategoryError(err?.message || "Unable to create category.");
    }
  };

  const handleChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  // Product image uploads.
  const handleProductImages = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setError("");

    for (const file of files) {
      const problem = checkImage(file);

      if (problem) {
        setError(problem);
        return;
      }
    }

    if (!storeId) {
      setError("Please select your store before uploading images.");
      return;
    }

    setUploadingImage(true);

    try {
      for (const file of files) {
        const response = await uploadProductImage(file, storeId);
        const url = extractUploadedImageUrl(response);

        setForm((previous) => ({
          ...previous,
          imageUrls: [...previous.imageUrls, url],
        }));
      }
    } catch (err) {
      setError(err?.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setForm((previous) => ({
      ...previous,
      imageUrls: previous.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // SEO image upload.
  const handleSeoImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");

    const problem = checkImage(file);

    if (problem) {
      setError(problem);
      return;
    }

    if (!storeId) {
      setError("Please select your store before uploading an image.");
      return;
    }

    setUploadingSeoImage(true);

    try {
      const response = await uploadProductSeoImage(file, storeId);
      const url = extractUploadedImageUrl(response);

      setForm((previous) => ({
        ...previous,
        seoImage: url,
      }));
    } catch (err) {
      setError(err?.message || "SEO image upload failed.");
    } finally {
      setUploadingSeoImage(false);
    }
  };

  // Variant controls.
  const updateVariant = (index, field, value) => {
    setVariants((previous) =>
      previous.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const addVariant = () => {
    setVariants((previous) => [...previous, emptyVariant()]);
  };

  const removeVariant = (index) => {
    setVariants((previous) => previous.filter((_, i) => i !== index));
  };

  // Submit product.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const values = toValues(form);

    if (!values.name) {
      setError("Product name is required.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    const selectedCategory = categories.find(
      (category) => String(category.id) === String(form.categoryId),
    );

    if (!selectedCategory) {
      setError("The selected category was not found. Reload the form.");
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

    // Validate simple product pricing.
    let simpleProductData = null;

    if (!isEdit && !hasVariants) {
      const sellingPrice = Number(form.sellingPrice);
      const crossedPrice =
        form.crossedPrice === "" ? null : Number(form.crossedPrice);
      const quantity = Number(form.quantity);
      const weight = form.weight === "" ? null : Number(form.weight);

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

      if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
        setError("Weight must be 0 or greater.");
        return;
      }

      simpleProductData = {
        sellingPrice,
        quantity,
        ...(crossedPrice !== null && { crossedPrice }),
        ...(weight !== null && { weight }),
      };
    }

    // Validate variants.
    let builtVariants = null;

    if (!isEdit && hasVariants) {
      builtVariants = buildVariants(variants);

      if (builtVariants.error) {
        setError(builtVariants.error);
        return;
      }
    }

    setSaving(true);

    try {
      if (isEdit) {
        const before = toValues(toForm(initialData));
        const data = {};

        const general = pickChanged(values, before, [
          "name",
          "audience",
          "isAvailable",
          "brandId",
          "categoryIds",
          "productDescription",
          "longDescription",
          "slug",
          "imageUrls",
        ]);

        // These fields cannot be cleared through the API.
        if (!general.brandId) delete general.brandId;
        if (!general.slug) delete general.slug;

        if (Object.keys(general).length > 0) {
          data.general = general;
        }

        if (values.status !== before.status) {
          data.status = values.status;
        }

        const custom = pickChanged(values, before, [
          "tags",
          "releaseDate",
        ]);

        if (!custom.releaseDate) {
          delete custom.releaseDate;
        }

        if (Object.keys(custom).length > 0) {
          data.custom = custom;
        }

        const seo = pickChanged(values, before, [
          "seoTitle",
          "seoDescription",
          "seoImage",
        ]);

        if (Object.keys(seo).length > 0) {
          data.seo = seo;
        }

        if (Object.keys(data).length === 0) {
          onClose();
          return;
        }

        await onSave(data);
      } else {
        const payload = {
          name: values.name,
          channel: "ALL",
          audience: values.audience,
          status: values.status,
          isAvailable: values.isAvailable,
          categoryIds: values.categoryIds,
          imageUrls: values.imageUrls,
          tags: values.tags,
          ...(values.brandId && { brandId: values.brandId }),
          ...(values.productDescription && {
            productDescription: values.productDescription,
          }),
          ...(values.longDescription && {
            longDescription: values.longDescription,
          }),
          ...(values.releaseDate && {
            releaseDate: values.releaseDate,
          }),
          ...(hasVariants
            ? { variants: builtVariants.variants }
            : simpleProductData),
        };

        const seo = {
          ...(values.seoTitle && { seoTitle: values.seoTitle }),
          ...(values.seoDescription && {
            seoDescription: values.seoDescription,
          }),
          ...(values.seoImage && { seoImage: values.seoImage }),
        };

        await onSave({ payload, seo });
      }
    } catch (err) {
      setError(err?.message || "Unable to save the product.");
    } finally {
      setSaving(false);
    }
  };

  const busy =
    saving || uploadingImage || uploadingSeoImage || creatingCategory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-lg sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {isEdit ? "Edit Product" : "Add Product"}
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

          {/* Basic information */}
          <Section title="Basic info">
            <div>
              <label className={labelClass}>Name *</label>
              <input
                required
                value={form.name}
                onChange={handleChange("name")}
                className={inputClass}
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0">
                <label className={labelClass}>Brand</label>
                <select
                  value={form.brandId}
                  onChange={handleChange("brandId")}
                  className={inputClass}
                >
                  <option value="">
                    {loadingBrands ? "Loading brands..." : "No brand"}
                  </option>

                  {brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.id}
                      disabled={brand.isAvailable === false}
                    >
                      {brand.name}
                      {brand.isAvailable === false ? " (Unavailable)" : ""}
                    </option>
                  ))}
                </select>
              </div>

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

            {isEdit && (
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  value={form.slug}
                  onChange={handleChange("slug")}
                  className={inputClass}
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    isAvailable: event.target.checked,
                  }))
                }
              />
              Available for sale
            </label>
          </Section>

          {/* Inline category creation */}
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
                <div>
                  <label className={labelClass}>Category name *</label>
                  <input
                    autoFocus
                    required
                    maxLength={100}
                    value={newCategoryName}
                    onChange={(event) =>
                      setNewCategoryName(event.target.value)
                    }
                    placeholder="e.g. Running shoes"
                    className={inputClass}
                    disabled={creatingCategory}
                  />
                </div>

                <div>
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

              <div>
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
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>
                  )}

                  <span className="text-sm font-medium text-gray-800">
                    {newCategoryImage ? "Choose another photo" : "Upload photo"}
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

                      const problem = checkImage(file);

                      if (problem) {
                        setNewCategoryError(problem);
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
                <p role="alert" className="break-words text-xs text-red-600">
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
                  {creatingCategory ? "Creating category..." : "Create category"}
                </button>
              </div>
            </section>
          )}

          {/* Product images */}
          <Section title="Images">
            {form.imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {form.imageUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="h-24 w-full rounded-md border bg-gray-50 object-contain"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 rounded bg-white/90 px-1.5 text-xs font-semibold text-red-600 shadow hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-gray-500">
              <span className="text-sm font-medium text-gray-800">
                {uploadingImage ? "Uploading..." : "Add images"}
              </span>

              <span className="mt-1 text-xs text-gray-500">
                Image files · Maximum 5 MB each
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingImage || !storeId}
                onChange={handleProductImages}
                className="sr-only"
              />
            </label>
          </Section>

          {/* Simple product or variants */}
          {!isEdit && (
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
                    Use this for products with different sizes or colors. Each
                    combination has its own price and stock.
                  </span>
                </span>
              </label>
            </div>
          )}

          {!isEdit && hasVariants ? (
            <Section title="Variants">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Add one row for each size and color combination.
                </p>

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
                    <div>
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

                    <div>
                      <label className={labelClass}>Color name *</label>
                      <input
                        required
                        value={variant.colorName}
                        onChange={(event) =>
                          updateVariant(index, "colorName", event.target.value)
                        }
                        placeholder="Black"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Color *</label>
                      <div className="flex h-[38px] items-center gap-2 rounded border border-gray-300 px-2">
                        <input
                          type="color"
                          value={variant.colorCode}
                          onChange={(event) =>
                            updateVariant(index, "colorCode", event.target.value)
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
                    <div>
                      <label className={labelClass}>Selling price (Nrs) *</label>
                      <input
                        required
                        type="number"
                        min="0.01"
                        step="any"
                        value={variant.sellingPrice}
                        onChange={(event) =>
                          updateVariant(index, "sellingPrice", event.target.value)
                        }
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
                        value={variant.crossedPrice}
                        onChange={(event) =>
                          updateVariant(index, "crossedPrice", event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Cost price (Nrs)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variant.costPrice}
                        onChange={(event) =>
                          updateVariant(index, "costPrice", event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Quantity *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="1"
                        value={variant.quantity}
                        onChange={(event) =>
                          updateVariant(index, "quantity", event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variant.weight}
                        onChange={(event) =>
                          updateVariant(index, "weight", event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>SKU</label>
                      <input
                        value={variant.sku}
                        onChange={(event) =>
                          updateVariant(index, "sku", event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>HS code</label>
                      <input
                        value={variant.hsCode}
                        onChange={(event) =>
                          updateVariant(index, "hsCode", event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Barcode</label>
                      <input
                        value={variant.altBarcode}
                        onChange={(event) =>
                          updateVariant(index, "altBarcode", event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Section>
          ) : !isEdit ? (
            <Section title="Pricing and stock">
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
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
            </Section>
          ) : (
            <p className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
              Variant prices and stock are managed separately from general
              product information.
            </p>
          )}

          {/* Product details */}
          <Section title="Details">
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

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={handleChange("tags")}
                  placeholder="oversized, cotton, summer"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Release date</label>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={handleChange("releaseDate")}
                  className={inputClass}
                />
              </div>
            </div>
          </Section>

          {/* SEO */}
          <Section title="SEO (optional)">
            <div>
              <label className={labelClass}>SEO title</label>
              <input
                value={form.seoTitle}
                onChange={handleChange("seoTitle")}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>SEO description</label>
              <textarea
                rows={2}
                value={form.seoDescription}
                onChange={handleChange("seoDescription")}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className={labelClass}>SEO image</label>

              <div className="flex flex-wrap items-center gap-3">
                {form.seoImage && (
                  <img
                    src={form.seoImage}
                    alt="SEO preview"
                    className="h-16 w-16 rounded border bg-gray-50 object-contain"
                  />
                )}

                <label className="cursor-pointer rounded border border-gray-300 px-3 py-2 text-xs font-medium text-gray-800 hover:border-gray-500">
                  {uploadingSeoImage
                    ? "Uploading..."
                    : form.seoImage
                      ? "Replace image"
                      : "Choose image"}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingSeoImage || !storeId}
                    onChange={handleSeoImage}
                    className="sr-only"
                  />
                </label>

                {form.seoImage && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        seoImage: "",
                      }))
                    }
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </Section>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="cursor-pointer rounded px-4 py-2 text-xs font-semibold text-gray-600 transition hover:text-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                busy ||
                loadingCategories ||
                Boolean(categoryError)
              }
              className="cursor-pointer rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : uploadingImage || uploadingSeoImage
                  ? "Uploading image..."
                  : creatingCategory
                    ? "Creating category..."
                    : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

