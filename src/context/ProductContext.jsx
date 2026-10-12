import { useState, useEffect } from "react";
import { ProductContext } from "./productContextObject";
import { getPublicProducts } from "../services/productService";
import { formatProduct } from "../utils/formatProduct";

const PAGE_SIZE = 50;

function extractProducts(response) {
  return response?.data?.products ?? [];
}

function extractTotalPages(response) {
  return Number(response?.data?.pagination?.totalPages) || 1;
}

export default function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const first = await getPublicProducts({
          page: 1,
          limit: PAGE_SIZE,
        });

        let items = extractProducts(first);
        const totalPages = extractTotalPages(first);

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              getPublicProducts({
                page: index + 2,
                limit: PAGE_SIZE,
              })
            )
          );

          items = items.concat(...rest.map(extractProducts));
        }

        if (!cancelled) {
          setProducts(items.map(formatProduct));
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setError(
            err?.message || "Unable to load products."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProductContext.Provider
      value={{ products, loading, error }}
    >
      {children}
    </ProductContext.Provider>
  );
}
