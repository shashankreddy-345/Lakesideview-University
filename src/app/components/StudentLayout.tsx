import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { Calendar, Search, User, Home, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg text-primary">Campus Resources</h1>
                  <p className="text-xs text-muted-foreground">Lakeside View University</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/student"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/student') 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Browse</span>
                </Link>
                <Link
                  to="/student/bookings"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/student/bookings') 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Bookings</span>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4 relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Student Account</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border z-50">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm">Logged in as</p>
                    <p className="text-sm font-medium">{user?.full_name || user?.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-border">
        <div className="flex items-center justify-around py-2">
          <Link
            to="/student"
            className={`flex flex-col items-center gap-1 px-3 py-2 ${
              isActive('/student') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Browse</span>
          </Link>
          <Link
            to="/student/bookings"
            className={`flex flex-col items-center gap-1 px-3 py-2 ${
              isActive('/student/bookings') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Bookings</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}