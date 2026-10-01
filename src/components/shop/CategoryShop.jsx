// src/components/shop/CategoryShop.jsx
import { useState } from "react";
import { useProducts } from "../../utils/useProducts";
import FilterPanel from "../home/FilterPanel";
import ProductCard from "../home/ProductCard";
import ProductSkeleton from "../home/ProductSkeleton";
import ResponsiveFilterPanel from "../shared/ResponsiveFilterPanel";

export default function CategoryShop({ category, title, subtitle }) {
  const { products, loading } = useProducts(category);
  const [filters, setFilters] = useState({});

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {title}
        </h1>

        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          {subtitle}
        </p>
      </div>

      {/* Shop Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)]">

        {/* Filters */}
        <ResponsiveFilterPanel>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
          />
        </ResponsiveFilterPanel>

        {/* Products */}
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">

            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              : products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}

          </div>
        </div>

      </div>
    </div>
  );
}