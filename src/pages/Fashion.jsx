import { useState, useMemo, useRef } from "react";
import FashionHero from "../components/fashion/FashionHero";
import CategoryTabs from "../components/fashion/CategoryTabs";
import FilterPanel from "../components/shared/FilterPanel";
import ProductCard from "../components/shared/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import ActivePriceChip from "../components/shared/ActivePriceChip";
import ResponsiveFilterPanel from "../components/shared/ResponsiveFilterPanel";
import { useFashionProducts } from "../utils/useFashionProducts";
import { useGender } from "../context/useGender";
import { filterByDealsAndDelivery } from "../utils/dealDeliveryFilters";

export default function Fashion() {
  const { products, loading } = useFashionProducts();
  const { matchesGender } = useGender();

  const [activeTab, setActiveTab] = useState("All");
  const [priceFilter, setPriceFilter] = useState(null);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [deals, setDeals] = useState([]);
  const [delivery, setDelivery] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(8);

  const productsRef = useRef(null);

  const clearFilters = () => {
    setPriceFilter(null);
    setOnlyNewArrivals(false);
    setDeals([]);
    setDelivery([]);
    setVisibleCount(8);
  };

  const handleShopNewArrivals = () => {
    const hasNew = products.some((p) => p.isNew);

    setOnlyNewArrivals(hasNew);
    setVisibleCount(8);

    productsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSetDeals = (next) => {
    setDeals(next);
    setVisibleCount(8);
  };

  const handleSetDelivery = (next) => {
    setDelivery(next);
    setVisibleCount(8);
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setVisibleCount(8);
  };

  const filteredProducts = useMemo(() => {
    const base = products
      .filter(
        (p) => activeTab === "All" || p.category === activeTab
      )
      .filter((p) => matchesGender(p.category))
      .filter(
        (p) =>
          !priceFilter ||
          (p.price >= priceFilter.min &&
            p.price <= priceFilter.max)
      )
      .filter(
        (p) => !onlyNewArrivals || p.isNew
      );

    return filterByDealsAndDelivery(
      base,
      deals,
      delivery
    ).sort((a, b) => {
      if (sortBy === "price-low") {
        return a.price - b.price;
      }

      if (sortBy === "price-high") {
        return b.price - a.price;
      }

      return 0;
    });
  }, [
    products,
    activeTab,
    priceFilter,
    onlyNewArrivals,
    deals,
    delivery,
    sortBy,
    matchesGender,
  ]);

  const visibleProducts = filteredProducts.slice(
    0,
    visibleCount
  );

  return (
    <>
      {/* ================= HERO ================= */}
      <div className="w-full">
        <FashionHero
          onShopNew={handleShopNewArrivals}
        />
      </div>

      {/* ================= CONTENT ================= */}
      <div
        className="
          mx-auto
          w-full
          max-w-[1600px]
          scroll-mt-24
          px-4
          pt-6
          pb-12
          sm:px-6
          sm:pt-8
          sm:pb-16
          lg:px-8
        "
      >
        {/* ================= CATEGORY TABS ================= */}
        <div className="mb-6 overflow-x-auto scrollbar-none">
          <CategoryTabs
            activeTab={activeTab}
            onSelect={handleTabSelect}
          />
        </div>

        {/* ================= TOP BAR ================= */}
        <div
          ref={productsRef}
          className="
            mb-5
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading..."
              : `${filteredProducts.length} products`}
          </p>

          {/* SORT */}
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-xs font-medium text-gray-500">
              Sort by
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="
                h-9
                cursor-pointer
                rounded-md
                border
                border-gray-300
                bg-white
                px-3
                text-xs
                shadow-sm
                outline-none
                focus:border-black
              "
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

        {/* ================= SHOP LAYOUT ================= */}
        <div
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-[240px_minmax(0,1fr)]
            xl:grid-cols-[280px_minmax(0,1fr)]
            2xl:grid-cols-[300px_minmax(0,1fr)]
          "
        >
          {/* ================= FILTERS ================= */}
          <ResponsiveFilterPanel>
            <FilterPanel
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
              onlyNewArrivals={onlyNewArrivals}
              setOnlyNewArrivals={setOnlyNewArrivals}
              deals={deals}
              setDeals={handleSetDeals}
              delivery={delivery}
              setDelivery={handleSetDelivery}
              onClearFilters={clearFilters}
            />
          </ResponsiveFilterPanel>

          {/* ================= PRODUCTS ================= */}
          <div className="min-w-0">
            <ActivePriceChip
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
            />

            {/* ================= LOADING ================= */}
            {loading ? (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:gap-4
                  md:grid-cols-3
                  xl:grid-cols-4
                "
              >
                {Array.from({ length: 8 }).map(
                  (_, i) => (
                    <ProductSkeleton key={i} />
                  )
                )}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* ================= EMPTY ================= */
              <div
                className="
                  rounded-lg
                  border
                  border-dashed
                  border-gray-200
                  bg-gray-50
                  px-4
                  py-12
                  text-center
                  sm:py-16
                "
              >
                <p className="text-sm font-medium text-gray-600">
                  No products match your selected filters.
                </p>

                <button
                  onClick={clearFilters}
                  className="
                    mt-3
                    cursor-pointer
                    rounded
                    bg-black
                    px-4
                    py-2
                    text-xs
                    text-white
                    transition
                    hover:bg-gray-800
                  "
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* ================= PRODUCT GRID ================= */}
                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                    sm:gap-4
                    md:grid-cols-3
                    xl:grid-cols-4
                  "
                >
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badgeColor="bg-orange-600"
                      showDiscount
                    />
                  ))}
                </div>

                {/* ================= SEE MORE ================= */}
                {visibleCount <
                  filteredProducts.length && (
                  <div className="mt-8 text-center sm:mt-10">
                    <button
                      onClick={() =>
                        setVisibleCount(
                          (prev) => prev + 8
                        )
                      }
                      className="
                        w-full
                        max-w-xs
                        cursor-pointer
                        rounded-md
                        border
                        border-gray-900
                        px-6
                        py-3
                        text-xs
                        font-semibold
                        text-gray-900
                        shadow-sm
                        transition-all
                        duration-200
                        hover:bg-black
                        hover:text-white
                        sm:w-auto
                        sm:px-8
                      "
                    >
                      See More (
                      {filteredProducts.length -
                        visibleCount}{" "}
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
  );
}