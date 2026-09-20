import { useState } from "react";
import PriceRangeFilter from "./PriceRangeFilter";

/**
 * Shared filter panel used by every category page except Home
 * (Home keeps its own richer panel in components/home/FilterPanel.jsx,
 * which additionally has Brand and Category sections this one doesn't).
 *
 * `onlyNewArrivals` / `setOnlyNewArrivals` are the real prop names —
 * six pages (Fashion, Beauty, Sports, Kids, Premium, Home Decor) already
 * call this component with those exact names, so nothing about their
 * calls needs to change.
 *
 * Outlet is the one exception: its toggle means "On Sale," not "New
 * Arrivals." It passes its own `onSaleOnly` state into the
 * `onlyNewArrivals` prop slot at the call site, and overrides
 * toggleLabel/toggleSubLabel so the UI reads correctly.
 *
 * Deals and Delivery Type below are display-only, same as on Home —
 * they toggle visually but aren't wired into any product filtering yet.
 */
export default function FilterPanel({
  priceFilter,
  setPriceFilter,
  onlyNewArrivals,
  setOnlyNewArrivals,
  toggleLabel = "New Arrivals",
  toggleSubLabel = "New arrivals only",
  onClearFilters,
}) {
  const activeFilterCount = (onlyNewArrivals ? 1 : 0) + (priceFilter ? 1 : 0);

  const [openSections, setOpenSections] = useState({
    deals: false,
    delivery: false,
  });

  const [deals, setDeals] = useState([]);
  const [delivery, setDelivery] = useState([]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleInList = (list, setList, value) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  return (
    <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-5">
      {/* ===== Header ===== */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-gray-900">All Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="cursor-pointer text-xs font-semibold text-gray-900 hover:text-gray-100"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ===== Toggle ===== */}
      <div className="border-t border-gray-100 py-4 first:border-t-0 first:pt-0">
        <span className="text-[13px] font-semibold text-gray-900">
          {toggleLabel}
        </span>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">{toggleSubLabel}</span>
          <button
            onClick={() => setOnlyNewArrivals(!onlyNewArrivals)}
            role="switch"
            aria-checked={onlyNewArrivals}
            className={`relative h-5 w-10 cursor-pointer rounded-full transition-colors duration-200 ${
              onlyNewArrivals ? "bg-gray-900" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                onlyNewArrivals ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* =========================================================
          ===== Price — UNCHANGED. Do not restyle this block. =====
          ========================================================= */}
      <div className="border-t border-gray-100 py-4">
        <h4 className="mb-2 text-xs font-semibold text-gray-800">Price</h4>
        <PriceRangeFilter
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
        />
      </div>
      {/* =========================================================
          ===== End of unchanged Price block =====
          ========================================================= */}

      {/* ===== Deals (display only) ===== */}
      <div className="border-t border-gray-100 py-4">
        <button
          onClick={() => toggleSection("deals")}
          className="flex w-full cursor-pointer items-center justify-between text-[13px] font-semibold text-gray-900"
        >
          Deals
          <span className="text-[9px] text-gray-400">
            {openSections.deals ? "▲" : "▼"}
          </span>
        </button>

        {openSections.deals && (
          <div className="mt-3 space-y-2.5">
            {["Clearance", "Flash Sale", "Bundle Offers", "Free Shipping"].map(
              (deal) => (
                <label
                  key={deal}
                  className="flex cursor-pointer items-center gap-2.5 text-[13px] font-normal text-gray-500 hover:text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={deals.includes(deal)}
                    onChange={() => toggleInList(deals, setDeals, deal)}
                    className="h-3.5 w-3.5 accent-gray-900"
                  />
                  {deal}
                </label>
              )
            )}
          </div>
        )}
      </div>

      {/* ===== Delivery Type (display only) ===== */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => toggleSection("delivery")}
          className="flex w-full cursor-pointer items-center justify-between text-[13px] font-semibold text-gray-900"
        >
          Delivery Type
          <span className="text-[9px] text-gray-400">
            {openSections.delivery ? "▲" : "▼"}
          </span>
        </button>

        {openSections.delivery && (
          <div className="mt-3 space-y-2.5">
            {["Express Delivery", "Standard Delivery", "Pickup Available"].map(
              (type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-2.5 text-[13px] font-normal text-gray-500 hover:text-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={delivery.includes(type)}
                    onChange={() => toggleInList(delivery, setDelivery, type)}
                    className="h-3.5 w-3.5 accent-red-600"
                  />
                  {type}
                </label>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}