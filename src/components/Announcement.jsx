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

function Announcement() {
  const [current, setCurrent] = useState(0);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const countryRef = useRef(null);

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

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countryRef.current &&
        !countryRef.current.contains(event.target)
      ) {
        setIsCountryOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
  };

  return (
    <div className="flex h-[55px] items-center justify-between border-b-[3px] border-yz-bg bg-black px-[68px] font-serif text-[14px] text-white">

      {/* =====================================================
          LEFT
      ===================================================== */}

      <div className="flex w-[250px] items-center justify-between">

        <a
          href="/"
          className="no-underline text-white"
        >
          <span className="text-[16px] font-bold italic">
            YanZee
          </span>
        </a>

        <button
          type="button"
          onClick={previousAnnouncement}
          className="cursor-pointer border-0 bg-transparent p-0 text-[18px] text-white transition-opacity duration-200 hover:opacity-60"
        >
          ‹
        </button>

      </div>


      {/* =====================================================
          CENTER
      ===================================================== */}

      <div className="flex-1 text-center font-medium">
        {announcements[current]}
      </div>


      {/* =====================================================
          RIGHT
      ===================================================== */}

      <div className="flex w-[300px] items-center justify-end gap-[18px]">

        {/* NEXT ANNOUNCEMENT */}

        <button
          type="button"
          onClick={nextAnnouncement}
          className="cursor-pointer border-0 bg-transparent p-0 text-[18px] text-white transition-opacity duration-200 hover:opacity-60"
        >
          ›
        </button>


        {/* =====================================================
            COUNTRY DROPDOWN
        ===================================================== */}

        <div
          className="relative"
          ref={countryRef}
        >

          {/* SELECTED COUNTRY */}

          <button
            type="button"
            onClick={() =>
              setIsCountryOpen((prev) => !prev)
            }
            className="flex cursor-pointer items-center gap-[9px] border-0 bg-transparent px-[5px] py-[7px] font-[inherit] text-[14px] text-white transition-opacity duration-200 hover:opacity-80"
            aria-expanded={isCountryOpen}
            aria-haspopup="listbox"
          >

            <FlagIcon
              code={selectedCountry.code}
              className="shrink-0"
            />

            <span className="whitespace-nowrap">
              {selectedCountry.label}
            </span>

            <span
            className={`ml-[7px] h-[8px] w-[8px] rotate-45 border-b-[1.5px] border-r-[1.5px] border-white transition-transform duration-200 ${
              isCountryOpen
                ? "translate-y-0.5 rotate-225"
                : "-translate-y-0.5"
            }`}
          />

          </button>


          {/* =====================================================
              DROPDOWN MENU
          ===================================================== */}

          {isCountryOpen && (
            <div
              className="absolute right-[-10px] top-[42px] z-[1100] w-[290px] overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white text-black shadow-[0_12px_35px_rgba(0,0,0,0.22)]"
              role="listbox"
            >

              {/* COUNTRY LIST */}

              <div className="max-h-[350px] overflow-y-auto country-scrollbar">

                {countries.map((country, index) => {
                  const isSelected =
                    country.code === selectedCountry.code;

                  const isLast =
                    index === countries.length - 1;

                  return (
                    <button
                      type="button"
                      key={country.code}
                      onClick={() =>
                        handleSelectCountry(country)
                      }
                      role="option"
                      aria-selected={isSelected}
                      className={`
                        flex
                        h-[62px]
                        w-full
                        cursor-pointer
                        items-center
                        gap-[16px]
                        border-0
                        px-[20px]
                        text-left
                        font-[inherit]
                        transition-colors
                        duration-150

                        ${
                          !isLast
                            ? "border-b border-[#eeeeee]"
                            : ""
                        }

                        ${
                          isSelected
                            ? "bg-[#fafafa]"
                            : "bg-white hover:bg-[#f6f6f6]"
                        }
                      `}
                    >

                      {/* FLAG */}

                      <span className="flex w-[24px] shrink-0 items-center justify-center">
                        <FlagIcon
                          code={country.code}
                        />
                      </span>


                      {/* COUNTRY NAME */}

                      <span
                        className={`
                          flex-1
                          text-[15px]
                          ${
                            isSelected
                              ? "font-medium text-[#111]"
                              : "font-normal text-[#222]"
                          }
                        `}
                      >
                        {country.name}
                      </span>


                      {/* CHECKMARK */}

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


        {/* =====================================================
            LANGUAGE
        ===================================================== */}

        <div className="flex cursor-pointer items-center gap-[7px] border-l border-[#555] pl-[15px]">

          <span className="text-[16px]">
            ◎
          </span>

          <span>
            English
          </span>

        </div>

      </div>

    </div>
  );
}

export default Announcement;