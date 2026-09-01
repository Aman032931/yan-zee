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
    <div className="yz-gender yz-gender--header" ref={ref}>
      <button
        type="button"
        className="yz-header__cat-btn yz-gender__trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Shop by category"
      >
        <span>{selectedGender}</span>
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
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="yz-gender__dropdown" role="listbox">
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
            <div className="yz-gender__option yz-gender__option--parent">
              <button
                type="button"
                className="yz-gender__option-label"
                onClick={() => onSelectGender("Kids")}
              >
                Kids
              </button>
              <button
                type="button"
                className="yz-gender__option-toggle"
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
                >
                  <path d="M3 4.5L6 7.5L9 4.5" />
                </svg>
              </button>
            </div>
            
            {isKidsOpen && (
              <div className="yz-gender__sub">
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
      className={`yz-gender__option ${isSelected ? "is-selected" : ""} ${isSub ? "yz-gender__option--sub" : ""}`}
      onClick={onClick}
      aria-selected={isSelected}
    >
      {label}
    </button>
  );
};

GenderDropdown.displayName = "GenderDropdown";

export default GenderDropdown;