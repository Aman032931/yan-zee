import { useState, useEffect } from "react"
import ProductCard from "../shared/ProductCard"
import { formatProduct } from "../../utils/formatProduct"

// Keeps the same card width as before (180px, 200px from `sm` up)
const CARD_SLOT = "flex w-[180px] shrink-0 sm:w-[200px]"

export default function RecommendedSection() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=100")
      .then((res) => res.json())
      .then((data) => {
        const topPicks = data.products
          .filter((item) => item.rating >= 4.0)
          .map(formatProduct)
        setRecommendations(topPicks)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load recommendations:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="my-6 w-full animate-pulse rounded-xl border border-gray-100 bg-white px-4 py-6 shadow-sm">
        <div className="mb-4 space-y-2 px-2">
          <div className="h-5 w-48 rounded bg-gray-200"></div>
          <div className="h-3 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="flex gap-4 overflow-hidden pt-1 pb-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`${CARD_SLOT} flex-col space-y-3 rounded-xl border border-gray-100 p-3`}
            >
              <div className="aspect-[4/5] w-full rounded-md bg-gray-200"></div>
              <div className="h-2.5 w-1/2 rounded bg-gray-200"></div>
              <div className="h-3.5 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/3 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="my-6 w-full rounded-xl border border-gray-100 bg-white px-4 py-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between px-2">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-gray-900">
            Recommended For You
          </h3>
          <p className="text-xs text-gray-500">
            Handpicked items based on popular trends and top ratings
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
          Personalized Picks
        </span>
      </div>

      {/* No items-start: cards stretch to the tallest one so all heights match.
          px-1 / pb-4 leave room so the card hover shadow isn't clipped. */}
      <div className="scrollbar-thin scrollbar-thumb-gray-200 flex gap-4 overflow-x-auto px-1 pt-1 pb-4">
        {recommendations.map((item) => (
          <div key={item.id} className={CARD_SLOT}>
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </section>
  )
}