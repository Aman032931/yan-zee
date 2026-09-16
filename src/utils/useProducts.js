// src/utils/useProducts.js
import { useState, useEffect } from "react";

const FAKE_API_URL = "https://fakestoreapi.com/products";

export function useProducts(category) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${FAKE_API_URL}?limit=100`)
      .then((res) => res.json())
      .then((data) => {
        const items = category
          ? data.filter((p) => p.category === category)
          : data;
        setProducts(items);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [category]);

  return { products, loading, error };
}
