import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../features/auth/services/authService";

export default function AppLayout({ children, fullWidth = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", name: "Dashboard", path: "/dashboard" },
    { id: "profile", name: "Profile", path: "/profile" },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/modules/") ||
        location.pathname.startsWith("/admin")
      );
    }

    if (path === "/profile") {
      return location.pathname === "/profile";
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
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              LancashiLearns
            </h1>
            <p className="text-sm text-slate-500">University Learning Platform</p>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main
        className={
          fullWidth
            ? "w-full px-6 py-8"
            : "mx-auto max-w-7xl px-6 py-8"
        }
      >
        {children}
      </main>
    </div>
  );
}