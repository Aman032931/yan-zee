import { useState, useEffect } from 'react';

export default function RecommendedSection({ onSelectProduct }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        // Filter high-rated products (>= 4.0) to simulate personalized recommendations
        const topPicks = data
          .filter((item) => item.rating?.rate >= 4.0)
          .map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            price: Math.round(item.price * 135),
            image: item.image,
            rating: item.rating?.rate,
            count: item.rating?.count,
          }));
        setRecommendations(topPicks);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load recommendations:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white py-6 px-4 my-4 rounded-xl border border-gray-100 shadow-sm text-center text-xs text-gray-400">
        Loading recommendations...
      </div>
    );
  }

  return (
    <section className="w-full bg-white py-6 px-4 my-6 rounded-xl border border-gray-100 shadow-sm">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recommended For You</h3>
          <p className="text-xs text-gray-500">Handpicked items based on popular trends and top ratings</p>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Personalized Picks
        </span>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-200">
        {recommendations.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectProduct && onSelectProduct(item)}
            className="min-w-[180px] max-w-[180px] sm:min-w-[200px] sm:max-w-[200px] bg-white border border-gray-100 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            {/* Image Container */}
            <div className="relative w-full h-32 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center p-2 mb-2">
              <img
                src={item.image}
                alt={item.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-1.5 left-1.5 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                ★ {item.rating}
              </span>
            </div>

            {/* Product Details */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider truncate">
                {item.category}
              </p>
              <h4 className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug mt-0.5">
                {item.title}
              </h4>
            </div>

            {/* Price & Action */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">
                Nrs {item.price.toLocaleString()}
              </span>
              <button className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded hover:bg-black transition">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}