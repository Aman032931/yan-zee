export default function ActivePriceChip({ priceFilter, setPriceFilter }) {
  if (!priceFilter) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full">
        {priceFilter.label}
        <button
          onClick={() => setPriceFilter(null)}
          className="text-gray-500 hover:text-gray-900 cursor-pointer font-bold leading-none"
          aria-label="Remove price filter"
        >
          ×
        </button>
      </span>
    </div>
  );
}