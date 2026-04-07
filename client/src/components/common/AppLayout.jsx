import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../features/auth/services/authService";
import logo from "../../assets/logo.png";

export default function AppLayout({ children, fullWidth = true }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith("/admin");
  const dashboardPath = isAdminPage ? "/admin" : "/dashboard";
  const logoPath = isAdminPage ? "/admin" : "/dashboard";

  const navItems = isAdminPage
    ? [{ id: "dashboard", name: "Dashboard", path: dashboardPath }]
    : [
        { id: "dashboard", name: "Dashboard", path: dashboardPath },
        { id: "notes", name: "Notes", path: "/notes" },
        { id: "profile", name: "Profile", path: "/profile" },
      ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/modules/")
      );
    }

    if (path === "/admin") {
      return location.pathname.startsWith("/admin");
    }

    if (path === "/profile") {
      return location.pathname === "/profile";
    }

    if (path === "/notes") {
      return location.pathname === "/notes";
    }

    return location.pathname === path;
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith("/admin")) {
      return "Admin Panel";
    }

    if (
      location.pathname === "/dashboard" ||
      location.pathname.startsWith("/modules/")
    ) {
      return "Dashboard";
    }

    if (location.pathname === "/notes") {
      return "Notes";
    }

    if (location.pathname === "/profile") {
      return "Profile";
    }

    return "LancashiLearns";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-800">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="w-full px-4 md:px-6 xl:px-8">
          <div className="flex min-h-[78px] w-full items-center justify-between gap-4">
            <Link to={logoPath} className="flex items-center gap-3">
              <img
                src={logo}
                alt="LancashiLearns"
                className="h-11 w-11 rounded-2xl shadow-md"
              />

              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                  LancashiLearns
                </h1>
                <p className="text-xs text-slate-500 md:text-sm">
                  University Learning Platform
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                    isActive(item.path)
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right md:block">
                <p className="text-xs font-medium text-slate-500">Current Page</p>
                <p className="text-sm font-semibold text-slate-900">
                  {getPageTitle()}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="flex gap-2 border-t border-slate-200/70 py-3 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                  isActive(item.path)
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main
        className={
          fullWidth
            ? "w-full px-4 py-6 md:px-6 md:py-8 xl:px-8"
            : "w-full px-4 py-6 md:px-6 md:py-8 xl:px-8"
        }
      >
        {children}
      </main>
    </div>
  );
}