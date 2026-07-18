"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import useAuthStore from "@/app/store/useAuthStore";
import { useParams, useRouter } from "next/navigation";
import LogoutBtn from "./LogoutBtn";
import { 
  FiArrowLeft, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiCalendar, 
  FiCopy, 
  FiCheck, 
  FiAward, 
  FiHash 
} from "react-icons/fi";

export default function UserProfile() {
  const params = useParams();
  const userId = params.id;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const updateAuthUser = useAuthStore((s) => s.updateUser);
  const authUser = useAuthStore((s) => s.user);

  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error);
      }
      
      const data = await res.json();
      setUser(data);
      setName(data.name);
      setEmail(data.email);
    } catch (err) {
      toast.error(err.message || 'Failed to load user');
      console.error('❌ Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch user on mount
  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id.toString());
    setCopied(true);
    toast.success("User ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!name || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }

    if (!email || !email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password validation if provided
    if (password) {
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }
    
    try {
      setIsUpdating(true);
      
      const updateData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: user.role
      };

      // Only include password if it's not empty
      if (password && password.trim() !== "") {
        updateData.password = password;
      }

      console.log('📤 Updating user:', { ...updateData, password: updateData.password ? '***' : undefined });

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || 'Update failed');
      }
      
      const updatedUser = await res.json();
      console.log('✅ User updated:', updatedUser);
      
      setUser(updatedUser);
      
      // Update auth store only if updating own profile
      if (authUser?.id == userId) {
        updateAuthUser({ name: updatedUser.name, email: updatedUser.email });
      }
      
      // Clear password fields
      setPassword("");
      setConfirmPassword("");
      
      toast.success('Profile updated successfully!');
      
      // Redirect after 1 second
      setTimeout(() => {
        router.push("/");
      }, 1000);
      
    } catch (err) {
      toast.error(err.message || 'Update failed');
      console.error('❌ Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-100 to-indigo-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="animate-pulse w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center">
            <div className="h-24 w-24 bg-gray-200 dark:bg-slate-800 rounded-full mb-4"></div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-slate-800 rounded mb-6"></div>
            <div className="h-20 w-full bg-gray-200 dark:bg-slate-800 rounded mb-4"></div>
            <div className="h-10 w-full bg-gray-200 dark:bg-slate-800 rounded mt-auto"></div>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-slate-800 rounded"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-100 to-indigo-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2 font-display">User not found</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">The user you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-100 to-indigo-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 flex items-center justify-center p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Profile Overview Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-3xl shadow-xl p-6 flex flex-col items-center relative overflow-hidden transition-all duration-300">
          {/* Top Decorative bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
          
          {/* Avatar Container */}
          <div className="relative group mb-4 mt-2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg ring-4 ring-blue-55 dark:ring-slate-800/50 transition-all group-hover:scale-105">
              {name.charAt(0).toUpperCase()}
            </div>
            {/* Floating Role Badge */}
            <span className={`absolute bottom-0 right-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border-2 border-white dark:border-slate-900 shadow-md ${
              user.role === 'admin' 
                ? 'bg-purple-600 text-white' 
                : 'bg-blue-600 text-white'
            }`}>
              {user.role.toUpperCase()}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 truncate w-full text-center">
            {user.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 truncate w-full text-center">
            {user.email}
          </p>

          {/* Points Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-yellow-900/30 rounded-2xl p-4 w-full mb-6">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold mb-1 text-sm">
              <FiAward className="text-lg" />
              <span>Loyalty Points</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-amber-900 dark:text-amber-200">
                {user.points ?? 0}
              </span>
              <span className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium">pts</span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-500/95 mt-2 font-medium">
              Rate: 10 points = ฿1 discount
            </p>
          </div>

          {/* User Meta List */}
          <div className="w-full space-y-4 text-xs mb-6 pt-4 border-t border-gray-100 dark:border-slate-800">
            {/* User ID */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 font-medium">
                <FiHash />
                <span>User ID</span>
              </div>
              <button 
                onClick={handleCopyId}
                className="flex items-center gap-1 font-mono text-gray-900 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title="Copy User ID"
              >
                <span>{user.id}</span>
                {copied ? <FiCheck className="text-green-500" /> : <FiCopy className="text-gray-400" />}
              </button>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 font-medium">
                <FiCalendar />
                <span>Joined</span>
              </div>
              <span className="text-gray-900 dark:text-slate-200">
                {new Date(user.createdAt || user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Logout button at bottom of profile overview */}
          <div className="w-full mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-center">
            <LogoutBtn />
          </div>
        </div>

        {/* Right Column - Profile Edit Form */}
        <div className="md:col-span-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-3xl shadow-xl p-6 md:p-8 flex flex-col relative overflow-hidden transition-all duration-300">
          
          {/* Header & Go Back */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer self-start sm:self-auto bg-gray-50 dark:bg-slate-800/40 hover:bg-gray-100 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-full"
            >
              <FiArrowLeft />
              <span className="font-semibold">Go Back</span>
            </button>
            
            <div className="text-left sm:text-right">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 font-display">
                Profile Settings
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Manage and update your login credentials
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6 flex-grow flex flex-col">
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-slate-200 font-semibold mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400 dark:text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    minLength={2}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/55 focus:border-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-slate-200 font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400 dark:text-slate-500" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/55 focus:border-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <FiLock className="text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">
                    Security Credentials
                  </h3>
                </div>
                
                {/* New Password */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 dark:text-slate-300 font-medium mb-2">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    minLength={6}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/55 focus:border-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 transition-all font-medium"
                  />
                  {password && password.length < 6 && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                      <span>❌ Password must be at least 6 characters</span>
                    </p>
                  )}
                  {password && password.length >= 6 && (
                    <p className="text-xs text-green-500 dark:text-green-400 mt-1.5 flex items-center gap-1 font-medium">
                      <span>✅ Password length is valid</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                {password && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm text-gray-600 dark:text-slate-300 font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      minLength={6}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/55 focus:border-transparent text-gray-900 dark:text-slate-100 placeholder-gray-400 transition-all font-medium"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                        <span>❌ Passwords do not match</span>
                      </p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-500 dark:text-green-400 mt-1.5 flex items-center gap-1 font-medium">
                        <span>✅ Passwords match</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 mt-auto">
              <button
                type="submit"
                disabled={isUpdating || (password && password !== confirmPassword)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile Settings</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}