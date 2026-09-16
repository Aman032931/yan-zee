import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-360 px-4 py-24 text-center">
      <p className="text-red-500 text-xs font-bold tracking-widest uppercase mb-3">
        Error 404
      </p>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Page not found
      </h1>
      <p className="text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-red-600 hover:bg-red-700 transition text-white text-sm font-semibold px-6 py-3 rounded-full cursor-pointer"
      >
        Back to home
      </Link>
    </div>
  );
}