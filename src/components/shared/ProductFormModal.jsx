import { useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { getCategories } from "../../services/categoryService";
import { getBrands } from "../../services/brandService";

import { useCategories, useCreateCategory } from "../../hooks/useCategories";
import { useBrands, useCreateBrand } from "../../hooks/useBrands";

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

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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

const toText = (value) =>
  value === null || value === undefined ? "" : String(value);

const isBlank = (value) => String(value ?? "").trim() === "";

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

function extractCreatedBrand(response) {
  const payload = response?.data ?? response;
  const brand = payload?.brand ?? payload?.data?.brand ?? payload;

  return brand && typeof brand === "object" && brand.id != null
    ? brand
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

// Object URL for a local file, revoked automatically when it changes.
function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}

function toForm(product) {
  const images =
    Array.isArray(product?.imageUrls) && product.imageUrls.length > 0
      ? product.imageUrls
      : product?.image
        ? [product.image]
        : [];

  return {
    name: toText(product?.name),
    brandId: toText(product?.brandId ?? product?.brand?.id),
    categoryId: toText(
      product?.categoryIds?.[0] ??
        product?.categories?.[0]?.id ??
        product?.category?.id,
    ),
    audience: product?.audience ?? "UNISEX",
    status: product?.status ?? "ACTIVE",
    isAvailable: product?.isAvailable ?? true,
    slug: toText(product?.slug),
    productDescription: toText(
      product?.productDescription ?? product?.description,
    ),
    longDescription: toText(product?.longDescription),
    imageUrls: images,
    tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
    releaseDate: product?.releaseDate
      ? String(product.releaseDate).slice(0, 10)
      : "",
    seoTitle: toText(product?.seoTitle),
    seoDescription: toText(product?.seoDescription),
    seoImage: toText(product?.seoImage),
    sellingPrice: toText(product?.sellingPrice ?? product?.price),
    crossedPrice: toText(product?.crossedPrice ?? product?.discountPrice),
    quantity: toText(product?.quantity ?? product?.totalStock),
    weight: toText(product?.weight),
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

function buildVariantPayload(variants) {
  return variants.map((variant) => {
    const size = variant.size.trim();
    const colorName = variant.colorName.trim();

    const crossedPrice = isBlank(variant.crossedPrice)
      ? null
      : Number(variant.crossedPrice);
    const costPrice = isBlank(variant.costPrice)
      ? null
      : Number(variant.costPrice);
    const weight = isBlank(variant.weight) ? null : Number(variant.weight);

    return {
      name: `${colorName} - ${size}`,
      size,
      colorCodes: [variant.colorCode],
      sellingPrice: Number(variant.sellingPrice),
      quantity: Number(variant.quantity),
      ...(crossedPrice !== null && { crossedPrice }),
      ...(costPrice !== null && { costPrice }),
      ...(weight !== null && { weight }),
      ...(variant.sku.trim() && { sku: variant.sku.trim() }),
      ...(variant.hsCode.trim() && { hsCode: variant.hsCode.trim() }),
      ...(variant.altBarcode.trim() && {
        altBarcode: variant.altBarcode.trim(),
      }),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Zod schemas                                                         */
/* ------------------------------------------------------------------ */

function addIssue(ctx, path, message) {
  ctx.addIssue({ code: "custom", message, path });
}

// Shared by the simple product form and each variant row.
function validatePricing(source, ctx, basePath) {
  const at = (field) => [...basePath, field];

  const sellingPrice = Number(source.sellingPrice);

  if (
    isBlank(source.sellingPrice) ||
    !Number.isFinite(sellingPrice) ||
    sellingPrice <= 0
  ) {
    addIssue(ctx, at("sellingPrice"), "Selling price must be greater than 0");
  }

  if (!isBlank(source.crossedPrice)) {
    const crossedPrice = Number(source.crossedPrice);

    if (!Number.isFinite(crossedPrice) || crossedPrice < sellingPrice) {
      addIssue(
        ctx,
        at("crossedPrice"),
        "Crossed-out price must be at least the selling price",
      );
    }
  }

  if (!isBlank(source.costPrice)) {
    const costPrice = Number(source.costPrice);

    if (!Number.isFinite(costPrice) || costPrice < 0) {
      addIssue(ctx, at("costPrice"), "Cost price must be 0 or greater");
    }
  }

  const quantity = Number(source.quantity);

  if (isBlank(source.quantity) || !Number.isInteger(quantity) || quantity < 0) {
    addIssue(
      ctx,
      at("quantity"),
      "Quantity must be a whole number of 0 or more",
    );
  }

  if (!isBlank(source.weight)) {
    const weight = Number(source.weight);

    if (!Number.isFinite(weight) || weight < 0) {
      addIssue(ctx, at("weight"), "Weight must be 0 or greater");
    }
  }
}

function validateVariants(variants, ctx) {
  if (variants.length === 0) {
    addIssue(ctx, ["variants"], "Add at least one product variant");
    return;
  }

  const seen = new Set();

  variants.forEach((variant, index) => {
    const base = ["variants", index];
    const size = variant.size.trim();
    const colorName = variant.colorName.trim();

    if (!size) addIssue(ctx, [...base, "size"], "Size is required");

    if (!colorName) {
      addIssue(ctx, [...base, "colorName"], "Color name is required");
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(variant.colorCode)) {
      addIssue(ctx, [...base, "colorCode"], "Select a valid color");
    }

    validatePricing(variant, ctx, base);

    if (size && colorName) {
      const key = `${colorName.toLowerCase()}|${size.toLowerCase()}`;

      if (seen.has(key)) {
        addIssue(
          ctx,
          [...base, "size"],
          "This size and color combination already exists",
        );
      }

      seen.add(key);
    }
  });
}

const variantSchema = z.object({
  size: z.string().trim(),
  colorName: z.string().trim(),
  colorCode: z.string(),
  sellingPrice: z.string(),
  crossedPrice: z.string(),
  costPrice: z.string(),
  quantity: z.string(),
  weight: z.string(),
  sku: z.string().trim(),
  hsCode: z.string().trim(),
  altBarcode: z.string().trim(),
});

function buildProductSchema(isEdit) {
  return z
    .object({
      name: z.string().trim().min(1, "Product name is required"),
      brandId: z.string(),
      categoryId: z.string().min(1, "Please select a category"),
      audience: z.string(),
      status: z.string(),
      isAvailable: z.boolean(),
      slug: z.string().trim(),
      productDescription: z.string().trim(),
      longDescription: z.string().trim(),
      imageUrls: z.array(z.string()),
      tags: z.string(),
      releaseDate: z.string(),
      seoTitle: z.string().trim(),
      seoDescription: z.string().trim(),
      seoImage: z.string(),
      hasVariants: z.boolean(),
      sellingPrice: z.string(),
      crossedPrice: z.string(),
      quantity: z.string(),
      weight: z.string(),
      variants: z.array(variantSchema),
    })
    .superRefine((values, ctx) => {
      // Editing never touches pricing or variants.
      if (isEdit) return;

      if (values.hasVariants) {
        validateVariants(values.variants, ctx);
      } else {
        validatePricing(values, ctx, []);
      }
    });
}

const imageFileSchema = z
  .instanceof(File)
  .superRefine((file, ctx) => {
    const problem = checkImage(file);

    if (problem) {
      ctx.addIssue({ code: "custom", message: problem });
    }
  })
  .nullable()
  .optional();

const newBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be 100 characters or fewer"),
  logo: imageFileSchema,
});

const newCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1000 characters or fewer"),
  photo: imageFileSchema,
});

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

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

// Red asterisk for mandatory fields.
function Req() {
  return (
    <span className="text-red-600" aria-hidden="true">
      *
    </span>
  );
}

function FieldError({ error }) {
  if (!error?.message) return null;
  return (
    <p role="alert" className="mt-1 break-words text-xs text-red-600">
      {error.message}
    </p>
  );
}

// Popup shown above the form so upload and save errors are never hidden.
function ErrorPopup({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-popup-title"
        aria-describedby="error-popup-message"
        className="w-full max-w-sm rounded-lg border border-red-200 bg-white p-5 shadow-xl"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600"
          >
            !
          </span>

          <div className="min-w-0">
            <h3
              id="error-popup-title"
              className="text-sm font-semibold text-gray-900"
            >
              Something needs fixing
            </h3>
            <p
              id="error-popup-message"
              className="mt-1 break-words text-sm text-gray-600"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="cursor-pointer rounded bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// Dashed upload box with preview, used by the inline brand/category panels.
function ImagePicker({
  label,
  file,
  preview,
  onChange,
  disabled,
  fit = "contain",
  uploadText,
  changeText,
  error,
}) {
  const inputRef = useRef(null);

  const clear = () => {
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>

      <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 transition hover:border-gray-500">
        {preview ? (
          <img
            src={preview}
            alt={`${label} preview`}
            className={`mb-3 h-24 w-24 rounded-lg border border-gray-200 ${
              fit === "cover" ? "object-cover" : "object-contain"
            }`}
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
          {file ? changeText : uploadText}
        </span>

        <span className="mt-1 text-center text-xs text-gray-500">
          Optional · Maximum 5 MB
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) onChange(picked);
          }}
        />
      </label>

      {file && (
        <div className="mt-3 flex min-w-0 items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2">
          <div className="min-w-0 flex-1">
            <p
              title={file.name}
              className="truncate text-xs font-medium text-gray-800"
            >
              {file.name}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>

          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="shrink-0 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      )}

      <FieldError error={error} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline "create brand" panel                                         */
/* ------------------------------------------------------------------ */

// This panel sits inside the product <form>, so it never renders a nested
// <form>. Its own useForm is submitted by the button (and the Enter key).
function NewBrandPanel({ storeId, mutation, onCreated, onClose }) {
  const creating = mutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newBrandSchema),
    defaultValues: { name: "", logo: null },
  });

  const logo = useWatch({ control, name: "logo" });
  const preview = useObjectUrl(logo);

  const onSubmit = async ({ name, logo: logoFile }) => {
    if (!storeId) {
      setError("root.server", {
        message: "Store ID is missing. Please select your store.",
      });
      return;
    }

    try {
      const response = await mutation.mutateAsync({
        name,
        logoFile: logoFile || undefined,
        isAvailable: true,
      });

      let created = extractCreatedBrand(response);

      if (!created?.id) {
        const items = await getBrands(storeId, { page: 1, limit: 100 });

        created = (Array.isArray(items) ? items : []).find(
          (brand) => brand.name?.trim().toLowerCase() === name.toLowerCase(),
        );
      }

      onCreated(created?.id ? String(created.id) : "");
    } catch (err) {
      setError("root.server", {
        message: err?.message || "Unable to create brand.",
      });
    }
  };

  const submit = handleSubmit(onSubmit);

  return (
    <section className="w-full min-w-0 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Create brand</h3>
        <p className="mt-1 text-xs text-gray-500">
          Enter a brand name and optionally upload its logo.
        </p>
      </div>

      <div>
        <label className={labelClass}>
          Brand name <Req />
        </label>
        <input
          autoFocus
          maxLength={100}
          placeholder="e.g. Nike"
          className={inputClass}
          disabled={creating}
          aria-invalid={!!errors.name}
          {...register("name")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
        />
        <FieldError error={errors.name} />
      </div>

      <ImagePicker
        label="Brand logo"
        file={logo}
        preview={preview}
        disabled={creating}
        fit="contain"
        uploadText="Upload logo"
        changeText="Choose another logo"
        error={errors.logo}
        onChange={(file) =>
          setValue("logo", file, { shouldValidate: true, shouldDirty: true })
        }
      />

      {errors.root?.server && (
        <p role="alert" className="break-words text-xs text-red-600">
          {errors.root.server.message}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={creating}
          className="rounded border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={creating || !storeId}
          className="rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Creating brand..." : "Create brand"}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Inline "create category" panel                                      */
/* ------------------------------------------------------------------ */

function NewCategoryPanel({ storeId, mutation, onCreated, onClose }) {
  const creating = mutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newCategorySchema),
    defaultValues: { name: "", description: "", photo: null },
  });

  const photo = useWatch({ control, name: "photo" });
  const preview = useObjectUrl(photo);

  const onSubmit = async ({ name, description, photo: photoFile }) => {
    if (!storeId) {
      setError("root.server", {
        message: "Store ID is missing. Please select your store.",
      });
      return;
    }

    try {
      const response = await mutation.mutateAsync({
        name,
        ...(description ? { description } : {}),
        imageFile: photoFile,
        isAvailable: true,
      });

      let created = extractCreatedCategory(response);

      if (!created?.id) {
        try {
          const refreshed = await getCategories(storeId, {
            page: 1,
            limit: 100,
          });

          created = extractCategories(refreshed).find(
            (category) =>
              category.name?.trim().toLowerCase() === name.toLowerCase() &&
              category.isAvailable !== false,
          );
        } catch {
          // The category list refreshes on its own after creation.
        }
      }

      onCreated(created?.id ? String(created.id) : "");
    } catch (err) {
      setError("root.server", {
        message: err?.message || "Unable to create category.",
      });
    }
  };

  const submit = handleSubmit(onSubmit);

  return (
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
          <label className={labelClass}>
            Category name <Req />
          </label>
          <input
            autoFocus
            maxLength={100}
            placeholder="e.g. Running shoes"
            className={inputClass}
            disabled={creating}
            aria-invalid={!!errors.name}
            {...register("name")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
          />
          <FieldError error={errors.name} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={2}
            maxLength={1000}
            placeholder="Briefly describe this category"
            className={`${inputClass} resize-none`}
            disabled={creating}
            {...register("description")}
          />
          <FieldError error={errors.description} />
        </div>
      </div>

      <ImagePicker
        label="Category photo"
        file={photo}
        preview={preview}
        disabled={creating}
        fit="cover"
        uploadText="Upload photo"
        changeText="Choose another photo"
        error={errors.photo}
        onChange={(file) =>
          setValue("photo", file, { shouldValidate: true, shouldDirty: true })
        }
      />

      {errors.root?.server && (
        <p role="alert" className="break-words text-xs text-red-600">
          {errors.root.server.message}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-3">
        <button
          type="button"
          onClick={onClose}
          disabled={creating}
          className="rounded border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={creating || !storeId}
          className="rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Creating category..." : "Create category"}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Product form                                                        */
/* ------------------------------------------------------------------ */

export default function ProductFormModal({
  initialData,
  onSave,
  onClose,
  storeId,
}) {
  const isEdit = Boolean(initialData);
  const schema = useMemo(() => buildProductSchema(isEdit), [isEdit]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      ...toForm(initialData),
      hasVariants: false,
      variants: [emptyVariant()],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  const hasVariants = useWatch({ control, name: "hasVariants" });
  const variantValues = useWatch({ control, name: "variants" });
  const imageUrls = useWatch({ control, name: "imageUrls" }) ?? [];
  const seoImage = useWatch({ control, name: "seoImage" });

  // Categories.
  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: categoriesLoadError,
  } = useCategories(storeId, { page: 1, limit: 100 });

  const categoryError = !storeId
    ? "Store ID is missing. Please select your store."
    : categoriesLoadError?.message || "";

  // Brands.
  const { data: brands = [], isLoading: loadingBrands } = useBrands(storeId, {
    page: 1,
    limit: 100,
  });

  const createBrandMutation = useCreateBrand(storeId);
  const creatingBrand = createBrandMutation.isPending;

  const createCategoryMutation = useCreateCategory(storeId);
  const creatingCategory = createCategoryMutation.isPending;

  const [showNewBrand, setShowNewBrand] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingSeoImage, setUploadingSeoImage] = useState(false);

  // Upload and save failures (field errors are shown under each field).
  const [popupError, setPopupError] = useState("");

  const busy =
    isSubmitting ||
    uploadingImage ||
    uploadingSeoImage ||
    creatingCategory ||
    creatingBrand;

  // Product image uploads.
  const handleProductImages = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setPopupError("");

    for (const file of files) {
      const problem = checkImage(file);

      if (problem) {
        setPopupError(problem);
        return;
      }
    }

    if (!storeId) {
      setPopupError("Please select your store before uploading images.");
      return;
    }

    setUploadingImage(true);

    try {
      for (const file of files) {
        const response = await uploadProductImage(file, storeId);
        const url = extractUploadedImageUrl(response);

        setValue("imageUrls", [...getValues("imageUrls"), url], {
          shouldDirty: true,
        });
      }
    } catch (err) {
      setPopupError(err?.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setValue(
      "imageUrls",
      getValues("imageUrls").filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  // SEO image upload.
  const handleSeoImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setPopupError("");

    const problem = checkImage(file);

    if (problem) {
      setPopupError(problem);
      return;
    }

    if (!storeId) {
      setPopupError("Please select your store before uploading an image.");
      return;
    }

    setUploadingSeoImage(true);

    try {
      const response = await uploadProductSeoImage(file, storeId);
      const url = extractUploadedImageUrl(response);

      setValue("seoImage", url, { shouldDirty: true });
    } catch (err) {
      setPopupError(err?.message || "SEO image upload failed.");
    } finally {
      setUploadingSeoImage(false);
    }
  };

  // Submit product.
  const onSubmit = async (form) => {
    setPopupError("");

    if (!storeId) {
      setPopupError("Please select your store before saving.");
      return;
    }

    const selectedCategory = categories.find(
      (category) => String(category.id) === String(form.categoryId),
    );

    if (!selectedCategory) {
      setFieldError("categoryId", {
        message: "The selected category was not found. Reload the form.",
      });
      return;
    }

    if (selectedCategory.isAvailable === false) {
      setFieldError("categoryId", {
        message:
          "This category is unavailable. Enable it through your category management first.",
      });
      return;
    }

    const values = toValues(form);

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

        if (!general.brandId) delete general.brandId;
        if (!general.slug) delete general.slug;

        if (Object.keys(general).length > 0) {
          data.general = general;
        }

        if (values.status !== before.status) {
          data.status = values.status;
        }

        const custom = pickChanged(values, before, ["tags", "releaseDate"]);

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
        let pricing;

        if (form.hasVariants) {
          pricing = { variants: buildVariantPayload(form.variants) };
        } else {
          const crossedPrice = isBlank(form.crossedPrice)
            ? null
            : Number(form.crossedPrice);
          const weight = isBlank(form.weight) ? null : Number(form.weight);

          pricing = {
            sellingPrice: Number(form.sellingPrice),
            quantity: Number(form.quantity),
            ...(crossedPrice !== null && { crossedPrice }),
            ...(weight !== null && { weight }),
          };
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
          ...pricing,
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
      setPopupError(err?.message || "Unable to save the product.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-lg sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
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
              <label className={labelClass}>
                Name <Req />
              </label>
              <input
                className={inputClass}
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError error={errors.name} />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Brand */}
              <div className="min-w-0">
                <label className={labelClass}>Brand</label>

                <Controller
                  control={control}
                  name="brandId"
                  render={({ field }) => (
                    <select {...field} className={inputClass}>
                      <option value="">
                        {loadingBrands ? "Loading brands..." : "Select brand"}
                      </option>

                      {brands.map((brand) => (
                        <option
                          key={brand.id}
                          value={String(brand.id)}
                          disabled={brand.isAvailable === false}
                        >
                          {brand.name}
                          {brand.isAvailable === false ? " (Unavailable)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowNewBrand((previous) => !previous);
                    setPopupError("");
                  }}
                  disabled={!storeId || creatingBrand}
                  className="mt-2 text-xs font-semibold text-gray-900 hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showNewBrand ? "− Cancel adding brand" : "+ Add new brand"}
                </button>
              </div>

              {/* Category */}
              <div className="min-w-0">
                <label className={labelClass}>
                  Category <Req />
                </label>

                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <select
                      {...field}
                      className={inputClass}
                      aria-invalid={!!errors.categoryId}
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
                  )}
                />
                <FieldError error={errors.categoryId} />

                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategory((previous) => !previous);
                    setPopupError("");
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
                <label className={labelClass}>
                  Audience <Req />
                </label>
                <select className={inputClass} {...register("audience")}>
                  {AUDIENCES.map((audience) => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Status <Req />
                </label>
                <select className={inputClass} {...register("status")}>
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
                <input className={inputClass} {...register("slug")} />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" {...register("isAvailable")} />
              Available for sale
            </label>
          </Section>

          {/* Inline brand creation */}
          {showNewBrand && (
            <NewBrandPanel
              storeId={storeId}
              mutation={createBrandMutation}
              onClose={() => setShowNewBrand(false)}
              onCreated={(brandId) => {
                if (brandId) {
                  setValue("brandId", brandId, { shouldDirty: true });
                }
                setShowNewBrand(false);
              }}
            />
          )}

          {/* Inline category creation */}
          {showNewCategory && (
            <NewCategoryPanel
              storeId={storeId}
              mutation={createCategoryMutation}
              onClose={() => setShowNewCategory(false)}
              onCreated={(categoryId) => {
                if (categoryId) {
                  setValue("categoryId", categoryId, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
                setShowNewCategory(false);
              }}
            />
          )}

          {/* Product images */}
          <Section title="Images">
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {imageUrls.map((url, index) => (
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
                  className="mt-0.5 h-4 w-4 accent-black"
                  {...register("hasVariants")}
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
                  onClick={() => appendVariant(emptyVariant())}
                  className="shrink-0 rounded border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                >
                  + Add variant
                </button>
              </div>

              <FieldError
                error={errors.variants?.root ?? errors.variants}
              />

              {variantFields.map((field, index) => {
                const rowErrors = errors.variants?.[index];
                const colorCode =
                  variantValues?.[index]?.colorCode ?? field.colorCode;

                return (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        Variant {index + 1}
                      </p>

                      {variantFields.length > 1 && (
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
                        <label className={labelClass}>
                          Size <Req />
                        </label>
                        <input
                          placeholder="S, M, L or XL"
                          className={inputClass}
                          aria-invalid={!!rowErrors?.size}
                          {...register(`variants.${index}.size`)}
                        />
                        <FieldError error={rowErrors?.size} />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Color name <Req />
                        </label>
                        <input
                          placeholder="Black"
                          className={inputClass}
                          aria-invalid={!!rowErrors?.colorName}
                          {...register(`variants.${index}.colorName`)}
                        />
                        <FieldError error={rowErrors?.colorName} />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Color <Req />
                        </label>
                        <div className="flex h-[38px] items-center gap-2 rounded border border-gray-300 px-2">
                          <input
                            type="color"
                            aria-label={`Variant ${index + 1} color`}
                            className="h-7 w-9 cursor-pointer border-0 bg-transparent p-0"
                            {...register(`variants.${index}.colorCode`)}
                          />
                          <span className="text-xs text-gray-600">
                            {String(colorCode).toUpperCase()}
                          </span>
                        </div>
                        <FieldError error={rowErrors?.colorCode} />
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>
                          Selling price (Nrs) <Req />
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          className={inputClass}
                          aria-invalid={!!rowErrors?.sellingPrice}
                          {...register(`variants.${index}.sellingPrice`)}
                        />
                        <FieldError error={rowErrors?.sellingPrice} />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Crossed-out price (Nrs)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className={inputClass}
                          aria-invalid={!!rowErrors?.crossedPrice}
                          {...register(`variants.${index}.crossedPrice`)}
                        />
                        <FieldError error={rowErrors?.crossedPrice} />
                      </div>

                      <div>
                        <label className={labelClass}>Cost price (Nrs)</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className={inputClass}
                          aria-invalid={!!rowErrors?.costPrice}
                          {...register(`variants.${index}.costPrice`)}
                        />
                        <FieldError error={rowErrors?.costPrice} />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Quantity <Req />
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className={inputClass}
                          aria-invalid={!!rowErrors?.quantity}
                          {...register(`variants.${index}.quantity`)}
                        />
                        <FieldError error={rowErrors?.quantity} />
                      </div>

                      <div>
                        <label className={labelClass}>Weight (kg)</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className={inputClass}
                          aria-invalid={!!rowErrors?.weight}
                          {...register(`variants.${index}.weight`)}
                        />
                        <FieldError error={rowErrors?.weight} />
                      </div>

                      <div>
                        <label className={labelClass}>SKU</label>
                        <input
                          className={inputClass}
                          {...register(`variants.${index}.sku`)}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>HS code</label>
                        <input
                          className={inputClass}
                          {...register(`variants.${index}.hsCode`)}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Barcode</label>
                        <input
                          className={inputClass}
                          {...register(`variants.${index}.altBarcode`)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </Section>
          ) : !isEdit ? (
            <Section title="Pricing and stock">
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Selling price (Nrs) <Req />
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    className={inputClass}
                    aria-invalid={!!errors.sellingPrice}
                    {...register("sellingPrice")}
                  />
                  <FieldError error={errors.sellingPrice} />
                </div>

                <div>
                  <label className={labelClass}>Crossed-out price (Nrs)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={inputClass}
                    aria-invalid={!!errors.crossedPrice}
                    {...register("crossedPrice")}
                  />
                  <FieldError error={errors.crossedPrice} />
                </div>

                <div>
                  <label className={labelClass}>
                    Quantity <Req />
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className={inputClass}
                    aria-invalid={!!errors.quantity}
                    {...register("quantity")}
                  />
                  <FieldError error={errors.quantity} />
                </div>

                <div>
                  <label className={labelClass}>Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className={inputClass}
                    aria-invalid={!!errors.weight}
                    {...register("weight")}
                  />
                  <FieldError error={errors.weight} />
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
                className={`${inputClass} resize-none`}
                {...register("productDescription")}
              />
            </div>

            <div>
              <label className={labelClass}>Long description</label>
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                {...register("longDescription")}
              />
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input
                  placeholder="oversized, cotton, summer"
                  className={inputClass}
                  {...register("tags")}
                />
              </div>

              <div>
                <label className={labelClass}>Release date</label>
                <input
                  type="date"
                  className={inputClass}
                  {...register("releaseDate")}
                />
              </div>
            </div>
          </Section>

          {/* SEO */}
          <Section title="SEO (optional)">
            <div>
              <label className={labelClass}>SEO title</label>
              <input className={inputClass} {...register("seoTitle")} />
            </div>

            <div>
              <label className={labelClass}>SEO description</label>
              <textarea
                rows={2}
                className={`${inputClass} resize-none`}
                {...register("seoDescription")}
              />
            </div>

            <div>
              <label className={labelClass}>SEO image</label>

              <div className="flex flex-wrap items-center gap-3">
                {seoImage && (
                  <img
                    src={seoImage}
                    alt="SEO preview"
                    className="h-16 w-16 rounded border bg-gray-50 object-contain"
                  />
                )}

                <label className="cursor-pointer rounded border border-gray-300 px-3 py-2 text-xs font-medium text-gray-800 hover:border-gray-500">
                  {uploadingSeoImage
                    ? "Uploading..."
                    : seoImage
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

                {seoImage && (
                  <button
                    type="button"
                    onClick={() =>
                      setValue("seoImage", "", { shouldDirty: true })
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
              disabled={busy || loadingCategories || Boolean(categoryError)}
              className="cursor-pointer rounded bg-brand-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : uploadingImage || uploadingSeoImage
                  ? "Uploading image..."
                  : creatingBrand
                    ? "Creating brand..."
                    : creatingCategory
                      ? "Creating category..."
                      : "Save"}
            </button>
          </div>
        </form>
      </div>

      {/* Upload and save errors: shown above the form, no scrolling needed */}
      <ErrorPopup message={popupError} onClose={() => setPopupError("")} />
    </div>
  );
}