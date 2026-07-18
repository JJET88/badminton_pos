"use client";

import LogoutBtn from "@/components/LogoutBtn";
import { useEffect, useState } from "react";
import useAuthStore from "@/app/store/useAuthStore";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const authUser = useAuthStore((s) => s.user);
  const updateAuthUser = useAuthStore((s) => s.updateUser);

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  });

  const fetchUser = async () => {
    if (!authUser?.id) {
      toast.error("Please login first");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/users/${authUser.id}`);
      
      if (!res.ok) {
        throw new Error("Failed to load user");
      }

      const data = await res.json();
      setUser({
        name: data.name,
        email: data.email,
        role: data.role,
      });
    } catch (error) {
      toast.error(error.message || "Error loading user");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [authUser]);

  const handleSave = async () => {
    if (!authUser?.id) return;

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/users/${authUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update profile");
      }

      const updatedUser = await res.json();
      updateAuthUser({ name: updatedUser.name, email: updatedUser.email });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Update failed");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 text-slate-800 dark:text-slate-100">
        <div className="animate-pulse w-full max-w-2xl">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-slate-800 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 sm:h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
              <div className="h-10 sm:h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
              <div className="h-10 sm:h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6 font-display">Settings</h1>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg shadow mb-4 sm:mb-6 overflow-hidden">
          <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
            {[
              { id: "profile", name: "Profile", icon: "👤" },
              { id: "account", name: "Account", icon: "⚙️" },
              { id: "notifications", name: "Notifications", icon: "🔔" },
              { id: "security", name: "Security", icon: "🔒" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base cursor-pointer ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500"
                    : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6">Profile Information</h2>

              <div className="space-y-4 sm:space-y-5">
                <InputField
                  label="Name"
                  value={user.name}
                  onChange={(v) => setUser({ ...user, name: v })}
                  placeholder="John Doe"
                />

                <InputField
                  label="Email"
                  type="email"
                  value={user.email}
                  onChange={(v) => setUser({ ...user, email: v })}
                  placeholder="john@example.com"
                />

                <div>
                  <label className="block text-gray-950 dark:text-slate-250 font-medium mb-2 text-sm sm:text-base">Role</label>
                  <select
                    value={user.role}
                    onChange={(e) => setUser({ ...user, role: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-805 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-slate-200 text-sm sm:text-base cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  className="w-full sm:w-auto bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-white font-medium px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base cursor-pointer"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6">Account Settings</h2>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-300">
                  <strong>Account ID:</strong> {authUser?.id}
                </p>
                <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-300 mt-1">
                  <strong>Member since:</strong> {new Date(authUser?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>

              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mb-4 sm:mb-6">
                Manage your account preferences and settings here.
              </p>

              <div className="flex gap-3">
                <LogoutBtn />
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6">Notifications</h2>

              <div className="space-y-3 sm:space-y-4">
                <ToggleItem label="Email notifications for new orders" />
                <ToggleItem label="Low stock alerts" />
                <ToggleItem label="Daily sales summary" />
                <ToggleItem label="Weekly reports" />
                <ToggleItem label="Product updates" />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6">Security</h2>

              <PasswordChangeForm userId={authUser?.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------- REUSABLE COMPONENTS ----------- */

function InputField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-gray-950 dark:text-slate-250 font-medium mb-2 text-sm sm:text-base">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-805 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-slate-250 placeholder-gray-400 text-sm sm:text-base"
      />
    </div>
  );
}

function ToggleItem({ label }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-200 dark:border-slate-805">
      <p className="text-gray-900 dark:text-slate-200 text-sm sm:text-base pr-4">{label}</p>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-800'
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function PasswordChangeForm({ userId }) {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("All fields are required");
      return;
    }

    if (passwords.new.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully!");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <InputField
        label="Current Password"
        type="password"
        value={passwords.current}
        onChange={(v) => setPasswords({ ...passwords, current: v })}
        placeholder="Enter current password"
      />
      <InputField
        label="New Password"
        type="password"
        value={passwords.new}
        onChange={(v) => setPasswords({ ...passwords, new: v })}
        placeholder="Enter new password"
      />
      <InputField
        label="Confirm New Password"
        type="password"
        value={passwords.confirm}
        onChange={(v) => setPasswords({ ...passwords, confirm: v })}
        placeholder="Confirm new password"
      />

      <button
        className="w-full sm:w-auto bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-white font-medium px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base cursor-pointer"
        onClick={handlePasswordChange}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Updating...
          </span>
        ) : 'Update Password'}
      </button>
    </div>
  );
}