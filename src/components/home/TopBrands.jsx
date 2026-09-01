

const brands = [
  { name: "YanZee", image: "https://res.cloudinary.com/dgzackqok/image/upload/v1781456164/yanzee-store/local/admin/viirn4yr0r2egei7t1cn.jpg" },
  { name: "LACOSTE", image: "/brands/lacoste.svg" },
  { name: "Blank NYC", isWordmark: true, wordmarkClass: "blank-nyc" },
  { name: "ETRO", isWordmark: true, wordmarkClass: "etro" },
  { name: "JASON WU", isWordmark: true, wordmarkClass: "jason-wu" },
  { name: "Pull & Bear", isWordmark: true, wordmarkClass: "pull-bear" },
  { name: "Revolution", isWordmark: true, wordmarkClass: "revolution" },
  { name: "SKIN1004", image: "/brands/skin1004.svg" },
  { name: "VANS", isWordmark: true, wordmarkClass: "vans" },
  { name: "XOXO", isWordmark: true, wordmarkClass: "xoxo" },
  { name: "XTI", isWordmark: true, wordmarkClass: "xti" },
  { name: "Charlotte Tilbury", isWordmark: true, wordmarkClass: "charlotte-tilbury" },
  { name: "ESTEE LAUDER", isWordmark: true, wordmarkClass: "estee-lauder" },
  { name: "KIKI MILANO", isWordmark: true, wordmarkClass: "kiki-milano" },
  { name: "NYX PROFESSIONAL MAKEUP", isWordmark: true, wordmarkClass: "nyx-professional-makeup" },
  { name: "MAX FACTOR", isWordmark: true, wordmarkClass: "max-factor" },
  { name: "Glossy Make Up", isWordmark: true, wordmarkClass: "glossy-make-up" },
  { name: "MaCaffeine", isWordmark: true, wordmarkClass: "macaffeine" },
];

const TopBrands = () => {
  // Duplicate brands for marquee effect
  const allBrands = [...brands, ...brands, ...brands];

  return (
    <section className="yz-hero-brands" aria-label="Featured brands">
      <section className="yz-top-brands">
        <div className="yz-section-head yz-section-head--solo">
          <h2>Top Brands</h2>
        </div>
        <div className="yz-brand-marquee yz-brand-marquee--rtl" style={{ "--yz-marquee-duration": "126s" }}>
          <div className="yz-brand-marquee__track yz-brand-marquee__track--top yz-brand-marquee__track--rtl">
            {allBrands.map((brand, index) => (
              <a
                key={`${brand.name}-${index}`}
                className="yz-top-brand-card"
                aria-label={brand.name}
                href={`/all?brand=${encodeURIComponent(brand.name)}`}
              >
                <div className="yz-top-brand-card__logo-wrap">
                  {brand.image ? (
                    <img
                      alt={`${brand.name} logo`}
                      className="yz-top-brand-card__logo"
                      loading="lazy"
                      decoding="async"
                      src={brand.image}
                    />
                  ) : (
                    <span
                      className={`yz-brand-wordmark yz-brand-wordmark--${brand.wordmarkClass} yz-top-brand-card__logo`}
                      aria-label={`${brand.name} logo`}
                    >
                      {brand.name}
                    </span>
                  )}
                </div>
                {brand.isWordmark && <span className="yz-top-brand-card__name">{brand.name}</span>}
              </a>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default TopBrands;