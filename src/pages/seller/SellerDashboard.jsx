import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Store,
  Package,
  Plus,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";

export default function SellerDashboard() {
  const navigate = useNavigate();

  // Get the selected store from SellerLayout.
  const {
    shop,
    shopLoading,
    shopError,
  } = useOutletContext();

  // The dashboard hook will use this store ID to load its products.
  const {
    products = [],
    loading: productsLoading,
    error: productsError,
  } = useDashboardMetrics(shop?.id);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Seller Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage your store and product listings.
          </p>
        </div>

        <Button
          onClick={() => navigate("/seller/products")}
          disabled={!shop}
        >
          <Plus className="mr-2 h-4 w-4" />
          Manage Products
        </Button>
      </div>

      {/* Store information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5" />
            My Store
          </CardTitle>
        </CardHeader>

        <CardContent>
          {shopLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-xl" />

              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56 max-w-full" />
              </div>
            </div>
          ) : shopError ? (
            <p className="text-sm text-destructive">
              {shopError}
            </p>
          ) : shop ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                {shop.logo || shop.image ? (
                  <img
                    src={shop.logo || shop.image}
                    alt={shop.name || "Store"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store className="h-8 w-8 text-muted-foreground" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {shop.name || "My Store"}
                  </h2>

                  {shop.status && (
                    <Badge variant="secondary">
                      {shop.status}
                    </Badge>
                  )}
                </div>

                {shop.description && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {shop.description}
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {shop.contactEmail && (
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="break-all">
                        {shop.contactEmail}
                      </span>
                    </div>
                  )}

                  {shop.contactPhone && (
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{shop.contactPhone}</span>
                    </div>
                  )}

                  {(shop.address || shop.storeAddress) && (
                    <div className="flex items-start gap-2 text-sm sm:col-span-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>
                        {shop.address || shop.storeAddress}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <Store className="mx-auto h-9 w-9 text-muted-foreground" />

              <h3 className="mt-3 font-medium">
                No store found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Create a store before managing products.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            My Products
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/seller/products")}
            disabled={!shop}
          >
            View Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {!shop && !shopLoading ? (
            <p className="text-sm text-muted-foreground">
              Create a store to start managing products.
            </p>
          ) : productsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : productsError ? (
            <p className="text-sm text-destructive">
              {productsError}
            </p>
          ) : (
            <div>
              <p className="text-3xl font-bold">
                {products.length}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {products.length === 1
                  ? "Product in your store"
                  : "Products in your store"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            Quick Actions
          </h2>

          <p className="text-sm text-muted-foreground">
            Shortcuts to manage your store.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            className={`transition-colors ${
              shop
                ? "cursor-pointer hover:bg-muted/40"
                : "opacity-60"
            }`}
            onClick={() => {
              if (shop) navigate("/seller/products");
            }}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">
                  Manage Products
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  View and manage your product listings.
                </p>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card
            className={`transition-colors ${
              shop
                ? "cursor-pointer hover:bg-muted/40"
                : "opacity-60"
            }`}
            onClick={() => {
              if (shop) navigate("/seller/products");
            }}
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">
                  Add a Product
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Open product management to add a listing.
                </p>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
