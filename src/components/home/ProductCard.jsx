import { useState } from "react";

const badgeStyles = {
  "top-selling": "bg-[#ff6b00] text-white",
  sale: "bg-[#ff0000] text-white",
  "new-in": "bg-[#0066cc] text-white",
  discounted: "bg-[#ff0000] text-white",
};

const ProductCard = ({ product, isCarousel = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(product.wishlisted || false);
  const badgeKey = product.badge ? product.badge.toLowerCase().replace(/ /g, "-") : "";

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <a
      className={`flex flex-col text-[#333] no-underline transition-transform duration-200 hover:-translate-y-1 ${
        isCarousel ? "yz-product-card--carousel" : "yz-product-card--grid"
      }`}
      href={product.href}
    >
      <div className="relative aspect-square overflow-hidden rounded-[8px] bg-[#f5f5f5]">
        {product.badge && (
          <div className="absolute left-2 top-2 z-[1] flex flex-col gap-1">
            <span
              className={`rounded-[3px] px-[10px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.3px] max-[480px]:px-2 max-[480px]:py-[1px] max-[480px]:text-[9px] ${
                badgeStyles[badgeKey] || ""
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}
        <div className="yz-img-wrap yz-img-wrap--fill is-loaded">
          <img
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            src={product.image}
            style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent", objectFit: "cover" }}
          />
        </div>
        <span
          role="button"
          tabIndex="0"
          className={`absolute right-2 top-2 z-[1] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(255,255,255,0.9)] text-[#999] transition-all duration-200 hover:scale-110 hover:bg-white max-[480px]:h-7 max-[480px]:w-7 ${
            isWishlisted ? "text-[#ff0000]" : ""
          }`}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
      </div>
      <div className="px-1 py-[10px]">
        <div className="mb-1 text-[12px] font-semibold uppercase text-[#666] max-[768px]:text-[11px] max-[480px]:text-[10px]">
          <span>{product.brand}</span>
        </div>
        <div className="mb-1">
          <div className="yz-rating-stars yz-rating-stars--sm" aria-label="Rated 0.0 out of 5">
            <span className="flex gap-[2px]" aria-hidden="true">
              <span className="text-[12px] text-[#f5a623]">★</span>
              <span className="text-[12px] text-[#f5a623]">★</span>
              <span className="text-[12px] text-[#f5a623]">★</span>
              <span className="text-[12px] text-[#f5a623]">★</span>
              <span className="text-[12px] text-[#f5a623]">★</span>
            </span>
          </div>
        </div>
        <p className="m-0 mb-[6px] line-clamp-2 overflow-hidden text-[14px] leading-[1.3] max-[768px]:text-[13px] max-[480px]:text-[12px]">
          {product.title}
        </p>
        <p className="m-0 text-[16px] font-semibold max-[768px]:text-[14px] max-[480px]:text-[13px]">
          <span className="yz-product-card__price-current">{product.price}</span>
          {product.comparePrice && (
            <>
              <del className="ml-2 text-[13px] font-normal text-[#999] line-through">{product.comparePrice}</del>
              <span className="ml-2 text-[13px] font-semibold text-[#ff0000]">{product.discount}</span>
            </>
          )}
        </p>
      </div>
    </a>
  );
};

export default ProductCard;