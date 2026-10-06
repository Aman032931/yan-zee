import { useState, useEffect } from "react";
import { ProductContext } from "./productContextObject";
import { getPublicProducts } from "../services/productService";
import { formatProduct } from "../utils/formatProduct";

const PAGE_SIZE = 50;

export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const first = await getPublicProducts({ page: 1, limit: PAGE_SIZE });
        let items = first.data.products;
        const totalPages = first.data.pagination?.totalPages ?? 1;

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              getPublicProducts({ page: i + 2, limit: PAGE_SIZE }),
            ),
          );
          items = items.concat(...rest.map((r) => r.data.products));
        }

        if (!cancelled) setProducts(items.map(formatProduct));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
}