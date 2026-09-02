import { useState, useRef } from "react";
import ProductCard from "./ProductCard";
import FilterPanel from "./FilterPanel";

// Product data arrays
const products = [
  {
    id: 1,
    brand: "MAX FACTOR",
    title: "Pro Foundation Brush F2 by Mashael Ajeel",
    price: "Nrs 2999",
    image: "https://f.nooncdn.com/p/pzsku/ZA592E524468EDBB8FF97Z/45/1746747611/79c98aa7-f265-475d-b20f-663a66aaf35e.jpg?format=webp&width=800",
    href: "/product/beauty-1781860114415-MAX%20FACTOR-Pro%20Foundation%20Brush%20F2%20by%20Mashael%20Ajeel",
  },
  {
    id: 2,
    brand: "Charlotte Tilbury",
    title: "Magic Vanish - Fair",
    price: "Nrs 8899",
    image: "https://f.nooncdn.com/p/pzsku/ZCACEF8DBCCE75EC32AD5Z/45/_/1719220178/6dc47ec3-b56b-499f-be3d-3258e70273d9.jpg?format=webp&width=800",
    href: "/product/beauty-1781858872271-Charlotte%20Tilbury-Magic%20Vanish%20-%20Fair",
    badge: "Top Selling",
  },
];

const featuredProducts = [
  {
    id: 3,
    brand: "MAX FACTOR",
    title: "Pro Blender Eyeshadow Brush E17 by Mashael Ajeel",
    price: "Nrs 4599",
    image: "https://f.nooncdn.com/p/pzsku/ZCFA83DC383E32E5A1CDEZ/45/1746214120/3aedb02c-e544-4e8e-b788-36bd8ef1a103.jpg?format=webp&width=800",
    href: "/product/beauty-1781860448993-MAX%20FACTOR-Pro%20Blender%20Eyeshadow%20Brush%20E17%20by%20Mashael%20Ajeel",
    badge: "Sale",
    wishlisted: true,
  },
  {
    id: 4,
    brand: "SKIN1004",
    title: "Madagascar Centella Ampoule 55ml",
    price: "Nrs 3999",
    image: "https://f.nooncdn.com/p/pzsku/Z4288B6B53229EE6A4C1CZ/45/_/1771667057/411d896a-c181-4a7d-bf8c-06b0d329a010.jpg?format=webp&width=800",
    href: "/product/beauty-1781864615468-SKIN1004-Madagascar%20Centella%20Ampoule%2055ml",
  },
  {
    id: 5,
    brand: "SKIN1004",
    title: "Madagascar Centella Hyalu-Cica Brightening Toner 30ml",
    price: "Nrs 1499",
    image: "https://f.bflcdn.com/f_auto,q_auto/products/26/6/8809576261073_FRONT_2.JPG",
    href: "/product/beauty-1781865097805-SKIN1004-Madagascar%20Centella%20Hyalu-Cica%20Brightening%20Toner%2030ml",
  },
  {
    id: 6,
    brand: "VANS",
    title: "Women Lace Up Training Shoes, Black",
    price: "Nrs 10199",
    comparePrice: "Nrs 21285",
    discount: "52%",
    image: "https://f.bflcdn.com/f_auto,q_auto/products/24/7/195440332382_SIDE_JPG_1.JPG",
    href: "/product/fashion-1781871538168-VANS-Women%20Lace%20Up%20Training%20Shoes%2C%20Black",
  },
  {
    id: 7,
    brand: "SKIN1004",
    title: "Madagascar Centella Ampoule 30ml",
    price: "Nrs 2299",
    image: "https://f.nooncdn.com/p/pzsku/ZC884AC96FDF237FBCA53Z/45/_/1772715876/67dcc5eb-c630-47a7-9964-e5f0820ea212.jpg?format=webp&width=800",
    href: "/product/beauty-1781864495341-SKIN1004-Madagascar%20Centella%20Ampoule%2030ml",
  },
  {
    id: 8,
    brand: "NYX PROFESSIONAL MAKEUP",
    title: "Lift & Snatch Brow Tint Pen Espresso",
    price: "Nrs 2949",
    image: "https://f.nooncdn.com/p/pzsku/Z4E8C48A07EEC05F0C792Z/45/1762587428/e68d2700-3904-48e9-8f46-d517265d4a13.jpg?format=webp&width=800",
    href: "/product/beauty-1781858565004-NYX%20PROFESSIONAL%20MAKEUP-Lift%20%26%20Snatch%20Brow%20Tint%20Pen%20Espresso",
  },
];

const newInFashion = [
  {
    id: 9,
    brand: "LACOSTE",
    title: "Women Brand Logo Lace Up Casual Shoes, White",
    price: "Nrs 11999",
    image: "https://f.bflcdn.com/f_auto,q_auto/products/26/2/5059554082821_01_1.JPG",
    href: "/product/fashion-1781871232707-LACOSTE-Women%20Brand%20Logo%20Lace%20Up%20Casual%20Shoes%2C%20White",
  },
  {
    id: 10,
    brand: "XOXO",
    title: "Women Brand Logo Lace Up Casual Shoes, Multicolor",
    price: "Nrs 5599",
    image: "https://f.bflcdn.com/f_auto,q_auto/products/25/4/92IOK00232_SIDE_1.JPG",
    href: "/product/fashion-1781871024381-XOXO-Women%20Brand%20Logo%20Lace%20Up%20Casual%20Shoes%2C%20Multicolor",
  },
  {
    id: 11,
    brand: "JASON WU",
    title: "Women 2 Pieces Stripe Shirt And Palazzo Pants Set, Light Sage",
    price: "Nrs 9199",
    image: "https://f.bflcdn.com/t_140/f_auto,q_auto/products/26/6/159000430_1.JPG",
    href: "/product/fashion-1782043007673-JASON%20WU-Women%202%20Pieces%20Stripe%20Shirt%20And%20Palazzo%20Pants%20Set%2C%20Light%20Sage",
  },
  {
    id: 12,
    brand: "XTI",
    title: "Women Brand Logo Lace Up Casual Shoes, White",
    price: "Nrs 5999",
    comparePrice: "Nrs 16000",
    discount: "63%",
    image: "https://f.bflcdn.com/f_auto,q_auto/products/26/1/8445901896314_01_1.JPG",
    href: "/product/fashion-1781872283861-XTI-Women%20Brand%20Logo%20Lace%20Up%20Casual%20Shoes%2C%20White",
  },
  {
    id: 13,
    brand: "XOXO",
    title: "Women Brand Logo Lace Up Casual Shoes, Beige",
    price: "Nrs 7699",
    comparePrice: "Nrs 15899",
    discount: "52%",
    image: "https://f.bflcdn.com/f_auto,q_auto/products/25/4/92IOK00229_SIDE_1.JPG",
    href: "/product/fashion-1781870859032-XOXO-Women%20Brand%20Logo%20Lace%20Up%20Casual%20Shoes%2C%20Beige",
  },
];

const newInBeauty = [
  {
    id: 14,
    brand: "Glossy Make Up",
    title: "Chelsea Lash Collection",
    price: "Nrs 2699",
    image: "https://f.nooncdn.com/p/pzsku/ZE34AB2902165CBFE5729Z/45/_/1724434123/f726e53c-2ea3-4ba8-9694-55fa67351977.jpg?format=webp&width=800",
    href: "/product/beauty-1781860958052-Glossy%20Make%20Up-Chelsea%20Lash%20Collection",
  },
  {
    id: 15,
    brand: "Revolution",
    title: "2000s Calling 9 Shades Eye Shadow Palette 0,4 g",
    price: "Nrs 1779",
    image: "https://f.bflcdn.com/f_auto,q_auto/products/26/4/5057566816717_45_2.JPG",
    href: "/product/beauty-1781865567567-Revolution-2000s%20Calling%209%20Shades%20Eye%20Shadow%20Palette%200%2C4%20g",
    badge: "New In",
  },
  {
    id: 16,
    brand: "NYX PROFESSIONAL MAKEUP",
    title: "Fat Oil Lip Drip Lip Gloss - 4.8ml - 0.16 fl oz",
    price: "Nrs 2299",
    image: "https://f.nooncdn.com/p/pzsku/Z066625B14D6C093261ECZ/45/1746621041/3d6ec3ec-85cf-4e1f-9a74-87ed71c1de30.jpg?format=webp&width=800",
    href: "/product/beauty-1781776790715-NYX%20PROFESSIONAL%20MAKEUP-Fat%20Oil%20Lip%20Drip%20Lip%20Gloss%20-%204.8ml%20-%200.16%20fl%20oz",
  },
  {
    id: 17,
    brand: "KIKI MILANO",
    title: "Unlimited Double Touch Liquid Lipstick",
    price: "Nrs 3719",
    image: "https://f.nooncdn.com/p/pzsku/ZA57B974D18B9A9ED4EDEZ/45/_/1719229917/b05be484-3b25-4344-b619-1aac7f077999.jpg?format=webp&width=800",
    href: "/product/beauty-1781859240987-KIKI%20MILANO-Unlimited%20Double%20Touch%20Liquid%20Lipstick",
    badge: "New In",
  },
  {
    id: 18,
    brand: "ESTEE LAUDER",
    title: "Double Wear Foundation Pump",
    price: "Nrs 2799",
    image: "https://f.nooncdn.com/p/pzsku/Z2BD98B78EAABDEFBD345Z/45/_/1779414089/3ae92b41-e498-4be3-a715-6ae9a5b29b52.jpg?format=webp&width=800",
    href: "/product/beauty-1781859659693-ESTEE%20LAUDER-Double%20Wear%20Foundation%20Pump",
    badge: "New In",
  },
];

const newInKids = [
  {
    id: 19,
    brand: "YanZee",
    title: "YANZEE CARGO PANTS WITH T-SHIRT",
    price: "Nrs 8599",
    image: "https://res.cloudinary.com/dgzackqok/image/upload/v1781509144/yanzee-store/local/admin/cgcujw5jfo8tkesehnrv.webp",
    href: "/product/kids-1781509303304-YanZee-YANZEE%20CARGO%20PANTS%20WITH%20T-SHIRT",
    badge: "New In",
  },
];

const productGridClass =
  "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 max-[1024px]:grid-cols-3 max-[1024px]:gap-[20px] max-[768px]:grid-cols-2 max-[768px]:gap-4 max-[480px]:grid-cols-2 max-[480px]:gap-[10px]";

const sectionHeadClass = "mb-[20px]";
const sectionTitleClass = "text-[20px] font-bold text-[#1a1a1a] max-[768px]:text-[17px]";
const moreBtnClass =
  "inline-block rounded-[4px] border border-[#ddd] px-10 py-[10px] text-[14px] font-medium text-[#333] no-underline transition-all duration-200 hover:border-[#ccc] hover:bg-[#f5f5f5] max-[480px]:px-6 max-[480px]:py-2 max-[480px]:text-[12px]";

const AllShop = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(1);
  const [sortBy, setSortBy] = useState("featured");
  const carouselRef = useRef(null);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleClearFilters = () => {
    setFilterCount(0);
  };

  const handleRemoveTag = () => {
    setFilterCount(0);
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="bg-white px-[8%] pb-[40px] pt-[30px] max-[768px]:px-[4%] max-[768px]:pb-[30px] max-[768px]:pt-4" aria-label="Yanzee">
      <div className="mb-[30px] py-[20px] text-center max-[768px]:mb-[20px] max-[768px]:py-[10px]">
        <div className="yz-all-shop__head-copy">
          <h1 className="m-0 mb-2 text-[28px] font-bold text-[#1a1a1a] max-[768px]:text-[22px]">Yanzee</h1>
          <p className="m-0 text-[16px] text-[#666] max-[768px]:text-[14px]">
            Discover fashion, sports, beauty, home &amp; more — filter by brand or department.
          </p>
        </div>
      </div>

      <div className="relative flex gap-[30px]">
        {/* Backdrop for mobile */}
        <button
          type="button"
          className={`max-[1024px]:hidden ${isFilterOpen ? "max-[1024px]:fixed max-[1024px]:inset-0 max-[1024px]:z-[999] max-[1024px]:block max-[1024px]:cursor-pointer max-[1024px]:bg-[rgba(0,0,0,0.5)]" : ""}`}
          aria-hidden="true"
          aria-label="Close filters"
          onClick={toggleFilter}
        />

        {/* FilterPanel - renders its own sidebar */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={toggleFilter}
          onClear={handleClearFilters}
        />

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex items-center justify-between border-b border-[#eee] pb-4 max-[768px]:flex-wrap max-[768px]:gap-[12px]">
            <button
              type="button"
              className="hidden cursor-pointer items-center gap-[6px] rounded-[4px] border border-[#ddd] px-4 py-2 text-[14px] transition-colors duration-200 hover:bg-[#f5f5f5] max-[1024px]:flex"
              aria-expanded={isFilterOpen}
              onClick={toggleFilter}
            >
              Filters
              {filterCount > 0 && (
                <span className="ml-1 rounded-[12px] bg-[#0066cc] px-2 py-[1px] text-[12px] text-white">{filterCount}</span>
              )}
            </button>
            <label className="flex items-center gap-2 text-[14px] text-[#333] max-[768px]:text-[13px]">
              <span>Sort by</span>
              <select
                aria-label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="min-w-[160px] cursor-pointer rounded-[4px] border border-[#ddd] bg-white px-3 py-2 text-[14px] text-[#333] focus:border-[#0066cc] focus:outline-none max-[768px]:min-w-[130px] max-[768px]:px-[10px] max-[768px]:py-[6px] max-[768px]:text-[13px]"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-[40px] max-[768px]:gap-[30px] max-[480px]:gap-6">
            {/* Trending Section */}
            <section className="yz-shop-highlight-section">
              <div className={sectionHeadClass}>
                <h2 className={sectionTitleClass}>Trending</h2>
              </div>
              <div className={`${productGridClass} yz-shop-highlight-section__grid`}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* For You Section - Horizontal Carousel */}
            <section className="relative">
              <div className={sectionHeadClass}>
                <h2 className={sectionTitleClass}>For You</h2>
                <a
                  href="/all?tag=for-you"
                  className="text-[14px] font-medium text-[#0066cc] no-underline hover:underline max-[768px]:text-[12px]"
                >
                  SEE ALL
                </a>
              </div>
              <div className="relative overflow-hidden px-[40px] max-[768px]:px-[20px] max-[480px]:px-[10px]">
                <button
                  type="button"
                  className="absolute left-0 top-1/2 z-[2] flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[20px] text-[#333] shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-[#f5f5f5] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] max-[768px]:h-7 max-[768px]:w-7 max-[768px]:text-[16px] max-[480px]:hidden"
                  onClick={() => scrollCarousel('left')}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <div
                  className="flex gap-4 overflow-x-auto py-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  ref={carouselRef}
                >
                  {featuredProducts.map((product) => (
                    <div
                      className="min-w-[220px] max-w-[220px] flex-[0_0_220px] max-[1024px]:min-w-[200px] max-[1024px]:max-w-[200px] max-[1024px]:flex-[0_0_200px] max-[768px]:min-w-[160px] max-[768px]:max-w-[160px] max-[768px]:flex-[0_0_160px] max-[480px]:min-w-[140px] max-[480px]:max-w-[140px] max-[480px]:flex-[0_0_140px]"
                      key={product.id}
                    >
                      <ProductCard product={product} isCarousel={true} />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="absolute right-0 top-1/2 z-[2] flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[20px] text-[#333] shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-200 hover:bg-[#f5f5f5] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] max-[768px]:h-7 max-[768px]:w-7 max-[768px]:text-[16px] max-[480px]:hidden"
                  onClick={() => scrollCarousel('right')}
                  aria-label="Next"
                >
                  ›
                </button>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <span className="h-2 w-6 cursor-pointer rounded-[4px] bg-[#1a1a1a]"></span>
                <span className="h-2 w-2 cursor-pointer rounded-full bg-[#ddd]"></span>
                <span className="h-2 w-2 cursor-pointer rounded-full bg-[#ddd]"></span>
                <span className="h-2 w-2 cursor-pointer rounded-full bg-[#ddd]"></span>
                <span className="h-2 w-2 cursor-pointer rounded-full bg-[#ddd]"></span>
                <span className="h-2 w-2 cursor-pointer rounded-full bg-[#ddd]"></span>
              </div>
            </section>

            {/* New in Fashion */}
            <section className="yz-shop-highlight-section">
              <div className={sectionHeadClass}>
                <h2 className={sectionTitleClass}>New in Fashion</h2>
                <a
                  href="/fashion"
                  className="text-[14px] font-medium text-[#0066cc] no-underline hover:underline max-[768px]:text-[12px]"
                >
                  See more
                </a>
              </div>
              <div className={`${productGridClass} yz-shop-highlight-section__grid`}>
                {newInFashion.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <a className={moreBtnClass} href="/fashion">
                  See more
                </a>
              </div>
            </section>

            {/* New in Beauty */}
            <section className="yz-shop-highlight-section">
              <div className={sectionHeadClass}>
                <h2 className={sectionTitleClass}>New in Beauty</h2>
                <a
                  href="/beauty"
                  className="text-[14px] font-medium text-[#0066cc] no-underline hover:underline max-[768px]:text-[12px]"
                >
                  See more
                </a>
              </div>
              <div className={`${productGridClass} yz-shop-highlight-section__grid`}>
                {newInBeauty.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <a className={moreBtnClass} href="/beauty">
                  See more
                </a>
              </div>
            </section>

            {/* New in Kids */}
            <section className="yz-shop-highlight-section">
              <div className={sectionHeadClass}>
                <h2 className={sectionTitleClass}>New in Kids</h2>
                <a
                  href="/kids"
                  className="text-[14px] font-medium text-[#0066cc] no-underline hover:underline max-[768px]:text-[12px]"
                >
                  See more
                </a>
              </div>
              <div className={`${productGridClass} yz-shop-highlight-section__grid`}>
                {newInKids.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <a className={moreBtnClass} href="/kids">
                  See more
                </a>
              </div>
            </section>
          </div>

          {/* Active Tags */}
          <div className="my-4 flex flex-wrap gap-2" aria-label="Active filters">
            {filterCount > 0 && (
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-[6px] rounded-[20px] border border-[#ddd] bg-[#f0f0f0] px-3 py-1 text-[13px] text-[#333] transition-colors duration-200 hover:bg-[#e5e5e5]"
                onClick={handleRemoveTag}
              >
                Sports ×
              </button>
            )}
          </div>

          {/* Empty State */}
          {filterCount > 0 && (
            <div className="px-5 py-[40px] text-center">
              <p className="m-0 mb-4 text-[18px] text-[#666]">No items match your filters.</p>
              <button
                type="button"
                className="cursor-pointer rounded-[4px] border-none bg-[#0066cc] px-8 py-[10px] text-[14px] text-white transition-colors duration-200 hover:bg-[#0055aa]"
                onClick={handleClearFilters}
              >
                View all {products.length + featuredProducts.length + newInFashion.length + newInBeauty.length + newInKids.length} items
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AllShop;