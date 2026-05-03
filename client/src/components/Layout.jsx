import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  Menu,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navLinks = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Projects", path: "/projects", icon: <FolderKanban size={20} /> },
    { name: "Tasks", path: "/tasks", icon: <CheckSquare size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white tracking-wide">
          <span className="text-emerald-500">Team</span>Task
        </h1>
      </div>
      <div className="flex-1 py-6 px-4">
        <div className="mb-8 px-2">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-2">
            Menu
          </p>
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 transition-all ${
                  location.pathname === link.path
                    ? "bg-royal-blue text-white border-l-4 border-emerald-500 font-semibold"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white border-l-4 border-transparent"
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-900/50 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Layout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 md:hidden bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <h1 className="text-xl font-bold text-white tracking-wide">
            <span className="text-emerald-500">Team</span>Task
          </h1>
          <button className="text-slate-300 hover:text-white">
            <Menu size={24} />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
