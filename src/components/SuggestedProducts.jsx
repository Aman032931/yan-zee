import { useState } from 'react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Noise-Canceling Headphones',
    category: 'Electronics',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    tags: ['Electronics', 'Audio'],
  },
  {
    id: 2,
    name: 'Ergonomic Mechanical Keyboard',
    category: 'Accessories',
    price: 89.99,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
    tags: ['Accessories', 'Workplace'],
  },
  {
    id: 3,
    name: 'Minimalist Water Bottle 1L',
    category: 'Lifestyle',
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
    tags: ['Lifestyle', 'Fitness'],
  },
  {
    id: 4,
    name: 'Smart Fitness Tracker Watch',
    category: 'Electronics',
    price: 79.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    tags: ['Electronics', 'Fitness'],
  },
  {
    id: 5,
    name: 'Leather Everyday Tote Bag',
    category: 'Lifestyle',
    price: 64.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
    tags: ['Lifestyle', 'Accessories'],
  },
];

const PREFERENCE_OPTIONS = ['All', 'Electronics', 'Lifestyle', 'Accessories', 'Fitness'];

export default function SuggestedProducts() {
  const [selectedPreference, setSelectedPreference] = useState('All');
  const [addedItems, setAddedItems] = useState([]);

  const suggestedProducts = PRODUCTS.filter((product) => {
    if (selectedPreference === 'All') return true;
    return (
      product.category === selectedPreference ||
      product.tags.includes(selectedPreference)
    );
  });

  const handleAddToCart = (id) => {
    setAddedItems((prev) => [...prev, id]);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 text-left">Suggested For You</h2>
          <p className="text-xs text-slate-500 text-left">
            Products curated based on your selected interests
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PREFERENCE_OPTIONS.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setSelectedPreference(pref)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedPreference === pref
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* 5-Column Compact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {suggestedProducts.map((product) => {
          const isAdded = addedItems.includes(product.id);
          return (
            <div
              key={product.id}
              className="group bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Compact Image Ratio */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {product.tags[0]}
                </span>
              </div>

              {/* Reduced Inner Spacing */}
              <div className="p-2.5 flex flex-col flex-grow justify-between text-left">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-xs text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-1 mt-0.5 mb-2">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-[11px] font-medium text-slate-600">{product.rating}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-sm font-bold text-slate-900">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={isAdded}
                    className={`w-full py-1.5 px-2 rounded-md font-semibold text-xs transition-colors ${
                      isAdded
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                  >
                    {isAdded ? 'Added ✓' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}