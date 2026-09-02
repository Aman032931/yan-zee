import { useState } from "react";

const brands = [
  "Adidas",
  "American Eagle",
  "Blank NYC",
  "CALVIN KLEIN",
  "Calvin Klein Jeans",
  "Charlotte Tilbury",
  "ESTEE LAUDER",
  "ETRO",
  "Glossy Make Up",
  "JASON WU",
  "KIKI MILANO",
  "LACOSTE",
  "MAX FACTOR",
  "MaCaffeine",
  "NYX PROFESSIONAL MAKEUP",
  "Pull & Bear",
  "Revolution",
  "SKIN1004",
  "VANS",
  "XOXO",
  "XTI",
  "YanZee",
];

const categories = [
  "Fashion",
  "Sports",
  "Beauty",
  "Outlet",
  "Kids",
  "Premium",
  "Home Decor & Appliances",
];

const pricePresets = ["Under 1000", "Under 2000", "2000+"];

const deals = ["On Sale", "Outlet", "Fast Delivery"];

const deliveryOptions = [
  "Fast delivery (next day)",
  "Free delivery",
  "Delivery in 5 days",
  "Delivery in 10 days",
];

const FilterPanel = ({ onClose, onClear }) => {
  const [expandedFilters, setExpandedFilters] = useState({
    brand: false,
    category: false,
    price: false,
    deals: false,
    delivery: false,
  });

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState([]);
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("50000");

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const toggleSelection = (list, value) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const handleClearAll = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedPrice(null);
    setSelectedDeals([]);
    setSelectedDelivery([]);
    setMinPrice("0");
    setMaxPrice("50000");
    onClear();
  };

  const triggerClass =
    "w-full flex items-center justify-between cursor-pointer border-none bg-transparent py-4 text-[14px] text-[#333] rounded-[4px] transition-all duration-200 hover:pl-1 hover:text-black hover:bg-[rgba(0,0,0,0.02)]";

  const chevronClass =
    "h-3 w-3 shrink-0 transition-transform duration-300";

  const subHeadingClass = "text-[13px] font-bold text-[#1a1a1a]";

  const itemClass =
    "flex w-full cursor-pointer items-center justify-between border-none bg-transparent px-4 py-[8px] text-left text-[13px] text-[#79756a] transition-colors duration-150 hover:bg-[#f0eeea] hover:text-[#4a4a40]";

  const itemSelectedClass = "font-medium text-[#4a4a40]";

  const scrollListClass =
    "mt-2 max-h-[220px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c9c9c9]";

  return (
    <aside
      className="relative w-[300px] shrink-0 rounded-[8px] border border-[#e5e5e5] bg-[#f7f7f7] p-6 max-[1024px]:fixed max-[1024px]:left-0 max-[1024px]:top-0 max-[1024px]:z-[1000] max-[1024px]:h-full max-[1024px]:w-[320px] max-[1024px]:max-h-screen max-[1024px]:overflow-y-auto max-[1024px]:rounded-none max-[1024px]:border-none max-[1024px]:bg-white max-[1024px]:shadow-[0_0_30px_rgba(0,0,0,0.15)] max-[1024px]:hidden [@media(max-height:700px)]:max-h-[90vh] [@media(max-height:700px)]:overflow-y-auto"
      aria-label="Product filters"
    >
      <button
        type="button"
        className="absolute right-[12px] top-[12px] z-[10] hidden cursor-pointer border-none bg-transparent px-2 py-1 text-[24px] text-[#333] hover:text-black max-[1024px]:block"
        aria-label="Close filters"
        onClick={onClose}
      >
        ×
      </button>
      <div className="yz-shop-filter-panel">
        {/* Header with All Filters and Clear all */}
        <div className="mb-[20px] flex items-center justify-between border-b border-[#eee] pb-[14px]">
          <h2 className="m-0 text-[20px] font-bold tracking-[-0.3px] text-[#1a1a1a]">All Filters</h2>
          <button
            type="button"
            className="cursor-pointer rounded-[4px] border-none bg-transparent px-3 py-[6px] text-[14px] font-semibold text-[#0066cc] transition-colors duration-200 hover:bg-[rgba(0,102,204,0.08)]"
            onClick={handleClearAll}
          >
            Clear all
          </button>
        </div>

        {/* New Arrivals Toggle */}
        <label className="flex cursor-pointer items-center justify-between border-b border-[#eee] py-4 text-[14px] text-[#333] hover:text-black">
          <span>New Arrivals</span>
          <input type="checkbox" className="peer hidden" />
          <span
            className="relative h-[26px] w-[44px] shrink-0 rounded-[13px] bg-[#ddd] transition-colors duration-200 after:absolute after:left-[2px] after:top-[2px] after:h-[22px] after:w-[22px] after:rounded-full after:bg-white after:shadow-[0_1px_3px_rgba(0,0,0,0.2)] after:transition-transform after:duration-200 peer-checked:bg-[#0066cc] peer-checked:after:translate-x-[18px]"
            aria-hidden="true"
          ></span>
        </label>

        {/* Brand Filter */}
        <div className="border-b border-[#eee] last:border-b-0">
          <button
            type="button"
            className={`${triggerClass} ${expandedFilters.brand ? "font-medium text-black" : ""}`}
            aria-expanded={expandedFilters.brand}
            onClick={() => toggleFilter('brand')}
          >
            <span className="flex items-center gap-2 text-[14px]">Brand</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`${chevronClass} ${expandedFilters.brand ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>

          {expandedFilters.brand && (
            <div className="pb-3">
              <h4 className={subHeadingClass}>All brands</h4>
              <div className={scrollListClass}>
                {brands.map((brand) => {
                  const isSelected = selectedBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      className={`${itemClass} ${isSelected ? itemSelectedClass : ""}`}
                      onClick={() => setSelectedBrands((prev) => toggleSelection(prev, brand))}
                    >
                      <span>{brand}</span>
                      {isSelected && <span className="text-[12px] text-[#1a1a1a]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="border-b border-[#eee] last:border-b-0">
          <button
            type="button"
            className={`${triggerClass} ${expandedFilters.category ? "font-medium text-black" : ""}`}
            aria-expanded={expandedFilters.category}
            onClick={() => toggleFilter('category')}
          >
            <span className="flex items-center gap-2 text-[14px]">
              Category
              <span className="rounded-[12px] bg-[#e8e8e8] px-[10px] py-[2px] text-[12px] font-medium text-[#666]">
                {selectedCategories.length}
              </span>
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`${chevronClass} ${expandedFilters.category ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>

          {expandedFilters.category && (
            <div className="pb-3">
              <h4 className={subHeadingClass}>All Departments</h4>
              <div className={scrollListClass}>
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`${itemClass} ${isSelected ? itemSelectedClass : ""}`}
                      onClick={() => setSelectedCategories((prev) => toggleSelection(prev, cat))}
                    >
                      <span>{cat}</span>
                      {isSelected && <span className="text-[12px] text-[#1a1a1a]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="border-b border-[#eee] last:border-b-0">
          <button
            type="button"
            className={`${triggerClass} ${expandedFilters.price ? "font-medium text-black" : ""}`}
            aria-expanded={expandedFilters.price}
            onClick={() => toggleFilter('price')}
          >
            <span className="flex items-center gap-2 text-[14px]">Price</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`${chevronClass} ${expandedFilters.price ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>

          {expandedFilters.price && (
            <div className="pb-3">
              <h4 className={subHeadingClass}>All Prices</h4>
              <div className="mt-2">
                {pricePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`${itemClass} ${selectedPrice === preset ? itemSelectedClass : ""}`}
                    onClick={() => setSelectedPrice(preset)}
                  >
                    <span>{preset}</span>
                    {selectedPrice === preset && <span className="text-[12px] text-[#1a1a1a]">✓</span>}
                  </button>
                ))}
              </div>

              <p className="mt-3 mb-2 px-4 text-[11px] font-semibold tracking-[0.5px] text-[#333]">
                CUSTOM RANGE
              </p>

              <div className="flex items-end gap-2 px-4">
                <label className="flex-1">
                  <span className="mb-1 block text-[11px] text-[#666]">Min</span>
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-[4px] border border-[#ddd] bg-white px-3 py-2 text-[14px] text-[#333] outline-none transition-colors duration-200 focus:border-[#0066cc]"
                  />
                </label>
                <label className="flex-1">
                  <span className="mb-1 block text-[11px] text-[#666]">Max</span>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-[4px] border border-[#ddd] bg-white px-3 py-2 text-[14px] text-[#333] outline-none transition-colors duration-200 focus:border-[#0066cc]"
                  />
                </label>
              </div>

              <div className="px-4 pt-3">
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-[4px] border-none bg-black py-[10px] text-[13px] font-bold text-white transition-colors duration-200 hover:bg-[#222]"
                  onClick={() => console.log(`Apply price range: ${minPrice} - ${maxPrice}`)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Deals Filter */}
        <div className="border-b border-[#eee] last:border-b-0">
          <button
            type="button"
            className={`${triggerClass} ${expandedFilters.deals ? "font-medium text-black" : ""}`}
            aria-expanded={expandedFilters.deals}
            onClick={() => toggleFilter('deals')}
          >
            <span className="flex items-center gap-2 text-[14px]">Deals</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`${chevronClass} ${expandedFilters.deals ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>

          {expandedFilters.deals && (
            <div className="pb-3">
              <h4 className={subHeadingClass}>All Deals</h4>
              <div className="mt-2">
                {deals.map((deal) => {
                  const isSelected = selectedDeals.includes(deal);
                  return (
                    <button
                      key={deal}
                      type="button"
                      className={`${itemClass} ${isSelected ? itemSelectedClass : ""}`}
                      onClick={() => setSelectedDeals((prev) => toggleSelection(prev, deal))}
                    >
                      <span>{deal}</span>
                      {isSelected && <span className="text-[12px] text-[#1a1a1a]">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Type Filter */}
        <div className="border-b border-[#eee] last:border-b-0">
          <button
            type="button"
            className={`${triggerClass} ${expandedFilters.delivery ? "font-medium text-black" : ""}`}
            aria-expanded={expandedFilters.delivery}
            onClick={() => toggleFilter('delivery')}
          >
            <span className="flex items-center gap-2 text-[14px]">Delivery Type</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`${chevronClass} ${expandedFilters.delivery ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>

          {expandedFilters.delivery && (
            <div className="pb-3">
              <div className="mt-1">
                {deliveryOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 px-4 py-[8px] transition-colors duration-150 hover:bg-[#f0eeea]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDelivery.includes(option)}
                      onChange={() => setSelectedDelivery((prev) => toggleSelection(prev, option))}
                      className="size-4 cursor-pointer accent-[#1a1a1a]"
                    />
                    <span className="text-[13px] text-[#4a4a40]">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default FilterPanel;