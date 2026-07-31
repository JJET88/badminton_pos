"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { 
  FiHome, 
  FiPackage, 
  FiShoppingCart, 
  FiTag, 
  FiUsers, 
  FiSettings,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiSun,
  FiMoon
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function DashboardLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();


  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🔐 ROLE-BASED PROTECTION
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const allowedRoles = ["admin", "cashier"];
    if (!allowedRoles.includes(user.role)) {
      router.replace("/accessDeny");
      return;
    }

    // Cashier cannot access products, vouchers, or user management folders
    if (user.role === "cashier") {
      const forbiddenPaths = [
        "/dashboard/products",
        "/dashboard/voucher",
        "/dashboard/users",
        "/dashboard/userManage"
      ];
      if (forbiddenPaths.includes(pathname)) {
        router.replace("/accessDeny");
      }
    }
  }, [user, pathname, router]);

  const menu = [
    { name: "Home", path: "/", icon: FiExternalLink },
    { name: "Dashboard", path: "/dashboard", icon: FiHome },
    { name: "Products", path: "/dashboard/products", icon: FiPackage },
    { name: "View Sales", path: "/dashboard/sales", icon: FiShoppingCart },
    { name: "Voucher", path: "/dashboard/voucher", icon: FiTag },
    { name: "Users", path: "/dashboard/users", icon: FiUsers },
    { name: "Settings", path: "/dashboard/settings", icon: FiSettings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`
          bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-50
          fixed lg:sticky top-0 h-screen flex flex-col
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 w-64
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Desktop Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg hidden lg:flex items-center justify-center transition-colors text-gray-600 dark:text-slate-400 cursor-pointer"
              aria-label="Toggle sidebar"
            >
              {collapsed ? (
                <FiChevronRight className="text-xl" />
              ) : (
                <FiChevronLeft className="text-xl" />
              )}
            </button>

            {/* Title */}
            {!collapsed && (
              <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Dashboard</h1>
            )}
          </div>

          {/* Theme toggler when expanded */}
          {!collapsed && (
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg hidden lg:flex items-center justify-center transition-colors text-gray-600 dark:text-slate-400 cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'light' ? <FiMoon className="text-lg" /> : <FiSun className="text-lg text-yellow-500" />}
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors text-gray-600 dark:text-slate-400 cursor-pointer"
            aria-label="Close menu"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Theme Toggle Button for Collapsed Mode */}
        {collapsed && (
          <div className="flex justify-center p-3 border-b border-gray-200 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-gray-600 dark:text-slate-400"
              title="Toggle Theme"
            >
              {theme === 'light' ? <FiMoon className="text-lg" /> : <FiSun className="text-lg text-yellow-500" />}
            </button>
          </div>
        )}


        {/* Go to Home Button */}
        {/* <div className={`p-3 border-b border-gray-200 ${collapsed ? "lg:px-2" : ""}`}>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
              text-white font-medium shadow-sm hover:shadow-md
              ${collapsed ? "lg:justify-center lg:px-3" : ""}
            `}
            title={collapsed ? "Go to Store" : undefined}
          >
            <FiExternalLink className="text-lg flex-shrink-0" />
            <span className={`${collapsed ? "lg:hidden" : ""}`}>
              Go to Store
            </span>
          </Link>
        </div> */}

        {/* Navigation Menu */}
        <nav className="flex-1 flex flex-col space-y-1 p-3 overflow-y-auto">
          {menu
            .filter(item => {
              if (user?.role === "cashier") {
                return !["/dashboard/products", "/dashboard/voucher", "/dashboard/users"].includes(item.path);
              }
              return true;
            })
            .map((item) => {
            const active = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-lg transition-all
                  ${
                    active
                      ? "bg-blue-600 text-white font-semibold shadow-sm"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }
                  ${collapsed ? "lg:justify-center lg:px-4" : "lg:px-4"}
                `}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`text-xl flex-shrink-0 ${active ? 'text-white' : 'text-gray-600 dark:text-slate-400'}`} />

                {/* Hide text in collapsed mode (desktop only) */}
                <span className={`flex-1 ${collapsed ? "lg:hidden" : ""}`}>
                  {item.name}
                </span>

                {/* Count */}
                {item.count && (
                  <span className={`text-sm ${collapsed ? "lg:hidden" : ""} ${
                    active ? 'text-white' : 'text-gray-600 dark:text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>


        {/* User Info (Bottom of sidebar) */}
        {user && !collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-800">
            <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800/40 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                  {user.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <span className={`inline-block mt-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300' 
                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
              }`}>
                {user.role?.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Collapsed User Avatar */}
        {user && collapsed && (
          <div className="hidden lg:flex p-4 border-t border-gray-200 dark:border-slate-800 justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 bg-gray-50 dark:bg-slate-950">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-sm text-slate-800 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-slate-400 cursor-pointer"
              aria-label="Open menu"
            >
              <FiMenu className="text-xl" />
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-600 dark:text-slate-400 cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'light' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl text-yellow-500" />}
              </button>
              
              <Link
                href="/products"
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-green-600 dark:text-green-400"
                aria-label="Go to store"
              >
                <FiExternalLink className="text-xl" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-950 overflow-x-hidden text-slate-800 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );

}