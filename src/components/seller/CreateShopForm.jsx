import { useEffect, useMemo, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useAuth } from "../../context/useAuth"
import { useCreateStore } from "../../hooks/useStores"
import { STORE_CATEGORIES } from "../../services/storeService"

const inputClass =
  "w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-red-600 focus:bg-white focus:ring-2 focus:ring-red-100 aria-invalid:border-red-400"

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700"

const MAX_LOGO_SIZE = 5 * 1024 * 1024

const categoryLabel = (category) =>
  category
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ")

const storeSchema = z.object({
  name: z.string().trim().min(1, "Store name is required"),
  category: z.enum(STORE_CATEGORIES),
  contactEmail: z
    .string()
    .trim()
    .min(1, "Contact email is required")
    .email("Enter a valid email address"),
  contactPhone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\+?[\d\s-]{7,15}$/.test(value),
      "Enter a valid phone number"
    ),
  storeAddress: z.string().trim(),
  logo: z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), "File must be an image")
    .refine((file) => file.size <= MAX_LOGO_SIZE, "Logo must be under 5 MB")
    .optional(),
})

function FieldError({ error }) {
  if (!error) return null
  return <p className="mt-1.5 text-xs text-red-600">{error.message}</p>
}

export default function CreateShopForm({ onCreated }) {
  const { currentUser } = useAuth()
  const createStore = useCreateStore()
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      category: "GENERAL",
      contactEmail: currentUser?.email || "",
      contactPhone: currentUser?.phone || "",
      storeAddress: "",
      logo: undefined,
    },
  })

  // Preview is derived from the form value, so no setState inside an effect.
  const logo = useWatch({ control, name: "logo" })
  const preview = useMemo(
    () => (logo ? URL.createObjectURL(logo) : ""),
    [logo]
  )

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleFileChange = (event) => {
    setValue("logo", event.target.files?.[0], {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const clearLogo = () => {
    setValue("logo", undefined, { shouldValidate: true })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async ({ logo: logoFile, ...values }) => {
    // Same behavior as before: send only the fields that have a value.
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== "")
    )

    try {
      const store = await createStore.mutateAsync({
        ...payload,
        logoFile: logoFile ?? null,
      })

      onCreated?.(store)
    } catch (err) {
      setError("root.server", {
        message: err.message || "Unable to create your store. Please try again.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errors.root?.server && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <span aria-hidden="true">!</span>
          <p>{errors.root.server.message}</p>
        </div>
      )}

      <div>
        <label htmlFor="store-name" className={labelClass}>
          Store name <span className="text-brand-red-600">*</span>
        </label>
        <input
          id="store-name"
          autoFocus
          placeholder="e.g. My Fashion Store"
          className={inputClass}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        <FieldError error={errors.name} />
      </div>

      <div>
        <label htmlFor="store-category" className={labelClass}>
          Category <span className="text-brand-red-600">*</span>
        </label>
        <select
          id="store-category"
          className={inputClass}
          aria-invalid={!!errors.category}
          {...register("category")}
        >
          {STORE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
        <FieldError error={errors.category} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="store-email" className={labelClass}>
            Contact email <span className="text-brand-red-600">*</span>
          </label>
          <input
            id="store-email"
            type="email"
            placeholder="you@example.com"
            className={inputClass}
            aria-invalid={!!errors.contactEmail}
            {...register("contactEmail")}
          />
          <FieldError error={errors.contactEmail} />
        </div>

        <div className="min-w-0">
          <label htmlFor="store-phone" className={labelClass}>
            Contact phone
          </label>
          <input
            id="store-phone"
            type="tel"
            placeholder="Phone number"
            className={inputClass}
            aria-invalid={!!errors.contactPhone}
            {...register("contactPhone")}
          />
          <FieldError error={errors.contactPhone} />
        </div>
      </div>

      <div>
        <label htmlFor="store-address" className={labelClass}>
          Store address{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="store-address"
          placeholder="City or full address"
          className={inputClass}
          aria-invalid={!!errors.storeAddress}
          {...register("storeAddress")}
        />
        <FieldError error={errors.storeAddress} />
      </div>

      <div>
        <label className={labelClass}>
          Store logo <span className="font-normal text-gray-400">(optional)</span>
        </label>

        <input
          ref={fileInputRef}
          id="store-logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {logo ? (
          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <img
              src={preview}
              alt="Store logo preview"
              className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {logo.name}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {(logo.size / 1024).toFixed(0)} KB
              </p>
            </div>

            <label
              htmlFor="store-logo"
              className="shrink-0 cursor-pointer text-xs font-semibold text-brand-red-600 hover:text-brand-red-700"
            >
              Change
            </label>

            <button
              type="button"
              onClick={clearLogo}
              className="shrink-0 cursor-pointer text-xs text-gray-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor="store-logo"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition hover:border-brand-red-600 hover:bg-red-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-gray-800">
                Upload a store logo
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">
                Choose an image from your device
              </span>
            </span>

            <span className="shrink-0 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">
              Browse
            </span>
          </label>
        )}

        <FieldError error={errors.logo} />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={createStore.isPending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createStore.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating store...
            </>
          ) : (
            "Create store"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          You can manage your store from your seller dashboard.
        </p>
      </div>
    </form>
  )
}