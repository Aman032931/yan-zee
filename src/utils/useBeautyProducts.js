import { useState, useEffect } from "react"
import { formatProduct } from "./formatProduct"

const BEAUTY_CATEGORIES = ["beauty", "fragrances", "skin-care"]

export function useBeautyProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=0")
      .then((res) => res.json())
      .then((data) => {
        const beautyOnly = data.products
          .filter((item) => BEAUTY_CATEGORIES.includes(item.category))
          .map(formatProduct) // category stays "beauty" | "fragrances" | "skin-care"
        setProducts(beautyOnly)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { products, loading, error }
}