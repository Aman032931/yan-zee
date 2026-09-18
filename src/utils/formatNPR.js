// Shared NPR currency formatter.
//
// This used to live inside Cart.jsx as a named export alongside the
// default `Cart` component. Vite's Fast Refresh only works reliably
// when a file exports *only* React components — mixing in a plain
// function export (like this one) breaks Fast Refresh for every file
// that imports it, which can leave the dev server serving stale code
// until a full hard reload. Pulling it out here fixes that for good.
export const formatNPR = (amount) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);