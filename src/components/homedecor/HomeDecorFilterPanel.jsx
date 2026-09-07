export default function HomeDecorFilterPanel({
  maxPrice,
  setMaxPrice,
  onlyNewArrivals,
  setOnlyNewArrivals,
  onClearFilters,
}) {
  const activeFilterCount = (onlyNewArrivals ? 1 : 0) + (maxPrice < 150000 ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">All Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-red-600 hover:text-red-800 transition cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

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

      <div>
        <h4 className="text-xs font-semibold text-gray-800 mb-2">Price</h4>
        <input
          type="range"
          min="500"
          max="150000"
          step="1000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-red-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-gray-500 mt-1">
          <span>Nrs 500</span>
          <span className="font-semibold text-gray-800">Up to Nrs {maxPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}