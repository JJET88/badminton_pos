"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/app/store/useAuthStore";

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login for:', form.email);

      // Use the login function from store
      const result = await login(form);

      console.log('📥 Login result:', result);

      if (result.success && result.user) {
        console.log('✅ Login successful, redirecting...');
        
        // Redirect based on role
        if (result.user.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } else {
        setErrorMsg(result.error || "Invalid email or password");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setErrorMsg(err.message || "An error occurred during login");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 font-display">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-slate-400">Sign in to your account</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <span>❌</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-900 dark:text-slate-200 font-medium mb-2">
              Email Address
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

          <div>
            <label className="block text-gray-900 dark:text-slate-200 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-gray-300 dark:border-slate-800 rounded focus:ring-2 focus:ring-blue-500 text-blue-600 dark:bg-slate-950"
              />
              <span className="ml-2 text-gray-700 dark:text-slate-300 text-sm">Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium text-sm"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-white font-semibold py-3 px-4 rounded-lg cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="text-center pt-4">
            <span className="text-gray-600 dark:text-slate-400">Don't have an account yet? </span>
            <Link
              href="/register"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-semibold"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );

}