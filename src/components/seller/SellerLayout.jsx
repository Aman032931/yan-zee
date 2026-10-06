import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { getMyShop } from '../../services/shopService';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/seller' },
  { label: 'My Products', to: '/seller/products' },
];

export default function SellerLayout() {
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopError, setShopError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getMyShop()
      .then((s) => {
        if (!cancelled) setShop(s);
      })
      .catch((err) => {
        if (!cancelled) setShopError(err.message);
      })
      .finally(() => {
        if (!cancelled) setShopLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-lg font-bold">Seller Panel</span>
          {shop && (
            <p className="mt-1 truncate text-xs text-white/60">{shop.name}</p>
          )}
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/seller'}
              className={({ isActive }) =>
                `block px-5 py-2.5 text-sm transition ${
                  isActive ? 'bg-white/10 font-semibold' : 'text-white/70 hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="px-5 py-4 text-xs text-white/60 hover:text-white border-t border-white/10">
          ← Back to store
        </Link>
      </aside>

      <main className="flex-1 p-8 min-w-0">
        <Outlet context={{ shop, setShop, shopLoading, shopError }} />
      </main>
    </div>
  );
}