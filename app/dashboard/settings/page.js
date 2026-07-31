"use client";

import LogoutBtn from "@/components/LogoutBtn";
import React, { useEffect, useState, useCallback } from "react";
import useAuthStore from "@/app/store/useAuthStore";
import toast from "react-hot-toast";
import {
  User,
  Settings,
  Bell,
  Shield,
  Clipboard,
  Check,
  Mail,
  UserCheck,
  Save,
  Lock,
  Loader2,
  Calendar,
  Image
} from "lucide-react";

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
    image: "",
  });

  const fetchUser = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/users/${authUser.id}`);

      if (!res.ok) {
        throw new Error("Failed to load user");
      }

      const data = await res.json();
      setUser({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "user",
        image: data.image || "",
      });
    } catch (error) {
      toast.error(error.message || "Error loading user");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (authUser?.id) {
      fetchUser();
    }
  }, [authUser?.id, fetchUser]);

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
      updateAuthUser({ name: updatedUser.name, email: updatedUser.email, image: updatedUser.image });
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
        <div className="animate-pulse w-full max-w-4xl">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-850 rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-3 col-span-1">
                <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded"></div>
              </div>
              <div className="col-span-3 space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "account", name: "Account settings", icon: Settings },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 p-4 sm:p-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto animate-fade-in">

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-display">
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage your account preferences, alerts, and security options
          </p>
        </div>

        {/* Outer card grid */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-4 min-h-[500px]">

          {/* Left Navigation Menu */}
          <div className="border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible scrollbar-none">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-sm font-semibold cursor-pointer w-full md:text-left ${isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-slate-200"
                    }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content Panel */}
          <div className="col-span-3 p-6 sm:p-8">

            {/* Profile tab pane */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Profile Information</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Update your visual profile settings and identity details.</p>
                </div>

                <div className="space-y-5">
                  <InputField
                    label="Full Name"
                    value={user.name}
                    onChange={(v) => setUser({ ...user, name: v })}
                    placeholder="John Doe"
                    icon={User}
                  />

                  <InputField
                    label="Email Address"
                    type="email"
                    value={user.email}
                    onChange={(v) => setUser({ ...user, email: v })}
                    placeholder="john@example.com"
                    icon={Mail}
                  />

                  <InputField
                    label="Avatar Image URL (Optional)"
                    value={user.image}
                    onChange={(v) => setUser({ ...user, image: v })}
                    placeholder="https://example.com/avatar.jpg"
                    icon={Image}
                  />


                  <button
                    className="w-full sm:w-auto bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed hover:bg-blue-700 hover:shadow shadow-blue-500/20 active:scale-95 transition-all text-white font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer flex items-center justify-center gap-1.5 self-start"
                    onClick={handleSave}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Account tab pane */}
            {activeTab === "account" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Account settings</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Overview details and general actions relating to your credentials.</p>
                </div>

                {/* Account Details */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-gray-150 dark:border-slate-850/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md overflow-hidden">
                      {user.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-950 dark:text-slate-100">{user.name}</h3>
                      <p className="text-xs text-gray-400 font-semibold uppercase">{user.role}</p>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-slate-850" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    <div className="space-y-1">
                      <p className="text-gray-400 uppercase text-[10px] tracking-wide">Account ID</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-white dark:bg-slate-950 px-2 py-1 border border-gray-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs">
                          {authUser?.id}
                        </span>
                        <CopyIdButton id={authUser?.id} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-gray-450 uppercase text-[10px] tracking-wide">Member Since</p>
                      <div className="flex items-center gap-1.5 text-gray-800 dark:text-slate-200 py-1">
                        <Calendar className="w-4 h-4 text-gray-450" />
                        <span>{new Date(authUser?.created_at || Date.now()).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <LogoutBtn />
                </div>
              </div>
            )}

            {/* Notifications tab pane */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Notifications</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Enable or disable transaction messages and system notifications.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-gray-150 dark:border-slate-850 px-5 py-2 space-y-1">
                  <ToggleItem label="Email notifications for new orders" />
                  <ToggleItem label="Low stock alerts" />
                  <ToggleItem label="Daily sales summary" />
                  <ToggleItem label="Weekly reports" />
                  <ToggleItem label="Product updates" />
                </div>
              </div>
            )}

            {/* Security tab pane */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Security</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage and rotate password credentials safely.</p>
                </div>

                <PasswordChangeForm userId={authUser?.id} />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------- REUSABLE COMPONENTS ----------- */

function InputField({ label, value, onChange, type = "text", placeholder = "", icon: IconComponent }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <IconComponent className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${IconComponent ? 'pl-10' : 'px-4'} pr-4 py-2.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-950 dark:text-slate-250 placeholder-gray-400 text-sm font-semibold`}
        />
      </div>
    </div>
  );
}

function ToggleItem({ label }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-200/50 dark:border-slate-850/60 last:border-b-0">
      <p className="text-gray-800 dark:text-slate-200 text-sm font-medium pr-4">{label}</p>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-800'
          }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );
}

function CopyIdButton({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("User ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
      title="Copy Account ID"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Clipboard className="w-3.5 h-3.5" />}
    </button>
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
    <div className="space-y-5">
      <InputField
        label="Current Password"
        type="password"
        value={passwords.current}
        onChange={(v) => setPasswords({ ...passwords, current: v })}
        placeholder="Enter current password"
        icon={Lock}
      />
      <InputField
        label="New Password"
        type="password"
        value={passwords.new}
        onChange={(v) => setPasswords({ ...passwords, new: v })}
        placeholder="Enter new password"
        icon={Lock}
      />
      <InputField
        label="Confirm New Password"
        type="password"
        value={passwords.confirm}
        onChange={(v) => setPasswords({ ...passwords, confirm: v })}
        placeholder="Confirm new password"
        icon={Lock}
      />

      <button
        className="w-full sm:w-auto bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed hover:bg-blue-700 hover:shadow shadow-blue-500/20 active:scale-95 transition-all text-white font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer flex items-center justify-center gap-1.5"
        onClick={handlePasswordChange}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Updating...</span>
          </>
        ) : (
          <span>Update Password</span>
        )}
      </button>
    </div>
  );
}