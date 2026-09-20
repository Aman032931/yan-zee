import { useState } from "react"
import PriceRangeFilter from "../shared/PriceRangeFilter"
import { DEALS, DELIVERY_TYPES } from "../../utils/dealDeliveryFilters"

function SectionHeader({ label, count, open, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between py-1 text-xs font-semibold text-gray-800"
    >
      <span className="flex items-center gap-1.5">
        {label}
        {count > 0 && (
          <span className="rounded-full bg-red-50 px-1.5 text-[10px] font-semibold text-red-600">
            {count}
          </span>
        )}
      </span>
      <span className="text-[9px] text-gray-400">{open ? "▲" : "▼"}</span>
    </button>
  )
}

function ToggleSwitch({ on, onChange }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={on}
      className={`relative h-5 w-10 cursor-pointer rounded-full transition-colors duration-200 ${
        on ? "bg-red-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export default function FilterPanel({
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  priceFilter,
  setPriceFilter,
  onlyNewArrivals,
  setOnlyNewArrivals,
  onClearFilters,
  deals: dealsProp,
  setDeals: setDealsProp,
  delivery: deliveryProp,
  setDelivery: setDeliveryProp,
}) {
  const [openSections, setOpenSections] = useState({
    newArrivals: true,
    category: true,
    brand: true,
    price: true,
    deals: false,
    delivery: false,
  })

  const [brandQuery, setBrandQuery] = useState("")

  // Use the page's state if provided, otherwise fall back to local state
  const [localDeals, setLocalDeals] = useState([])
  const [localDelivery, setLocalDelivery] = useState([])

  const deals = dealsProp ?? localDeals
  const setDeals = setDealsProp ?? setLocalDeals
  const delivery = deliveryProp ?? localDelivery
  const setDelivery = setDeliveryProp ?? setLocalDelivery

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleInList = (list, setList, value) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    )
  }

  const handleClear = () => {
    setDeals([])
    setDelivery([])
    onClearFilters?.()
  }

  const categories = [
    "All Departments",
    "Fashion",
    "Sports",
    "Beauty",
    "Outlet",
    "Kids",
    "Premium",
  ]
  const brands = [
    "All Brands",
    "MEN'S CLOTHING",
    "WOMEN'S CLOTHING",
    "JEWELERY",
    "ELECTRONICS",
  ]

  const visibleBrands = brands.filter((b) =>
    b.toLowerCase().includes(brandQuery.toLowerCase())
  )

  const activeFilterCount =
    (selectedCategory !== "all" && selectedCategory !== "All Departments"
      ? 1
      : 0) +
    (selectedBrand !== "All Brands" ? 1 : 0) +
    (onlyNewArrivals ? 1 : 0) +
    (priceFilter ? 1 : 0) +
    deals.length +
    delivery.length

  return (
    <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-5">
      {/* ===== Header ===== */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-gray-900">All Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClear}
            className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ===== New Arrivals ===== */}
      <div className="border-t border-gray-100 py-4 first:border-t-0 first:pt-0">
        <button
          onClick={() => toggleSection("newArrivals")}
          className="flex w-full cursor-pointer items-center justify-between text-[13px] font-semibold text-gray-900"
        >
          New Arrivals
          <span className="text-[9px] text-gray-400">
            {openSections.newArrivals ? "▲" : "▼"}
          </span>
        </button>

        {openSections.newArrivals && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">New arrivals only</span>
            <ToggleSwitch
              on={onlyNewArrivals}
              onChange={() => setOnlyNewArrivals(!onlyNewArrivals)}
            />
          </div>
        )}
      </div>

      {/* ===== Brand ===== */}
      <div className="border-t border-gray-100 py-4">
        <button
          onClick={() => toggleSection("brand")}
          className="flex w-full cursor-pointer items-center justify-between text-[13px] font-semibold text-gray-900"
        >
          <span className="flex items-center gap-1.5">
            Brand
            {selectedBrand !== "All Brands" && (
              <span className="rounded-full bg-red-50 px-1.5 text-[10px] font-semibold text-red-600">
                1
              </span>
            )}
          </span>
          <span className="text-[9px] text-gray-400">
            {openSections.brand ? "▲" : "▼"}
          </span>
        </button>

        {openSections.brand && (
          <div className="mt-3">
            <input
              type="text"
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
              placeholder="Search brands..."
              className="mb-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-red-600/40 focus:bg-white"
            />

            <div className="scroll-hide max-h-40 space-y-2.5 overflow-y-auto">
              {visibleBrands.map((brand) => {
                const isSelected =
                  selectedBrand.toLowerCase() === brand.toLowerCase()
                return (
                  <label
                    key={brand}
                    className={`flex cursor-pointer items-center gap-2.5 text-[13px] capitalize ${
                      isSelected
                        ? "font-semibold text-gray-900"
                        : "font-normal text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={isSelected}
                      onChange={() => onSelectBrand(brand)}
                      className="h-3.5 w-3.5 accent-red-600"
                    />
                    {brand.toLowerCase()}
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== Category ===== */}
      <div className="border-t border-gray-100 py-4">
        <button
          onClick={() => toggleSection("category")}
          className="flex w-full cursor-pointer items-center justify-between text-[13px] font-semibold text-gray-900"
        >
          <span className="flex items-center gap-1.5">
            Category
            {selectedCategory !== "all" &&
              selectedCategory !== "All Departments" && (
                <span className="rounded-full bg-red-50 px-1.5 text-[10px] font-semibold text-red-600">
                  1
                </span>
              )}
          </span>
          <span className="text-[9px] text-gray-400">
            {openSections.category ? "▲" : "▼"}
          </span>
        </button>

        {openSections.category && (
          <div className="scroll-hide mt-3 max-h-44 space-y-1 overflow-y-auto">
            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.toLowerCase() ||
                (cat === "All Departments" && selectedCategory === "all")
              return (
                <button
                  key={cat}
                  onClick={() =>
                    onSelectCategory(cat === "All Departments" ? "all" : cat)
                  }
                  className={`block w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-[13px] tracking-wide uppercase ${
                    isSelected
                      ? "bg-red-50 font-semibold text-red-600"
                      : "font-normal text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          ===== Price — this MUST be PriceRangeFilter, not an
          ===== inline reimplementation. This is what gives you
          ===== the drag slider + custom range (image 3), instead
          ===== of a plain Min/Max box with a red Apply button.
          ========================================================= */}
      <div className="border-t border-gray-100 py-4">
        <SectionHeader
          label="Price"
          count={priceFilter ? 1 : 0}
          open={openSections.price}
          onClick={() => toggleSection("price")}
        />

        {openSections.price && (
          <div className="mt-3">
            <PriceRangeFilter
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
            />
          </div>
        )}
      </div>
      {/* ========================================================= */}

      {/* ===== Deals ===== */}
      <div className="border-t border-gray-100 py-4">
        <button
          onClick={() => toggleSection("deals")}
          className="flex w-full cursor-pointer items-center justify-between text-[13px] font-semibold text-gray-900"
        >
          Deals
          <span className="text-[9px] text-gray-400">
            {openSections.deals ? "▲" : "▼"}
          </span>
        </button>

        {openSections.deals && (
          <div className="mt-3 space-y-2.5">
            {DEALS.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 text-[13px] font-normal text-gray-500 hover:text-gray-800"
              >
                <input
                  type="checkbox"
                  checked={deals.includes(key)}
                  onChange={() => toggleInList(deals, setDeals, key)}
                  className="h-3.5 w-3.5 accent-red-600"
                />
                {label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ===== Delivery Type ===== */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => toggleSection("delivery")}
          className="flex w-full cursor-pointer items-center justify-between text-[13px] font-semibold text-gray-900"
        >
          Delivery Type
          <span className="text-[9px] text-gray-400">
            {openSections.delivery ? "▲" : "▼"}
          </span>
        </button>

        {openSections.delivery && (
          <div className="mt-3 space-y-2.5">
            {DELIVERY_TYPES.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 text-[13px] font-normal text-gray-500 hover:text-gray-800"
              >
                <input
                  type="checkbox"
                  checked={delivery.includes(key)}
                  onChange={() => toggleInList(delivery, setDelivery, key)}
                  className="h-3.5 w-3.5 accent-red-600"
                />
                {label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}