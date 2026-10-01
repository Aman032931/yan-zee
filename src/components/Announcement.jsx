import { useState, useRef, useEffect } from "react";
import '../styles/country.css';
const countries = [
  { code: "US", label: "USA", name: "United States" },
  { code: "SA", label: "SA", name: "Saudi Arabia" },
  { code: "AE", label: "UAE", name: "United Arab Emirates" },
  { code: "KW", label: "Kuwait", name: "Kuwait" },
  { code: "QA", label: "Qatar", name: "Qatar" },
  { code: "BH", label: "Bahrain", name: "Bahrain" },
  { code: "OM", label: "Oman", name: "Oman" },
];

function FlagIcon({ code, className = "" }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/48x36/${code.toLowerCase()}.png 2x`}
      alt=""
      width={20}
      height={15}
      className={`inline-block rounded-[2px] object-cover ${className}`}
    />
  );
}

function CountryDropdown({
  dropdownRef,
  isCountryOpen,
  setIsCountryOpen,
  selectedCountry,
  onSelectCountry,
}) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsCountryOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-[9px] border-0 bg-transparent px-[5px] py-[7px] font-[inherit] text-[14px] text-white transition-opacity duration-200 hover:opacity-80"
        aria-expanded={isCountryOpen}
        aria-haspopup="listbox"
      >
        <FlagIcon code={selectedCountry.code} className="shrink-0" />
        <span className="whitespace-nowrap">{selectedCountry.label}</span>
        <span
          className={`ml-[7px] h-[8px] w-[8px] rotate-45 border-b-[1.5px] border-r-[1.5px] border-white transition-transform duration-200 ${
            isCountryOpen ? "translate-y-0.5 rotate-225" : "-translate-y-0.5"
          }`}
        />
      </button>

      {isCountryOpen && (
        <div
          className="absolute left-1/2 top-[42px] z-[1100] w-[min(290px,90vw)] -translate-x-1/2 overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white text-black shadow-[0_12px_35px_rgba(0,0,0,0.22)] sm:left-auto sm:right-[-10px] sm:translate-x-0"
          role="listbox"
        >
          <div className="max-h-[350px] overflow-y-auto country-scrollbar">
            {countries.map((country, index) => {
              const isSelected = country.code === selectedCountry.code;
              const isLast = index === countries.length - 1;
              return (
                <button
                  type="button"
                  key={country.code}
                  onClick={() => onSelectCountry(country)}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex h-[62px] w-full cursor-pointer items-center gap-[16px] border-0 px-[20px] text-left font-[inherit] transition-colors duration-150 ${
                    !isLast ? "border-b border-[#eeeeee]" : ""
                  } ${isSelected ? "bg-[#fafafa]" : "bg-white hover:bg-[#f6f6f6]"}`}
                >
                  <span className="flex w-[24px] shrink-0 items-center justify-center">
                    <FlagIcon code={country.code} />
                  </span>
                  <span
                    className={`flex-1 text-[15px] ${
                      isSelected ? "font-medium text-[#111]" : "font-normal text-[#222]"
                    }`}
                  >
                    {country.name}
                  </span>
                  {isSelected && (
                    <span className="flex h-[22px] w-[22px] items-center justify-center text-[18px] font-semibold text-black">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Announcement() {
  const [current, setCurrent] = useState(0);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const mobileCountryRef = useRef(null);
  const desktopCountryRef = useRef(null);

  const announcements = [
    "Made in NEPAL, Made by NEPALI Products",
    "Free Shipping on Orders Above Rs. 3000",
    "Discover the Latest Nepali Fashion",
  ];

  const previousAnnouncement = () => {
    setCurrent((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
  };

  const nextAnnouncement = () => {
    setCurrent((prev) => (prev === announcements.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedMobile =
        mobileCountryRef.current && mobileCountryRef.current.contains(event.target);
      const clickedDesktop =
        desktopCountryRef.current && desktopCountryRef.current.contains(event.target);

      if (!clickedMobile && !clickedDesktop) {
        setIsCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
  };

  return (
    <div className="border-b-[3px] border-yz-bg bg-black font-serif text-white">

      {/* MOBILE — stacked layout (< sm) */}
      <div className="flex flex-col items-center gap-2 px-4 py-3 sm:hidden">

        <a href="/" className="no-underline text-white">
          <span className="text-[18px] font-bold italic">YanZee</span>
        </a>

        <div className="flex items-center gap-3">
          <CountryDropdown
            dropdownRef={mobileCountryRef}
            isCountryOpen={isCountryOpen}
            setIsCountryOpen={setIsCountryOpen}
            selectedCountry={selectedCountry}
            onSelectCountry={handleSelectCountry}
          />
          <span className="h-[14px] w-px bg-[#555]" />
          <div className="flex items-center gap-[6px] text-[13px]">
            <span className="text-[15px]">◎</span>
            <span>English</span>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-3 border-t border-[#2a2a2a] pt-2 text-[12px]">
          <button
            type="button"
            onClick={previousAnnouncement}
            className="cursor-pointer border-0 bg-transparent p-0 text-[16px] text-white transition-opacity duration-200 hover:opacity-60"
          >
            ‹
          </button>
          <span className="min-w-0 flex-1 truncate text-center font-medium">
            {announcements[current]}
          </span>
          <button
            type="button"
            onClick={nextAnnouncement}
            className="cursor-pointer border-0 bg-transparent p-0 text-[16px] text-white transition-opacity duration-200 hover:opacity-60"
          >
            ›
          </button>
        </div>
      </div>

      {/* DESKTOP — single row (sm and up) */}
      <div className="hidden h-[55px] items-center justify-between px-[68px] text-[14px] sm:flex">

        <div className="flex w-[250px] items-center justify-between">
          <a href="/" className="no-underline text-white">
            <span className="text-[16px] font-bold italic">YanZee</span>
          </a>
          <button
            type="button"
            onClick={previousAnnouncement}
            className="cursor-pointer border-0 bg-transparent p-0 text-[18px] text-white transition-opacity duration-200 hover:opacity-60"
          >
            ‹
          </button>
        </div>

        <div className="min-w-0 flex-1 truncate text-center font-medium">
          {announcements[current]}
        </div>

        <div className="flex w-[300px] items-center justify-end gap-[18px]">
          <button
            type="button"
            onClick={nextAnnouncement}
            className="cursor-pointer border-0 bg-transparent p-0 text-[18px] text-white transition-opacity duration-200 hover:opacity-60"
          >
            ›
          </button>

          <CountryDropdown
            dropdownRef={desktopCountryRef}
            isCountryOpen={isCountryOpen}
            setIsCountryOpen={setIsCountryOpen}
            selectedCountry={selectedCountry}
            onSelectCountry={handleSelectCountry}
          />

          <div className="flex cursor-pointer items-center gap-[7px] border-l border-[#555] pl-[15px]">
            <span className="text-[16px]">◎</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Announcement;