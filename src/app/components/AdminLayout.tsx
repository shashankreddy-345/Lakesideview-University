import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { LayoutDashboard, TrendingUp, MessageSquare, Home, LogOut } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      navigate('/');
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity">
            <Home className="w-5 h-5" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <h2 className="text-xl">Admin Portal</h2>
          <p className="text-sm text-sidebar-foreground/70 mt-1">
            Intelligence Layer
          </p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin') 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/insights"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/insights') 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Insights</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/feedback"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin/feedback') 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Feedback Monitor</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="px-4 py-3 bg-sidebar-accent rounded-lg mb-3">
            <p className="text-sm">Logged in as</p>
            <p className="text-sm">CIO Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}