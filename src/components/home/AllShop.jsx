import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../shared/ProductCard";
import { formatProduct } from "../../utils/formatProduct";
import FilterPanel from "./FilterPanel";
import RecommendedSection from "./RecommendedSection";
import ProductSkeleton from "../ProductSkeleton";
import ActivePriceChip from "../shared/ActivePriceChip";
import { useGender } from "../../context/useGender";
import { filterByDealsAndDelivery } from "../../utils/dealDeliveryFilters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ResponsiveFilterPanel from "../shared/ResponsiveFilterPanel";

const SHOP_LAYOUT =
  "grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]";
const GRID_CLASSES =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4";

export default function AllShop({
  selectedCategory = "all",
  setSelectedCategory,
  title = "Yanzee",
  subtitle = "Discover fashion, sports, beauty, home & more — filter by brand or department.",
  showRecommended = true,
}) {
  const { matchesGender } = useGender();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [priceFilter, setPriceFilterRaw] = useState(null); // { min, max, label } | null
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [deals, setDeals] = useState([]);
  const [delivery, setDelivery] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl && setSelectedCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategory(categoryFromUrl);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleCount(12);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCategorySelect = (cat) => {
    if (setSelectedCategory) setSelectedCategory(cat);
    setVisibleCount(12);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setVisibleCount(12);
  };

  const setPriceFilter = (filter) => {
    setPriceFilterRaw(filter);
    setVisibleCount(12);
  };

  const handleNewArrivalsChange = (isNew) => {
    setOnlyNewArrivals(isNew);
    setVisibleCount(12);
  };

  // Reset "See More" whenever a deal/delivery box changes
  const handleSetDeals = (next) => {
    setDeals(next);
    setVisibleCount(12);
  };

  const handleSetDelivery = (next) => {
    setDelivery(next);
    setVisibleCount(12);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setVisibleCount(12);
  };

useEffect(() => {
  fetch("https://dummyjson.com/products?limit=100")
    .then((res) => res.json())
    .then((data) => {
      setProducts(data.products.map(formatProduct));
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
    setPriceFilterRaw(null);
    setOnlyNewArrivals(false);
    setDeals([]);
    setDelivery([]);
    setVisibleCount(12);
  };

  const isCategoryMatch = (productCategory, selectedCat) => {
    if (!selectedCat || selectedCat === "all") return true;
    return (
      productCategory.toLowerCase().trim() === selectedCat.toLowerCase().trim()
    );
  };

  const baseProducts = products
    .filter((p) => isCategoryMatch(p.category, selectedCategory))
    .filter((p) => matchesGender(p.category))
    .filter(
      (p) =>
        selectedBrand === "All Brands" ||
        p.brand.toLowerCase() === selectedBrand.toLowerCase(),
    )
    .filter(
      (p) =>
        !priceFilter ||
        (p.price >= priceFilter.min && p.price <= priceFilter.max),
    )
    .filter((p) => !onlyNewArrivals || p.isNew);

  // Apply Deals + Delivery Type, then sort
  const filteredProducts = filterByDealsAndDelivery(
    baseProducts,
    deals,
    delivery,
  ).sort((a, b) => {
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
      {showRecommended && <RecommendedSection />}

      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 capitalize">
            {title}
          </h2>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label className="text-xs font-medium text-gray-500">Sort by</label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="cursor-pointer rounded border border-gray-300 bg-white px-3 py-1.5 text-xs shadow-sm outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className={SHOP_LAYOUT}>
      <ResponsiveFilterPanel>
        <FilterPanel
          selectedCategory={selectedCategory || "all"}
          onSelectCategory={handleCategorySelect}
          selectedBrand={selectedBrand}
          onSelectBrand={handleBrandSelect}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          onlyNewArrivals={onlyNewArrivals}
          setOnlyNewArrivals={handleNewArrivalsChange}
          deals={deals}
          setDeals={handleSetDeals}
          delivery={delivery}
          setDelivery={handleSetDelivery}
          onClearFilters={clearFilters}
        />
      </ResponsiveFilterPanel>

        <div className="min-w-0">
          <div className="mb-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Filter & Sort</span>
                  <span className="text-xs text-gray-500">Open filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader className="pr-8">
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="mt-2">
                  <FilterPanel
                    selectedCategory={selectedCategory || "all"}
                    onSelectCategory={handleCategorySelect}
                    selectedBrand={selectedBrand}
                    onSelectBrand={handleBrandSelect}
                    priceFilter={priceFilter}
                    setPriceFilter={setPriceFilter}
                    onlyNewArrivals={onlyNewArrivals}
                    setOnlyNewArrivals={handleNewArrivalsChange}
                    deals={deals}
                    setDeals={handleSetDeals}
                    delivery={delivery}
                    setDelivery={handleSetDelivery}
                    onClearFilters={clearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <ActivePriceChip
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
          />

          {loading ? (
            <div className={GRID_CLASSES}>
              {[...Array(8)].map((_, index) => (
                <ProductSkeleton key={index} />
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
              <div className={GRID_CLASSES}>
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="mt-10 text-center">
                  <button
                    onClick={handleSeeMore}
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
  );
}