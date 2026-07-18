"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Load Data
  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    const res = await fetch("/api/sales");
    const data = await res.json();
    setSales(data || []);
  }

  // Revenue Calculations
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const today = new Date().toDateString();
  const todayRevenue = sales
    .filter((s) => new Date(s.createdAt).toDateString() === today)
    .reduce((sum, s) => sum + Number(s.total), 0);

  // Pagination Logic
  const totalPages = Math.ceil(sales.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentSales = sales.slice(startIndex, startIndex + pageSize);

  const goNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const goPrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 font-display">Sales Report</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-4 sm:p-5 rounded-xl shadow">
          <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">Today Revenue</p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-slate-100">฿{todayRevenue.toFixed(2)}</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-4 sm:p-5 rounded-xl shadow">
          <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">Total Revenue</p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-slate-100">฿{totalRevenue.toFixed(2)}</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 p-4 sm:p-5 rounded-xl shadow sm:col-span-2 lg:col-span-1">
          <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm">Total Orders</p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-slate-100">{sales.length}</h2>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-950/50">
              <tr className="border-b border-gray-200 dark:border-slate-800 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-sm">
              {currentSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-850/50 transition"
                >
                  <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-slate-100">#{sale.id}</td>

                  <td className="px-4 text-gray-800 dark:text-slate-200">
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>

                  <td className="px-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                      {sale.paymentType}
                    </span>
                  </td>

                  <td className="px-4 text-right text-gray-800 dark:text-slate-200 font-medium">
                    ฿{Number(sale.subtotal).toFixed(2)}
                  </td>

                  <td className="px-4 text-right text-gray-800 dark:text-slate-200 font-medium">
                    ฿{Number(sale.tax).toFixed(2)}
                  </td>

                  <td className="px-4 text-right font-bold text-gray-900 dark:text-slate-100">
                    ฿{Number(sale.total).toFixed(2)}
                  </td>

                  <td className="px-4 text-right">
                    <Link
                      href={`/dashboard/sales/${sale.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sales.length === 0 && (
          <p className="text-gray-500 dark:text-slate-400 p-8 text-center text-lg">No sales recorded.</p>
        )}
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3 sm:space-y-4 animate-fade-in">
        {currentSales.map((sale) => (
          <div
            key={sale.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow border border-gray-200 dark:border-slate-800"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Invoice</p>
                <p className="font-semibold text-lg text-gray-900 dark:text-slate-100">#{sale.id}</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                {sale.paymentType}
              </span>
            </div>

            <div className="text-sm text-gray-600 dark:text-slate-400 mb-3">
              {new Date(sale.createdAt).toLocaleString()}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-xs">Subtotal</p>
                <p className="font-medium text-gray-800 dark:text-slate-200">฿{Number(sale.subtotal).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-xs">Tax</p>
                <p className="font-medium text-gray-800 dark:text-slate-200">฿{Number(sale.tax).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-xs">Total</p>
                <p className="font-bold text-base text-gray-900 dark:text-slate-100">฿{Number(sale.total).toFixed(2)}</p>
              </div>
            </div>

            <Link
              href={`/dashboard/sales/${sale.id}`}
              className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-semibold"
            >
              View Details
            </Link>
          </div>
        ))}

        {sales.length === 0 && (
          <div className="bg-white dark:bg-slate-900 p-8 border border-gray-250 dark:border-slate-800 rounded-xl shadow text-center">
            <p className="text-gray-500 dark:text-slate-400">No sales recorded.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 text-sm">
        {/* Page size selection */}
        <div className="flex items-center">
          <label className="mr-2 text-gray-600 dark:text-slate-400">Rows per page:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-200 px-3 py-1.5 rounded cursor-pointer focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-2 bg-gray-250 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded disabled:opacity-50 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors font-semibold"
          >
            Previous
          </button>

          <span className="text-gray-700 dark:text-slate-300 font-medium whitespace-nowrap">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="px-3 sm:px-4 py-2 bg-gray-250 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded disabled:opacity-50 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors font-semibold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}