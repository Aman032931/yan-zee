import PriceRangeFilter from '../shared/PriceRangeFilter';

export default function OutletFilterPanel({
  priceFilter,
  setPriceFilter,
  onSaleOnly,
  setOnSaleOnly,
  onClearFilters,
}) {
  const activeFilterCount = (onSaleOnly ? 1 : 0) + (priceFilter ? 1 : 0);

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
        <span className="text-xs font-medium text-gray-700">On Sale Only</span>
        <button
          onClick={() => setOnSaleOnly(!onSaleOnly)}
          className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
            onSaleOnly ? "bg-black justify-end" : "bg-gray-200 justify-start"
          }`}
        >
          <div className="w-3.5 h-3.5 bg-white rounded-full shadow-md" />
        </button>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-800 mb-2">Price</h4>
        <PriceRangeFilter priceFilter={priceFilter} setPriceFilter={setPriceFilter} />
      </div>
    </div>
  );
}