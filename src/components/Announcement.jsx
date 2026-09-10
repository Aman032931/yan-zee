import { useState, useRef, useEffect} from "react";

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

function Announcement() {
  const [current, setCurrent] = useState(0);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const countryRef = useRef(null);
  // const location = useLocation();

  const announcements = [
    "Made in NEPAL, Made by NEPALI Products",
    "Free Shipping on Orders Above Rs. 3000",
    "Discover the Latest Nepali Fashion",
  ];

  const previousAnnouncement = () => {
    setCurrent((prev) =>
      prev === 0 ? announcements.length - 1 : prev - 1
    );
  };

  const nextAnnouncement = () => {
    setCurrent((prev) =>
      prev === announcements.length - 1 ? 0 : prev + 1
    );
  };

  // Close the country dropdown when clicking anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
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
    <div className="flex h-[55px] items-center justify-between border-b-[3px] border-red-600 bg-black px-[68px] font-serif text-[14px] text-white">
      {/* LEFT */}
      <div className="flex w-[250px] items-center justify-between">
        <a href="/">
          <span className="text-[16px] font-bold italic">
            YanZee
          </span>
        </a>

        <button
          onClick={previousAnnouncement}
          className="cursor-pointer border-0 bg-transparent text-[18px] text-white"
        >
          ‹
        </button>
      </div>

      {/* CENTER */}
      <div className="flex-1 text-center font-medium">
        {announcements[current]}
      </div>

      {/* RIGHT */}
      <div className="flex w-[300px] items-center justify-end gap-[18px]">
        <button
          onClick={nextAnnouncement}
          className="cursor-pointer border-0 bg-transparent text-[18px] text-white"
        >
          ›
        </button>

        {/* COUNTRY DROPDOWN */}
        <div className="relative" ref={countryRef}>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 border-0 bg-transparent font-[inherit] text-[14px] text-white"
            onClick={() => setIsCountryOpen((prev) => !prev)}
            aria-expanded={isCountryOpen}
            aria-haspopup="listbox"
          >
            <FlagIcon code={selectedCountry.code} />
            <span>{selectedCountry.label}</span>
            <span className="ml-[10px] text-[15px]">
              {isCountryOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {/* DROPDOWN MENU */}
          {isCountryOpen && (
            <div
              className="absolute right-[-10px] top-[34px] z-[1100] max-h-[360px] w-[280px] overflow-y-auto rounded-[14px] border border-black/5 bg-white py-[10px] text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
              role="listbox"
            >
              {countries.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    type="button"
                    key={country.code}
                    onClick={() => handleSelectCountry(country)}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex h-[50px] w-full cursor-pointer items-center gap-[12px] border-0 bg-transparent px-4 text-left font-[inherit] hover:bg-[#f5f5f5] ${
                      isSelected ? "bg-[#f5f5f5]" : ""
                    }`}
                  >
                    <FlagIcon code={country.code} />
                    <span>{country.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-[18px]">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* LANGUAGE */}
        <div className="flex cursor-pointer items-center gap-[7px] border-l border-[#555] pl-[15px]">
          <span>◎</span>
          <span>English</span>
        </div>
      </div>
    </div>
  );
}

export default Announcement;