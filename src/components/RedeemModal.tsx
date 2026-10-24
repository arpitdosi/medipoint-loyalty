import React, { useState } from 'react';
import { Customer, StoreProfile } from '../types';
import confetti from 'canvas-confetti';
import { Gift, X, Sparkles, Check, AlertCircle } from 'lucide-react';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  currentBillAmount: number;
  store: StoreProfile;
  onConfirmRedeem: (pointsToRedeem: number, discountAmount: number) => void;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({
  isOpen,
  onClose,
  customer,
  currentBillAmount,
  store,
  onConfirmRedeem,
}) => {
  const maxPossiblePointsByBalance = customer.currentPoints;
  // Maximum points that don't exceed current bill amount in Rs
  const maxPointsForBill = Math.floor(currentBillAmount / store.pointValueInRs);
  const maxRedeemable = Math.min(maxPossiblePointsByBalance, maxPointsForBill);

  const defaultPoints = Math.min(store.minRedeemPoints, maxRedeemable);
  const [pointsInput, setPointsInput] = useState<number>(defaultPoints);

  if (!isOpen) return null;

  const discountAmount = pointsInput * store.pointValueInRs;
  const remainingPoints = customer.currentPoints - pointsInput;
  const newPayable = Math.max(0, currentBillAmount - discountAmount);

  const isValid = 
    pointsInput >= store.minRedeemPoints && 
    pointsInput <= maxRedeemable && 
    pointsInput > 0;

  const handleQuickSelect = (pts: number) => {
    if (pts <= maxRedeemable) {
      setPointsInput(pts);
    }
  };

  const handleApply = () => {
    if (!isValid) return;

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore if canvas-confetti is not loaded
    }

    onConfirmRedeem(pointsInput, discountAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[95dvh] sm:max-h-[88vh] overflow-hidden">
        {/* Header - Always visible */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-200" />
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">
              Loyalty Points Redeem Karein
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto overscroll-contain space-y-4 text-xs">
          {/* Customer status */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-sm">{customer.name}</p>
              <p className="text-slate-600 font-mono">+91 {customer.mobile}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Balance</span>
              <span className="text-lg font-extrabold text-emerald-900 font-mono tabular-nums">
                {customer.currentPoints} <span className="text-xs font-normal">pts</span>
              </span>
              <span className="block text-[11px] text-emerald-700 font-medium">
                (Worth ₹{customer.currentPoints * store.pointValueInRs})
              </span>
            </div>
          </div>

          {/* Bill Context */}
          <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-600 font-medium">Current Bill Subtotal:</span>
            <span className="font-bold text-slate-900 font-mono text-sm tabular-nums">
              {store.currencySymbol}{currentBillAmount.toFixed(2)}
            </span>
          </div>

          {/* Points Input Control */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-800">
              Kitne Points Redeem Karne Hain? (Min: {store.minRedeemPoints} pts)
            </label>
            <div className="relative">
              <input
                type="number"
                min={store.minRedeemPoints}
                max={maxRedeemable}
                step={5}
                value={pointsInput || ''}
                onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)}
                onChange={(e) => setPointsInput(Number(e.target.value))}
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                Points = ₹{discountAmount} Off
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500">Quick:</span>
              {customer.currentPoints >= store.minRedeemPoints && (
                <button
                  type="button"
                  onClick={() => handleQuickSelect(store.minRedeemPoints)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                    pointsInput === store.minRedeemPoints 
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  {store.minRedeemPoints} Pts (₹{store.minRedeemPoints})
                </button>
              )}
              {customer.currentPoints >= 100 && (
                <button
                  type="button"
                  onClick={() => handleQuickSelect(100)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                    pointsInput === 100 
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  100 Pts (₹100)
                </button>
              )}
              {maxRedeemable > store.minRedeemPoints && (
                <button
                  type="button"
                  onClick={() => handleQuickSelect(maxRedeemable)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                    pointsInput === maxRedeemable 
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  Max ({maxRedeemable} Pts)
                </button>
              )}
            </div>
          </div>

          {/* Calculation summary */}
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-700">
              <span>Points Redeem:</span>
              <span className="font-bold text-emerald-800 font-mono">-{pointsInput} Points</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold text-xs">
              <span>Discount on Bill:</span>
              <span className="font-mono">-{store.currencySymbol}{discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Remaining Points:</span>
              <span className="font-bold font-mono">{remainingPoints} Points</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-xs pt-1 border-t border-emerald-200">
              <span>New Bill to Pay:</span>
              <span className="font-mono">{store.currencySymbol}{newPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Validation warnings */}
          {customer.currentPoints < store.minRedeemPoints && (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Customer ke paas minimum {store.minRedeemPoints} points hone chahiye. Abhi {customer.currentPoints} points hain.
              </span>
            </div>
          )}
          {pointsInput > maxRedeemable && (
            <div className="flex items-center gap-1.5 text-red-700 bg-red-50 p-2.5 rounded border border-red-200 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Aap {maxRedeemable} se zyada points redeem nahi kar sakte (Bill amount ya Balance limit).
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center justify-end gap-2 px-4 sm:px-5 py-2.5 sm:py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!isValid}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Apply ₹{discountAmount} Discount</span>
          </button>
        </div>
      </div>
    </div>
  );
};
