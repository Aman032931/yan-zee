import React from "react";

const GenderDropdown = React.forwardRef(({ 
  isOpen, 
  isKidsOpen, 
  selectedGender, 
  onToggle, 
  onToggleKids, 
  onSelectGender 
}, ref) => {
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-[6px] rounded-[4px] border-none bg-transparent px-3 py-2 text-[14px] font-medium text-black transition-colors duration-200 hover:bg-[#f5f5f5]"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Shop by category"
      >
        <span className="max-[768px]:hidden">{selectedGender}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="transition-transform duration-200 aria-expanded:rotate-180"
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-[100] min-w-[180px] rounded-[8px] border border-[#e5e5e5] bg-white py-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-[768px]:left-[-70px] max-[768px]:min-w-[160px]"
          role="listbox"
        >
          <GenderOption
            label="Women"
            isSelected={selectedGender === "Women"}
            onClick={() => onSelectGender("Women")}
          />
          <GenderOption
            label="Men"
            isSelected={selectedGender === "Men"}
            onClick={() => onSelectGender("Men")}
          />

          <div className="yz-gender__kids-group">
            <div className="mt-1 flex border-t border-[#e5e5e5] pt-1">
              <button
                type="button"
                className="flex-1 cursor-pointer border-0 bg-transparent px-4 py-[10px] text-left text-[14px] text-[#333] transition-colors duration-150 hover:bg-[#f5f5f5]"
                onClick={() => onSelectGender("Kids")}
              >
                Kids
              </button>
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent px-4 py-[10px] text-[#666] transition-colors duration-150 hover:bg-[#f5f5f5]"
                onClick={onToggleKids}
                aria-expanded={isKidsOpen}
                aria-label="Kids"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                  className="transition-transform duration-200 aria-expanded:rotate-180"
                >
                  <path d="M3 4.5L6 7.5L9 4.5" />
                </svg>
              </button>
            </div>

            {isKidsOpen && (
              <div className="pl-2">
                <GenderOption
                  label="Boy"
                  isSub={true}
                  isSelected={selectedGender === "Boy"}
                  onClick={() => onSelectGender("Boy")}
                />
                <GenderOption
                  label="Girl"
                  isSub={true}
                  isSelected={selectedGender === "Girl"}
                  onClick={() => onSelectGender("Girl")}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// Sub-component for gender options
const GenderOption = ({ label, isSelected, onClick, isSub = false }) => {
  return (
    <button
      type="button"
      role="option"
      className={`flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-4 py-[10px] text-left text-[14px] text-[#333] transition-colors duration-150 hover:bg-[#f5f5f5] ${
        isSelected ? "bg-[#f0f0f0] font-semibold text-black" : ""
      } ${isSub ? "pl-8 text-[13px]" : ""}`}
      onClick={onClick}
      aria-selected={isSelected}
    >
      {label}
    </button>
  );
};

GenderDropdown.displayName = "GenderDropdown";

export default GenderDropdown;