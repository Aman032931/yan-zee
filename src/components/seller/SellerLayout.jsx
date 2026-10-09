import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useMyStores } from '../../hooks/useStores';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/seller' },
  { label: 'My Products', to: '/seller/products' },
];

const STORE_KEY = 'yanzee_store_id';

const readSavedStoreId = () => {
  try {
    return localStorage.getItem(STORE_KEY);
  } catch {
    return null;
  }
};

export default function SellerLayout() {
  const { data: stores = [], isLoading, error } = useMyStores();
  const [selectedId, setSelectedId] = useState(readSavedStoreId);

  // the saved store may have been deleted, so fall back to the first one
  const shop = stores.find((s) => s.id === selectedId) ?? stores[0] ?? null;

  const selectStore = (id) => {
    try {
      localStorage.setItem(STORE_KEY, id);
    } catch {
      // ignore: the choice just won't survive a reload
    }
    setSelectedId(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-lg font-bold">Seller Panel</span>
          {shop && stores.length <= 1 && (
            <p className="mt-1 truncate text-xs text-white/60">{shop.name}</p>
          )}
          {stores.length > 1 && (
            <select
              value={shop?.id ?? ''}
              onChange={(e) => selectStore(e.target.value)}
              className="mt-2 w-full rounded bg-white/10 px-2 py-1 text-xs text-white"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} className="text-black">
                  {s.name}
                </option>
              ))}
            </select>
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
        <Outlet
          context={{
            shop,
            setShop: (s) => s && selectStore(s.id),
            stores,
            selectStore,
            shopLoading: isLoading,
            shopError: error?.message ?? '',
          }}
        />
      </main>
    </div>
  );
}