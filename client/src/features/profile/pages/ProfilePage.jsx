import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/common/AppLayout";
import { auth } from "../../../firebase/config";
import {
  getUserProfileById,
  updateUserProfileById,
} from "../services/userProfileService";

function getInitials(name) {
  if (!name) return "ST";

  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    academicYear: "",
    semester: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const user = auth.currentUser;

        if (!user) {
          setError("No authenticated user found.");
          return;
        }

        const profile = await getUserProfileById(user.uid);

        if (!profile) {
          setError("User profile not found.");
          return;
        }

        setFormData({
          fullName: profile.fullName || "",
          email: profile.email || user.email || "",
          academicYear: profile.academicYear ? String(profile.academicYear) : "",
          semester: profile.semester ? String(profile.semester) : "",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const initials = useMemo(() => getInitials(formData.fullName), [formData.fullName]);

  const profileCompletion = useMemo(() => {
    let completed = 0;
    if (formData.fullName.trim()) completed += 1;
    if (formData.email.trim()) completed += 1;
    if (formData.academicYear) completed += 1;
    if (formData.semester) completed += 1;
    return Math.round((completed / 4) * 100);
  }, [formData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const user = auth.currentUser;

    if (!user) {
      setError("No authenticated user found.");
      return;
    }

    const trimmedName = formData.fullName.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    try {
      setSaving(true);

      await updateUserProfileById(user.uid, {
        fullName: trimmedName,
        academicYear: formData.academicYear || null,
        semester: formData.semester || null,
      });

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 shadow-sm">
            <div className="space-y-3">
              <div className="h-4 w-28 rounded bg-white/20 animate-pulse" />
              <div className="h-10 w-56 rounded bg-white/20 animate-pulse" />
              <div className="h-4 w-80 max-w-full rounded bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-3xl bg-slate-200 animate-pulse" />
                <div className="mt-4 h-6 w-40 rounded bg-slate-200 animate-pulse" />
                <div className="mt-2 h-4 w-56 rounded bg-slate-200 animate-pulse" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-5">
                <div className="h-6 w-44 rounded bg-slate-200 animate-pulse" />
                <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                  <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                </div>
                <div className="h-12 w-40 rounded-xl bg-slate-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 shadow-sm">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                Student Profile
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">
                My Profile
              </h1>
              <p className="mt-3 max-w-2xl text-slate-200 leading-relaxed">
                View and update your personal academic details so the platform
                can show the correct learning materials and module structure.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100">Profile Completion</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {profileCompletion}%
              </p>
            </div>
          </div>

          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 left-20 h-44 w-44 rounded-full bg-blue-400/10 blur-2xl" />
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-2xl font-bold text-white shadow-sm">
                  {initials}
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-800">
                  {formData.fullName.trim() || "Student Name"}
                </h2>

                <p className="mt-1 break-all text-slate-500">
                  {formData.email || "No email available"}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Academic Year</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">
                    {formData.academicYear ? `Year ${formData.academicYear}` : "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Semester</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">
                    {formData.semester ? `Semester ${formData.semester}` : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-700">Student Tip</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Keep your academic year and semester updated so the platform can
                display the most relevant modules and learning materials for you.
              </p>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Profile Details
              </h2>
              <p className="mt-2 text-slate-600">
                Update your personal details and academic information below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Your email address is linked to your login account and cannot
                  be edited here.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Academic Year
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select year</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving Changes..." : "Update Profile"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}