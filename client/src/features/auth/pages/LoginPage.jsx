import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginUser,
  getUserProfile,
  createMissingUserProfile
} from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const user = await loginUser({ email, password });

      let profile = await getUserProfile(user.uid);

      if (!profile) {
        await createMissingUserProfile(user);
        profile = await getUserProfile(user.uid);
      }

      if (!profile.profileCompleted) {
        navigate("/academic-selection");
      } else if (profile.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-100"
      data-testid="login-page"
    >
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-100">
              LancashiLearns
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Learn smarter,
              <br />
              all in one place.
            </h1>
            <p className="mt-6 max-w-md text-blue-100 leading-relaxed">
              Access your modules, study materials, personal notebook, and code
              lab through one modern university learning platform.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <h3 className="font-semibold text-lg">Organised learning</h3>
              <p className="text-sm text-blue-100 mt-2">
                View only the modules relevant to your academic year and semester.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <h3 className="font-semibold text-lg">Built for computing students</h3>
              <p className="text-sm text-blue-100 mt-2">
                Keep notes, open learning resources, and run code inside the same platform.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div
                className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-4 py-1 text-sm font-medium"
                data-testid="login-badge"
              >
                Student Login
              </div>
              <h2
                className="mt-4 text-3xl font-bold text-slate-800"
                data-testid="login-title"
              >
                Welcome back
              </h2>
              <p className="mt-2 text-slate-500">
                Sign in to continue to your learning dashboard.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                data-testid="login-form"
              >
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your university email"
                    data-testid="login-email"
                    className="w-full border border-slate-300 bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    data-testid="login-password"
                    className="w-full border border-slate-300 bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {error && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                    data-testid="login-error"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-70"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-600 mt-6">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  data-testid="register-link"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}