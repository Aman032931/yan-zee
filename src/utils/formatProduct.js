const MIN_DISCOUNT = 5 // discounts below this % are ignored (no strike-through price)
const LOW_STOCK_LIMIT = 10
const NEW_DAYS = 14

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="400" height="500" fill="#f3f4f6"/><text x="200" y="255" font-family="Arial" font-size="20" text-anchor="middle" fill="#9ca3af">No image</text></svg>',
  )

/**
 * Turns a backend product into the shape the cards and filters use.
 * `price` is what the customer pays; `mrp` is the struck-through price.
 *  * `discountPrice` is the SALE price (lower than `price`), confirmed with the backend.
 */
export function formatProduct(item) {
  const listPrice = Number(item.price) || 0
  const salePrice = Number(item.discountPrice)
  const onSale = salePrice > 0 && salePrice < listPrice

  const price = onSale ? salePrice : listPrice
  const rawDiscount = onSale ? Math.round((1 - salePrice / listPrice) * 100) : 0
  const discountPercent = rawDiscount >= MIN_DISCOUNT ? rawDiscount : 0
  const mrp = discountPercent > 0 ? listPrice : null

  const stock =
    item.totalStock ??
    (item.variants ?? []).reduce((sum, v) => sum + (v.stock || 0), 0)
  const outOfStock = item.status === "OUT_OF_STOCK" || stock <= 0
  const lowStock = !outOfStock && stock <= LOW_STOCK_LIMIT

  const ageInDays = item.createdAt
    ? (Date.now() - new Date(item.createdAt).getTime()) / 86_400_000
    : Infinity
  const isNew = ageInDays <= NEW_DAYS

  // Order = priority
  const tags = [
    isNew && { label: "NEW", color: "bg-emerald-500" },
    lowStock && { label: "LOW STOCK", color: "bg-red-600" },
    outOfStock && { label: "OUT OF STOCK", color: "bg-gray-700" },
  ].filter(Boolean)

  return {
    id: item.id,
    title: item.name,
    brand: item.shopName || item.category.replace(/_/g, " "), // becomes the shop name once the backend sends one
    category: item.category.toLowerCase().replace(/_/g, "-"), // e.g. "home-decor"
    audience: item.audience,
    shopId: item.shopId,
    description: item.description || "",
    variants: item.variants ?? [],
    price,
    mrp,
    discountPercent,
    image: item.image || item.gallery?.[0] || PLACEHOLDER_IMAGE,
    gallery: item.gallery ?? [],
    rating: 4, // placeholder: the backend has no ratings yet
    badge: null,
    isNew,
    stock,
    tags,
  }
}