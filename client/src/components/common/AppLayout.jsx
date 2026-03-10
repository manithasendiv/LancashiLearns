import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../features/auth/services/authService";

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [{ id: "dashboard", name: "Dashboard", path: "/dashboard" }];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/modules/") ||
        location.pathname.startsWith("/admin")
      );
    }

    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">LancashiLearns</h1>
            <p className="text-sm text-slate-500">University Learning Platform</p>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}