"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    role: "user" 
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    // Validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return setErr("Please fill in all fields");
    }

    if (form.name.trim().length < 2) {
      return setErr("Name must be at least 2 characters long");
    }

    if (form.password.length < 6) {
      return setErr("Password must be at least 6 characters long");
    }

    if (form.password !== form.confirmPassword) {
      return setErr("Passwords do not match");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return setErr("Please enter a valid email address");
    }

    setIsLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role
      };

      console.log('📤 Sending registration data:', { ...payload, password: '***' });

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('📥 Response:', data);

      if (!res.ok) {
        setIsLoading(false);
        return setErr(data.error || data.message || "Registration failed");
      }

      setMsg("✅ Account created successfully! Redirecting to Login...");
      setTimeout(() => router.push("/login"), 1500);
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      setIsLoading(false);
      setErr("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 font-display">
            Create an account
          </h1>
          <p className="text-gray-600 dark:text-slate-400">Join us today and get started</p>
        </div>

        {msg && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
            <span>✅</span>
            <span>{msg}</span>
          </div>
        )}

        {err && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <span>❌</span>
            <span>{err}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-gray-900 dark:text-slate-200 font-medium mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              required
              minLength={2}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-slate-200 placeholder-gray-400"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-900 dark:text-slate-200 font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@company.com"
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-slate-200 placeholder-gray-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-900 dark:text-slate-200 font-medium mb-2">
              Password *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-slate-200 placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
              Must be at least 6 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-900 dark:text-slate-200 font-medium mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-slate-200 placeholder-gray-400"
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                ❌ Passwords do not match
              </p>
            )}
            {form.confirmPassword && form.password === form.confirmPassword && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✅ Passwords match
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-900 dark:text-slate-200 font-medium mb-2">
              Account Type *
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-slate-200 cursor-pointer"
            >
              <option value="user">User</option>
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-white font-semibold py-3 px-4 rounded-lg cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <span className="text-gray-600 dark:text-slate-400">Already have an account? </span>
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-semibold"
            >
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}