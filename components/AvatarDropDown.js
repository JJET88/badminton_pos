"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useAuthStore from "@/app/store/useAuthStore";
import { CgProfile } from "react-icons/cg";
import { FiLogOut, FiUser, FiSettings, FiShoppingBag } from "react-icons/fi";

export default function AvatarDropDown() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.profile-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const userPoints = user?.points ?? 0;

  return (
    <div className="relative profile-dropdown-container">
      {isAuthenticated() && user ? (
        <>
          {/* Profile Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all relative cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md relative">
              {user.name?.charAt(0).toUpperCase() || "U"}

              {/* Small Points Badge */}
              {userPoints > 0 && (
                <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                  {userPoints > 999 ? "999+" : userPoints}
                </span>
              )}
            </div>

            <span className="text-sm font-medium max-w-[100px] truncate">
              {user.name?.split(" ")[0] || "User"}
            </span>

            <svg
              className={`w-4 h-4 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-850">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300"
                        : "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {user.role?.toUpperCase()}
                  </span>
                </div>

                {/* Points Display */}
                <div className="mt-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-yellow-900/30 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-yellow-800 dark:text-amber-400">
                      ⭐ Reward Points
                    </span>
                    <span className="text-lg font-extrabold text-yellow-900 dark:text-amber-200">
                      {userPoints}
                    </span>
                  </div>
                  <p className="text-[10px] text-yellow-600 dark:text-amber-500 mt-0.5">
                    10 points = $1 discount
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <Link
                href={`/userProfile/${user.id}`}
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <FiUser className="text-lg text-blue-600" />
                <span className="font-medium">My Profile</span>
              </Link>

              <Link
                href="/purchase-history"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <FiShoppingBag className="text-lg text-green-600" />
                <span className="font-medium">Purchase History</span>
              </Link>

              {user.role === "admin" && (
                <Link
                  href="/dashboard"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <FiSettings className="text-lg text-purple-600" />
                  <span className="font-medium">Admin Dashboard</span>
                </Link>
              )}

              <hr className="my-2 border-gray-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium cursor-pointer"
              >
                <FiLogOut className="text-lg" />
                Logout
              </button>
            </div>
          )}
        </>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-blue-800 font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
        >
          <CgProfile className="text-xl" />
          <span>Login</span>
        </Link>
      )}
    </div>
  );
}
