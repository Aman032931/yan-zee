import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import StatCard from '../../components/shared/StatCard';
import RevenueTrendChart from '../../components/shared/RevenueTrendChart';
import MonthlyOrdersChart from '../../components/shared/MonthlyOrdersChart';
import SalesByCategoryChart from '../../components/shared/SalesByCategoryChart';

export default function AdminDashboard() {
  const { products, loading, revenueTrend, ordersTrend } = useDashboardMetrics();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">YANZEE Admin — overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Products"
          value={loading ? '…' : products.length}
          sublabel="across all categories"
          color="bg-violet-600"
        />
        <StatCard label="Total Orders" value="Coming soon" sublabel="requires backend" color="bg-cyan-600" />
        <StatCard label="Total Users" value="Coming soon" sublabel="requires backend" color="bg-emerald-600" />
        <StatCard label="Revenue" value="Coming soon" sublabel="requires backend" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <RevenueTrendChart data={revenueTrend} />
        <MonthlyOrdersChart data={ordersTrend} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <SalesByCategoryChart products={products} title="Sales by Category" />
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Total Orders, Total Users, and Revenue will populate automatically once the real backend is connected. Total
        Products, the trend charts, and the category breakdown are computed live from the real fake API response.
      </p>
    </div>
  );
}