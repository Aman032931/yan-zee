const NPR_RATE = 135
const MIN_DISCOUNT = 5 // discounts below this % are ignored (no strike-through price)

/**
 * Single source of truth for every product on every page.
 * Tags are derived from the product's own data, so different products
 * get different tags, and the same product gets the same tags everywhere.
 *
 * The discount is NOT a tag. It shows next to the price
 * (strike-through price + "% OFF" chip).
 */
export function formatProduct(item) {
  const price = Math.round(item.price * NPR_RATE)

  const rawDiscount = Math.round(item.discountPercentage || 0)
  const discountPercent = rawDiscount >= MIN_DISCOUNT ? rawDiscount : 0
  const mrp =
    discountPercent > 0
      ? Math.round(price / (1 - discountPercent / 100))
      : null

  const topSelling = item.rating >= 4.6
  // DummyJSON has no real "new" date, so this is a stable placeholder:
  // roughly one product in four is marked new, spread across categories.
  const isNew = item.id % 4 === 0
  const lowStock = item.stock <= 10 || item.availabilityStatus === "Low Stock"

  // Order = priority
  const tags = [
    topSelling && { label: "TOP SELLING", color: "bg-orange-600" },
    isNew && { label: "NEW", color: "bg-emerald-500" },
    lowStock && { label: "LOW STOCK", color: "bg-red-600" },
  ].filter(Boolean)

  return {
    id: item.id,
    title: item.title,
    brand: item.category.toUpperCase(),
    category: item.category.toLowerCase(),
    price,
    mrp,
    discountPercent,
    image: item.thumbnail || item.images?.[0],
    rating: Math.round(item.rating || 4),
    badge: topSelling ? "TOP SELLING" : null, // kept for any code that still reads it
    isNew, // used by the "New arrivals only" filter, so it matches the NEW tag
    stock: item.stock,
    tags,
  }
}