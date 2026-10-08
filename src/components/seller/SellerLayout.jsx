
import { useState, useEffect } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Store,
  LayoutDashboard,
  Package,
  Tags,
  Award,
  ShoppingBag,
  Settings,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

import { getMyShop } from "../../services/shopService";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/seller",
    icon: LayoutDashboard,
  },
  {
    label: "My Products",
    to: "/seller/products",
    icon: Package,
  },
  {
    label: "Categories",
    to: "/seller/categories",
    icon: Tags,
  },
  {
    label: "Brands",
    to: "/seller/brands",
    icon: Award,
  },
  {
    label: "Orders",
    to: "/seller/orders",
    icon: ShoppingBag,
  },
  {
    label: "Settings",
    to: "/seller/settings",
    icon: Settings,
  },
];

export default function SellerLayout() {
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getMyShop()
      .then((response) => {
        if (cancelled) return;

        const shopData =
          response?.data?.store ||
          response?.data?.shop ||
          response?.data ||
          response?.shop ||
          response;

        setShop(shopData);
      })
      .catch((error) => {
        if (!cancelled) {
          setShopError(
            error.message || "Unable to load shop details."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setShopLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      {/* Sidebar */}
      <aside className="flex w-full flex-col border-b bg-background md:min-h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        {/* Seller branding */}
        <div className="p-5">
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-5" />
            </div>

            <div>
              <p className="font-semibold tracking-tight">
                YanZee
              </p>
              <p className="text-xs text-muted-foreground">
                Seller Panel
              </p>
            </div>
          </Link>

          {/* Shop information */}
          <div className="mt-5 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              Your shop
            </p>

            <p className="mt-1 truncate text-sm font-medium">
              {shopLoading
                ? "Loading shop..."
                : shop?.name || "Shop details unavailable"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Mobile menu toggle */}
        <div className="flex items-center justify-between border-b p-3 md:hidden">
          <span className="text-sm font-medium">
            Seller Navigation
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={
              mobileMenuOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={mobileMenuOpen}
            onClick={() =>
              setMobileMenuOpen((open) => !open)
            }
          >
            {mobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav
          className={`${
            mobileMenuOpen ? "flex" : "hidden"
          } flex-col gap-1 p-3 md:flex md:flex-1`}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/seller"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Shop loading error */}
        {shopError && (
          <p className="px-5 pb-3 text-xs text-destructive">
            Shop details could not be loaded.
          </p>
        )}

        {/* Back to marketplace */}
        <div className="border-t p-3">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Store
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet
          context={{
            shop,
            setShop,
            shopLoading,
            shopError,
          }}
        />
      </main>
    </div>
  );
}