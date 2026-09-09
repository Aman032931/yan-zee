import { useState, useEffect } from 'react';

// Fetches real fakestoreapi products into local, editable state.
// Add/Edit/Delete only mutate this in-memory array — nothing persists
// to a real backend yet. Swap this out once real product CRUD exists.
export function useManagedProducts(scopeFilter = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          price: Math.round(item.price * 135),
          image: item.image,
          description: item.description,
        }));
        setProducts(scopeFilter ? formatted.filter(scopeFilter) : formatted);
      })
      .finally(() => setLoading(false));
  }, []);

  const addProduct = (newProduct) => {
    setProducts((prev) => [
      { ...newProduct, id: Date.now() }, // temporary local-only id
      ...prev,
    ]);
  };

  const updateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return { products, loading, addProduct, updateProduct, deleteProduct };
}