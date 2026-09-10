import { useState } from 'react';

export default function FilterPanel({
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  maxPrice,
  setMaxPrice,
  onlyNewArrivals,
  setOnlyNewArrivals,
  onClearFilters,
}) {
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: false,
    price: false,
    deals: false,
    delivery: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const categories = [
    "All Departments",
    "Fashion",
    "Sports",
    "Beauty",
    "Outlet",
    "Kids",
    "Premium",
  ];

  const brands = [
    "All Brands",
    "MEN'S CLOTHING",
    "WOMEN'S CLOTHING",
    "JEWELERY",
    "ELECTRONICS",
  ];

  const activeFilterCount =
    (selectedCategory !== "all" && selectedCategory !== "All Departments" ? 1 : 0) +
    (selectedBrand !== "All Brands" ? 1 : 0) +
    (onlyNewArrivals ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">All Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* New Arrivals Toggle Switch */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-700">New Arrivals</span>
        <button
          onClick={() => setOnlyNewArrivals(!onlyNewArrivals)}
          className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
            onlyNewArrivals ? "bg-black justify-end" : "bg-gray-200 justify-start"
          }`}
        >
          <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md" />
        </button>
      </div>

      {/* Brand Section */}
      <div className="border-b border-gray-100 pb-3">
        <button
          onClick={() => toggleSection("brand")}
          className="w-full flex justify-between items-center text-xs font-semibold text-gray-800 py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            Brand
            {selectedBrand !== "All Brands" && (
              <span className="bg-gray-200 text-gray-700 text-[10px] rounded-full px-1.5 py-0.2">
                1
              </span>
            )}
          </span>
          <span>{openSections.brand ? "▲" : "▼"}</span>
        </button>

        {openSections.brand && (
          <div className="mt-2 space-y-1.5 pl-1 max-h-48 overflow-y-auto">
            {brands.map((brand) => {
              const isSelected = selectedBrand.toLowerCase() === brand.toLowerCase();
              return (
                <div
                  key={brand}
                  onClick={() => onSelectBrand(brand)}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded cursor-pointer transition ${
                    isSelected
                      ? "text-gray-900 font-bold bg-gray-50"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="capitalize">{brand.toLowerCase()}</span>
                  {isSelected && <span>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Section */}
      <div className="border-b border-gray-100 pb-3">
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex justify-between items-center text-xs font-semibold text-gray-800 py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            Category
            {selectedCategory !== "all" && selectedCategory !== "All Departments" && (
              <span className="bg-gray-200 text-gray-700 text-[10px] rounded-full px-1.5 py-0.2">
                1
              </span>
            )}
          </span>
          <span>{openSections.category ? "▲" : "▼"}</span>
        </button>

        {openSections.category && (
          <div className="mt-2 space-y-1.5 pl-1 max-h-48 overflow-y-auto">
            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.toLowerCase() ||
                (cat === "All Departments" && selectedCategory === "all");

              return (
                <div
                  key={cat}
                  onClick={() => onSelectCategory(cat === "All Departments" ? "all" : cat)}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded cursor-pointer transition ${
                    isSelected
                      ? "text-gray-900 font-bold bg-gray-50"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>{cat}</span>
                  {isSelected && <span>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range Slider Section */}
      <div className="border-b border-gray-100 pb-3">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex justify-between items-center text-xs font-semibold text-gray-800 py-1 cursor-pointer"
        >
          <span>Price</span>
          <span>{openSections.price ? "▲" : "▼"}</span>
        </button>

        {openSections.price && (
          <div className="mt-2 px-1">
            <input
              type="range"
              min="500"
              max="150000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <span>Nrs 500</span>
              <span className="font-semibold text-gray-800">
                Up to Nrs {maxPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Deals Section */}
      <div className="border-b border-gray-100 pb-3">
        <button
          onClick={() => toggleSection("deals")}
          className="w-full flex justify-between items-center text-xs font-semibold text-gray-800 py-1 cursor-pointer"
        >
          <span>Deals</span>
          <span>{openSections.deals ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Delivery Type Section */}
      <div>
        <button
          onClick={() => toggleSection("delivery")}
          className="w-full flex justify-between items-center text-xs font-semibold text-gray-800 py-1 cursor-pointer"
        >
          <span>Delivery Type</span>
          <span>{openSections.delivery ? "▲" : "▼"}</span>
        </button>
      </div>
    </div>
  );
}