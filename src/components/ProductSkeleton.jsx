export default function ProductSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 animate-pulse space-y-3 shadow-sm">
      {/* Image Placeholder */}
      <div className="w-full h-44 bg-gray-200 rounded-md"></div>

      {/* Content Placeholders */}
      <div className="space-y-2">
        <div className="w-1/3 h-2.5 bg-gray-200 rounded"></div>
        <div className="w-3/4 h-3.5 bg-gray-200 rounded"></div>
        <div className="w-1/2 h-3.5 bg-gray-200 rounded"></div>
      </div>

      {/* Footer Price/CTA Placeholder */}
      <div className="pt-2 flex justify-between items-center border-t border-gray-100">
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
        <div className="w-12 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}