import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Upload from './pages/Upload';
import Review from './pages/Review';
import Records from './pages/Records';
import Overview from './pages/Overview';

const NAV_LINKS = [
  { to: '/', label: 'New Document', icon: '📋' },
  { to: '/records', label: 'Records', icon: '🗂️' },
  { to: '/overview', label: 'Overview', icon: '📊' },
];

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-gray-900 border-r border-gray-700 flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-700">
        <p className="text-emerald-400 font-black text-xl tracking-widest">🏭 DocFlow</p>
        <p className="text-gray-500 text-xs mt-1">Manufacturing OCR System</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-gray-600 text-xs">v1.0.0 · DocFlow</p>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <main className="ml-56 flex-1 p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/review/:id" element={<Review />} />
            <Route path="/records" element={<Records />} />
            <Route path="/overview" element={<Overview />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}