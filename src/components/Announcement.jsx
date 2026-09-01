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
    <div className="announcement">

      {/* LEFT */}
      <div className="announcement-left">
        <span className="brand">YANZEE</span>

        <button onClick={previousAnnouncement}>
          ‹
        </button>
      </div>

      {/* CENTER */}
      <div className="announcement-message">
        {announcements[current]}
      </div>

      {/* RIGHT */}
      <div className="announcement-right">

        <button onClick={nextAnnouncement}>
          ›
        </button>

        {/* COUNTRY DROPDOWN */}
        <div className="country-dropdown">

          <button
            className="country-button"
            onClick={() => setIsCountryOpen(!isCountryOpen)}
          >
            <span className="flag">
              {countries[0].flag}
            </span>

            <span>USA</span>

            <span className="arrow">
              {isCountryOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {/* DROPDOWN MENU */}
          {isCountryOpen && (
            <div className="country-menu">

              {countries.map((country, index) => (
                <div
                  className="country-item"
                  key={country.name}
                >
                  <span className="flag">
                    {country.flag}
                  </span>

                  <span>{country.name}</span>

                  {index === 0 && (
                    <span className="check">✓</span>
                  )}
                </div>
              ))}

            </div>
          )}

        </div>

        {/* LANGUAGE */}
        <div className="language">
          <span>◎</span>
          <span>English</span>
        </div>

      </div>

    </div>
  );
}

export default Announcement;