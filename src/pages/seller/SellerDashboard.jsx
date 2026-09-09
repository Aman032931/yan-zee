import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import StatCard from '../../components/shared/StatCard';
import RevenueTrendChart from '../../components/shared/RevenueTrendChart';
import MonthlyOrdersChart from '../../components/shared/MonthlyOrdersChart';
import SalesByCategoryChart from '../../components/shared/SalesByCategoryChart';

const sellerScopeFilter = (p) => p.id <= 5;

export default function SellerDashboard() {
  const { products, loading, revenueTrend, ordersTrend } = useDashboardMetrics(sellerScopeFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Seller Panel — your overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="My Products"
          value={loading ? '…' : products.length}
          sublabel="listed in store"
          color="bg-violet-600"
        />
        <StatCard label="My Orders" value="Coming soon" sublabel="requires backend" color="bg-pink-600" />
        <StatCard label="My Revenue" value="Coming soon" sublabel="requires backend" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <RevenueTrendChart data={revenueTrend} />
        <MonthlyOrdersChart data={ordersTrend} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <SalesByCategoryChart products={products} title="Sales by Product" />
      </div>

      <p className="text-xs text-gray-400 mt-6">
        My Orders and My Revenue will populate automatically once the real backend is connected. My Products, the
        trend charts, and category breakdown are computed live from the real fake API response, scoped to a
        placeholder subset until real per-seller ownership exists.
      </p>
    </div>
  );
}