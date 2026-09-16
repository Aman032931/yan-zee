// src/components/shop/CategoryShop.jsx
import { useState } from "react";
import { useProducts } from "../../utils/useProducts";
import FilterPanel from "../home/FilterPanel";
import ProductCard from "../home/ProductCard";
import ProductSkeleton from "../home/ProductSkeleton";

export default function CategoryShop({ category, title, subtitle }) {
  const { products, loading } = useProducts(category);
  const [filters, setFilters] = useState({});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-500 mb-6">{subtitle}</p>

      <div className="flex gap-8">
        <FilterPanel filters={filters} onChange={setFilters} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}