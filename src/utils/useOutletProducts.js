import { useState, useEffect } from 'react';

export function useOutletProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=0')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.products.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          price: Math.round(item.price * 135),
          image: item.thumbnail || item.images?.[0],
          rating: Math.round(item.rating || 4),
          badge: item.rating > 4.5 ? "TOP SELLING" : null,
          // dummyjson has no sale/discount flag on the product itself —
          // placeholder flag until a real backend has one
          isOnSale: item.id % 2 === 0,
        }));
        setProducts(formatted);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}