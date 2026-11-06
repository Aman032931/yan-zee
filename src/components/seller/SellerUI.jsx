import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"

/* ---------- Shared classes ---------- */
export const inputClass =
  "w-full rounded-xl border border-yz-border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-600/10"

export const labelClass =
  "mb-1.5 block text-xs font-semibold tracking-wide text-zinc-700"

/* ---------- Required-field marker ---------- */
export function Req() {
  return (
    <span className="ml-0.5 font-bold text-brand-red-600" aria-hidden="true">
      *
    </span>
  )
}

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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-red-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-600/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
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
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-yz-border bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition duration-200 hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-600/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/* ---------- Page structure ---------- */
export function PageShell({ children }) {
  return (
    <div className="w-full min-w-0 space-y-6">
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-yz-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="self-start sm:shrink-0">{action}</div>}
    </div>
  )
}

export function ErrorBanner({ children }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
    >
      <span aria-hidden="true">⚠</span>
      <span>{children}</span>
    </div>
  )
}

export function FormCard({ title, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-yz-border bg-white shadow-sm">
      <div className="border-b border-yz-border bg-zinc-50/70 px-5 py-4">
        <h2 className="text-base font-bold text-zinc-900">{title}</h2>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  )
}

/* ---------- Popup form ---------- */
export function FormModal({
  title,
  onClose,
  busy = false,
  maxWidth = "max-w-lg",
  children,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose, busy])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-2xl border border-yz-border bg-white shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-yz-border bg-white px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-zinc-950">
              {title}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-zinc-500 transition hover:bg-red-50 hover:text-brand-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ---------- Search ---------- */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search name or slug",
  results,
  onSelect,
  getResultLabel = (item) => item?.name ?? "Unnamed result",
  getResultDescription,
  loading = false,
  emptyMessage = "No results found.",
}) {
  const wrapperRef = useRef(null)
  const [open, setOpen] = useState(false)

  const hasPopup = Array.isArray(results) && typeof onSelect === "function"

  useEffect(() => {
    if (!hasPopup) return

    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [hasPopup])

  return (
    <div
      ref={wrapperRef}
      className="relative w-full sm:max-w-xs"
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />

      <input
        type="search"
        value={value}
        onFocus={() => {
          if (hasPopup) setOpen(true)
        }}
        onChange={(event) => {
          onChange(event.target.value)
          if (hasPopup) setOpen(true)
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-yz-border bg-white py-2.5 pr-3 pl-9 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-brand-red-600 focus:ring-2 focus:ring-brand-red-600/10"
      />

      {hasPopup && open && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-yz-border bg-white p-1.5 shadow-xl">
          {loading ? (
            <p className="px-3 py-4 text-center text-sm text-zinc-500">
              Loading results...
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-zinc-500">
              {emptyMessage}
            </p>
          ) : (
            results.map((item, index) => (
              <button
                key={item?.id ?? item?._id ?? item?.orderId ?? index}
                type="button"
                onClick={() => {
                  onSelect(item)
                  setOpen(false)
                }}
                className="flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition hover:bg-red-50"
              >
                <span className="text-sm font-semibold text-zinc-900">
                  {getResultLabel(item)}
                </span>

                {getResultDescription?.(item) && (
                  <span className="mt-0.5 text-xs text-zinc-500">
                    {getResultDescription(item)}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- List card ---------- */
export function DataCard({ icon: Icon, title, count, search, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-yz-border bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-yz-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-zinc-950">
          {Icon && (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-brand-red-600">
              <Icon className="h-5 w-5" />
            </span>
          )}

          {title}

          {count !== undefined && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
              {count}
            </span>
          )}
        </h2>

        {search && <SearchInput {...search} />}
      </div>

      {children}
    </section>
  )
}

/* ---------- Table ---------- */
const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
}

export function DataTable({ columns, minWidth = "min-w-[640px]", children }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${minWidth}`}>
        <thead>
          <tr className="border-y border-yz-border bg-zinc-50 text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
            {columns.map((col) => (
              <th
                key={col.label}
                className={`px-5 py-3.5 ${ALIGN[col.align] ?? ALIGN.left}`}
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
    <tr className="border-b border-yz-border last:border-b-0 transition-colors hover:bg-red-50/40">
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

/* ---------- Entity cell ---------- */
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
          className={`h-full w-full ${
            fit === "contain" ? "object-contain" : "object-cover"
          }`}
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
            className="block truncate font-semibold text-zinc-900 transition hover:text-brand-red-600 hover:underline"
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
  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"

const rowTone = (danger) =>
  danger
    ? "text-red-600 hover:bg-red-50"
    : "text-zinc-700 hover:bg-zinc-100"

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

/* ---------- Table footer ---------- */
export function TableFooter({ total, page, totalPages, onPageChange }) {
  const safeTotalPages = Math.max(1, totalPages || 1)

  const windowStart = Math.max(
    1,
    Math.min(page - 2, safeTotalPages - 4)
  )

  const last = Math.min(safeTotalPages, windowStart + 4)

  const pages = []
  for (let p = windowStart; p <= last; p++) {
    pages.push(p)
  }

  const arrowBase =
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-600/30 disabled:cursor-not-allowed disabled:opacity-35"

  const pageBase =
    "inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-600/30"

  return (
    <div className="flex flex-col gap-3 border-t border-yz-border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-zinc-500 sm:text-sm">
        Page <span className="font-bold text-zinc-900">{page}</span>
      </p>

      <nav
        aria-label="Pagination"
        className="flex items-center justify-between gap-1 sm:justify-end"
      >
        <button
          type="button"
          className={`${arrowBase} border-yz-border text-zinc-600 hover:border-brand-red-200 hover:bg-red-50 hover:text-brand-red-600`}
          disabled={page <= 1 || total === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Go to previous page"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {windowStart > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className={`${pageBase} border border-yz-border text-zinc-700 hover:bg-zinc-50`}
              aria-label="Go to page 1"
            >
              1
            </button>

            {windowStart > 2 && (
              <span className="px-1 text-sm text-zinc-400" aria-hidden="true">
                …
              </span>
            )}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-label={`Go to page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`${pageBase} ${
              p === page
                ? "bg-brand-red-600 text-white shadow-sm"
                : "border border-yz-border text-zinc-700 hover:border-brand-red-200 hover:bg-red-50 hover:text-brand-red-600"
            }`}
          >
            {p}
          </button>
        ))}

        {last < safeTotalPages && (
          <>
            {last < safeTotalPages - 1 && (
              <span className="px-1 text-sm text-zinc-400" aria-hidden="true">
                …
              </span>
            )}

            <button
              type="button"
              onClick={() => onPageChange(safeTotalPages)}
              className={`${pageBase} border border-yz-border text-zinc-700 hover:bg-zinc-50`}
              aria-label={`Go to page ${safeTotalPages}`}
            >
              {safeTotalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className={`${arrowBase} border-yz-border text-zinc-600 hover:border-brand-red-200 hover:bg-red-50 hover:text-brand-red-600`}
          disabled={page >= safeTotalPages || total === 0}
          onClick={() => onPageChange(page + 1)}
          aria-label="Go to next page"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  )
}

/* ---------- Empty / loading states ---------- */
export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="border-t border-yz-border px-4 py-14 text-center">
      {Icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-brand-red-600">
          <Icon className="h-7 w-7" />
        </div>
      )}

      <h3 className="mt-4 font-bold text-zinc-900">{title}</h3>

      {text && (
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-zinc-500">
          {text}
        </p>
      )}
    </div>
  )
}

export function LoadingRows({ rows = 3 }) {
  return (
    <div className="space-y-3 border-t border-yz-border p-5">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse rounded-xl bg-zinc-100"
        />
      ))}
    </div>
  )
}

/* ---------- Status pill ---------- */
const TONES = {
  green: "border border-green-200 bg-green-50 text-green-700",
  red: "border border-red-200 bg-red-50 text-red-700",
  gray: "border border-zinc-200 bg-zinc-100 text-zinc-600",
}

export function StatusPill({ tone = "gray", children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
        TONES[tone] ?? TONES.gray
      }`}
    >
      {children}
    </span>
  )
}

/* ---------- Image upload ---------- */
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
        <div className="flex items-center gap-3 rounded-xl border border-yz-border bg-zinc-50 p-3">
          <img
            src={shown}
            alt="Preview"
            className={`h-14 w-14 rounded-lg border border-yz-border bg-white ${
              fit === "contain" ? "object-contain" : "object-cover"
            }`}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-800">
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
            className="cursor-pointer text-xs font-bold text-brand-red-600 hover:underline"
          >
            Change
          </label>

          {file && (
            <button
              type="button"
              onClick={clear}
              className="cursor-pointer text-xs font-semibold text-red-600 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-yz-border bg-zinc-50 px-4 py-7 text-center transition hover:border-brand-red-600 hover:bg-red-50/50"
        >
          <span className="rounded-lg bg-brand-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-red-700">
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