export default function AdminOrders() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
        <p className="text-sm font-medium text-gray-600">No order data available yet.</p>
        <p className="text-xs text-gray-400 mt-1">This will populate once checkout and order storage are connected to the real backend.</p>
      </div>
    </div>
  );
}