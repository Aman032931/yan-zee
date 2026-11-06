import { useOutlets } from "../../hooks/useOutlets"

export default function OutletFilter({ storeId, value, onChange }) {
  const { data: outlets = [] } = useOutlets(storeId)
  const active = outlets.filter((outlet) => outlet.isActive !== false)

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Filter by outlet"
      className="h-10 rounded-lg border border-yz-border bg-background px-3 text-sm outline-none focus:border-brand-red-600"
    >
      <option value="">All outlets</option>
      {active.map((outlet) => (
        <option key={outlet.id} value={outlet.id}>
          {outlet.name}
          {outlet.isMain ? " (Main)" : ""}
        </option>
      ))}
    </select>
  )
}