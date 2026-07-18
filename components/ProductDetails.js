/* eslint-disable @next/next/no-img-element */
"use client";

import useCartStore from "@/app/store/useCartStore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProductDetails({ id }) {
	const [product, setProduct] = useState(null);
	const [loading, setLoading] = useState(true);

	const { carts, addCart } = useCartStore();

	const showToast = (msg, type = "success") => {
		type === "error" ? toast.error(msg) : toast.success(msg);
	};

	useEffect(() => {
		if (!id) return;

		fetch(`/api/products/${id}`)
			.then((res) => res.json())
			.then((data) => {
				if (data?.message === "Product not found") {
					setProduct(null);
				} else {
					setProduct(data);
				}
				setLoading(false);
			})
			.catch(() => {
				setProduct(null);
				setLoading(false);
			});
	}, [id]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
				<p className="text-gray-600 dark:text-slate-400 text-lg animate-pulse">
					Loading product details...
				</p>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
				<p className="text-gray-600 dark:text-slate-400 text-lg">❌ Product not found.</p>
			</div>
		);
	}

	// 🛒 ADD TO CART
	const handleAddToCart = (e, productId) => {
		e.stopPropagation();

		if (carts.find((c) => c.productId === productId)) {
			return showToast("Item already in cart!", "error");
		}

		addCart({
			id: Date.now(),
			productId,
			quantity: 1,
			title: product.title,
			price: product.price,
			image: product.image,
		});
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
			<div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden w-full max-w-5xl border border-transparent dark:border-slate-800">
				{/* Header */}
				<div className="p-6 border-b border-transparent bg-gradient-to-r from-blue-600 to-indigo-500 text-white text-center">
					<h1 className="text-3xl md:text-4xl font-bold font-display">🛍️ Product Details</h1>
				</div>

				{/* Body */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
					{/* Image */}
					<div className="flex justify-center">
						<img
							src={product.image || "/default-image.png"}
							alt={product.title}
							className="w-full max-w-sm h-auto rounded-2xl shadow-md object-cover hover:scale-105 transition duration-300 bg-white dark:bg-slate-950 p-4 border border-gray-100 dark:border-slate-800"
						/>
					</div>

					{/* Info */}
					<div className="flex flex-col justify-center space-y-5">
						<h2 className="text-3xl font-semibold text-gray-800 dark:text-slate-100">
							{product.title}
						</h2>

						<p className="text-gray-500 dark:text-slate-400">
							Category:{" "}
							<span className="text-blue-600 dark:text-blue-400 font-medium">
								{product.category}
							</span>
						</p>
						<div className="border-t border-gray-200 dark:border-slate-800 pt-5">
							<h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
								Description
							</h3>
							<p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">
								{product.description || "No description available."}
							</p>
						</div>

						<p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
							💵 ฿{product.price}
						</p>

						<p className="text-gray-500 dark:text-slate-400 text-sm">
							Stock:{" "}
							<span
								className={
									product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
								}
							>
								{product.stock > 0 ? product.stock : "Out of stock"}
							</span>
						</p>

						<div className="flex flex-wrap gap-3 mt-6">
							{/* Back */}
							<Link
								href="/products"
								className="flex-1 px-3 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-center cursor-pointer font-semibold"
							>
								← Back
							</Link>

							{/* Add to Cart */}
							{carts.find((cart) => cart.productId === product.id) ? (
								<button className="flex-1 px-3 py-3 bg-blue-900 text-white rounded-xl cursor-not-allowed font-semibold">
									Added
								</button>
							) : (
								<button
									onClick={(e) => handleAddToCart(e, product.id)}
									className="flex-1 px-3 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer font-semibold"
								>
									🛒 Add Cart
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-4 bg-gray-50 dark:bg-slate-950/50 text-center text-gray-500 dark:text-slate-400 border-t border-gray-150 dark:border-slate-800">
					Product ID: {product.id}
				</div>
			</div>
		</div>
	);
}
