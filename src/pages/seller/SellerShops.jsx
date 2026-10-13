import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Store } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import CreateShopForm from "../../components/seller/CreateShopForm"
import { useToggleStorePublish } from "../../hooks/useStores"

const categoryLabel = (c = "") =>
  c
    .split("_")
    .map((w) => (w ? w[0] + w.slice(1).toLowerCase() : w))
    .join(" ")

export default function SellerShops() {
  const { stores, selectStore } = useOutletContext()
  const toggle = useToggleStorePublish()

  const [showForm, setShowForm] = useState(false)
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

  // the new store becomes the active one, and the form closes
  const handleCreated = (store) => {
    if (store?.id) selectStore(store.id)
    setShowForm(false)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Shops</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stores.length === 1
              ? "You have 1 shop."
              : `You have ${stores.length} shops.`}{" "}
            Use the dropdown in the sidebar to switch between them.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="self-start">
            <Plus className="mr-2 h-4 w-4" />
            Add shop
          </Button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          ⚠ {error}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a new shop</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateShopForm
              onCreated={handleCreated}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {stores.map((store) => {
          const busy = busyId === store.id

          return (
            <Card key={store.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: logo + details */}
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                      {store.name}
                    </h2>
                    <p className="truncate text-xs text-gray-400">
                      {store.slug}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {store.category && (
                        <Badge variant="outline">
                          {categoryLabel(store.category)}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          store.isPublished
                            ? "border-green-200 bg-green-100 text-green-700"
                            : "border-red-200 bg-red-100 text-red-700"
                        }
                      >
                        {store.isPublished ? "Published" : "Unpublished"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right: action (fixed width so it never changes size) */}
                <div className="flex shrink-0 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-[42px] w-[100px] text-sm ${
                      store.isPublished
                        ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                        : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                    }`}
                    disabled={busy}
                    onClick={() => handleToggle(store)}
                  >
                    {busy
                      ? "Updating..."
                      : store.isPublished
                        ? "Unpublish"
                        : "Publish"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}