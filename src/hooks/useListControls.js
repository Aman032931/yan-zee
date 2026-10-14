import { useState } from "react"

// Client-side search + pagination for a list of items.
//   items         the full list
//   getSearchText (item) => string to search in, e.g. `${item.name} ${item.slug}`
//   pageSize      rows per page (default 10)
export function useListControls(items, getSearchText, pageSize = 10) {
  const [state, setState] = useState({ query: "", page: 1 })

  const needle = state.query.trim().toLowerCase()
  const filtered = needle
    ? items.filter((item) => getSearchText(item).toLowerCase().includes(needle))
    : items

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(state.page, totalPages)
  const start = (page - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  return {
    query: state.query,
    // typing in the search box always goes back to page 1
    setQuery: (query) => setState({ query, page: 1 }),
    page,
    setPage: (p) => setState((s) => ({ ...s, page: p })),
    totalPages,
    pageItems,
    total: filtered.length,
    from: filtered.length ? start + 1 : 0,
    to: start + pageItems.length,
    isSearching: needle !== "",
  }
}