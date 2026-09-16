import { NavLink, Outlet, Link } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Users', to: '/admin/users' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-black text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="text-lg font-bold">YANZEE Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
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
        <Outlet />
      </main>
    </div>
  );
}