import { useOutletContext } from 'react-router-dom';
import { useManagedProducts } from '../../hooks/useManagedProducts';
import StatCard from '../../components/shared/StatCard';
import SalesByCategoryChart from '../../components/shared/SalesByCategoryChart';
import CreateShopForm from '../../components/seller/CreateShopForm';

export default function SellerDashboard() {
  const { shop, setShop, shopLoading, shopError } = useOutletContext();
  const { products, loading, error } = useManagedProducts(Boolean(shop));

  if (shopLoading) return <p className="text-sm text-gray-500">Loading your shop…</p>;
  if (shopError) return <p className="text-sm text-red-600">{shopError}</p>;

  if (!shop) {
    return (
      <div className="max-w-xl">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Create your shop</h1>
        <p className="mb-6 text-sm text-gray-500">
          Set up your shop before you start adding products.
        </p>
        <CreateShopForm onCreated={setShop} />
      </div>
    );
  }

  const activeCount = products.filter((p) => p.status === 'ACTIVE').length;
  const totalStock = products.reduce((sum, p) => sum + (p.totalStock || 0), 0);
  const chartProducts = products.map((p) => ({
    id: p.id,
    category: p.category,
    price: p.price,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">{shop.name} — your overview</p>

      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          ⚠ {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="My Products"
          value={loading ? '…' : products.length}
          sublabel={loading ? '' : `${activeCount} active`}
          color="bg-violet-600"
        />
        <StatCard
          label="Total Stock"
          value={loading ? '…' : totalStock}
          sublabel="units across all sizes"
          color="bg-sky-600"
        />
        <StatCard label="My Orders" value="Coming soon" sublabel="needs orders API" color="bg-pink-600" />
        <StatCard label="My Revenue" value="Coming soon" sublabel="needs orders API" color="bg-orange-500" />
      </div>

      <SalesByCategoryChart products={chartProducts} title="Catalogue by Category" />
    </div>
  );
}