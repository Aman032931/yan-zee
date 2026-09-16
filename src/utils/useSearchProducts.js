import { useState, useEffect } from 'react';

export function useSearchProducts(query) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          brand: item.category.toUpperCase(),
          category: item.category.toLowerCase(),
          price: Math.round(item.price * 135),
          image: item.image,
          rating: Math.round(item.rating?.rate || 4),
          badge: item.rating?.rate > 4.2 ? "TOP SELLING" : null,
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