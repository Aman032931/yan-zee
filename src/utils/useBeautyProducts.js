import { useState, useEffect } from 'react';

const BEAUTY_CATEGORIES = ["beauty", "fragrances", "skin-care"];

export function useBeautyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=0')
      .then((res) => res.json())
      .then((data) => {
        const beautyOnly = data.products
          .filter((item) => BEAUTY_CATEGORIES.includes(item.category))
          .map((item) => {
            const price = Math.round(item.price * 135);
            const mrp = Math.round(price * 1.3);
            const discountPercent = Math.round(((mrp - price) / mrp) * 100);

            return {
              id: item.id,
              title: item.title,
              category: item.category, // "beauty" | "fragrances" | "skin-care"
              price,
              mrp,
              discountPercent,
              image: item.thumbnail || item.images?.[0],
              rating: Math.round(item.rating || 4),
              badge: item.rating > 4.5 ? "TOP SELLING" : null,
              isNew: item.id <= 5,
            };
          });
        setProducts(beautyOnly);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}