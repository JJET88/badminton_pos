"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import useCartStore from "@/app/store/useCartStore";
import useAuthStore from "@/app/store/useAuthStore";
import { PiShoppingCart } from "react-icons/pi";
import { FiLogOut, FiUser, FiSettings, FiShoppingBag, FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import AvatarDropDown from "./AvatarDropDown";

export default function Header({ search, setSearch }) {
	const { theme, toggleTheme } = useTheme();
	const { carts } = useCartStore();

	const user = useAuthStore((s) => s.user);
	const fetchUser = useAuthStore((s) => s.fetchUser);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const logout = useAuthStore((s) => s.logout);
	
	const [showMobileMenu, setShowMobileMenu] = useState(false);


	// Fetch fresh user data on component mount
	useEffect(() => {
		if (isAuthenticated()) {
			console.log('🔄 Fetching user data on mount...');
			fetchUser();
		}
	}, [isAuthenticated, fetchUser]);

	// Auto-refresh user data every 30 seconds
	useEffect(() => {
		if (!isAuthenticated()) return;

		const interval = setInterval(() => {
			console.log('🔄 Auto-refreshing user data...');
			fetchUser();
		}, 30000);

		return () => clearInterval(interval);
	}, [isAuthenticated, fetchUser]);



	return (
		<header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-xl sticky top-0 z-50">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 sm:h-20">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl font-bold hover:opacity-80 transition-opacity"
					>
						<span className="text-3xl sm:text-4xl">🏸</span>
						<span className="hidden sm:inline">TawBayin</span>
						<span className="sm:hidden text-lg">TB</span>
					</Link>

					{/* Desktop Search Bar */}
					<div className="hidden md:flex flex-1 max-w-2xl mx-8">
						<input
							type="text"
							placeholder="Search products..."
							className="w-full px-4 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					{/* Desktop Right Side */}
					<div className="hidden md:flex items-center gap-4">
						{/* Theme Toggle Button */}
						<button
							onClick={toggleTheme}
							className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center border border-white/10"
							title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
						>
							{theme === 'light' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl text-yellow-400" />}
						</button>

						{/* Cart Button */}
						<Link
							href="/carts"
							className="relative inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-transparent hover:border-green-500 transition-all shadow-sm hover:shadow-md group text-gray-700 dark:text-slate-200"
						>
							<PiShoppingCart className="text-2xl text-gray-700 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />

							{carts.length > 0 && (
								<span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[24px] h-6 px-1 text-[11px] font-bold bg-green-500 text-white rounded-full shadow-lg animate-bounce">
									{carts.length > 99 ? "99+" : carts.length}
								</span>
							)}
						</Link>


						{/* Profile */}
						<AvatarDropDown />
					</div>

					{/* Mobile Menu Button & Cart */}
					<div className="flex md:hidden items-center gap-3">
						{/* Mobile Theme Toggle */}
						<button
							onClick={toggleTheme}
							className="text-white p-2 flex items-center justify-center cursor-pointer"
							title="Toggle Theme"
						>
							{theme === 'light' ? <FiMoon className="text-xl" /> : <FiSun className="text-xl text-yellow-400" />}
						</button>

						{/* Mobile Cart */}
						<Link href="/carts" className="relative">
							<PiShoppingCart className="text-3xl" />
							{carts.length > 0 && (
								<span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
									{carts.length > 9 ? "9+" : carts.length}
								</span>
							)}
						</Link>

						{/* Mobile Menu Toggle */}
						<button
							onClick={() => setShowMobileMenu(!showMobileMenu)}
							className="text-white p-2"
						>
							{showMobileMenu ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
						</button>
					</div>

				</div>

				{/* Mobile Search */}
				<div className="md:hidden pb-4">
					<input
						type="text"
						placeholder="Search products..."
						className="w-full px-4 py-2 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			{/* Mobile Menu */}
			{showMobileMenu && (
				<div className="md:hidden bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border-t border-gray-200 dark:border-slate-800 shadow-lg">
					{isAuthenticated() && user ? (
						<>
							{/* User Info */}
							<div className="px-4 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
										{user.image ? (
											/* eslint-disable-next-line @next/next/no-img-element */
											<img src={user.image} alt={user.name} className="w-full h-full object-cover" />
										) : (
											user.name?.charAt(0).toUpperCase() || "U"
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{user.name}</p>
										<p className="text-xs text-gray-600 dark:text-slate-400 truncate">{user.email}</p>
									</div>
								</div>
								
								{/* Mobile Points Display - FIXED */}
								<div className="mt-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-3">
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
											⭐ Reward Points
										</span>
										<span className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
											{userPoints}
										</span>
									</div>
								</div>
							</div>

							<Link
								href={`/userProfile/${user.id}`}
								onClick={() => setShowMobileMenu(false)}
								className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800"
							>
								<FiUser className="text-xl text-blue-600" />
								<span className="font-medium">My Profile</span>
							</Link>

							<Link
								href="/purchase-history"
								onClick={() => setShowMobileMenu(false)}
								className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800"
							>
								<FiShoppingBag className="text-xl text-green-600" />
								<span className="font-medium">Purchase History</span>
							</Link>

							{(user.role === "admin" || user.role === "cashier") && (
								<Link
									href="/dashboard"
									onClick={() => setShowMobileMenu(false)}
									className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800"
								>
									<FiSettings className="text-xl text-purple-600" />
									<span className="font-medium">
										{user.role === "admin" ? "Admin Dashboard" : "Cashier Dashboard"}
									</span>
								</Link>
							)}

							<button
								onClick={() => {
									setShowMobileMenu(false);
									logout();
								}}
								className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-t border-gray-200 dark:border-slate-800"
							>

								<FiLogOut className="text-xl" />
								<span className="font-medium">Logout</span>
							</button>
						</>
					) : (
						<Link
							href="/login"
							onClick={() => setShowMobileMenu(false)}
							className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50"
						>
							<CgProfile className="text-2xl text-blue-600" />
							<span className="font-medium">Login</span>
						</Link>
					)}
				</div>
			)}
		</header>
	);
}