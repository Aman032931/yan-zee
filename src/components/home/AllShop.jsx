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
    <section className="yz-all-shop yz-all-shop--store-card" aria-label="Yanzee">
      <div className="yz-all-shop__head">
        <div className="yz-all-shop__head-copy">
          <h1 className="yz-all-shop__title">Yanzee</h1>
          <p className="yz-all-shop__subtitle">
            Discover fashion, sports, beauty, home &amp; more — filter by brand or department.
          </p>
        </div>
      </div>

      <div className="yz-all-shop__layout">
        {/* Backdrop for mobile */}
        <button
          type="button"
          className={`yz-all-shop__backdrop ${isFilterOpen ? 'active' : ''}`}
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

        <div className="yz-all-shop__main">
          {/* Toolbar */}
          <div className="yz-all-shop__toolbar">
            <button
              type="button"
              className="yz-all-shop__filter-toggle"
              aria-expanded={isFilterOpen}
              onClick={toggleFilter}
            >
              Filters
              {filterCount > 0 && (
                <span className="yz-all-shop__filter-count">{filterCount}</span>
              )}
            </button>
            <label className="yz-all-shop__sort">
              <span>Sort by</span>
              <select
                aria-label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </label>
          </div>

          <div className="yz-all-shop__highlights">
            {/* Trending Section */}
            <section className="yz-shop-highlight-section">
              <div className="yz-section-head">
                <h2>Trending</h2>
              </div>
              <div className="yz-all-shop__grid yz-product-grid yz-shop-highlight-section__grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>

            {/* For You Section - Horizontal Carousel */}
            <section className="yz-product-carousel">
              <div className="yz-section-head">
                <h2>For You</h2>
                <a href="/all?tag=for-you">SEE ALL</a>
              </div>
              <div className="yz-carousel-wrap yz-carousel-wrap--products">
                <button 
                  type="button" 
                  className="yz-carousel__btn yz-carousel__btn--prev" 
                  onClick={() => scrollCarousel('left')}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <div className="yz-carousel" ref={carouselRef}>
                  {featuredProducts.map((product) => (
                    <div className="yz-carousel__item" key={product.id}>
                      <ProductCard product={product} isCarousel={true} />
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  className="yz-carousel__btn yz-carousel__btn--next" 
                  onClick={() => scrollCarousel('right')}
                  aria-label="Next"
                >
                  ›
                </button>
              </div>
              <div className="yz-dots yz-dots--progress yz-dots--products">
                <span className="is-active"></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </section>

            {/* New in Fashion */}
            <section className="yz-shop-highlight-section">
              <div className="yz-section-head">
                <h2>New in Fashion</h2>
                <a href="/fashion">See more</a>
              </div>
              <div className="yz-all-shop__grid yz-product-grid yz-shop-highlight-section__grid">
                {newInFashion.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="yz-shop-highlight-section__more">
                <a className="yz-shop-highlight-section__more-btn" href="/fashion">
                  See more
                </a>
              </div>
            </section>

            {/* New in Beauty */}
            <section className="yz-shop-highlight-section">
              <div className="yz-section-head">
                <h2>New in Beauty</h2>
                <a href="/beauty">See more</a>
              </div>
              <div className="yz-all-shop__grid yz-product-grid yz-shop-highlight-section__grid">
                {newInBeauty.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="yz-shop-highlight-section__more">
                <a className="yz-shop-highlight-section__more-btn" href="/beauty">
                  See more
                </a>
              </div>
            </section>

            {/* New in Kids */}
            <section className="yz-shop-highlight-section">
              <div className="yz-section-head">
                <h2>New in Kids</h2>
                <a href="/kids">See more</a>
              </div>
              <div className="yz-all-shop__grid yz-product-grid yz-shop-highlight-section__grid">
                {newInKids.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="yz-shop-highlight-section__more">
                <a className="yz-shop-highlight-section__more-btn" href="/kids">
                  See more
                </a>
              </div>
            </section>
          </div>

          {/* Active Tags */}
          <div className="yz-all-shop__active-tags" aria-label="Active filters">
            {filterCount > 0 && (
              <button type="button" className="yz-all-shop__tag" onClick={handleRemoveTag}>
                Sports ×
              </button>
            )}
          </div>

          {/* Empty State */}
          {filterCount > 0 && (
            <div className="yz-all-shop__empty">
              <p className="yz-all-shop__empty-title">No items match your filters.</p>
              <button type="button" className="yz-all-shop__empty-btn" onClick={handleClearFilters}>
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