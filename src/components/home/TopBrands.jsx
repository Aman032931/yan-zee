const brandColors = {
  "blank-nyc": "#1a1a1a",
  etro: "#8b1a1a",
  "jason-wu": "#2c3e50",
  "pull-bear": "#1a1a2e",
  revolution: "#e74c3c",
  vans: "#e74c3c",
  xoxo: "#8e44ad",
  xti: "#2c3e50",
};

const brands = [
  {
    name: "YanZee",
    image:
      "https://res.cloudinary.com/dgzackqok/image/upload/v1781456164/yanzee-store/local/admin/viirn4yr0r2egei7t1cn.jpg",
    category: "all",
  },
  { name: "Blank NYC", isWordmark: true, wordmarkClass: "blank-nyc", category: "men's clothing" },
  { name: "ETRO", isWordmark: true, wordmarkClass: "etro", category: "women's clothing" },
  { name: "JASON WU", isWordmark: true, wordmarkClass: "jason-wu", category: "women's clothing" },
  { name: "Pull & Bear", isWordmark: true, wordmarkClass: "pull-bear", category: "men's clothing" },
  { name: "Revolution", isWordmark: true, wordmarkClass: "revolution", category: "women's clothing" },
  { name: "VANS", isWordmark: true, wordmarkClass: "vans", category: "men's clothing" },
  { name: "XOXO", isWordmark: true, wordmarkClass: "xoxo", category: "women's clothing" },
  { name: "XTI", isWordmark: true, wordmarkClass: "xti", category: "men's clothing" },
];

const TopBrands = () => {
  const allBrands = [...brands, ...brands, ...brands];

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-white py-[20px]"
      aria-label="Featured brands"
    >
      <section className="bg-white px-[8%] py-[20px] max-[768px]:px-[4%] max-[768px]:py-4">
        <div className="mb-[20px]">
          <h2 className="text-center text-[22px] font-bold text-[#1a1a1a]">
            Top Brands
          </h2>
        </div>
        <div
          className="relative w-full overflow-hidden py-[10px]"
          style={{ "--yz-marquee-duration": "126s" }}
        >
          <div className="flex w-max animate-brand-marquee gap-[40px]">
            {allBrands.map((brand, index) => (
              <a
                key={brand.name + "-" + index}
                className="flex min-w-[80px] shrink-0 flex-col items-center px-4 py-2 text-[#333] no-underline transition-transform duration-200 hover:scale-[1.08]"
                aria-label={brand.name}
                href={"/all?category=" + encodeURIComponent(brand.category)}
              >
                <div className="flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full border border-[#eee] bg-[#f5f5f5] max-[768px]:h-[55px] max-[768px]:w-[55px] max-[480px]:h-[45px] max-[480px]:w-[45px]">
                  {brand.image ? (
                    <img
                      alt={brand.name + " logo"}
                      className="max-h-[50px] max-w-[50px] object-contain max-[768px]:max-h-[35px] max-[768px]:max-w-[35px] max-[480px]:max-h-[28px] max-[480px]:max-w-[28px]"
                      loading="lazy"
                      decoding="async"
                      src={brand.image}
                    />
                  ) : (
                    <span
                      className="p-1 text-center text-[12px] font-bold leading-[1.2] max-[768px]:text-[10px] max-[480px]:text-[8px]"
                      style={{ color: brandColors[brand.wordmarkClass] }}
                    >
                      {brand.name}
                    </span>
                  )}
                </div>
                {brand.isWordmark && (
                  <span className="mt-[6px] text-center text-[11px] font-medium text-[#666] max-[768px]:text-[9px] max-[480px]:mt-1 max-[480px]:text-[8px]">
                    {brand.name}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default TopBrands;