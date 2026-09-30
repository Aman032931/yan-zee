import { useState, useMemo, useRef } from "react"
import FashionHero from "../components/fashion/FashionHero"
import CategoryTabs from "../components/fashion/CategoryTabs"
import FilterPanel from "../components/shared/FilterPanel"
import ProductCard from "../components/shared/ProductCard"
import ProductSkeleton from "../components/ProductSkeleton"
import ActivePriceChip from "../components/shared/ActivePriceChip"
import { useFashionProducts } from "../utils/useFashionProducts"
import { useGender } from "../context/useGender"
import { filterByDealsAndDelivery } from "../utils/dealDeliveryFilters" // NEW

export default function Fashion() {
  const { products, loading } = useFashionProducts()
  const { matchesGender } = useGender()
  const [activeTab, setActiveTab] = useState("All")
  const [priceFilter, setPriceFilter] = useState(null)
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false)
  const [deals, setDeals] = useState([]) // NEW
  const [delivery, setDelivery] = useState([]) // NEW
  const [sortBy, setSortBy] = useState("featured")
  const [visibleCount, setVisibleCount] = useState(8)

  const clearFilters = () => {
    setPriceFilter(null)
    setOnlyNewArrivals(false)
    setDeals([]) // NEW
    setDelivery([]) // NEW
    setVisibleCount(8)
  }

  const productsRef = useRef(null)

  const handleShopNewArrivals = () => {
    const hasNew = products.some((p) => p.isNew)
    setOnlyNewArrivals(hasNew)
    setVisibleCount(8)
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }
  // NEW: reset "See More" whenever a deal/delivery box changes
  const handleSetDeals = (next) => {
    setDeals(next)
    setVisibleCount(8)
  }
  const handleSetDelivery = (next) => {
    setDelivery(next)
    setVisibleCount(8)
  }

  const handleTabSelect = (tab) => {
    setActiveTab(tab)
    setVisibleCount(8)
  }

  const filteredProducts = useMemo(() => {
    const base = products
      .filter((p) => activeTab === "All" || p.category === activeTab)
      .filter((p) => matchesGender(p.category))
      .filter(
        (p) =>
          !priceFilter ||
          (p.price >= priceFilter.min && p.price <= priceFilter.max)
      )
      .filter((p) => !onlyNewArrivals || p.isNew)

    // NEW: apply Deals + Delivery Type
    return filterByDealsAndDelivery(base, deals, delivery).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
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
    matchesGender,
  ]) // NEW: deals, delivery

  const visibleProducts = filteredProducts.slice(0, visibleCount)

  return (
    <>
      {/* Full-width hero — no max-width wrapper */}
      <div className="w-full">
        <FashionHero  onShopNew={handleShopNewArrivals}/>
      </div>

      {/* Everything else stays inside the constrained container */}
      <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-16 scroll-mt-24">
        <CategoryTabs activeTab={activeTab} onSelect={handleTabSelect} />

        <div  ref={productsRef} className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${filteredProducts.length} products`}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer rounded border border-gray-300 bg-white px-3 py-1.5 text-xs shadow-sm outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <div className="items-start">
            <FilterPanel
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
              onlyNewArrivals={onlyNewArrivals}
              setOnlyNewArrivals={setOnlyNewArrivals}
              deals={deals} // NEW
              setDeals={handleSetDeals} // NEW
              delivery={delivery} // NEW
              setDelivery={handleSetDelivery} // NEW
              onClearFilters={clearFilters}
            />
          </div>

          <div className="min-w-0">
            <ActivePriceChip
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
            />

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                <p className="text-sm font-medium text-gray-600">
                  No products match your selected filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-3 cursor-pointer rounded bg-black px-4 py-2 text-xs text-white transition hover:bg-gray-800"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badgeColor="bg-orange-600"
                      showDiscount
                    />
                  ))}
                </div>

                {visibleCount < filteredProducts.length && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="cursor-pointer rounded-md border border-gray-900 px-8 py-3 text-xs font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:bg-black hover:text-white"
                    >
                      See More ({filteredProducts.length - visibleCount}{" "}
                      remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
