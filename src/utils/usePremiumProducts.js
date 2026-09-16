import { useState, useEffect } from 'react';

export function usePremiumProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        const premiumOnly = data
          .filter((item) => item.category === "jewelery")
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
        setProducts(premiumOnly);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}