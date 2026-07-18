"use client";

import { useState, useEffect } from "react";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [code, setCode] = useState("");
  const [type, setType] = useState("percentage");
  const [amount, setAmount] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    loadVouchers();
  }, []);

  async function loadVouchers() {
    try {
      setLoading(true);
      const res = await fetch("/api/vouchers");
      if (!res.ok) {
        throw new Error('Failed to load vouchers');
      }
      const data = await res.json();
      setVouchers(data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      alert('Failed to load vouchers. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    resetForm();
    setIsEditing(false);
    setShowForm(true);
  }

  function openEditForm(v) {
    setCode(v.code);
    setType(v.type);
    setAmount(v.amount.toString());
    setMinTotal(v.minTotal?.toString() || "");
    
    if (v.expiresAt) {
      const date = new Date(v.expiresAt);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setExpiresAt(`${year}-${month}-${day}`);
    } else {
      setExpiresAt("");
    }
    
    setCurrentId(v.id);
    setIsEditing(true);
    setShowForm(true);
  }

  function resetForm() {
    setCode("");
    setType("percentage");
    setAmount("");
    setMinTotal("");
    setExpiresAt("");
    setCurrentId(null);
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleSubmit() {
    if (!code || !amount) {
      alert("Please fill in all required fields (Code and Amount)");
      return;
    }

    if (type === 'percentage' && Number(amount) > 100) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      amount: Number(amount),
      minTotal: minTotal ? Number(minTotal) : null,
      expiresAt: expiresAt || null,
    };

    try {
      let response;
      
      if (isEditing) {
        response = await fetch(`/api/vouchers/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/vouchers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save voucher'}`);
        return;
      }

      alert(isEditing ? '✅ Voucher updated successfully!' : '✅ Voucher created successfully!');
      closeForm();
      loadVouchers();
      
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert('❌ Failed to save voucher. Please try again.');
    }
  }

  async function deleteVoucher(id, code) {
    if (!confirm(`Are you sure you want to delete voucher "${code}"?`)) return;

    try {
      const response = await fetch(`/api/vouchers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete voucher'}`);
        return;
      }
      
      alert('✅ Voucher deleted successfully!');
      loadVouchers();
      
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('❌ Failed to delete voucher. Please try again.');
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "No expiry";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  }

  function getStatus(v) {
    if (!v.expiresAt) return { text: 'Active', color: 'bg-green-100 text-green-800' };
    const now = new Date();
    const expiry = new Date(v.expiresAt);
    if (expiry < now) {
      return { text: 'Expired', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-950 min-h-screen flex items-center justify-center text-slate-800 dark:text-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100 font-display">🎟️ Vouchers</h1>
          <button
            onClick={openCreateForm}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
          >
            <span className="text-xl">+</span>
            New Voucher
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg shadow p-4 sm:p-6">
            <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2">Total Vouchers</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{vouchers.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg shadow p-4 sm:p-6">
            <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2">Active Vouchers</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {vouchers.filter(v => getStatus(v).text === 'Active').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-lg shadow p-4 sm:p-6">
            <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2">Expired Vouchers</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
              {vouchers.filter(v => getStatus(v).text === 'Expired').length}
            </p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                    Min Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                    Expires
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {vouchers.map((v) => {
                  const status = getStatus(v);
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-slate-850/50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {v.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 capitalize">
                          {v.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {v.type === "percentage" ? `${v.amount}%` : `฿${v.amount}`}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-350">
                        {v.minTotal ? `฿${v.minTotal}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-350">
                        {formatDate(v.expiresAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status.text === 'Active' 
                            ? 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300'
                        }`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditForm(v)}
                          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteVoucher(v.id, v.code)}
                          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {vouchers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-slate-400 text-lg">No vouchers found.</p>
                <button
                  onClick={openCreateForm}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
                >
                  Create your first voucher
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {vouchers.map((v) => {
            const status = getStatus(v);
            return (
              <div
                key={v.id}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-450 mb-1">Code</p>
                    <p className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">{v.code}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    status.text === 'Active' 
                      ? 'bg-green-100 dark:bg-green-950/80 text-green-800 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300'
                  }`}>
                    {status.text}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-slate-450 text-xs mb-1">Type</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 capitalize">
                      {v.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-slate-455 text-xs mb-1">Amount</p>
                    <p className="font-semibold text-gray-800 dark:text-slate-200">
                      {v.type === "percentage" ? `${v.amount}%` : `฿${v.amount}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-slate-455 text-xs mb-1">Min Total</p>
                    <p className="font-medium text-gray-800 dark:text-slate-200">{v.minTotal ? `฿${v.minTotal}` : "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-slate-455 text-xs mb-1">Expires</p>
                    <p className="font-medium text-xs text-gray-800 dark:text-slate-200">{formatDate(v.expiresAt)}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-slate-800">
                  <button
                    onClick={() => openEditForm(v)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteVoucher(v.id, v.code)}
                    className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {vouchers.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl shadow-sm p-8 text-center bg-white dark:bg-slate-900">
              <p className="text-gray-500 dark:text-slate-400 text-base mb-4">No vouchers found.</p>
              <button
                onClick={openCreateForm}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
              >
                Create your first voucher
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeForm}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-slate-100">
                {isEditing ? "Edit Voucher" : "Create New Voucher"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-305 mb-2">
                  Voucher Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SAVE20"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-305 mb-2">
                  Discount Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (฿)</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-305 mb-2">
                  {type === "percentage" ? "Discount Percentage *" : "Discount Amount (฿) *"}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={type === "percentage" ? "e.g., 20" : "e.g., 50"}
                  min="0"
                  max={type === "percentage" ? "100" : undefined}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>

              {/* Min Total */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-305 mb-2">
                  Minimum Purchase Total (฿)
                </label>
                <input
                  type="number"
                  value={minTotal}
                  onChange={(e) => setMinTotal(e.target.value)}
                  placeholder="e.g., 100 (optional)"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-305 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base cursor-pointer"
                />
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  Leave empty for no expiration
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition cursor-pointer hover:shadow-md"
                >
                  {isEditing ? "Update Voucher" : "Create Voucher"}
                </button>
                <button
                  onClick={closeForm}
                  className="sm:w-auto px-4 sm:px-6 py-2.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}