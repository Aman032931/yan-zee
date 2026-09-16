import { useState, useEffect } from 'react';

export function useHomeDecorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        // No real furniture/kitchen/lighting/decor/appliance category exists in fakestoreapi.
        // Deliberately not stretching "electronics" to cover this — always resolves empty
        // until a richer API or real backend has an actual home category.
        const homeOnly = data.filter((item) => item.category === "home");
        setProducts(homeOnly);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}