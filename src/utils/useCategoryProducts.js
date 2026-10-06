import { useMemo } from 'react';
import { useProducts } from '../context/useProducts';

// Products of one category, read from the shared list in ProductContext.
export function useCategoryProducts(category) {
  const { products, loading, error } = useProducts();
  const filtered = useMemo(
    () => products.filter((p) => p.category === category),
    [products, category],
  );
  return { products: filtered, loading, error };
}