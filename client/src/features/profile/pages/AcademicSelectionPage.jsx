import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/config";
import { saveAcademicSelection } from "../services/profileService";

export default function AcademicSelectionPage() {
  const navigate = useNavigate();

  const [academicYear, setAcademicYear] = useState("1");
  const [semester, setSemester] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      setError("No authenticated user found.");
      return;
    }

    try {
      setLoading(true);
      await saveAcademicSelection(user.uid, academicYear, semester);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save academic details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 text-white p-12">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-green-100">
              LancashiLearns
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Personalise your
              <br />
              learning dashboard.
            </h1>
            <p className="mt-6 max-w-md text-green-100 leading-relaxed">
              Select your academic year and semester so the platform can show
              only the modules and materials relevant to you.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <h3 className="font-semibold text-lg">Relevant modules only</h3>
              <p className="text-sm text-green-100 mt-2">
                Your dashboard will automatically display the modules assigned to
                your selected year and semester.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-5">
              <h3 className="font-semibold text-lg">Built for easy access</h3>
              <p className="text-sm text-green-100 mt-2">
                View materials, save personal notes, and practise programming
                from one platform.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-4 py-1 text-sm font-medium">
                Academic Setup
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-800">
                Select your academic details
              </h2>
              <p className="mt-2 text-slate-500">
                Choose your academic year and semester to continue.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full border border-slate-300 bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-slate-700">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full border border-slate-300 bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-70"
                >
                  {loading ? "Saving..." : "Save and Continue"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}