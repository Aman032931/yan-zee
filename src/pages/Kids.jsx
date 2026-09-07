import { useState, useMemo } from 'react';
import KidsHero from '../components/kids/KidsHero';
import KidsCategoryTabs from '../components/kids/KidsCategoryTabs';
import KidsFilterPanel from '../components/kids/KidsFilterPanel';
import KidsProductCard from '../components/kids/KidsProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useKidsProducts } from '../utils/useKidsProducts';

export default function Kids() {
  const { products, loading } = useKidsProducts();
  const [activeTab, setActiveTab] = useState("All");
  const [maxPrice, setMaxPrice] = useState(150000);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const clearFilters = () => {
    setMaxPrice(150000);
    setOnlyNewArrivals(false);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => activeTab === "All" || p.category === activeTab)
      .filter((p) => p.price <= maxPrice)
      .filter((p) => !onlyNewArrivals || p.isNew)
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [products, activeTab, maxPrice, onlyNewArrivals, sortBy]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-16">
      <KidsHero />
      <KidsCategoryTabs activeTab={activeTab} onSelect={setActiveTab} />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{loading ? "Loading..." : `${filteredProducts.length} products`}</p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-xs outline-none bg-white cursor-pointer shadow-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
        <div>
          <KidsFilterPanel
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onlyNewArrivals={onlyNewArrivals}
            setOnlyNewArrivals={setOnlyNewArrivals}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm font-medium text-gray-600">
                No kids products available yet — check back soon.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                We're working on adding real inventory for this department.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <KidsProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}