import React, { useState } from 'react';
import { Bill, StoreProfile, Customer } from '../types';
import { formatWhatsAppLoyaltyMessage, getWhatsAppUrl } from '../utils/whatsapp';
import { 
  X, 
  Printer, 
  Send, 
  Copy, 
  Check, 
  ExternalLink,
  MessageCircle,
  Receipt
} from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  customer: Customer | null;
  store: StoreProfile;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  bill,
  customer,
  store,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !bill || !customer) return null;

  const whatsappMessage = formatWhatsAppLoyaltyMessage(store, bill, customer);
  const whatsappUrl = getWhatsAppUrl(customer.mobile, whatsappMessage);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[95dvh] sm:max-h-[88vh] overflow-hidden">
        {/* Modal Top Header - Always visible */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">
              Bill #{bill.billNumber} - Receipt & WhatsApp
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto overscroll-contain space-y-4">
          {/* WhatsApp Direct Action Banner */}
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Customer ko WhatsApp par bhejein
                </p>
                <p className="text-[11px] text-emerald-700">
                  Mobile: <span className="font-mono font-bold">+91 {customer.mobile}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyMessage}
                title="Copy WhatsApp text"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </button>
            </div>
          </div>

          {/* Printable Thermal Receipt Container */}
          <div id="printable-receipt" className="p-5 bg-white border border-dashed border-slate-300 rounded-lg text-slate-900 font-mono text-xs shadow-xs">
            {/* Pharmacy Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-0.5">
              <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                {store.storeName}
              </h2>
              <p className="text-[11px] text-slate-600 font-sans">{store.address}</p>
              <p className="text-[11px] text-slate-600">Tel: +91 {store.phone}</p>
              {store.dlNumber && (
                <p className="text-[10px] text-slate-500">D.L. No: {store.dlNumber}</p>
              )}
              {store.gstin && (
                <p className="text-[10px] text-slate-500">GSTIN: {store.gstin}</p>
              )}
            </div>

            {/* Bill Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 flex justify-between text-[11px]">
              <div>
                <div><span className="text-slate-500">Bill No:</span> <span className="font-bold">{bill.billNumber}</span></div>
                <div><span className="text-slate-500">Date:</span> {new Date(bill.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
              </div>
              <div className="text-right">
                <div><span className="text-slate-500">Customer:</span> <span className="font-bold">{customer.name}</span></div>
                <div><span className="text-slate-500">Phone:</span> {customer.mobile}</div>
              </div>
            </div>

            {/* Items by Tab */}
            <div className="py-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold text-[11px] pb-1.5 text-slate-700">
                <span>Tab / Category</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="space-y-1.5">
                {bill.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs">
                    <div>
                      <div className="font-sans font-medium text-slate-900">{item.tabName}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.isLoyaltyEligible 
                          ? `Loyalty: +${item.pointsEarned.toFixed(0)} pts (@${item.pointsPerHundred}pt/₹100)`
                          : `No loyalty points`}
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 tabular-nums">
                      {store.currencySymbol}{item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Discounts */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Bill (Subtotal):</span>
                <span className="font-bold tabular-nums">{store.currencySymbol}{bill.subtotal.toFixed(2)}</span>
              </div>
              {bill.discountFromPoints > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Loyalty Redeemed ({bill.pointsRedeemed} pts):</span>
                  <span className="tabular-nums">-{store.currencySymbol}{bill.discountFromPoints.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
                <span>Net Payable:</span>
                <span className="text-emerald-700 tabular-nums">{store.currencySymbol}{bill.finalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Payment Mode:</span>
                <span className="font-medium text-slate-700">{bill.paymentMode}</span>
              </div>
            </div>

            {/* Points Summary Box */}
            <div className="my-2.5 p-2 bg-emerald-50/70 border border-emerald-200 rounded text-center space-y-0.5">
              <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">
                Loyalty Points Summary
              </div>
              <div className="text-xs text-emerald-800">
                Points Earned This Bill: <span className="font-bold font-mono">+{bill.pointsEarned.toFixed(0)} Points</span>
              </div>
              <div className="text-xs font-bold text-emerald-950">
                Total Balance: <span className="font-mono text-sm">{customer.currentPoints.toFixed(0)} Points</span> (= ₹{(customer.currentPoints * store.pointValueInRs).toFixed(0)})
              </div>
              {customer.currentPoints >= store.minRedeemPoints ? (
                <div className="text-[10px] text-emerald-700 font-sans mt-0.5">
                  ✨ 50+ Points ready! Customer can redeem on next purchase!
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                  Need {store.minRedeemPoints - customer.currentPoints} more points to redeem discount.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-2 text-[10px] text-slate-500 font-sans space-y-0.5">
              <p>Thank you for your visit! Get well soon.</p>
              <p className="font-mono text-[9px] text-slate-400">Powered by MedPoints Loyalty</p>
            </div>
          </div>

          {/* WhatsApp Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">WhatsApp Message Preview:</span>
              <span className="text-[11px] text-slate-400">Will be sent to +91 {customer.mobile}</span>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {whatsappMessage}
            </pre>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
