import { useState, useEffect } from 'react';

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

// Splits real, live fakestoreapi products into 6 buckets (by product ID) to
// produce a chartable trend shape. This is genuinely dynamic — it recalculates
// from the live API response — but fakestoreapi has no real order dates, so
// this simulates a monthly split of real catalogue data rather than showing
// actual historical order/revenue data, which doesn't exist yet.
export function useDashboardMetrics(scopeFilter = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item.id,
          category: item.category,
          price: Math.round(item.price * 135),
        }));
        setProducts(scopeFilter ? formatted.filter(scopeFilter) : formatted);
      })
      .finally(() => setLoading(false));
  }, []);

  const buckets = MONTHS.map((month, i) => products.filter((p) => p.id % MONTHS.length === i));

  const revenueTrend = MONTHS.map((month, i) => ({
    month,
    revenue: buckets[i].reduce((sum, p) => sum + p.price, 0),
  }));

  const ordersTrend = MONTHS.map((month, i) => ({
    month,
    orders: buckets[i].length,
  }));

  return { products, loading, revenueTrend, ordersTrend };
}