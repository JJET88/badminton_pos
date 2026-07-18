/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect } from "react";

import Swal from "sweetalert2";
import toast from "react-hot-toast";
import useCartStore from "@/app/store/useCartStore";
import useProductStore from "@/app/store/useProductStore";

const Cart = ({ cart: { id, productId, quantity } }) => {
  const { products, fetchProducts } = useProductStore();
  const { increaseQuantity, decreaseQuantity, removeCart } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const product = products.find((el) => el.id === productId);
  if (!product) return null;

  const cost = product.price * quantity;

  const handleIncreaseQuantity = () => increaseQuantity(id);

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      decreaseQuantity(id);
    } else {
      Swal.fire({
        title: "Remove item?",
        text: "This item will be removed from your cart.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Remove",
        cancelButtonText: "Cancel",
      }).then((res) => {
        if (res.isConfirmed) {
          removeCart(id);
        }
      });
    }
  };

  return (
    <div className="
      bg-white dark:bg-slate-900
      border border-gray-200 dark:border-slate-800
      rounded-2xl 
      p-5 
      shadow-sm
      hover:shadow-md 
      transition 
      grid grid-cols-6
      gap-4
      items-center
      text-slate-800 dark:text-slate-200
    ">
      {/* Image */}
      <div className="col-span-1 flex justify-center">
        <img
          src={product.image}
          alt={product.title}
          className="h-20 w-20 object-contain rounded-md bg-gray-50 dark:bg-slate-800 p-2"
        />
      </div>

      {/* Product Info */}
      <div className="col-span-3">
        <p className="font-semibold text-lg">{product.title}</p>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">฿{product.price.toFixed(2)}</p>
      </div>

      {/* Quantity */}
      <div className="col-span-1 flex flex-col items-center">
        <span className="text-gray-700 dark:text-slate-300 mb-1 text-sm">Qty</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecreaseQuantity}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 transition cursor-pointer"
          >
            -
          </button>

          <span className="font-semibold">{quantity}</span>

          <button
            onClick={handleIncreaseQuantity}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 transition cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="col-span-1 text-right">
        <p className="text-xl font-bold text-slate-900 dark:text-white">฿{cost.toFixed(2)}</p>
      </div>
    </div>
  );

};

export default Cart;
