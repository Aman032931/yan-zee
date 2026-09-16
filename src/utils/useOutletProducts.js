import { useState, useEffect } from 'react';

export function useOutletProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category, // "men's clothing" | "women's clothing" | "jewelery" | "electronics"
          price: Math.round(item.price * 135),
          image: item.image,
          rating: Math.round(item.rating?.rate || 4),
          badge: item.rating?.rate > 4.2 ? "TOP SELLING" : null,
          // fakestoreapi has no sale/discount field — placeholder flag until real backend has one
          isOnSale: item.id % 2 === 0,
        }));
        setProducts(formatted);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}