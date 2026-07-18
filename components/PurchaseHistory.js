"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '@/app/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Package, 
  TrendingUp, 
  PiggyBank, 
  X, 
  ChevronRight, 
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchaseHistory() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [purchases, setPurchases] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    limit: 10,
    offset: 0
  });

  const fetchPurchaseHistory = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', filters.limit);
      params.append('offset', filters.offset);

      const res = await fetch(`/api/users/${user.id}/purchases?${params}`);
      
      if (!res.ok) throw new Error('Failed to fetch purchase history');

      const data = await res.json();
      setPurchases(data.purchases);
      setStatistics(data.statistics);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching purchase history:', err);
      toast.error('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters.startDate, filters.endDate, filters.limit, filters.offset]);

  useEffect(() => {
    if (user?.id) {
      fetchPurchaseHistory();
    }
  }, [user?.id, fetchPurchaseHistory]);

  async function viewPurchaseDetails(saleId) {
    try {
      const res = await fetch(`/api/users/${user.id}/purchases/${saleId}`);
      
      if (!res.ok) throw new Error('Failed to fetch purchase details');

      const data = await res.json();
      setSelectedPurchase(data);
      setShowDetails(true);
    } catch (err) {
      console.error('Error fetching purchase details:', err);
      toast.error('Failed to load purchase details');
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function resetFilters() {
    setFilters({
      startDate: '',
      endDate: '',
      limit: 10,
      offset: 0
    });
  }

  const handlePageChange = (page) => {
    const newOffset = (page - 1) * filters.limit;
    setFilters((prev) => ({ ...prev, offset: newOffset }));
  };

  const handleLimitChange = (newLimit) => {
    setFilters((prev) => ({ ...prev, limit: parseInt(newLimit), offset: 0 }));
  };

  const limit = filters.limit;
  const offset = filters.offset;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-8 text-center shadow-sm">
          <p className="text-yellow-800 dark:text-yellow-450 font-medium">Please login to view your purchase history</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push('/')}
              className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors group cursor-pointer bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-sm hover:shadow"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Shop</span>
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-display">
              Purchase History
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Review and manage your store transactions
            </p>
          </div>

          <button
            onClick={fetchPurchaseHistory}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh List
          </button>
        </div>

        {/* Statistics Grid */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">{statistics.total_orders}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Spent</p>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">฿{parseFloat(statistics.total_spent).toFixed(2)}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg Order</p>
                <CreditCard className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">฿{parseFloat(statistics.average_order).toFixed(2)}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Savings</p>
                <PiggyBank className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">฿{parseFloat(statistics.total_savings).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-gray-200 dark:border-slate-800 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-slate-455" />
            <h3 className="font-bold text-sm text-gray-700 dark:text-slate-200">Filter Purchases</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value, offset: 0 })}
                className="w-full border border-gray-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-2 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value, offset: 0 })}
                className="w-full border border-gray-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-medium"
              />
            </div>
            <button
              onClick={resetFilters}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 py-2.5 rounded-xl transition-all font-bold text-sm cursor-pointer shadow-sm border border-transparent dark:border-slate-700/50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Purchase List Area */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-slate-400 mt-4 text-sm font-medium">Loading your transactions...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📦
            </div>
            <p className="text-gray-800 dark:text-slate-200 text-lg font-bold">No orders found</p>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Start shopping to see your purchase history here</p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table-like headers for desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-extrabold uppercase text-gray-500 dark:text-slate-400 tracking-wider">
              <span className="col-span-2">Order ID</span>
              <span className="col-span-3">Purchase Date</span>
              <span className="col-span-2 text-center">Items count</span>
              <span className="col-span-2">Payment Method</span>
              <span className="col-span-2 text-right">Total Price</span>
              <span className="col-span-1"></span>
            </div>

            {/* List entries */}
            {purchases.map((purchase) => (
              <div
                key={purchase.sale_id}
                className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 hover:shadow-lg transition-all hover:scale-[1.005] hover:border-blue-300 dark:hover:border-blue-900/60 shadow-sm group flex flex-col md:grid md:grid-cols-12 md:items-center gap-4"
              >
                {/* Mobile ID and Date */}
                <div className="col-span-2 flex justify-between items-center md:block">
                  <span className="text-xs md:hidden font-extrabold uppercase text-gray-400">Order ID</span>
                  <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-450">
                    #{purchase.sale_id}
                  </span>
                </div>

                <div className="col-span-3 flex justify-between items-center md:block border-t border-gray-50 dark:border-slate-850 pt-2.5 md:pt-0">
                  <span className="text-xs md:hidden font-extrabold uppercase text-gray-400">Date</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                    {formatDate(purchase.purchase_date)}
                  </span>
                </div>

                <div className="col-span-2 flex justify-between items-center md:block md:text-center border-t border-gray-50 dark:border-slate-850 pt-2.5 md:pt-0">
                  <span className="text-xs md:hidden font-extrabold uppercase text-gray-400">Items</span>
                  <span className="text-sm font-medium bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-350">
                    {purchase.total_items} ({purchase.items_count} type{purchase.items_count !== 1 ? 's' : ''})
                  </span>
                </div>

                <div className="col-span-2 flex justify-between items-center md:block border-t border-gray-50 dark:border-slate-850 pt-2.5 md:pt-0">
                  <span className="text-xs md:hidden font-extrabold uppercase text-gray-400">Payment</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    {purchase.paymentType}
                  </span>
                </div>

                <div className="col-span-2 flex justify-between items-center md:block md:text-right border-t border-gray-50 dark:border-slate-850 pt-2.5 md:pt-0">
                  <span className="text-xs md:hidden font-extrabold uppercase text-gray-400">Total</span>
                  <div>
                    <span className="text-lg font-extrabold text-green-600 dark:text-green-455">
                      ฿{parseFloat(purchase.total).toFixed(2)}
                    </span>
                    {purchase.discount > 0 && (
                      <p className="text-[10px] text-green-500 font-semibold">
                        Saved ฿{parseFloat(purchase.discount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Trigger */}
                <div className="col-span-1 flex justify-end border-t border-gray-50 dark:border-slate-850 pt-3 md:pt-0">
                  <button
                    onClick={() => viewPurchaseDetails(purchase.sale_id)}
                    className="w-full md:w-auto bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-blue-600 dark:text-blue-400 px-4 py-2 md:p-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer font-bold md:font-normal text-sm"
                    title="View Details"
                  >
                    <span className="md:hidden">View Details</span>
                    <ChevronRight className="w-4 h-4 hidden md:block" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalCount > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
                {/* Left side: Range and Limit Select */}
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                  <div>
                    Showing <span className="font-semibold text-gray-900 dark:text-slate-100">{Math.min(offset + 1, totalCount)}</span> to{" "}
                    <span className="font-semibold text-gray-900 dark:text-slate-100">{Math.min(offset + purchases.length, totalCount)}</span> of{" "}
                    <span className="font-semibold text-gray-900 dark:text-slate-100">{totalCount}</span> orders
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Show:</span>
                    <select
                      value={filters.limit}
                      onChange={(e) => handleLimitChange(e.target.value)}
                      className="border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-xs font-semibold"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Right side: Page Navigation Buttons */}
                <div className="flex items-center gap-1.5 self-center">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs font-semibold"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNumber = currentPage - 3 + i;
                      }
                      if (currentPage > totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      }
                    }
                    
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNumber
                            ? "bg-blue-600 border-blue-600 text-white shadow"
                            : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Purchase Details Modal */}
        {showDetails && selectedPurchase && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-transparent dark:border-slate-800 animate-in zoom-in-95 duration-200">
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Order details</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Reference ID: #{selectedPurchase.id}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-lg hover:bg-gray-150 dark:hover:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Meta Info */}
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-gray-155 dark:border-slate-850/60">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">Order Date</p>
                      <p className="font-bold text-gray-955 dark:text-slate-200">{formatDate(selectedPurchase.purchaseDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">Payment Method</p>
                      <p className="font-bold text-gray-955 dark:text-slate-200">{selectedPurchase.paymentType}</p>
                    </div>
                    {selectedPurchase.voucherCode && (
                      <div>
                        <p className="text-gray-500 dark:text-slate-400 font-medium mb-1">Voucher Code</p>
                        <p className="font-bold text-blue-600 dark:text-blue-450">{selectedPurchase.voucherCode}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items list */}
                <div>
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-gray-900 dark:text-slate-100">
                    <ShoppingBag className="w-4 h-4 text-gray-450" />
                    Order Items
                  </h3>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                    {selectedPurchase.items.map((item) => (
                      <div key={item.id} className="flex gap-4 border-b border-slate-100 dark:border-slate-850 pb-3 last:border-b-0 last:pb-0">
                        {item.product.image && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 p-1 flex-shrink-0"
                          />
                        )}
                        <div className="flex-grow min-w-0">
                          <p className="font-semibold text-sm text-gray-955 dark:text-slate-100 truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-400">{item.product.category}</p>
                          <p className="text-xs text-gray-555 dark:text-slate-400 mt-1">
                            ฿{parseFloat(item.unitPrice).toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-extrabold text-sm text-gray-955 dark:text-slate-100">฿{parseFloat(item.lineTotal).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary Pricing */}
                <div className="bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/10 dark:to-green-900/10 border border-green-200/50 dark:border-green-900/30 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500 dark:text-slate-400">Subtotal</span>
                    <span className="text-gray-955 dark:text-slate-200">฿{parseFloat(selectedPurchase.subtotal).toFixed(2)}</span>
                  </div>
                  {selectedPurchase.discount > 0 && (
                    <div className="flex justify-between text-xs text-green-700 dark:text-green-400 font-semibold">
                      <span>Discount</span>
                      <span>- ฿{parseFloat(selectedPurchase.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500 dark:text-slate-400">Tax (10%)</span>
                    <span className="text-gray-955 dark:text-slate-200">฿{parseFloat(selectedPurchase.tax).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-green-205 dark:border-green-900/20 pt-2.5 flex justify-between font-extrabold text-base">
                    <span className="text-gray-955 dark:text-slate-100 font-display">Total Paid</span>
                    <span className="text-green-600 dark:text-green-400">฿{parseFloat(selectedPurchase.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}