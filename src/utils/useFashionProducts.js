import { useState, useEffect } from 'react';

const FASHION_CATEGORIES = [
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "womens-dresses",
  "womens-shoes",
  "womens-bags",
  "womens-watches",
  "womens-jewellery",
  "tops",
  "sunglasses",
];

export function useFashionProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://dummyjson.com/products?limit=0')
      .then((res) => res.json())
      .then((data) => {
        const fashionOnly = data.products
          .filter((item) => FASHION_CATEGORIES.includes(item.category))
          .map((item) => {
            const price = Math.round(item.price * 135);
            // dummyjson has no MRP/discount field — this is a placeholder
            // "original price" (30% higher) purely for layout, not a real discount.
            const mrp = Math.round(price * 1.3);
            const discountPercent = Math.round(((mrp - price) / mrp) * 100);

            return {
              id: item.id,
              title: item.title,
              category: item.category, // e.g. "mens-shirts", "womens-dresses"
              price,
              mrp,
              discountPercent,
              image: item.thumbnail || item.images?.[0],
              rating: Math.round(item.rating || 4),
              badge: item.rating > 4.5 ? "TOP SELLING" : null,
              isNew: item.id <= 5,
            };
          });
        setProducts(fashionOnly);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}