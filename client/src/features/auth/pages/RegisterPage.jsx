import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
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

    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await registerUser({ fullName, email, password });
      navigate("/academic-selection");
    } catch (err) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-600 text-white p-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-100">
              LancashiLearns
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Start your learning
              <br />
              journey here.
            </h1>
            <p className="mt-6 max-w-md text-blue-100 leading-relaxed">
              Create your student account to access modules, learning materials,
              personal notes, and interactive coding tools in one platform.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <h3 className="font-semibold text-lg">Personalised modules</h3>
              <p className="text-sm text-blue-100 mt-2">
                View the subjects that match your academic year and semester.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <h3 className="font-semibold text-lg">Study and practice together</h3>
              <p className="text-sm text-blue-100 mt-2">
                Read materials, save notes, and run programming code without leaving the app.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-4 py-1 text-sm font-medium">
                Student Registration
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-800">
                Create your account
              </h2>
              <p className="mt-2 text-slate-500">
                Register to access your university learning dashboard.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full border border-slate-300 bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

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
                    placeholder="Create a password"
                    className="w-full border border-slate-300 bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className="w-full border border-slate-300 bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-70"
                >
                  {loading ? "Creating Account..." : "Register"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-600 mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}