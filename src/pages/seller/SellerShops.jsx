import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Store } from "lucide-react"

import { useToggleStorePublish } from "../../hooks/useStores"
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
  StatusPill,
  TableFooter,
  TableRow,
  Td,
} from "../../components/seller/SellerUI"

const COLUMNS = [
  { label: "Shop Name" },
  { label: "Category" },
  { label: "Status" },
  { label: "Actions", align: "center" },
]

const categoryLabel = (c = "") =>
  c
    .split("_")
    .map((w) => (w ? w[0] + w.slice(1).toLowerCase() : w))
    .join(" ")

export default function SellerShops() {
  // openAddStore opens the same popup as "Add Store" in the sidebar dropdown
  const { stores, openAddStore } = useOutletContext()
  const toggle = useToggleStorePublish()

  const list = useListControls(stores, (s) => `${s.name} ${s.slug ?? ""}`)

  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState("")

  const handleToggle = async (store) => {
    setError("")
    setBusyId(store.id)
    try {
      await toggle.mutateAsync(store.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="My Shops"
        subtitle={`You have ${stores.length} ${
          stores.length === 1 ? "shop" : "shops"
        }. Use the store switcher in the sidebar to change shops.`}
        action={
          <PrimaryButton onClick={openAddStore}>
            <Plus className="h-4 w-4" />
            Add Shop
          </PrimaryButton>
        }
      />

      <ErrorBanner>{error}</ErrorBanner>

      <DataCard
        icon={Store}
        title="All shops"
        count={stores.length}
        search={{
          value: list.query,
          onChange: list.setQuery,
          placeholder: "Search name or slug",
        }}
      >
        {list.total === 0 ? (
          <EmptyState
            icon={Store}
            title={`No results for "${list.query.trim()}"`}
            text="Try a different name or slug."
          />
        ) : (
          <>
            <DataTable columns={COLUMNS}>
              {list.pageItems.map((store) => {
                const busy = busyId === store.id

                return (
                  <TableRow key={store.id}>
                    <Td>
                      <EntityCell
                        image={store.logo}
                        icon={Store}
                        name={store.name}
                        sub={store.slug}
                      />
                    </Td>

                    <Td className="text-zinc-600">
                      {store.category ? categoryLabel(store.category) : "—"}
                    </Td>

                    <Td>
                      <StatusPill tone={store.isPublished ? "green" : "red"}>
                        {store.isPublished ? "Active" : "Inactive"}
                      </StatusPill>
                    </Td>

                    <Td align="center">
                      {/* fixed width so the button never changes size */}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleToggle(store)}
                        className={`inline-flex h-[42px] w-[110px] cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          store.isPublished
                            ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                            : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {busy
                          ? "Updating..."
                          : store.isPublished
                            ? "Unpublish"
                            : "Publish"}
                      </button>
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