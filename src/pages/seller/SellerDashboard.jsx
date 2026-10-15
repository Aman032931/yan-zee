import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  PackageX,
  Plus,
  ArrowUpRight,
  Store,
} from "lucide-react";

import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";

import {
  Card,
  CardContent,
} from "../../components/ui/card";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

function getProductStatus(product) {
  return String(product.status || "")
    .toUpperCase()
    .replaceAll(" ", "_");
}

function StatCard({ title, value, icon: Icon, loading, accent }) {
  return (
    <Card className="overflow-hidden rounded-xl border border-[#e9e5ef] bg-white shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-600">
              {title}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              {loading ? "—" : value}
            </p>
          </div>

          <div className="rounded-lg bg-red-50 p-2.5">
            <Icon className="h-5 w-5 text-brand-red-600" />
          </div>
        </div>

        <div className="mt-6 h-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${accent}`}
            style={{ width: "42%" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { shop, shopError } = useOutletContext();

  const {
    products = [],
    loading,
    error,
  } = useDashboardMetrics(shop?.id);

  const activeCount = products.filter((product) =>
    ["ACTIVE", "PUBLISHED"].includes(getProductStatus(product))
  ).length;

  const outOfStockCount = products.filter((product) =>
    ["OUT_OF_STOCK", "OUTOFSTOCK"].includes(
      getProductStatus(product)
    )
  ).length;

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-full space-y-6 bg-[#f8f9fb] p-4 sm:p-6 lg:p-8">
      {/* Dashboard Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            Good afternoon{shop?.name ? `, ${shop.name}` : ""}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's your shop overview for{" "}
            <span className="font-medium text-brand-red-600">
              {today}
            </span>
          </p>
        </div>

        <Button
          onClick={() => navigate("/seller/products")}
          className="bg-brand-red-600 text-white hover:bg-brand-red-700"
        >
          Manage Products
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </header>

      {/* Product Overview */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Product Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Products"
            value={products.length}
            icon={Package}
            loading={loading}
            accent="bg-brand-red-600"
          />

          <StatCard
            title="Active Products"
            value={activeCount}
            icon={CheckCircle2}
            loading={loading}
            accent="bg-emerald-500"
          />

          <StatCard
            title="Out of Stock"
            value={outOfStockCount}
            icon={PackageX}
            loading={loading}
            accent="bg-orange-400"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </section>

      {/* Shop */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          My Shop
        </h2>

        <Card className="rounded-xl border border-[#e9e5ef] bg-white shadow-none">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <Store className="h-6 w-6 text-brand-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              {shopError ? (
                <p className="text-sm text-red-600">{shopError}</p>
              ) : (
                <>
                  <h3 className="truncate font-semibold text-gray-900">
                    {shop?.name || "No shop selected"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {shop
                      ? "Your store is ready to manage."
                      : "Select or create a shop to get started."}
                  </p>
                </>
              )}
            </div>

            {shop?.status && (
              <Badge variant="outline" className="shrink-0 font-normal bg-green-500">
                {shop.status}
              </Badge>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="flex items-center gap-4 rounded-xl border border-[#e9e5ef] bg-white p-5 text-left transition-colors hover:border-red-200"
          >
            <div className="rounded-lg bg-red-50 p-3">
              <Package className="h-5 w-5 text-brand-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">
                Manage Products
              </p>
              <p className="mt-1 text-sm text-gray-500">
                View and update your products.
              </p>
            </div>

            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="flex items-center gap-4 rounded-xl border border-[#e9e5ef] bg-white p-5 text-left transition-colors hover:border-red-200"
          >
            <div className="rounded-lg bg-red-50 p-3">
              <Plus className="h-5 w-5 text-brand-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">
                Add a Product
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add a product to your catalog.
              </p>
            </div>

            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </section>
    </div>
  );
}