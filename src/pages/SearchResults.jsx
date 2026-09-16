import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/home/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useSearchProducts } from '../utils/useSearchProducts';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { results, loading } = useSearchProducts(query);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        {query ? `Search results for "${query}"` : 'Search'}
      </h1>
      <p className="text-slate-500 mb-6">
        {loading ? 'Searching...' : `${results.length} product${results.length === 1 ? '' : 's'} found`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm font-medium text-gray-600">
            {query ? `No products match "${query}".` : 'Type something in the search bar to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}