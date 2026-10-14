import { useState } from "react"
import { ShoppingBag } from "lucide-react"

import {
  DataCard,
  EmptyState,
  PageHeader,
  PageShell,
} from "../../components/seller/SellerUI"

// There is no orders API yet, so this page only has the final layout.
export default function SellerOrders() {
  const [query, setQuery] = useState("")

  return (
    <PageShell>
      <PageHeader title="Orders" subtitle="Manage your orders." />

      <DataCard
        icon={ShoppingBag}
        title="All orders"
        count={0}
        search={{
          value: query,
          onChange: setQuery,
          placeholder: "Search orders",
        }}
      >
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          text="Orders will appear here once the orders API is connected."
        />
      </DataCard>
    </PageShell>
  )
}