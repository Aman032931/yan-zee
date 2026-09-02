import { useState } from "react";

const countries = [
  { name: "United States", flag: "🇺🇸" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "Kuwait", flag: "🇰🇼" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Bahrain", flag: "🇧🇭" },
  { name: "Oman", flag: "🇴🇲" },
];

function Announcement() {
  const [current, setCurrent] = useState(0);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

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

  return (
    <div className="flex h-[55px] items-center justify-between border-b-[3px] border-red-600 bg-black px-[68px] font-serif text-[14px] text-white">
      {/* LEFT */}
      <div className="flex w-[250px] items-center justify-between">
        <span className="text-[16px] font-bold italic">YANZEE</span>

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
        <div className="relative">
          <button
            className="flex cursor-pointer items-center gap-2 border-0 bg-transparent font-[inherit] text-[14px] text-white"
            onClick={() => setIsCountryOpen(!isCountryOpen)}
          >
            <span className="text-[20px]">
              {countries[0].flag}
            </span>

            <span>USA</span>

            <span className="ml-[2px] text-[15px]">
              {isCountryOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {/* DROPDOWN MENU */}
          {isCountryOpen && (
            <div className="absolute right-[-10px] top-[34px] z-[1000] max-h-[360px] w-[280px] overflow-y-auto rounded-[14px] bg-white py-[10px] text-black shadow-[0_4px_15px_rgba(0,0,0,0.25)]">
              {countries.map((country, index) => (
                <div
                  className="flex h-[50px] cursor-pointer items-center gap-[12px] px-4 hover:bg-[#f5f5f5]"
                  key={country.name}
                >
                  <span className="text-[20px]">
                    {country.flag}
                  </span>

                  <span>{country.name}</span>

                  {index === 0 && (
                    <span className="ml-auto text-[18px]">✓</span>
                  )}
                </div>
              ))}
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