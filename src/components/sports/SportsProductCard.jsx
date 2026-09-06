import { useState } from 'react';

export default function SportsProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  return (
    <div className="w-full min-w-0 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col overflow-hidden relative group">
      {product.badge && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded">
          {product.badge}
        </span>
      )}

      <button
        type="button"
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 transition cursor-pointer"
        aria-label="Add to wishlist"
      >
        <svg
          className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'fill-none stroke-current'}`}
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <div className="w-full h-56 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-3 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block truncate">
            {product.category}
          </span>
          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 mt-1 min-h-[32px]">
            {product.title}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className="text-yellow-400">★</span>
            <span className="text-gray-600">{product.rating}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-gray-900">
            Nrs {product.price.toLocaleString()}
          </span>
          <button className="bg-black text-white text-[11px] font-semibold px-3 py-1.5 rounded hover:bg-gray-800 transition cursor-pointer whitespace-nowrap">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}