import { useState, useMemo } from 'react';
import PremiumHero from '../components/premium/PremiumHero';
import PremiumCategoryTabs from '../components/premium/PremiumCategoryTabs';
import PremiumFilterPanel from '../components/premium/PremiumFilterPanel';
import PremiumProductCard from '../components/premium/PremiumProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { usePremiumProducts } from '../utils/usePremiumProducts';
import { useGender } from '../context/useGender';

export default function Premium() {
  const { products, loading } = usePremiumProducts();
  const { matchesGender } = useGender();
  const [activeTab, setActiveTab] = useState("All");
  const [priceFilter, setPriceFilterRaw] = useState(null);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(8);

  const setPriceFilter = (filter) => {
    setPriceFilterRaw(filter);
    setVisibleCount(8);
  };

  const clearFilters = () => { setPriceFilterRaw(null); setOnlyNewArrivals(false); setVisibleCount(8); };
  const handleTabSelect = (tab) => { setActiveTab(tab); setVisibleCount(8); };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => activeTab === "All" || p.category === activeTab)
      .filter((p) => matchesGender(p.category))
      .filter((p) => !priceFilter || (p.price >= priceFilter.min && p.price <= priceFilter.max))
      .filter((p) => !onlyNewArrivals || p.isNew)
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [products, activeTab, priceFilter, onlyNewArrivals, sortBy, matchesGender]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <>
      <div className="w-full">
        <PremiumHero />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-16">
        <PremiumCategoryTabs activeTab={activeTab} onSelect={handleTabSelect} />
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{loading ? "Loading..." : `${filteredProducts.length} products`}</p>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded px-3 py-1.5 text-xs outline-none bg-white cursor-pointer shadow-sm">
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
          <div>
            <PremiumFilterPanel priceFilter={priceFilter} setPriceFilter={setPriceFilter} onlyNewArrivals={onlyNewArrivals} setOnlyNewArrivals={setOnlyNewArrivals} onClearFilters={clearFilters} />
          </div>
          <div className="min-w-0">
            {priceFilter && (
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full">
                  {priceFilter.label}
                  <button onClick={() => setPriceFilter(null)} className="text-gray-500 hover:text-gray-900 cursor-pointer font-bold leading-none" aria-label="Remove price filter">×</button>
                </span>
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm font-medium text-gray-600">No products match your selected filters.</p>
                <button onClick={clearFilters} className="mt-3 bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 transition cursor-pointer">Reset Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleProducts.map((product) => <PremiumProductCard key={product.id} product={product} />)}
                </div>
                {visibleCount < filteredProducts.length && (
                  <div className="mt-10 text-center">
                    <button onClick={() => setVisibleCount((prev) => prev + 8)} className="px-8 py-3 text-xs font-semibold text-gray-900 border border-gray-900 rounded-md hover:bg-black hover:text-white transition-all duration-200 shadow-sm cursor-pointer">
                      See More ({filteredProducts.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}