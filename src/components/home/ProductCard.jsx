import  { useState } from "react";

const ProductCard = ({ product, isCarousel = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(product.wishlisted || false);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <a className={`yz-product-card ${isCarousel ? 'yz-product-card--carousel' : 'yz-product-card--grid'}`} href={product.href}>
      <div className="yz-product-card__img-wrap">
        {product.badge && (
          <div className="yz-product-card__badges">
            <span className={`yz-product-card__highlight yz-product-card__highlight--${product.badge.toLowerCase().replace(/ /g, '-')}`}>
              {product.badge}
            </span>
          </div>
        )}
        <div className="yz-img-wrap yz-img-wrap--fill is-loaded">
          <img
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="yz-product-card__img"
            src={product.image}
            style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent", objectFit: "cover" }}
          />
        </div>
        <span
          role="button"
          tabIndex="0"
          className={`yz-product-card__wish ${isWishlisted ? "is-active" : ""}`}
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
      </div>
      <div className="yz-product-card__body">
        <div className="yz-product-card__brand">
          <span>{product.brand}</span>
        </div>
        <div className="yz-product-card__rating">
          <div className="yz-rating-stars yz-rating-stars--sm" aria-label="Rated 0.0 out of 5">
            <span className="yz-rating-stars__row" aria-hidden="true">
              <span className="yz-rating-stars__star">★</span>
              <span className="yz-rating-stars__star">★</span>
              <span className="yz-rating-stars__star">★</span>
              <span className="yz-rating-stars__star">★</span>
              <span className="yz-rating-stars__star">★</span>
            </span>
          </div>
        </div>
        <p className="yz-product-card__title">{product.title}</p>
        <p className="yz-product-card__price">
          <span className="yz-product-card__price-current">{product.price}</span>
          {product.comparePrice && (
            <>
              <del className="yz-product-card__price-compare">{product.comparePrice}</del>
              <span className="yz-product-card__discount">{product.discount}</span>
            </>
          )}
        </p>
      </div>
    </a>
  );
};

export default ProductCard;