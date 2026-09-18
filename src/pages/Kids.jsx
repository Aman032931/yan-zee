import { useState, useMemo } from "react"
import KidsHero from "../components/kids/KidsHero"
import KidsCategoryTabs from "../components/kids/KidsCategoryTabs"
import FilterPanel from "../components/shared/FilterPanel"
import ProductCard from "../components/shared/ProductCard"
import ProductSkeleton from "../components/ProductSkeleton"
import { useKidsProducts } from "../utils/useKidsProducts"

export default function Kids() {
  const { products, loading } = useKidsProducts()
  const [activeTab, setActiveTab] = useState("All")
  const [priceFilter, setPriceFilter] = useState(null)
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false)
  const [sortBy, setSortBy] = useState("featured")

  const clearFilters = () => {
    setPriceFilter(null)
    setOnlyNewArrivals(false)
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => activeTab === "All" || p.category === activeTab)
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
  }, [products, activeTab, priceFilter, onlyNewArrivals, sortBy])

  return (
    <>
      <div className="w-full">
        <KidsHero />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-16">
        <KidsCategoryTabs activeTab={activeTab} onSelect={setActiveTab} />

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
                  No kids products available yet — check back soon.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  We're working on adding real inventory for this department.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
