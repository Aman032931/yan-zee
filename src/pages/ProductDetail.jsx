import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const CATEGORY_LABELS = {
  "men's clothing": "Men's Clothing",
  "women's clothing": "Women's Clothing",
  jewelery: "Jewelery",
  electronics: "Electronics",
};

const CLOTHING_CATEGORIES = ["men's clothing", "women's clothing"];
const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setNotFound(false);
    setSelectedSize(null);
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((item) => {
        if (!item || !item.id) {
          setNotFound(true);
          return;
        }
        const price = Math.round(item.price * 135);
        // fakestoreapi has no MRP/discount field — this is a placeholder
        // "original price" (30% higher) purely for layout, not a real discount.
        const mrp = Math.round(price * 1.3);
        const discountPercent = Math.round(((mrp - price) / mrp) * 100);

        setProduct({
          id: item.id,
          title: item.title,
          category: item.category,
          price,
          mrp,
          discountPercent,
          image: item.image,
          description: item.description,
          rating: Math.round(item.rating?.rate || 4),
          reviewCount: item.rating?.count || 0,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">Loading...</div>;
  }

  if (notFound || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-lg font-semibold text-gray-700">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const isClothing = CLOTHING_CATEGORIES.includes(product.category);
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  const handleBuyNow = () => {
    navigate('/cart', {
      state: {
        buyNowItem: {
          ...product,
          size: selectedSize,
          quantity: 1,
        },
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6 flex flex-wrap items-center gap-1">
        <Link to="/" className="hover:text-gray-800 transition">Home</Link>
        <span>/</span>
        <Link to="/all" className="hover:text-gray-800 transition">{categoryLabel}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-gray-50 rounded-lg flex items-center justify-center p-8 h-96">
          <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
        </div>

        {/* Details */}
        <div>
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">{categoryLabel}</span>
          <h1 className="text-xl font-bold text-gray-900 mt-1 mb-3">{product.title}</h1>

          <div className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded mb-4">
            {product.rating}<span>★</span>
            <span className="text-white/80 font-normal ml-1">| {product.reviewCount} Ratings</span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">Nrs {product.price.toLocaleString()}</span>
            <span className="text-sm text-gray-400 line-through">MRP Nrs {product.mrp.toLocaleString()}</span>
            <span className="text-sm font-semibold text-orange-600">({product.discountPercent}% OFF)</span>
          </div>
          <p className="text-xs text-green-600 mb-6">inclusive of all taxes</p>

          {isClothing && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-800 mb-2">Select Size</p>
              <div className="flex gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-full border text-xs font-semibold transition cursor-pointer ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Sizes shown for reference only — real per-size stock isn't tracked yet.
              </p>
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <button className="flex-1 bg-black text-white text-sm font-semibold py-3 rounded hover:bg-gray-800 transition cursor-pointer">
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 border border-black text-black text-sm font-semibold py-3 rounded hover:bg-black hover:text-white transition cursor-pointer"
            >
              Buy Now
            </button>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-800 mb-2">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}