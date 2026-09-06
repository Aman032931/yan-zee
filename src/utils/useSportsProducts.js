import { useState, useEffect } from 'react';

export function useSportsProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        // fakestoreapi has no sports/fitness category — this will always
        // resolve to an empty array until a richer API or backend is wired in.
        const sportsOnly = data
          .filter((item) => item.category === "sports" || item.category === "fitness")
          .map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            price: Math.round(item.price * 135),
            image: item.image,
            rating: Math.round(item.rating?.rate || 4),
            badge: item.rating?.rate > 4.2 ? "TOP SELLING" : null,
            isNew: item.id <= 5,
          }));
        setProducts(sportsOnly);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}