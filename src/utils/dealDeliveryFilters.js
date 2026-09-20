export const DEALS = [
  { key: "clearance", label: "Clearance" },
  { key: "flash", label: "Flash Sale" },
  { key: "bundle", label: "Bundle Offers" },
  { key: "freeShipping", label: "Free Shipping" },
];

export const DELIVERY_TYPES = [
  { key: "express", label: "Express Delivery" },
  { key: "standard", label: "Standard Delivery" },
  { key: "pickup", label: "Pickup Available" },
];

// Stable number from any id (works for numeric and string ids)
const seed = (id) =>
  [...String(id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

// Uses real fields if a product has them; otherwise fills in TEMP mock values
export function getDealTags(p) {
  if (Array.isArray(p.deals)) return p.deals;
  const n = seed(p.id);
  const price = p.priceNPR ?? p.price ?? 0;
  const tags = [];
  if (n % 5 === 0) tags.push("clearance");
  if (n % 3 === 0 || p.badge === "TOP SELLING") tags.push("flash");
  if (n % 4 === 0) tags.push("bundle");
  if (price >= 3000) tags.push("freeShipping");
  return tags;
}

export function getDeliveryTypes(p) {
  if (Array.isArray(p.delivery)) return p.delivery;
  const n = seed(p.id);
  const types = ["standard"];
  if (n % 2 === 0) types.push("express");
  if (n % 3 === 0) types.push("pickup");
  return types;
}

// Within a group: any match. Between groups: both must match.
export function filterByDealsAndDelivery(products, deals = [], delivery = []) {
  return products.filter((p) => {
    if (deals.length && !deals.some((d) => getDealTags(p).includes(d))) return false;
    if (delivery.length && !delivery.some((d) => getDeliveryTypes(p).includes(d))) return false;
    return true;
  });
}