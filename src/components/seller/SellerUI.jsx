import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"

/* ---------- Shared classes ---------- */
export const inputClass =
  "w-full rounded-xl border border-yz-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-red-600 focus:ring-1 focus:ring-brand-red-600"

export const labelClass = "mb-1 block text-xs font-medium text-zinc-600"

/* ---------- Buttons ---------- */
export function PrimaryButton({
  children,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-yz-border bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/* ---------- Page structure ---------- */
// One width for every seller list page.
export function PageShell({ children }) {
  return (
    <div className="w-full space-y-6 xl:px-10 2xl:px-[118px]">{children}</div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {action && <div className="self-start">{action}</div>}
    </div>
  )
}

export function ErrorBanner({ children }) {
  if (!children) return null
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      ⚠ {children}
    </div>
  )
}

export function FormCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-yz-border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">{title}</h2>
      {children}
    </section>
  )
}


/* ---------- Popup form ---------- */
export function FormModal({ title, onClose, busy = false, children }) {
  // Escape closes the popup (but not while a save is running)
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose, busy])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        // clicking the dark area outside the popup closes it
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-yz-border bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-zinc-900">{title}</h2>

          <button
            type="button"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}


/* ---------- Search ---------- */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search name or slug",
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-yz-border bg-white py-2.5 pr-3 pl-9 text-sm transition outline-none focus:border-brand-red-600 focus:ring-1 focus:ring-brand-red-600"
      />
    </div>
  )
}

/* ---------- List card: "All categories (3)" + search ---------- */
// search: { value, onChange, placeholder }
export function DataCard({ icon: Icon, title, count, search, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-yz-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
          {count !== undefined && (
            <span className="text-sm font-normal text-zinc-500">({count})</span>
          )}
        </h2>
        {search && <SearchInput {...search} />}
      </div>
      {children}
    </section>
  )
}

/* ---------- Table ---------- */
const ALIGN = { left: "text-left", center: "text-center", right: "text-right" }

// columns: [{ label, align? }]
export function DataTable({ columns, minWidth = "min-w-[640px]", children }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${minWidth}`}>
        <thead>
          <tr className="border-y border-yz-border bg-white text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            {columns.map((col) => (
              <th
                key={col.label}
                className={`px-5 py-3 ${ALIGN[col.align] ?? ALIGN.left}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function TableRow({ children }) {
  return (
    <tr className="border-b border-yz-border last:border-b-0 hover:bg-yz-bg/60">
      {children}
    </tr>
  )
}

export function Td({ align = "left", className = "", children }) {
  return (
    <td className={`px-5 py-4 ${ALIGN[align] ?? ALIGN.left} ${className}`}>
      {children}
    </td>
  )
}

// Thumbnail + name + small text. Pass `to` to make the name/thumbnail a link.
export function EntityCell({
  image,
  icon: Icon,
  name,
  sub,
  extra,
  to,
  linkState,
  fit = "cover",
}) {
  const thumb = (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-yz-border bg-zinc-50">
      {image ? (
        <img
          src={image}
          alt={name}
          className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        />
      ) : Icon ? (
        <Icon className="h-5 w-5 text-zinc-400" />
      ) : null}
    </div>
  )

  return (
    <div className="flex items-center gap-3">
      {to ? (
        <Link
          to={to}
          state={linkState}
          aria-label={`View ${name} details`}
          className="shrink-0"
        >
          {thumb}
        </Link>
      ) : (
        thumb
      )}

      <div className="min-w-0">
        {to ? (
          <Link
            to={to}
            state={linkState}
            className="block truncate font-semibold text-zinc-900 hover:text-brand-red-600 hover:underline"
          >
            {name}
          </Link>
        ) : (
          <p className="truncate font-semibold text-zinc-900">{name}</p>
        )}
        {sub && <p className="truncate text-xs text-zinc-500">{sub}</p>}
        {extra}
      </div>
    </div>
  )
}

/* ---------- Inline row actions ---------- */
const rowBase =
  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"

const rowTone = (danger) =>
  danger ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-100"

export function RowButton({
  danger = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`${rowBase} ${rowTone(danger)} ${className}`}
      {...props}
    />
  )
}

export function RowLink({ className = "", ...props }) {
  return (
    <Link className={`${rowBase} ${rowTone(false)} ${className}`} {...props} />
  )
}

/* ---------- Table footer: "1 - 5 / 5" + pagination ---------- */
export function TableFooter({
  from,
  to,
  total,
  page,
  totalPages,
  onPageChange,
}) {
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4))
  const last = Math.min(totalPages, windowStart + 4)
  const pages = []
  for (let p = windowStart; p <= last; p++) pages.push(p)

  const arrow =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-yz-border text-zinc-500 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"

  return (
    <div className="flex items-center justify-between border-t border-yz-border px-5 py-3 text-sm text-zinc-900">
      <span>
        {from} - {to} / {total}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={arrow}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
              p === page
                ? "bg-brand-red-600 text-white"
                : "border border-yz-border text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className={arrow}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ---------- Empty / loading states ---------- */
export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="border-t border-yz-border px-4 py-12 text-center">
      {Icon && <Icon className="mx-auto h-9 w-9 text-zinc-300" />}
      <h3 className="mt-3 font-medium text-zinc-900">{title}</h3>
      {text && <p className="mt-1 text-sm text-zinc-500">{text}</p>}
    </div>
  )
}

export function LoadingRows({ rows = 3 }) {
  return (
    <div className="space-y-3 border-t border-yz-border p-5">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse rounded-lg bg-zinc-100"
        />
      ))}
    </div>
  )
}

/* ---------- Status pill ---------- */
const TONES = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-zinc-100 text-zinc-600",
}

export function StatusPill({ tone = "gray", children }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${TONES[tone] ?? TONES.gray}`}
    >
      {children}
    </span>
  )
}

/* ---------- Image upload (logo / category image) ---------- */
// The parent keeps the chosen File; this component handles the preview.
export function ImageUploadField({
  id,
  label = "Image (optional)",
  file,
  currentUrl,
  onChange,
  uploadText = "Upload image",
  fit = "cover",
}) {
  const inputRef = useRef(null)
  const previewRef = useRef("")
  const [preview, setPreview] = useState("")

  // free the preview URL when the component goes away
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])

  const pick = (next) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const url = next ? URL.createObjectURL(next) : ""
    previewRef.current = url
    setPreview(url)
    onChange(next)
  }

  const clear = () => {
    pick(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  // the new file if one is chosen, otherwise the current saved image
  const shown = preview || currentUrl || ""

  return (
    <div>
      <label className={labelClass}>{label}</label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      {shown ? (
        <div className="flex items-center gap-3 rounded-xl border border-yz-border bg-yz-bg p-3">
          <img
            src={shown}
            alt="Preview"
            className={`h-14 w-14 rounded-lg border border-yz-border bg-white ${
              fit === "contain" ? "object-contain" : "object-cover"
            }`}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-800">
              {file ? file.name : "Current image"}
            </p>
            {file && (
              <p className="text-xs text-zinc-500">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>
          <label
            htmlFor={id}
            className="cursor-pointer text-xs font-medium text-brand-red-600 hover:underline"
          >
            Change
          </label>
          {file && (
            <button
              type="button"
              onClick={clear}
              className="cursor-pointer text-xs font-medium text-red-600 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-yz-border bg-white px-4 py-6 text-center transition hover:border-brand-red-600 hover:bg-yz-bg"
        >
          <span className="rounded-lg bg-brand-red-600 px-3 py-1.5 text-xs font-semibold text-white">
            {uploadText}
          </span>
          <span className="text-xs text-zinc-500">
            PNG, JPG or WebP. Click to browse.
          </span>
        </label>
      )}
    </div>
  )
}
