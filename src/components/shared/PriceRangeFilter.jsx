import { useState, useRef, useCallback, useEffect } from "react"; // ✅ add useEffect

const SLIDER_MIN = 300;
const SLIDER_MAX = 10000;
const STEP = 100;

export default function PriceRangeFilter({ priceFilter, setPriceFilter }) {
  const [sliderMin, setSliderMin] = useState(300);
  const [sliderMax, setSliderMax] = useState(10000);
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");
  const [customApplied, setCustomApplied] = useState(false);
  const [dragging, setDragging] = useState(null);
  const trackRef = useRef(null);

  // ✅ Sync local display state whenever priceFilter is cleared externally
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
      max: Infinity,
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
      <div>
        <div
          ref={trackRef}
          className="relative h-1.5 rounded-full bg-gray-200 mt-5 mb-2 select-none"
        >
          <div
            className="absolute h-1.5 rounded-full bg-black"
            style={{
              left: `${valueToPercent(sliderMin)}%`,
              width: `${valueToPercent(sliderMax) - valueToPercent(sliderMin)}%`,
            }}
          />
          <div
            onPointerDown={handlePointerDown("min")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-white shadow-md cursor-pointer touch-none"
            style={{ left: `${valueToPercent(sliderMin)}%` }}
          />
          <div
            onPointerDown={handlePointerDown("max")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-white shadow-md cursor-pointer touch-none"
            style={{ left: `${valueToPercent(sliderMax)}%` }}
          />
        </div>
        <p className="text-[11px] font-semibold text-gray-700">
          Nrs {sliderMin.toLocaleString()} – Nrs {sliderMax.toLocaleString()}+
        </p>
      </div>

      {/* Custom Range */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-[11px] font-semibold text-gray-500 mb-2 tracking-wide">
          CUSTOM RANGE
        </p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 block mb-1">Min</label>
            <input
              type="number"
              min="0"
              value={customMin}
              onChange={handleCustomMinChange}
              placeholder="0"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-black"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 block mb-1">Max</label>
            <input
              type="number"
              min="0"
              value={customMax}
              onChange={handleCustomMaxChange}
              placeholder="Any"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none focus:border-black"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyCustom}
            className="flex-1 bg-black text-white text-xs font-semibold py-2 rounded hover:bg-gray-800 transition cursor-pointer"
          >
            Apply
          </button>
          {customApplied && (
            <button
              onClick={handleClearCustom}
              className="flex-1 border border-gray-300 text-gray-700 text-xs font-semibold py-2 rounded hover:bg-gray-50 transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
