import { useState, useEffect } from "react";
import { apiRequest } from "../services/api";

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export function useDashboardMetrics(storeId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(storeId));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      // Do not request products without a selected store.
      if (!storeId) {
        setProducts([]);
        setError("");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await apiRequest("/products", {
          method: "GET",
          auth: true,
          headers: {
            "x-store-id": String(storeId),
          },
        });

        // Support common backend response structures.
        const productList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data?.products)
            ? response.data.products
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.products)
                ? response.products
                : [];

        const formatted = productList.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: Number(
            item.discountPrice ?? item.price ?? 0
          ),
          originalPrice: Number(item.price ?? 0),
          discountPrice: Number(
            item.discountPrice ?? item.price ?? 0
          ),
          image: item.image,
          status: item.status,
          audience: item.audience,
          variants: item.variants || [],
        }));

        if (!cancelled) {
          setProducts(formatted);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load seller products."
          );
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const buckets = MONTHS.map((month, i) =>
    products.filter(
      (product) =>
        Number(product.id || 0) % MONTHS.length === i
    )
  );

  const revenueTrend = MONTHS.map((month, i) => ({
    month,
    revenue: buckets[i].reduce(
      (sum, product) => sum + product.price,
      0
    ),
  }));

  const ordersTrend = MONTHS.map((month, i) => ({
    month,
    orders: buckets[i].length,
  }));

  return {
    products,
    loading,
    error,
    revenueTrend,
    ordersTrend,
  };
}
