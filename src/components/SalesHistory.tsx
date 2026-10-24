import React, { useState } from 'react';
import { Bill, StoreProfile, Customer } from '../types';
import { 
  History, 
  Search, 
  Printer, 
  MessageCircle, 
  FileText,
  Calendar,
  CreditCard,
  Banknote
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';
import { formatWhatsAppLoyaltyMessage, getWhatsAppUrl } from '../utils/whatsapp';

interface SalesHistoryProps {
  bills: Bill[];
  customers: Customer[];
  store: StoreProfile;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  bills,
  customers,
  store,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const filteredBills = bills.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.billNumber.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term) ||
      b.customerMobile.includes(term)
    );
  });

  const totalSales = bills.reduce((sum, b) => sum + b.finalAmount, 0);
  const totalPointsAwarded = bills.reduce((sum, b) => sum + b.pointsEarned, 0);
  const totalPointsRedeemed = bills.reduce((sum, b) => sum + b.pointsRedeemed, 0);

  const handleOpenReceipt = (bill: Bill) => {
    setSelectedBill(bill);
    setIsReceiptOpen(true);
  };

  const handleQuickWhatsApp = (bill: Bill) => {
    const cust = customers.find(c => c.id === bill.customerId) || {
      id: bill.customerId,
      name: bill.customerName,
      mobile: bill.customerMobile,
      currentPoints: bill.pointsBalanceAfter,
      totalPointsEarned: bill.pointsEarned,
      totalPointsRedeemed: bill.pointsRedeemed,
      totalSpent: bill.finalAmount,
      totalBills: 1,
      firstVisit: bill.date,
      lastVisit: bill.date,
    };
    const message = formatWhatsAppLoyaltyMessage(store, bill, cust);
    const url = getWhatsAppUrl(bill.customerMobile, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const selectedCustomer = selectedBill 
    ? (customers.find(c => c.id === selectedBill.customerId) || {
        id: selectedBill.customerId,
        name: selectedBill.customerName,
        mobile: selectedBill.customerMobile,
        currentPoints: selectedBill.pointsBalanceAfter,
        totalPointsEarned: selectedBill.pointsEarned,
        totalPointsRedeemed: selectedBill.pointsRedeemed,
        totalSpent: selectedBill.finalAmount,
        totalBills: 1,
        firstVisit: selectedBill.date,
        lastVisit: selectedBill.date,
      })
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Loyalty Bills Issued</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
            {bills.length} <span className="text-xs font-normal text-slate-400">Bills</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Total Revenue: ₹{totalSales.toFixed(0)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Points Given to Customers</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono tabular-nums">
            +{totalPointsAwarded} <span className="text-xs font-normal">pts</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">
            Grahak loyalty bonus earned
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Discount Given Via Points</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono tabular-nums">
            ₹{(totalPointsRedeemed * store.pointValueInRs).toFixed(0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {totalPointsRedeemed} points redeemed
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Bill No, Name, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredBills.length} of {bills.length} bills
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Bill No & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Categories / Tabs</th>
                <th className="py-3 px-4 text-right">Points Earned</th>
                <th className="py-3 px-4 text-right">Final Bill</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Koi bill record nahi mila.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Bill No & Date */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{bill.billNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(bill.date).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{bill.customerName}</div>
                      <div className="font-mono text-slate-500 text-[11px]">+91 {bill.customerMobile}</div>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {bill.items.map((item, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600">
                            <span className="font-medium text-slate-800">{item.tabName}:</span>{' '}
                            <span className="font-mono">₹{item.amount}</span>
                            {item.isLoyaltyEligible && (
                              <span className="text-emerald-700 font-bold ml-1">
                                (+{item.pointsEarned} pts)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Points Earned */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                        +{bill.pointsEarned} pts
                      </span>
                      {bill.pointsRedeemed > 0 && (
                        <div className="text-[10px] text-amber-700 mt-0.5">
                          -{bill.pointsRedeemed} pts redeemed
                        </div>
                      )}
                    </td>

                    {/* Final Bill */}
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-sm text-slate-900 tabular-nums">
                      ₹{bill.finalAmount.toFixed(2)}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {bill.paymentMode}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleQuickWhatsApp(bill)}
                        title="Resend WhatsApp Message"
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenReceipt(bill)}
                        title="View / Print Receipt"
                        className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        bill={selectedBill}
        customer={selectedCustomer}
        store={store}
      />
    </div>
  );
};
