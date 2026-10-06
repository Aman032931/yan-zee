import { useState, useEffect, useCallback } from 'react';
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';

const PAGE_SIZE = 50;

async function fetchAllMine() {
  const first = await getMyProducts({ page: 1, limit: PAGE_SIZE });
  let items = first.data.products;
  const totalPages = first.data.pagination?.totalPages ?? 1;

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        getMyProducts({ page: i + 2, limit: PAGE_SIZE }),
      ),
    );
    items = items.concat(...rest.map((r) => r.data.products));
  }
  return items;
}

// The seller's own products. After every change the list is reloaded,
// because the create/update/delete responses carry very little data.
export function useManagedProducts(enabled = true) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setProducts(await fetchAllMine());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchAllMine()
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const addProduct = async (payload) => {
    await createProduct(payload);
    await reload();
  };

  const editProduct = async (id, payload) => {
    await updateProduct(id, payload);
    await reload();
  };

  const removeProduct = async (id) => {
    await deleteProduct(id);
    await reload();
  };

  return { products, loading, error, addProduct, editProduct, removeProduct };
}