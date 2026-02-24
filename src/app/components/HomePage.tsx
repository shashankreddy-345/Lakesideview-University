import { useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Users, LogIn, Lock, Mail } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || '';
    
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userId', user._id);
        
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      } else {
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-primary p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-primary-foreground/80">
            Lakeside View University's Resource Management System
          </p>
        </div>

        {/* Role Toggles */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setRole('student')}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              role === 'student'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Users className="w-4 h-4" />
            Student Portal
          </button>
          <button
            onClick={() => setRole('admin')}
            className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              role === 'admin'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin Portal
          </button>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? "student@university.edu" : "admin@university.edu"}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In as {role === 'student' ? 'Student' : 'Administrator'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-primary hover:underline">
              User Name is email, Password is password123
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground mb-4 uppercase tracking-wider font-semibold">Demo Accounts</p>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => performLogin('sophia.young10@lakeside.edu', 'password123')}
                className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 py-2 px-3 rounded border border-purple-200 transition-colors text-left flex justify-between items-center"
              >
                <span className="font-medium">Sophia Young (Admin)</span>
                <span className="opacity-70">sophia.young10@lakeside.edu</span>
              </button>
              <button
                type="button"
                onClick={() => performLogin('noah.jackson11@lakeside.edu', 'password123')}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 px-3 rounded border border-blue-200 transition-colors text-left flex justify-between items-center"
              >
                <span className="font-medium">Noah Jackson (Student)</span>
                <span className="opacity-70">noah.jackson11@lakeside.edu</span>
              </button>
              <button
                type="button"
                onClick={() => performLogin('hannah.thomas12@lakeside.edu', 'password123')}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 px-3 rounded border border-blue-200 transition-colors text-left flex justify-between items-center"
              >
                <span className="font-medium">Hannah Thomas (Student)</span>
                <span className="opacity-70">hannah.thomas12@lakeside.edu</span>
              </button>
              <button
                type="button"
                onClick={() => performLogin('zoe.smith13@lakeside.edu', 'password123')}
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 py-2 px-3 rounded border border-blue-200 transition-colors text-left flex justify-between items-center"
              >
                <span className="font-medium">Zoe Smith (Student)</span>
                <span className="opacity-70">zoe.smith13@lakeside.edu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}