import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";
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
  "w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black";

const labelClass = "mb-1 block text-xs font-medium text-gray-600";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyVariant = () => ({
  name: "",
  size: "",
  colorCode: "",
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

// Form state from a product (or blank for a new one).
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
    variants: [emptyVariant()],
  };
}

// The values as the API sees them. Used to build payloads and to
// work out which parts of an edited product actually changed.
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

// Keep only the keys whose value differs from the original.
function pickChanged(now, before, keys) {
  const changed = {};

  keys.forEach((key) => {
    if (JSON.stringify(now[key]) !== JSON.stringify(before[key])) {
      changed[key] = now[key];
    }
  });

  return changed;
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

// Validate the variants and convert them to the API shape.
function buildVariants(variants) {
  if (variants.length === 0) {
    return { error: "Add at least one variant." };
  }

  const result = [];

  for (let i = 0; i < variants.length; i += 1) {
    const v = variants[i];
    const label = `Variant ${i + 1}`;

    const sellingPrice = Number(v.sellingPrice);
    const quantity = Number(v.quantity);
    const crossedPrice = v.crossedPrice === "" ? null : Number(v.crossedPrice);
    const costPrice = v.costPrice === "" ? null : Number(v.costPrice);
    const weight = v.weight === "" ? null : Number(v.weight);

    if (!v.name.trim()) {
      return { error: `${label}: name is required.` };
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

    result.push({
      name: v.name.trim(),
      ...(v.size.trim() && { size: v.size.trim() }),
      ...(v.colorCode && { colorCodes: [v.colorCode] }),
      sellingPrice,
      ...(crossedPrice !== null && { crossedPrice }),
      ...(costPrice !== null && { costPrice }),
      quantity,
      ...(weight !== null && { weight }),
      ...(v.sku.trim() && { sku: v.sku.trim() }),
      ...(v.hsCode.trim() && { hsCode: v.hsCode.trim() }),
      ...(v.altBarcode.trim() && { altBarcode: v.altBarcode.trim() }),
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

  const { data: brands = [], isLoading: loadingBrands } = useBrands(storeId, {
    page: 1,
    limit: 100,
  });

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

        const payload = response?.data ?? response;
        const items = payload?.categories ?? payload?.data?.categories;

        if (!Array.isArray(items)) {
          throw new Error("Unexpected categories response from the server.");
        }

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

  const handleChange = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  // ---------- Product images (uploaded as soon as they are chosen) ----------

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

    setUploadingImage(true);

    try {
      for (const file of files) {
        const response = await uploadProductImage(file, storeId);
        const url = response.data.url;

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

    setUploadingSeoImage(true);

    try {
      const response = await uploadProductSeoImage(file, storeId);
      setForm((previous) => ({ ...previous, seoImage: response.data.url }));
    } catch (err) {
      setError(err?.message || "SEO image upload failed.");
    } finally {
      setUploadingSeoImage(false);
    }
  };

  // ---------- Variants (create only) ----------

  const setVariant = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      variants: previous.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  const addVariant = () => {
    setForm((previous) => ({
      ...previous,
      variants: [...previous.variants, emptyVariant()],
    }));
  };

  const removeVariant = (index) => {
    setForm((previous) => ({
      ...previous,
      variants: previous.variants.filter((_, i) => i !== index),
    }));
  };

  // ---------- Submit ----------

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
      (category) => category.id === form.categoryId,
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

        // These can't be cleared through the API, so never send them empty.
        if (!general.brandId) delete general.brandId;
        if (!general.slug) delete general.slug;

        if (Object.keys(general).length > 0) data.general = general;

        if (values.status !== before.status) data.status = values.status;

        const custom = pickChanged(values, before, ["tags", "releaseDate"]);
        if (!custom.releaseDate) delete custom.releaseDate;
        if (Object.keys(custom).length > 0) data.custom = custom;

        const seo = pickChanged(values, before, [
          "seoTitle",
          "seoDescription",
          "seoImage",
        ]);
        if (Object.keys(seo).length > 0) data.seo = seo;

        if (Object.keys(data).length === 0) {
          onClose(); // nothing changed
          return;
        }

        await onSave(data);
      } else {
        const built = buildVariants(form.variants);

        if (built.error) {
          setError(built.error);
          return;
        }

        const payload = {
          name: values.name,
          channel: "ALL",
          audience: values.audience,
          status: values.status,
          isAvailable: values.isAvailable,
          categoryIds: values.categoryIds,
          imageUrls: values.imageUrls,
          tags: values.tags,
          variants: built.variants,
          ...(values.brandId && { brandId: values.brandId }),
          ...(values.productDescription && {
            productDescription: values.productDescription,
          }),
          ...(values.longDescription && {
            longDescription: values.longDescription,
          }),
          ...(values.releaseDate && { releaseDate: values.releaseDate }),
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

  const busy = saving || uploadingImage || uploadingSeoImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* ---------- Basic info ---------- */}
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
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
                      {category.isAvailable === false ? " (Unavailable)" : ""}
                    </option>
                  ))}
                </select>
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

          {/* ---------- Images ---------- */}
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
                disabled={uploadingImage}
                onChange={handleProductImages}
                className="sr-only"
              />
            </label>
          </Section>

          {/* ---------- Descriptions, tags ---------- */}
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          {/* ---------- Variants (create) ---------- */}
          {isEdit ? (
            <p className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
              Variant prices and stock can't be edited here yet. They'll be
              managed through the inventory update once that endpoint is ready.
            </p>
          ) : (
            <Section title="Variants *">
              {form.variants.map((variant, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">
                      Variant {index + 1}
                    </p>

                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Name *</label>
                      <input
                        value={variant.name}
                        onChange={(e) =>
                          setVariant(index, "name", e.target.value)
                        }
                        placeholder="Black - Medium"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Size</label>
                      <input
                        value={variant.size}
                        onChange={(e) =>
                          setVariant(index, "size", e.target.value)
                        }
                        placeholder="M"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className={labelClass}>Selling price *</label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={variant.sellingPrice}
                        onChange={(e) =>
                          setVariant(index, "sellingPrice", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Crossed price</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variant.crossedPrice}
                        onChange={(e) =>
                          setVariant(index, "crossedPrice", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Cost price</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variant.costPrice}
                        onChange={(e) =>
                          setVariant(index, "costPrice", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.quantity}
                        onChange={(e) =>
                          setVariant(index, "quantity", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <label className={labelClass}>Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={variant.weight}
                        onChange={(e) =>
                          setVariant(index, "weight", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>SKU</label>
                      <input
                        value={variant.sku}
                        onChange={(e) =>
                          setVariant(index, "sku", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>HS code</label>
                      <input
                        value={variant.hsCode}
                        onChange={(e) =>
                          setVariant(index, "hsCode", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Barcode</label>
                      <input
                        value={variant.altBarcode}
                        onChange={(e) =>
                          setVariant(index, "altBarcode", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className={`${labelClass} mb-0`}>Color</label>
                    <input
                      type="color"
                      value={variant.colorCode || "#000000"}
                      onChange={(e) =>
                        setVariant(index, "colorCode", e.target.value)
                      }
                      className="h-8 w-12 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-xs text-gray-500">
                      {variant.colorCode || "No color"}
                    </span>
                    {variant.colorCode && (
                      <button
                        type="button"
                        onClick={() => setVariant(index, "colorCode", "")}
                        className="text-xs font-medium text-gray-600 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-semibold text-gray-800 hover:underline"
              >
                + Add another variant
              </button>
            </Section>
          )}

          {/* ---------- SEO ---------- */}
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

              <div className="flex items-center gap-3">
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
                    disabled={uploadingSeoImage}
                    onChange={handleSeoImage}
                    className="sr-only"
                  />
                </label>

                {form.seoImage && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({ ...previous, seoImage: "" }))
                    }
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </Section>

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
              disabled={busy || loadingCategories || Boolean(categoryError)}
              className="cursor-pointer rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : uploadingImage || uploadingSeoImage
                  ? "Uploading image..."
                  : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}