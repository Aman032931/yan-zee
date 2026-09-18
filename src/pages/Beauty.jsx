import { useState, useMemo } from "react"
import BeautyHero from "../components/beauty/BeautyHero"
import BeautyCategoryTabs from "../components/beauty/BeautyCategoryTabs"
import FilterPanel from "../components/shared/FilterPanel";
import ProductCard from "../components/shared/ProductCard"
import ProductSkeleton from "../components/ProductSkeleton"
import { useBeautyProducts } from "../utils/useBeautyProducts"
import { useGender } from "../context/useGender"

export default function Beauty() {
  const { products, loading } = useBeautyProducts()
  const { matchesGender } = useGender()
  const [activeTab, setActiveTab] = useState("All")
  const [priceFilter, setPriceFilterRaw] = useState(null)
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false)
  const [sortBy, setSortBy] = useState("featured")
  const [visibleCount, setVisibleCount] = useState(8)

  const setPriceFilter = (filter) => {
    setPriceFilterRaw(filter)
    setVisibleCount(8)
  }

  const clearFilters = () => {
    setPriceFilterRaw(null)
    setOnlyNewArrivals(false)
    setVisibleCount(8)
  }

  const handleTabSelect = (tab) => {
    setActiveTab(tab)
    setVisibleCount(8)
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => activeTab === "All" || p.category === activeTab)
      .filter((p) => matchesGender(p.category))
      .filter(
        (p) =>
          !priceFilter ||
          (p.price >= priceFilter.min && p.price <= priceFilter.max)
      )
      .filter((p) => !onlyNewArrivals || p.isNew)
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price
        if (sortBy === "price-high") return b.price - a.price
        return 0
      })
  }, [products, activeTab, priceFilter, onlyNewArrivals, sortBy, matchesGender])

  const visibleProducts = filteredProducts.slice(0, visibleCount)

  return (
    <>
      {/* Full-width hero — no max-width wrapper */}
      <div className="w-full">
        <BeautyHero />
      </div>

      {/* Everything else stays inside the constrained container */}
      <div className="mx-auto max-w-360 px-4 pt-8 pb-16">
        <BeautyCategoryTabs activeTab={activeTab} onSelect={handleTabSelect} />

        <div className="mb-6 flex items-center justify-between">
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
              onClearFilters={clearFilters}
            />
          </div>

          <div className="min-w-0">
            {priceFilter && (
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-800">
                  {priceFilter.label}
                  <button
                    onClick={() => setPriceFilter(null)}
                    className="cursor-pointer leading-none font-bold text-gray-500 hover:text-gray-900"
                    aria-label="Remove price filter"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

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
                    <ProductCard key={product.id} product={product} />
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
