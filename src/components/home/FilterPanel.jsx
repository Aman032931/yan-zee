import  { useState } from "react";

const FilterPanel = ({  onClose, onClear }) => {
  const [expandedFilters, setExpandedFilters] = useState({
    brand: false,
    category: false,
    price: false,
    deals: false,
    delivery: false,
  });

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <aside className="yz-all-shop__sidebar" aria-label="Product filters">
      <button 
        type="button" 
        className="yz-all-shop__sidebar-close" 
        aria-label="Close filters" 
        onClick={onClose}
      >
        ×
      </button>
      <div className="yz-shop-filter-panel">
        {/* Header with All Filters and Clear all */}
        <div className="yz-all-shop__sidebar-head">
          <h2>All Filters</h2>
          <button type="button" className="yz-all-shop__clear" onClick={onClear}>
            Clear all
          </button>
        </div>

        {/* New Arrivals Toggle */}
        <label className="yz-shop-filter-toggle">
          <span>New Arrivals</span>
          <input type="checkbox" />
          <span className="yz-shop-filter-toggle__track" aria-hidden="true"></span>
        </label>

        {/* Brand Filter */}
        <div className="yz-shop-filter-acc">
          <button
            type="button"
            className={`yz-shop-filter-acc__trigger ${expandedFilters.brand ? 'is-open' : ''}`}
            aria-expanded={expandedFilters.brand}
            onClick={() => toggleFilter('brand')}
          >
            <span className="yz-shop-filter-acc__label">Brand</span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              aria-hidden="true"
              className={expandedFilters.brand ? 'rotate' : ''}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>
        </div>

        {/* Category Filter */}
        <div className="yz-shop-filter-acc">
          <button
            type="button"
            className={`yz-shop-filter-acc__trigger ${expandedFilters.category ? 'is-open' : ''}`}
            aria-expanded={expandedFilters.category}
            onClick={() => toggleFilter('category')}
          >
            <span className="yz-shop-filter-acc__label">
              Category
              <span className="yz-shop-filter-acc__count">1</span>
            </span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              aria-hidden="true"
              className={expandedFilters.category ? 'rotate' : ''}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>
        </div>

        {/* Price Filter */}
        <div className="yz-shop-filter-acc">
          <button
            type="button"
            className={`yz-shop-filter-acc__trigger ${expandedFilters.price ? 'is-open' : ''}`}
            aria-expanded={expandedFilters.price}
            onClick={() => toggleFilter('price')}
          >
            <span className="yz-shop-filter-acc__label">Price</span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              aria-hidden="true"
              className={expandedFilters.price ? 'rotate' : ''}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>
        </div>

        {/* Deals Filter */}
        <div className="yz-shop-filter-acc">
          <button
            type="button"
            className={`yz-shop-filter-acc__trigger ${expandedFilters.deals ? 'is-open' : ''}`}
            aria-expanded={expandedFilters.deals}
            onClick={() => toggleFilter('deals')}
          >
            <span className="yz-shop-filter-acc__label">Deals</span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              aria-hidden="true"
              className={expandedFilters.deals ? 'rotate' : ''}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>
        </div>

        {/* Delivery Type Filter */}
        <div className="yz-shop-filter-acc">
          <button
            type="button"
            className={`yz-shop-filter-acc__trigger ${expandedFilters.delivery ? 'is-open' : ''}`}
            aria-expanded={expandedFilters.delivery}
            onClick={() => toggleFilter('delivery')}
          >
            <span className="yz-shop-filter-acc__label">Delivery Type</span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              aria-hidden="true"
              className={expandedFilters.delivery ? 'rotate' : ''}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FilterPanel;