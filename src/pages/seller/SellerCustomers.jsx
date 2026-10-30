import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Users, Pencil, Trash2, X } from "lucide-react"

import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../../hooks/useCustomers"
import { useListControls } from "../../hooks/useListControls"
import {
  DataCard,
  DataTable,
  EmptyState,
  EntityCell,
  ErrorBanner,
  PageHeader,
  PageShell,
  PrimaryButton,
  TableFooter,
  TableRow,
  Td,
} from "../../components/seller/SellerUI"

const COLUMNS = [
  { label: "Customer" },
  { label: "Phone" },
  { label: "Added" },
  { label: "Actions", align: "center" },
]

const inputClass =
  "h-11 w-full rounded-xl border border-yz-border bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-brand-red-600/50"

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-yz-border bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-yz-border px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function CustomerForm({ customer, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const set = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError("")

    if (!values.name.trim()) {
      setError("Name is required.")
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorBanner>{error}</ErrorBanner>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">
          Name
        </span>
        <input
          className={inputClass}
          value={values.name}
          onChange={set("name")}
          placeholder="Aman Gurung"
          autoFocus
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">
          Phone
        </span>
        <input
          className={inputClass}
          value={values.phone}
          onChange={set("phone")}
          placeholder="9800000000"
          inputMode="tel"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-zinc-700">
          Email
        </span>
        <input
          className={inputClass}
          type="email"
          value={values.email}
          onChange={set("email")}
          placeholder="name@example.com"
        />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl border border-yz-border px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? "Saving..." : customer ? "Save changes" : "Add customer"}
        </PrimaryButton>
      </div>
    </form>
  )
}

export default function SellerCustomers() {
  const { shop } = useOutletContext()
  const storeId = shop?.id

  // fetch one big page and search/paginate on the client, like the Shops page
  const { data, isLoading, error: loadError } = useCustomers(
    { page: 1, limit: 50 },
    storeId
  )
  const customers = data?.customers ?? []

  const create = useCreateCustomer(storeId)
  const update = useUpdateCustomer(storeId)
  const remove = useDeleteCustomer(storeId)

  const list = useListControls(
    customers,
    (c) => `${c.name} ${c.phone ?? ""} ${c.email ?? ""}`
  )

  // null | { mode: "create" } | { mode: "edit", customer } | { mode: "delete", customer }
  const [dialog, setDialog] = useState(null)
  const [deleteError, setDeleteError] = useState("")
  const [deleting, setDeleting] = useState(false)

  const closeDialog = () => {
    setDialog(null)
    setDeleteError("")
  }

  const handleSave = async (values) => {
    if (dialog.mode === "edit") {
      await update.mutateAsync({ id: dialog.customer.id, changes: values })
    } else {
      // don't send empty fields when creating
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v)
      )
      await create.mutateAsync(payload)
    }
    closeDialog()
  }

  const handleDelete = async () => {
    setDeleteError("")
    setDeleting(true)
    try {
      await remove.mutateAsync(dialog.customer.id)
      closeDialog()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} ${
          customers.length === 1 ? "customer" : "customers"
        } in this shop.`}
        action={
          <PrimaryButton onClick={() => setDialog({ mode: "create" })}>
            <Plus className="h-4 w-4" />
            Add Customer
          </PrimaryButton>
        }
      />

      <ErrorBanner>{loadError?.message}</ErrorBanner>

      <DataCard
        icon={Users}
        title="All customers"
        count={customers.length}
        search={{
          value: list.query,
          onChange: list.setQuery,
          placeholder: "Search name, phone or email",
        }}
      >
        {isLoading ? (
          <p className="p-8 text-center text-sm text-zinc-500">
            Loading customers...
          </p>
        ) : list.total === 0 ? (
          <EmptyState
            icon={Users}
            title={
              list.isSearching
                ? `No results for "${list.query.trim()}"`
                : "No customers yet"
            }
            text={
              list.isSearching
                ? "Try a different name, phone or email."
                : "Add your first customer to get started."
            }
          />
        ) : (
          <>
            <DataTable columns={COLUMNS}>
              {list.pageItems.map((customer) => (
                <TableRow key={customer.id}>
                  <Td>
                    <EntityCell
                      icon={Users}
                      name={customer.name}
                      sub={customer.email}
                    />
                  </Td>

                  <Td className="text-zinc-600">{customer.phone || "—"}</Td>

                  <Td className="text-zinc-600">
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString()
                      : "—"}
                  </Td>

                  <Td align="center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${customer.name}`}
                        onClick={() => setDialog({ mode: "edit", customer })}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-yz-border text-zinc-600 hover:bg-zinc-50"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${customer.name}`}
                        onClick={() => setDialog({ mode: "delete", customer })}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Td>
                </TableRow>
              ))}
            </DataTable>

            <TableFooter
              from={list.from}
              to={list.to}
              total={list.total}
              page={list.page}
              totalPages={list.totalPages}
              onPageChange={list.setPage}
            />
          </>
        )}
      </DataCard>

      {/* Add / edit dialog */}
      {(dialog?.mode === "create" || dialog?.mode === "edit") && (
        <Modal
          title={dialog.mode === "edit" ? "Edit customer" : "Add customer"}
          onClose={closeDialog}
        >
          <CustomerForm
            customer={dialog.customer}
            onSubmit={handleSave}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      {dialog?.mode === "delete" && (
        <Modal title="Delete customer" onClose={closeDialog}>
          <ErrorBanner>{deleteError}</ErrorBanner>
          <p className="text-sm text-zinc-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-zinc-900">
              {dialog.customer.name}
            </span>
            ? This can't be undone.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeDialog}
              className="h-11 rounded-xl border border-yz-border px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="h-11 rounded-xl bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </PageShell>
  )
}