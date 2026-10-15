import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react"

import {
  useOutlets,
  useCreateOutlet,
  useUpdateOutlet,
  useDeleteOutlet,
  useToggleOutletStatus,
} from "../../hooks/useOutlets"
import { useListControls } from "../../hooks/useListControls"
import {
  DataCard,
  DataTable,
  EmptyState,
  EntityCell,
  ErrorBanner,
  FormCard,
  LoadingRows,
  PageHeader,
  PageShell,
  PrimaryButton,
  RowButton,
  SecondaryButton,
  StatusPill,
  TableFooter,
  TableRow,
  Td,
  inputClass,
  labelClass,
} from "../../components/seller/SellerUI"

const COLUMNS = [
  { label: "Outlet" },
  { label: "Contact" },
  { label: "Status" },
  { label: "Actions", align: "right" },
]

/* ---------------- Add / Edit form ---------------- */
function OutletForm({ storeId, outlet, onDone }) {
  const isEdit = Boolean(outlet)
  const create = useCreateOutlet(storeId)
  const update = useUpdateOutlet(storeId)
  const saving = create.isPending || update.isPending

  const [form, setForm] = useState({
    name: outlet?.name ?? "",
    address: outlet?.address ?? "",
    contactPerson: outlet?.contactPerson ?? "",
    contactPhone: outlet?.contactPhone ?? "",
  })
  const [error, setError] = useState("")

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.name.trim()) {
      setError("Outlet name is required.")
      return
    }

    // send only the fields that have a value
    const payload = Object.fromEntries(
      Object.entries(form)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== ""),
    )

    try {
      if (isEdit) {
        await update.mutateAsync({ outletId: outlet.id, ...payload })
      } else {
        await create.mutateAsync(payload)
      }
      onDone()
    } catch (err) {
      setError(err.message || "Unable to save outlet.")
    }
  }

  return (
    <FormCard title={isEdit ? `Edit ${outlet.name}` : "Add an outlet"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorBanner>{error}</ErrorBanner>

        <div>
          <label className={labelClass}>Outlet name *</label>
          <input
            required
            value={form.name}
            onChange={handleChange("name")}
            className={inputClass}
            placeholder="e.g. Pokhara branch"
          />
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <input
            value={form.address}
            onChange={handleChange("address")}
            className={inputClass}
            placeholder="Street, city"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Contact person</label>
            <input
              value={form.contactPerson}
              onChange={handleChange("contactPerson")}
              className={inputClass}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className={labelClass}>Contact phone</label>
            <input
              value={form.contactPhone}
              onChange={handleChange("contactPhone")}
              className={inputClass}
              placeholder="Phone number"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create outlet"}
          </PrimaryButton>
          <SecondaryButton onClick={onDone} disabled={saving}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </FormCard>
  )
}

/* ---------------- Page ---------------- */
export default function SellerOutlets() {
  const { shop } = useOutletContext()

  const { data: outlets = [], isLoading, error } = useOutlets(shop.id)
  const toggle = useToggleOutletStatus(shop.id)
  const remove = useDeleteOutlet(shop.id)

  const list = useListControls(
    outlets,
    (o) => `${o.name} ${o.address ?? ""} ${o.contactPerson ?? ""}`,
  )

  // null = form closed, {} = add, outlet object = edit
  const [formOutlet, setFormOutlet] = useState(null)
  const [actionError, setActionError] = useState("")
  const [busyId, setBusyId] = useState(null)

  const run = async (id, fn) => {
    setActionError("")
    setBusyId(id)
    try {
      await fn()
    } catch (err) {
      setActionError(err.message || "The action could not be completed.")
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = (outlet) => {
    if (!window.confirm(`Delete "${outlet.name}"?`)) return
    run(outlet.id, () => remove.mutateAsync(outlet.id))
  }

  return (
    <PageShell>
      <PageHeader
        title="Outlets"
        subtitle={`Manage the outlets of ${shop.name}.`}
        action={
          !formOutlet && (
            <PrimaryButton onClick={() => setFormOutlet({})}>
              <Plus className="h-4 w-4" />
              Add outlet
            </PrimaryButton>
          )
        }
      />

      <ErrorBanner>{actionError || error?.message}</ErrorBanner>

      {formOutlet && (
        <OutletForm
          key={formOutlet.id ?? "new"}
          storeId={shop.id}
          outlet={formOutlet.id ? formOutlet : null}
          onDone={() => setFormOutlet(null)}
        />
      )}

      <DataCard
        icon={MapPin}
        title="All outlets"
        count={isLoading ? undefined : outlets.length}
        search={{
          value: list.query,
          onChange: list.setQuery,
          placeholder: "Search name or address",
        }}
      >
        {isLoading ? (
          <LoadingRows />
        ) : outlets.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No outlets yet"
            text="Add your first outlet to get started."
          />
        ) : list.total === 0 ? (
          <EmptyState
            icon={MapPin}
            title={`No results for "${list.query.trim()}"`}
            text="Try a different name or address."
          />
        ) : (
          <>
            <DataTable columns={COLUMNS}>
              {list.pageItems.map((outlet) => {
                const busy = busyId === outlet.id

                return (
                  <TableRow key={outlet.id}>
                    <Td>
                      <EntityCell
                        icon={MapPin}
                        name={outlet.name}
                        sub={outlet.address || "No address"}
                        extra={
                          outlet.isMain && (
                            <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                              Main outlet
                            </span>
                          )
                        }
                      />
                    </Td>

                    <Td className="text-zinc-600">
                      <p className="font-medium text-zinc-800">
                        {outlet.contactPerson || "—"}
                      </p>
                      {outlet.contactPhone && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                          <Phone className="h-3 w-3" />
                          {outlet.contactPhone}
                        </p>
                      )}
                    </Td>

                    <Td>
                      <StatusPill tone={outlet.isActive ? "green" : "red"}>
                        {outlet.isActive ? "Active" : "Inactive"}
                      </StatusPill>
                    </Td>

                    <Td align="right" className="whitespace-nowrap">
                      <RowButton
                        disabled={busy}
                        onClick={() =>
                          run(outlet.id, () => toggle.mutateAsync(outlet.id))
                        }
                      >
                        {outlet.isActive ? "Disable" : "Enable"}
                      </RowButton>

                      <RowButton
                        disabled={busy}
                        onClick={() => setFormOutlet(outlet)}
                        aria-label={`Edit ${outlet.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </RowButton>

                      <RowButton
                        danger
                        disabled={busy}
                        onClick={() => handleDelete(outlet)}
                        aria-label={`Delete ${outlet.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </RowButton>
                    </Td>
                  </TableRow>
                )
              })}
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
    </PageShell>
  )
}