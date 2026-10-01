import { useState, useMemo } from "react"
import KidsHero from "../components/kids/KidsHero"
import KidsCategoryTabs from "../components/kids/KidsCategoryTabs"
import FilterPanel from "../components/shared/FilterPanel"
import ResponsiveFilterPanel from "../components/shared/ResponsiveFilterPanel"
import ProductCard from "../components/shared/ProductCard"
import ProductSkeleton from "../components/ProductSkeleton"
import { useKidsProducts } from "../utils/useKidsProducts"
import { filterByDealsAndDelivery } from "../utils/dealDeliveryFilters"
import ActivePriceChip from "../components/shared/ActivePriceChip"

const SHOP_LAYOUT =
  "grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]"

const GRID_CLASSES =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"

export default function Kids() {
  const { products, loading } = useKidsProducts()

  const [activeTab, setActiveTab] = useState("All")
  const [priceFilter, setPriceFilter] = useState(null)
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false)
  const [deals, setDeals] = useState([])
  const [delivery, setDelivery] = useState([])
  const [sortBy, setSortBy] = useState("featured")

  const clearFilters = () => {
    setPriceFilter(null)
    setOnlyNewArrivals(false)
    setDeals([])
    setDelivery([])
  }

  const filteredProducts = useMemo(() => {
    const base = products
      .filter(
        (p) =>
          activeTab === "All" ||
          p.category === activeTab
      )
      .filter(
        (p) =>
          !priceFilter ||
          (p.price >= priceFilter.min &&
            p.price <= priceFilter.max)
      )
      .filter(
        (p) =>
          !onlyNewArrivals || p.isNew
      )

    return filterByDealsAndDelivery(
      base,
      deals,
      delivery
    ).sort((a, b) => {
      if (sortBy === "price-low") {
        return a.price - b.price
      }

      if (sortBy === "price-high") {
        return b.price - a.price
      }

      return 0
    })
  }, [
    products,
    activeTab,
    priceFilter,
    onlyNewArrivals,
    deals,
    delivery,
    sortBy,
  ])

  return (
    <>
      {/* Full-width hero */}
      <div className="w-full">
        <KidsHero />
      </div>

      {/* Main content */}
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8">
        {/* Category tabs */}
        <div className="mb-6 min-w-0 overflow-x-auto">
          <KidsCategoryTabs
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
        </div>

        {/* Product count + sorting */}
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading..."
              : `${filteredProducts.length} products`}
          </p>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <label className="text-xs font-medium text-gray-500">
              Sort by
            </label>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              className="h-9 min-w-0 flex-1 cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-xs shadow-sm outline-none sm:w-auto sm:flex-none"
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>

        {/* Shop layout */}
        <div className={SHOP_LAYOUT}>
          {/* Desktop sidebar / Mobile filter sheet */}
          <ResponsiveFilterPanel
            title="Kids Filters"
            buttonText="Filter Products"
          >
            <FilterPanel
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
              onlyNewArrivals={onlyNewArrivals}
              setOnlyNewArrivals={setOnlyNewArrivals}
              deals={deals}
              setDeals={setDeals}
              delivery={delivery}
              setDelivery={setDelivery}
              onClearFilters={clearFilters}
            />
          </ResponsiveFilterPanel>

          {/* Products */}
          <div className="min-w-0">
            <ActivePriceChip
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
            />

            {loading ? (
              <div className={GRID_CLASSES}>
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center sm:py-16">
                <p className="text-sm font-medium text-gray-600">
                  No kids products available yet —
                  check back soon.
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  We're working on adding real
                  inventory for this department.
                </p>
              </div>
            ) : (
              <div className={GRID_CLASSES}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    imageFit="cover"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}