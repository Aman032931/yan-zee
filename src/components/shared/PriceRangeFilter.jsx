import { useState, useRef, useCallback, useEffect } from "react";

const SLIDER_MIN = 1;
const SLIDER_MAX = 10000;
const STEP = 100;

export default function PriceRangeFilter({ priceFilter, setPriceFilter }) {
  const [sliderMin, setSliderMin] = useState(SLIDER_MIN);
  const [sliderMax, setSliderMax] = useState(SLIDER_MAX);
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");
  const [customApplied, setCustomApplied] = useState(false);
  const [dragging, setDragging] = useState(null);
  const trackRef = useRef(null);

  // Sync local display state whenever priceFilter is cleared externally
  // (e.g. "Clear all" in the filter panel, or the × on the active-filter chip)
  useEffect(() => {
    if (priceFilter === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSliderMin(SLIDER_MIN);
      setSliderMax(SLIDER_MAX);
      setCustomMin("");
      setCustomMax("");
      setCustomApplied(false);
    }
  }, [priceFilter]);

  const valueToPercent = (value) =>
    ((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  const percentFromClientX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const value =
      Math.round((SLIDER_MIN + pct * (SLIDER_MAX - SLIDER_MIN)) / STEP) * STEP;
    return Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, value));
  };

  const applySliderFilter = (min, max) => {
    setCustomApplied(false);
    setPriceFilter({
      min,
      // Right handle at the far end means "no upper limit" (the label shows "+")
      max: max >= SLIDER_MAX ? Infinity : max,
      label: `Nrs ${min.toLocaleString()} – Nrs ${max.toLocaleString()}+`,
    });
  };

  const handlePointerDown = (which) => (e) => {
    e.target.setPointerCapture(e.pointerId);
    setDragging(which);
  };

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragging || !trackRef.current) return;
      const value = percentFromClientX(e.clientX);
      if (dragging === "min") {
        const next = Math.min(value, sliderMax - STEP);
        setSliderMin(next);
        applySliderFilter(next, sliderMax);
      } else {
        const next = Math.max(value, sliderMin + STEP);
        setSliderMax(next);
        applySliderFilter(sliderMin, next);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [dragging, sliderMin, sliderMax],
  );

  const handlePointerUp = () => setDragging(null);

  const handleCustomMinChange = (e) => {
    const val = e.target.value;
    if (val === "" || Number(val) >= 0) setCustomMin(val);
  };
  const handleCustomMaxChange = (e) => {
    const val = e.target.value;
    if (val === "" || Number(val) >= 0) setCustomMax(val);
  };

  const handleApplyCustom = () => {
    const hasMin = customMin !== "";
    const hasMax = customMax !== "";
    if (!hasMin && !hasMax) return;

    const min = hasMin ? Math.max(0, Number(customMin)) : 0;
    const max = hasMax ? Math.max(min, Number(customMax)) : Infinity;
    setCustomApplied(true);
    setPriceFilter({
      min,
      max,
      label: `Nrs ${min.toLocaleString()} – Nrs ${max === Infinity ? "∞" : max.toLocaleString()}`,
    });
  };

  const handleClearCustom = () => {
    setCustomMin("");
    setCustomMax("");
    setCustomApplied(false);
    setPriceFilter(null);
  };

  return (
    <div className="space-y-4">
      {/* Dual-handle slider */}
      <div className="px-2.5">
        <div
          ref={trackRef}
          className="relative mt-6 mb-3 h-2 rounded-full bg-gray-200 select-none"
        >
          <div
            className="absolute h-2 rounded-full bg-gray-900"
            style={{
              left: `${valueToPercent(sliderMin)}%`,
              width: `${valueToPercent(sliderMax) - valueToPercent(sliderMin)}%`,
            }}
          />
          <div
            onPointerDown={handlePointerDown("min")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none rounded-full border-2 border-gray-900 bg-white shadow-md"
            style={{ left: `${valueToPercent(sliderMin)}%` }}
          />
          <div
            onPointerDown={handlePointerDown("max")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none rounded-full border-2 border-gray-900 bg-white shadow-md"
            style={{ left: `${valueToPercent(sliderMax)}%` }}
          />
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700">
        Nrs {sliderMin.toLocaleString()} – Nrs {sliderMax.toLocaleString()}+
      </p>

      {/* Custom Range */}
      <div className="border-t border-gray-100 pt-4">
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
          CUSTOM RANGE
        </p>
        <div className="mb-3 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs text-gray-500">Min</label>
            <input
              type="number"
              min="0"
              value={customMin}
              onChange={handleCustomMinChange}
              placeholder="0"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs text-gray-500">Max</label>
            <input
              type="number"
              min="0"
              value={customMax}
              onChange={handleCustomMaxChange}
              placeholder="Any"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyCustom}
            className="flex-1 cursor-pointer rounded bg-red-800 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Apply
          </button>
          {customApplied && (
            <button
              onClick={handleClearCustom}
              className="flex-1 cursor-pointer rounded border bg-black py-2.5 text-sm font-semibold text-white transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}