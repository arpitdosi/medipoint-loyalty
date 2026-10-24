import React, { useState } from 'react';
import { Customer, StoreProfile, PointTransaction } from '../types';
import { 
  Users, 
  Search, 
  Gift, 
  MessageCircle, 
  PlusCircle, 
  MinusCircle, 
  ArrowUpDown, 
  FileText,
  X,
  Check,
  Award,
  Sparkles
} from 'lucide-react';
import { cleanIndianMobile, getWhatsAppUrl } from '../utils/whatsapp';

interface CustomerLedgerProps {
  customers: Customer[];
  transactions: PointTransaction[];
  store: StoreProfile;
  onUpdateCustomer: (customer: Customer, txn?: PointTransaction) => void;
  onQuickBillForCustomer: (customer: Customer) => void;
}

export const CustomerLedger: React.FC<CustomerLedgerProps> = ({
  customers,
  transactions,
  store,
  onUpdateCustomer,
  onQuickBillForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'redeem_ready' | 'high_value'>('all');

  // Adjust Points Modal State
  const [adjustCustomer, setAdjustCustomer] = useState<Customer | null>(null);
  const [adjustPoints, setAdjustPoints] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustReason, setAdjustReason] = useState('Festival / Goodwill Bonus');

  // Customer History Modal State
  const [viewHistoryCustomer, setViewHistoryCustomer] = useState<Customer | null>(null);

  // Filtered list
  const filteredCustomers = customers.filter((cust) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      cust.name.toLowerCase().includes(term) || 
      cust.mobile.includes(term);

    if (!matchesSearch) return false;

    if (filter === 'redeem_ready') {
      return cust.currentPoints >= store.minRedeemPoints;
    }
    if (filter === 'high_value') {
      return cust.totalSpent >= 5000;
    }
    return true;
  });

  // Analytics metrics
  const totalActivePoints = customers.reduce((sum, c) => sum + c.currentPoints, 0);
  const totalRedeemedPoints = customers.reduce((sum, c) => sum + c.totalPointsRedeemed, 0);
  const redeemReadyCount = customers.filter(c => c.currentPoints >= store.minRedeemPoints).length;

  const handleOpenWhatsAppBalance = (customer: Customer) => {
    const pointsValue = customer.currentPoints * store.pointValueInRs;
    let msg = `🏥 *${store.storeName}*\nNamaste *${customer.name}* Ji! 🙏\n\nAapke account me abhi *${customer.currentPoints} Loyalty Points* (Value: ₹${pointsValue}) jama hain.`;
    
    if (customer.currentPoints >= store.minRedeemPoints) {
      msg += `\n\n🎉 *Badhai ho!* Aapke 50 se zyada points ho gaye hain. Agli baar dukan par aakar ₹${pointsValue} ki chhut le sakte hain!`;
    } else {
      msg += `\n\n₹${store.minRedeemPoints} discount ke liye bas ${store.minRedeemPoints - customer.currentPoints} points or chahiye.`;
    }

    msg += `\n\nDhanyawad! Call/WhatsApp: ${store.phone}`;

    const url = getWhatsAppUrl(customer.mobile, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustCustomer) return;

    const diff = adjustType === 'ADD' ? adjustPoints : -adjustPoints;
    const newBalance = Math.max(0, adjustCustomer.currentPoints + diff);

    const updatedCustomer: Customer = {
      ...adjustCustomer,
      currentPoints: newBalance,
      totalPointsEarned: adjustType === 'ADD' ? adjustCustomer.totalPointsEarned + adjustPoints : adjustCustomer.totalPointsEarned,
      totalPointsRedeemed: adjustType === 'DEDUCT' ? adjustCustomer.totalPointsRedeemed + adjustPoints : adjustCustomer.totalPointsRedeemed,
    };

    const txn: PointTransaction = {
      id: `txn_${Date.now()}`,
      date: new Date().toISOString(),
      customerId: adjustCustomer.id,
      customerName: adjustCustomer.name,
      customerMobile: adjustCustomer.mobile,
      type: 'ADJUSTMENT',
      points: diff,
      notes: `${adjustType === 'ADD' ? 'Credited' : 'Debited'} ${adjustPoints} pts: ${adjustReason}`,
      balanceAfter: newBalance,
    };

    onUpdateCustomer(updatedCustomer, txn);
    setAdjustCustomer(null);
  };

  const customerTxns = viewHistoryCustomer 
    ? transactions.filter(t => t.customerId === viewHistoryCustomer.id)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Registered Customers</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
            {customers.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Sabhi grahak ka record</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Current Points in Circulation</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono tabular-nums">
            {totalActivePoints} <span className="text-sm font-normal">pts</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-1 font-mono">
            Worth ₹{totalActivePoints * store.pointValueInRs}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Ready to Redeem (50+ pts)</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono tabular-nums">
            {redeemReadyCount} <span className="text-sm font-normal">customers</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Inko WhatsApp offer bhej sakte hain</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Points Redeemed Till Date</div>
          <div className="text-2xl font-extrabold text-slate-800 mt-1 font-mono tabular-nums">
            {totalRedeemedPoints} <span className="text-sm font-normal">pts</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">₹{totalRedeemedPoints * store.pointValueInRs} discount diya</div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setFilter('redeem_ready')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'redeem_ready'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              50+ Points Ready ({redeemReadyCount})
            </button>
            <button
              onClick={() => setFilter('high_value')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filter === 'high_value'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              High Value (₹5k+)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name & Phone</th>
                <th className="py-3 px-4 text-right">Points Balance</th>
                <th className="py-3 px-4 text-right">Total Spent</th>
                <th className="py-3 px-4 text-center">Bills</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Koi customer nahi mila. Billing screen par jaakar pehla bill banayein!
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isRedeemReady = cust.currentPoints >= store.minRedeemPoints;
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Phone */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                        <div className="font-mono text-slate-500 text-xs flex items-center gap-1">
                          +91 {cust.mobile}
                        </div>
                      </td>

                      {/* Points Balance */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-extrabold text-sm text-slate-900 tabular-nums">
                          {cust.currentPoints} <span className="text-[11px] font-normal text-slate-500">pts</span>
                        </div>
                        <div className="text-[11px] font-medium text-emerald-700">
                          = ₹{cust.currentPoints * store.pointValueInRs} Value
                        </div>
                        {isRedeemReady && (
                          <span className="inline-block mt-0.5 text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                            ✨ 50+ Redeem Ready
                          </span>
                        )}
                      </td>

                      {/* Total Spent */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 tabular-nums">
                        ₹{cust.totalSpent.toFixed(0)}
                      </td>

                      {/* Bills count */}
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {cust.totalBills}
                      </td>

                      {/* Last Visit */}
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {new Date(cust.lastVisit).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenWhatsAppBalance(cust)}
                          title="WhatsApp Par Balance Bhejein"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onQuickBillForCustomer(cust)}
                          title="Is Customer Ke Liye Bill Banayein"
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setAdjustCustomer(cust)}
                          title="Points Add/Deduct Karein"
                          className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Gift className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setViewHistoryCustomer(cust)}
                          title="Transactions History Dekhein"
                          className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          History
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Points Modal */}
      {adjustCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form onSubmit={handleSaveAdjustment} className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">
                Adjust Points - {adjustCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setAdjustCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                <span>Current Balance:</span>
                <span className="font-bold font-mono text-emerald-700 text-sm">
                  {adjustCustomer.currentPoints} Points (₹{adjustCustomer.currentPoints * store.pointValueInRs})
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Action: Points Jodein ya Ghatayein?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADD')}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                      adjustType === 'ADD' 
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Points Add (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('DEDUCT')}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                      adjustType === 'DEDUCT' 
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Deduct (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kitne Points?
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason (Karan)
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Birthday bonus, manual reward"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAdjustCustomer(null)}
                className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer History Modal */}
      {viewHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">
                  {viewHistoryCustomer.name} - Points Ledger History
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  +91 {viewHistoryCustomer.mobile} · Current: {viewHistoryCustomer.currentPoints} pts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewHistoryCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-96 overflow-y-auto space-y-3">
              {customerTxns.length === 0 ? (
                <p className="text-center text-slate-500 py-6">
                  Is customer ki abhi koi point history nahi hai.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {customerTxns.map((tx) => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{tx.notes}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.date).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold text-sm ${
                          tx.points >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                        </span>
                        <div className="text-[10px] text-slate-500">
                          Balance: {tx.balanceAfter} pts
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-3 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewHistoryCustomer(null)}
                className="px-4 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
