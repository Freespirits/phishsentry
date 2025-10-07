import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/alerts', label: 'Alerts' },
  { to: '/feed', label: 'Feed Stats' },
  { to: '/metrics', label: 'Model Metrics' },
  { to: '/lists', label: 'Block/Allow Lists' }
];

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div>
              <p className="text-lg font-semibold text-brand-dark">PhishSentry</p>
              <p className="text-sm text-slate-500">Ops Dashboard</p>
            </div>
          </div>
          <nav className="mt-4 space-y-1 px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'block rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900',
                    isActive && 'bg-brand text-white hover:bg-brand-dark hover:text-white'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Security Operations</h1>
              <p className="text-sm text-slate-500">
                Monitor alerts, feeds, detection models, and enforcement lists.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-slate-600">{user.email}</span>
                  <button
                    onClick={logout}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    Sign out
                  </button>
                </>
              ) : null}
            </div>
          </header>
          <section className="p-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}

export default Layout;
