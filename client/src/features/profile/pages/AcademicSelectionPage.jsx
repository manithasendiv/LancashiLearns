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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Academic Selection
        </h1>
        <p className="text-slate-500 text-center mb-6">
          Choose your academic year and semester
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save and Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}