import { useState, useEffect } from 'react';

const PREMIUM_CATEGORIES = ["womens-watches", "mens-watches", "womens-jewellery", "fragrances", "sunglasses"];

export function usePremiumProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=0')
      .then((res) => res.json())
      .then((data) => {
        const premiumOnly = data.products
          .filter((item) => PREMIUM_CATEGORIES.includes(item.category))
          .map((item) => {
            const price = Math.round(item.price * 135);
            const mrp = Math.round(price * 1.3);
            const discountPercent = Math.round(((mrp - price) / mrp) * 100);

            return {
              id: item.id,
              title: item.title,
              category: item.category,
              price,
              mrp,
              discountPercent,
              image: item.thumbnail || item.images?.[0],
              rating: Math.round(item.rating || 4),
              badge: item.rating > 4.5 ? "TOP SELLING" : null,
              isNew: item.id <= 5,
            };
          });
        setProducts(premiumOnly);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}