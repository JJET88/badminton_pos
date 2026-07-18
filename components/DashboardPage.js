"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [activeFilter, setActiveFilter] = useState("week");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const resProducts = await fetch("/api/products");
        const productsData = await resProducts.json();
        setProducts(productsData || []);

        const resSales = await fetch("/api/sales");
        const salesData = await resSales.json();
        setSales(salesData || []);

        const revenue = salesData.reduce(
          (sum, sale) => sum + Number(sale.total || 0),
          0
        );

        const today = new Date().toDateString();

        const todayTotal = salesData
          .filter(
            (sale) =>
              new Date(sale.createdAt || sale.date || Date.now()).toDateString() === today
          )
          .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

        setTotalRevenue(revenue);
        setTodayRevenue(todayTotal);
      } catch (error) {
        console.error("Dashboard load error:", error);
      }
    }

    load();
  }, []);

  useEffect(() => {
    setChartData(generateChartData(sales, activeFilter));
  }, [sales, activeFilter]);

  function generateChartData(salesData, filter) {
    const now = new Date();

    if (filter === "day") {
      const hours = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        revenue: 0,
      }));

      salesData.forEach((sale) => {
        const date = new Date(sale.createdAt || sale.date || Date.now());

        if (date.toDateString() === now.toDateString()) {
          hours[date.getHours()].revenue += Number(sale.total || 0);
        }
      });

      return hours;
    }

    if (filter === "week") {
      const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      const data = weekDays.map((day) => ({
        label: day,
        revenue: 0,
      }));

      salesData.forEach((sale) => {
        const date = new Date(sale.createdAt || sale.date || Date.now());
        data[date.getDay()].revenue += Number(sale.total || 0);
      });

      return data;
    }

    if (filter === "month") {
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

      const data = Array.from({ length: daysInMonth }, (_, i) => ({
        label: `${i + 1}`,
        revenue: 0,
      }));

      salesData.forEach((sale) => {
        const date = new Date(sale.createdAt || sale.date || Date.now());

        if (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        ) {
          data[date.getDate() - 1].revenue += Number(sale.total || 0);
        }
      });

      return data;
    }

    if (filter === "year") {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      const data = months.map((month) => ({
        label: month,
        revenue: 0,
      }));

      salesData.forEach((sale) => {
        const date = new Date(sale.createdAt || sale.date || Date.now());

        if (date.getFullYear() === now.getFullYear()) {
          data[date.getMonth()].revenue += Number(sale.total || 0);
        }
      });

      return data;
    }

    return [];
  }

  const lowStockItems = products.filter(
    (product) => Number(product.stock || product.quantity || 0) < 5
  ).length;

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-3xl">
            💰
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-sm">Total Revenue</p>
            <h2 className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-3xl">
            🧾
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-sm">Today Sales</p>
            <h2 className="text-2xl font-bold">฿{todayRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-3xl">
            📦
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-sm">Total Products</p>
            <h2 className="text-2xl font-bold">{products.length}</h2>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <div>
            <p className="text-gray-400 dark:text-slate-500 text-sm">Low Stock Items</p>
            <h2 className="text-2xl font-bold">{lowStockItems}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <h2 className="font-bold text-lg capitalize">
              {activeFilter} Sales Report
            </h2>

            <button className="text-xs text-gray-400 dark:text-slate-550 border border-gray-200 dark:border-slate-800 rounded-full px-4 py-1">
              Badminton POS Sales
            </button>
          </div>

          <div className="flex gap-2 text-xs">
            {["day", "week", "month", "year"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full font-semibold capitalize cursor-pointer transition-all ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

}