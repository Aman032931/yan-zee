import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import FilterPanel from './FilterPanel';
import RecommendedSection from './RecommendedSection';
import ProductSkeleton from '../ProductSkeleton';

export default function AllShop({
  selectedCategory = "all",
  setSelectedCategory,
  title = "Yanzee",
  subtitle = "Discover fashion, sports, beauty, home & more — filter by brand or department.",
  showRecommended = true,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [maxPrice, setMaxPrice] = useState(150000);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(12);

  const handleCategorySelect = (cat) => {
    if (setSelectedCategory) setSelectedCategory(cat);
    setVisibleCount(12);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setVisibleCount(12);
  };

  const handleMaxPriceChange = (price) => {
    setMaxPrice(price);
    setVisibleCount(12);
  };

  const handleNewArrivalsChange = (isNew) => {
    setOnlyNewArrivals(isNew);
    setVisibleCount(12);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setVisibleCount(12);
  };

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          brand: item.category.toUpperCase(),
          category: item.category.toLowerCase(),
          price: Math.round(item.price * 135),
          image: item.image,
          rating: Math.round(item.rating?.rate || 4),
          badge: item.rating?.rate > 4.2 ? "TOP SELLING" : null,
          isNew: item.id <= 5,
        }));
        setProducts(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setLoading(false);
      });
  }, []);

  const clearFilters = () => {
    if (setSelectedCategory) setSelectedCategory("all");
    setSelectedBrand("All Brands");
    setMaxPrice(150000);
    setOnlyNewArrivals(false);
    setVisibleCount(12);
  };

  const isCategoryMatch = (productCategory, selectedCat) => {
    if (!selectedCat || selectedCat === "all" || selectedCat === "All Departments") return true;

    const cat = selectedCat.toLowerCase().trim();
    const pCat = productCategory.toLowerCase().trim();

    if (pCat === cat) return true;

    if (["fashion", "clothing"].includes(cat)) {
      return pCat === "men's clothing" || pCat === "women's clothing";
    }
    if (["beauty", "jewelry", "jewelery"].includes(cat)) {
      return pCat === "jewelery";
    }
    if (["electronics"].includes(cat)) {
      return pCat === "electronics";
    }
    if (["women's clothing", "dresses", "handbags"].includes(cat)) {
      return pCat === "women's clothing";
    }
    if (["men's clothing", "tops & tees"].includes(cat)) {
      return pCat === "men's clothing";
    }

    return pCat.includes(cat) || cat.includes(pCat);
  };

  const filteredProducts = products
    .filter((p) => isCategoryMatch(p.category, selectedCategory))
    .filter((p) =>
      selectedBrand === "All Brands" ||
      p.brand.toLowerCase() === selectedBrand.toLowerCase()
    )
    .filter((p) => p.price <= maxPrice)
    .filter((p) => !onlyNewArrivals || p.isNew)
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className="py-6">
      {/* Recommended Carousel Section */}
      {showRecommended && <RecommendedSection />}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">{title}</h2>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="text-xs text-gray-500 font-medium">Sort by</label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="border border-gray-300 rounded px-3 py-1.5 text-xs outline-none bg-white cursor-pointer shadow-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
        {/* Left Column: Filter Panel */}
        <div>
          <FilterPanel
            selectedCategory={selectedCategory || "all"}
            onSelectCategory={handleCategorySelect}
            selectedBrand={selectedBrand}
            onSelectBrand={handleBrandSelect}
            maxPrice={maxPrice}
            setMaxPrice={handleMaxPriceChange}
            onlyNewArrivals={onlyNewArrivals}
            setOnlyNewArrivals={handleNewArrivalsChange}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Right Column: Product Grid OR Skeleton Loader */}
        <div className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm font-medium text-gray-600">No products match your selected filters.</p>
              <button
                onClick={clearFilters}
                className="mt-3 bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="mt-10 text-center">
                  <button
                    onClick={handleSeeMore}
                    className="px-8 py-3 text-xs font-semibold text-gray-900 border border-gray-900 rounded-md hover:bg-black hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
                  >
                    See More ({filteredProducts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}