import { useState, useEffect } from 'react';

export function useSearchProducts(query) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=0')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.products.map((item) => ({
          id: item.id,
          title: item.title,
          brand: item.category.toUpperCase(),
          category: item.category.toLowerCase(),
          price: Math.round(item.price * 135),
          image: item.thumbnail || item.images?.[0],
          rating: Math.round(item.rating || 4),
          badge: item.rating > 4.5 ? "TOP SELLING" : null,
        }));
        setAllProducts(formatted);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const results = query
    ? allProducts.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return { results, loading, error };
}