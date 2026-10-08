import { useState, useEffect } from "react"
import { apiRequest } from "../services/api"

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"]

export function useDashboardMetrics() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await apiRequest("/products", {
          method: "GET",
          auth: true,
        })

        /*
          Support common backend response structures:

          {
            data: [...]
          }

          or

          {
            products: [...]
          }

          or directly:

          [...]
        */
        const productList =
          Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.products)
                ? response.products
                : []

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
        }))

        setProducts(formatted)
      } catch (err) {
        setError(
          err.message ||
            "Unable to load seller products."
        )

        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const buckets = MONTHS.map((month, i) =>
    products.filter(
      (product) =>
        Number(product.id || 0) % MONTHS.length === i
    )
  )

  const revenueTrend = MONTHS.map((month, i) => ({
    month,
    revenue: buckets[i].reduce(
      (sum, product) => sum + product.price,
      0
    ),
  }))

  const ordersTrend = MONTHS.map((month, i) => ({
    month,
    orders: buckets[i].length,
  }))

  return {
    products,
    loading,
    error,
    revenueTrend,
    ordersTrend,
  }
}
