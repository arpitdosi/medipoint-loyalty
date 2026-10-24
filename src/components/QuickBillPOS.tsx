import React, { useState, useId } from 'react';
import { 
  StoreProfile, 
  CategoryTab, 
  Customer, 
  Bill, 
  BillItem, 
  PointTransaction,
  MedicineReminder
} from '../types';
import { 
  Receipt, 
  Sparkles, 
  UserCheck, 
  Phone, 
  User, 
  Gift, 
  CreditCard, 
  Banknote, 
  Send, 
  RotateCcw,
  CheckCircle2,
  Award,
  Layers,
  ArrowRight,
  Bell,
  Pill,
  Calendar,
  AlertCircle,
  X,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReceiptModal } from './ReceiptModal';
import { RedeemModal } from './RedeemModal';
import { CategoryVisualArt } from './CategoryVisualArt';
import { getCategoryTheme } from '../utils/categoryTheme';
import { StoreMiniDashboard } from './StoreMiniDashboard';

interface QuickBillPOSProps {
  store: StoreProfile;
  tabs: CategoryTab[];
  customers: Customer[];
  reminders: MedicineReminder[];
  bills?: Bill[];
  onSaveBill: (
    bill: Bill, 
    customer: Customer, 
    transaction: PointTransaction
  ) => void;
  onSaveReminder?: (reminder: MedicineReminder) => void;
  onGoToTabs: () => void;
  onGoToReminders?: () => void;
  onGoToCustomers?: () => void;
  prefillMobile?: string;
  prefillMedicine?: string;
  presetScenario?: boolean;
}

export const QuickBillPOS: React.FC<QuickBillPOSProps> = ({
  store,
  tabs,
  customers,
  reminders,
  bills = [],
  onSaveBill,
  onSaveReminder,
  onGoToTabs,
  onGoToReminders,
  onGoToCustomers,
  prefillMobile,
  prefillMedicine,
}) => {
  // Customer inputs
  const [customerMobile, setCustomerMobile] = useState(prefillMobile || '');
  const [customerName, setCustomerName] = useState(() => {
    if (prefillMobile) {
      const found = customers.find(c => c.mobile === prefillMobile);
      return found ? found.name : '';
    }
    return '';
  });
  const [customerNotes, setCustomerNotes] = useState('');
  
  // Category amounts: tabId -> amount
  const [amounts, setAmounts] = useState<Record<string, number>>(() => {
    if (prefillMedicine) {
      const medTab = tabs.find(t => t.id === 'tab_medicine' || t.name.toLowerCase().includes('med'));
      return medTab ? { [medTab.id]: 500 } : {};
    }
    return {};
  });
  
  // Payment Mode
  const [paymentMode, setPaymentMode] = useState<Bill['paymentMode']>('UPI');

  // Monthly Medicine Refill Reminder State
  const [enableRefillReminder, setEnableRefillReminder] = useState(Boolean(prefillMedicine));
  const [refillMedicineName, setRefillMedicineName] = useState(prefillMedicine || '');
  const [refillCategory, setRefillCategory] = useState<MedicineReminder['category']>('Thyroid');
  const [refillDays, setRefillDays] = useState(30);
  const [refillAlertDays, setRefillAlertDays] = useState(2);

  // Redemption state
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [redeemedDiscount, setRedeemedDiscount] = useState(0);

  // Modals state
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [lastGeneratedBill, setLastGeneratedBill] = useState<Bill | null>(null);
  const [lastCustomer, setLastCustomer] = useState<Customer | null>(null);

  // Auto-complete match
  const matchedCustomer = customers.find(
    (c) => c.mobile.replace(/\D/g, '') === customerMobile.replace(/\D/g, '') && c.mobile.length >= 10
  );

  // Dynamic calculations
  const activeTabs = tabs.filter((t) => t.active);

  // Build items array
  const items: BillItem[] = activeTabs.map((tab) => {
    const amount = Number(amounts[tab.id]) || 0;
    let pointsEarned = 0;
    if (tab.isLoyaltyEligible && tab.pointsPerHundred > 0 && amount > 0) {
      // Calculate loyalty points: e.g. (amount / 100) * pointsPerHundred
      // Math.floor or exact: usually integer points or 1 decimal.
      pointsEarned = Math.floor((amount / 100) * tab.pointsPerHundred);
    }
    return {
      tabId: tab.id,
      tabName: tab.hindiName ? `${tab.name} (${tab.hindiName})` : tab.name,
      amount,
      isLoyaltyEligible: tab.isLoyaltyEligible,
      pointsPerHundred: tab.pointsPerHundred,
      pointsEarned,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const pointsEarnedThisBill = items.reduce((sum, item) => sum + item.pointsEarned, 0);
  const finalAmount = Math.max(0, subtotal - redeemedDiscount);

  const existingPoints = matchedCustomer ? matchedCustomer.currentPoints : 0;
  const projectedBalance = existingPoints - redeemedPoints + pointsEarnedThisBill;
  const isRedeemEligible = existingPoints >= store.minRedeemPoints && subtotal > 0;

  // 50 Points Milestone Upsell Modal State
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [dismissedUpsellKey, setDismissedUpsellKey] = useState<string | null>(null);

  // Check if customer's total points are approaching 50 (i.e. total points 45 se 49 tak aa rhe ho)
  const isNearFifty = (projectedBalance >= 45 && projectedBalance <= 49) || 
    (Boolean(matchedCustomer) && existingPoints >= 45 && existingPoints <= 49 && projectedBalance < 50);

  const currentEvaluatingPoints = isNearFifty ? (projectedBalance >= 45 ? projectedBalance : existingPoints) : 0;
  const pointsShortOfFifty = Math.max(1, 50 - currentEvaluatingPoints);
  
  // Find medicine or loyalty eligible tab to compute amount needed
  const medTab = tabs.find((t) => t.id === 'tab_medicine' || t.name.toLowerCase().includes('med') || t.isLoyaltyEligible);
  const medRate = medTab && medTab.pointsPerHundred > 0 ? medTab.pointsPerHundred : 1;
  const amountNeededForFifty = Math.ceil((pointsShortOfFifty / medRate) * 100);

  const upsellKey = `${customerMobile}_${currentEvaluatingPoints}`;
  React.useEffect(() => {
    if (isNearFifty && customerMobile.length >= 10 && dismissedUpsellKey !== upsellKey) {
      setShowUpsellModal(true);
    }
  }, [isNearFifty, customerMobile, currentEvaluatingPoints, dismissedUpsellKey, upsellKey]);

  const handleAutoAddUpsell = () => {
    if (!medTab) return;
    const currentMedAmt = amounts[medTab.id] || 0;
    const newAmt = currentMedAmt + amountNeededForFifty;
    setAmounts((prev) => ({
      ...prev,
      [medTab.id]: newAmt,
    }));
    setShowUpsellModal(false);
    setDismissedUpsellKey(upsellKey);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  const handleDismissUpsell = () => {
    setShowUpsellModal(false);
    setDismissedUpsellKey(upsellKey);
  };

  // Auto-fill customer name if matched
  const handleMobileChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setCustomerMobile(cleaned);
    const found = customers.find((c) => c.mobile === cleaned);
    if (found) {
      setCustomerName(found.name);
    }
  };

  const handleAmountChange = (tabId: string, val: string) => {
    // Strip non-digits and leading zeros so 5 or 500 never becomes 05 or 0500
    const clean = val.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    const num = clean === '' ? 0 : parseInt(clean, 10);
    setAmounts((prev) => ({
      ...prev,
      [tabId]: num,
    }));
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if ('select' in e.target && typeof (e.target as HTMLInputElement).select === 'function') {
      (e.target as HTMLInputElement).select();
    }
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Quick preset: ₹500 Medicine + ₹300 General Store test
  const handleLoadUserScenario = () => {
    setCustomerMobile('9876543210');
    setCustomerName('Ramesh Patel');
    
    // Find medicine tab and general tab
    const medTab = tabs.find((t) => t.id === 'tab_medicine' || t.name.toLowerCase().includes('med'));
    const genTab = tabs.find((t) => t.id === 'tab_general' || t.name.toLowerCase().includes('gen'));

    const newAmounts: Record<string, number> = {};
    if (medTab) newAmounts[medTab.id] = 500;
    if (genTab) newAmounts[genTab.id] = 300;
    
    setAmounts(newAmounts);
    setRedeemedPoints(0);
    setRedeemedDiscount(0);
  };

  const handleResetForm = () => {
    setCustomerMobile('');
    setCustomerName('');
    setCustomerNotes('');
    setAmounts({});
    setRedeemedPoints(0);
    setRedeemedDiscount(0);
  };

  const handleConfirmRedeem = (points: number, discount: number) => {
    setRedeemedPoints(points);
    setRedeemedDiscount(discount);
  };

  const handleRemoveRedeem = () => {
    setRedeemedPoints(0);
    setRedeemedDiscount(0);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerMobile || customerMobile.length < 10) {
      alert('Kripya customer ka 10 digit mobile number dalein.');
      return;
    }

    if (subtotal <= 0) {
      alert('Kam se kam ek tab me amount darz karein.');
      return;
    }

    const billNumber = `INV-${Date.now().toString().slice(-6)}`;
    const billDate = new Date().toISOString();

    // Prepare customer object
    let customerObj: Customer;
    if (matchedCustomer) {
      customerObj = {
        ...matchedCustomer,
        name: customerName || matchedCustomer.name,
        currentPoints: projectedBalance,
        totalPointsEarned: matchedCustomer.totalPointsEarned + pointsEarnedThisBill,
        totalPointsRedeemed: matchedCustomer.totalPointsRedeemed + redeemedPoints,
        totalSpent: matchedCustomer.totalSpent + finalAmount,
        totalBills: matchedCustomer.totalBills + 1,
        lastVisit: billDate,
      };
    } else {
      customerObj = {
        id: `cust_${Date.now()}`,
        name: customerName || 'Grahak',
        mobile: customerMobile,
        currentPoints: projectedBalance,
        totalPointsEarned: pointsEarnedThisBill,
        totalPointsRedeemed: redeemedPoints,
        totalSpent: finalAmount,
        totalBills: 1,
        firstVisit: billDate,
        lastVisit: billDate,
        notes: customerNotes,
      };
    }

    // Prepare Bill
    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      billNumber,
      customerId: customerObj.id,
      customerName: customerObj.name,
      customerMobile: customerObj.mobile,
      date: billDate,
      items: items.filter((i) => i.amount > 0),
      subtotal,
      pointsRedeemed: redeemedPoints,
      discountFromPoints: redeemedDiscount,
      finalAmount,
      pointsEarned: pointsEarnedThisBill,
      pointsBalanceAfter: projectedBalance,
      paymentMode,
      notes: customerNotes,
    };

    // Prepare point transaction
    const txn: PointTransaction = {
      id: `txn_${Date.now()}`,
      date: billDate,
      customerId: customerObj.id,
      customerName: customerObj.name,
      customerMobile: customerObj.mobile,
      type: redeemedPoints > 0 ? 'REDEEMED' : 'EARNED',
      points: pointsEarnedThisBill - redeemedPoints,
      billId: newBill.id,
      billNumber: newBill.billNumber,
      notes: redeemedPoints > 0 
        ? `Redeemed ${redeemedPoints} pts & earned ${pointsEarnedThisBill} pts`
        : `Earned on bill #${billNumber}`,
      balanceAfter: projectedBalance,
    };

    // Save
    onSaveBill(newBill, customerObj, txn);

    // Save or update Monthly Medicine Reminder if enabled
    if (enableRefillReminder && refillMedicineName.trim() && onSaveReminder) {
      const startDate = new Date();
      const nextDueDate = new Date();
      nextDueDate.setDate(startDate.getDate() + Number(refillDays));

      const existingRem = reminders.find(r => r.customerMobile === customerObj.mobile);
      const remToSave: MedicineReminder = {
        id: existingRem ? existingRem.id : `rem_${Date.now()}`,
        customerId: customerObj.id,
        customerName: customerObj.name,
        customerMobile: customerObj.mobile,
        medicineName: refillMedicineName.trim(),
        category: refillCategory,
        daysSupply: Number(refillDays),
        startDate: startDate.toISOString(),
        nextDueDate: nextDueDate.toISOString(),
        alertBeforeDays: Number(refillAlertDays),
        status: 'ACTIVE',
        reminderCount: 0,
        notes: `Bill #${billNumber} ke sath reminder set kiya`,
      };
      onSaveReminder(remToSave);
    }

    // If customer reaches 50 or above, celebrate!
    if (projectedBalance >= store.minRedeemPoints && existingPoints < store.minRedeemPoints) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }

    // Set for receipt modal
    setLastGeneratedBill(newBill);
    setLastCustomer(customerObj);
    setIsReceiptOpen(true);

    // Reset form after saving
    handleResetForm();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Store Mini-Dashboard: Store Name, Today vs All-Time sales, Customer count, Points distributed, 10-day refills, and Category breakdown */}
      <StoreMiniDashboard
        store={store}
        tabs={tabs}
        customers={customers}
        bills={bills}
        reminders={reminders}
        onGoToReminders={onGoToReminders}
        onGoToCustomers={onGoToCustomers}
        onAutoFillTestScenario={handleLoadUserScenario}
      />

      {/* Main Billing Grid */}
      <form onSubmit={handleCreateBill} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Details + Tabs Input (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Customer Lookup Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
                  <User className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Customer Details (ग्राहक की जानकारी)
                </h3>
              </div>
              {matchedCustomer && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Existing Customer</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mobile Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder="9876543210"
                    value={customerMobile}
                    onFocus={handleInputFocus}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    className="w-full pl-11 pr-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wide"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Number dalte hi pichla points balance dikh jayega
                </p>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Ka Naam *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel, Sunita Ji"
                  value={customerName}
                  onFocus={handleInputFocus}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Existing Customer Status Strip */}
            {matchedCustomer && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Current Points</span>
                    <span className="text-base font-extrabold text-emerald-700 font-mono tabular-nums">
                      {matchedCustomer.currentPoints} pts
                    </span>
                    <span className="text-slate-500 text-[11px] ml-1">
                      (₹{matchedCustomer.currentPoints * store.pointValueInRs})
                    </span>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Purchases</span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      {matchedCustomer.totalBills} bills (₹{matchedCustomer.totalSpent})
                    </span>
                  </div>
                </div>

                {matchedCustomer.currentPoints >= store.minRedeemPoints ? (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                      <Award className="w-4 h-4 text-emerald-600" />
                      50+ Points Ready to Redeem!
                    </span>
                    {redeemedPoints === 0 && (
                      <button
                        type="button"
                        onClick={() => setIsRedeemOpen(true)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        Redeem Karein
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 text-[11px]">
                    Need {store.minRedeemPoints - matchedCustomer.currentPoints} more pts for discount
                  </span>
                )}
              </div>
            )}

            {/* Existing Medicine Reminder Banner for this Customer */}
            {matchedCustomer && reminders.some(r => r.customerMobile === matchedCustomer.mobile) && (
              <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-xs text-teal-950">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="font-bold">नियमित दवा: </span>
                    <span className="text-teal-900 font-medium">
                      {reminders.find(r => r.customerMobile === matchedCustomer.mobile)?.medicineName}
                    </span>
                  </div>
                </div>
                <span className="font-bold font-mono text-teal-800 text-[11px]">
                  Next Due: {new Date(reminders.find(r => r.customerMobile === matchedCustomer.mobile)!.nextDueDate).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            )}
          </div>

          {/* Dynamic Category Tabs & Amount Inputs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Category Tabs & Bill Amount (सामान की कीमत)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dukan wale ne jo tabs banaye hain unme amount likhein. Loyalty points automatically count honge!
                </p>
              </div>

              <button
                type="button"
                onClick={onGoToTabs}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ Custom Tab Banayein</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of active tabs as attractive, color-coded visual cards */}
            <div className="space-y-3.5">
              {activeTabs.map((tab) => {
                const amount = amounts[tab.id] || '';
                const num = Number(amount) || 0;
                const points = tab.isLoyaltyEligible && tab.pointsPerHundred > 0
                  ? Math.floor((num / 100) * tab.pointsPerHundred)
                  : 0;
                const theme = getCategoryTheme(tab);

                const handleQuickAdd = (addVal: number) => {
                  const currentVal = Number(amounts[tab.id]) || 0;
                  handleAmountChange(tab.id, String(currentVal + addVal));
                };

                return (
                  <div
                    key={tab.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
                      num > 0 
                        ? `${theme.cardBgActive} ${theme.cardBorderActive}` 
                        : `${theme.cardBgInactive} ${theme.cardBorderInactive}`
                    }`}
                  >
                    {/* Left: Product Visual Art & Details */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Product Illustration */}
                      <CategoryVisualArt
                        tabId={tab.id}
                        tabName={tab.name}
                        color={tab.color}
                        size="md"
                        className="shrink-0"
                      />

                      {/* Tab Name, Hindi Name, and Product Examples */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className={`font-bold text-sm sm:text-base ${theme.titleText}`}>
                            {tab.name}
                          </span>
                          {tab.hindiName && (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${theme.hindiTagBg} ${theme.hindiTagText}`}>
                              {tab.hindiName}
                            </span>
                          )}
                        </div>

                        {/* Product Items Tags (as requested: chips packet, soap, shampoo, diapers, oil, herbs) */}
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                          {theme.productExamples.map((item, idx) => (
                            <span key={idx} className="inline-flex items-center">
                              <span className="font-medium">{item}</span>
                              {idx < theme.productExamples.length - 1 && (
                                <span className="mx-1 text-slate-300 font-bold">·</span>
                              )}
                            </span>
                          ))}
                        </div>

                        {/* Loyalty Policy */}
                        <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                          {tab.isLoyaltyEligible ? (
                            <span className={`font-semibold flex items-center gap-1.5 ${theme.loyaltyPillText}`}>
                              <span className={`w-2 h-2 rounded-full ${theme.loyaltyDotColor} shrink-0`} />
                              <span>Loyalty: हर ₹100 पर <strong>{tab.pointsPerHundred} Point</strong> (=₹{tab.pointsPerHundred * store.pointValueInRs})</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">
                              No Loyalty Points (पॉइंट्स बंद हैं)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount input, quick helpers, & live points badge */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                      {/* Live points badge */}
                      <div className="text-left md:text-right min-w-22">
                        {tab.isLoyaltyEligible ? (
                          num > 0 ? (
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs font-mono ${theme.pointsTagActive}`}>
                              +{points} Points
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">
                              0 pts
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Points Off
                          </span>
                        )}
                      </div>

                      {/* Amount Input with Currency and Quick Increment */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="relative w-36 sm:w-40">
                          <span className={`absolute left-3 top-2 text-xs font-bold ${theme.currencySymbolColor}`}>
                            ₹
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            placeholder="0"
                            value={amount === 0 ? '' : amount}
                            onFocus={handleInputFocus}
                            onChange={(e) => handleAmountChange(tab.id, e.target.value)}
                            className={`w-full pl-7 pr-3 py-1.5 text-base font-bold text-slate-900 border rounded-xl text-right font-mono focus:outline-none focus:ring-2 ${theme.inputBg} ${theme.inputBorder} ${theme.inputFocusRing} scroll-mt-28`}
                          />
                        </div>

                        {/* Quick Add Presets */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(100)}
                            className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded border border-slate-200 cursor-pointer transition-colors"
                          >
                            +₹100
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(500)}
                            className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded border border-slate-200 cursor-pointer transition-colors"
                          >
                            +₹500
                          </button>
                          {num > 0 && (
                            <button
                              type="button"
                              onClick={() => handleAmountChange(tab.id, '')}
                              className="px-1.5 py-0.5 text-[10px] font-bold text-red-500 hover:text-red-700 bg-white hover:bg-red-50 rounded border border-red-200 cursor-pointer transition-colors"
                              title="क्लियर करें"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Medicine Refill Reminder Setting Card */}
          <div className="bg-white rounded-xl border border-teal-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableRefillReminder}
                  onChange={(e) => setEnableRefillReminder(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 block flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>मंथली दवा रिफिल रिमाइंडर सेट करें (Auto Refill Reminder)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    थायराइड, कोलेस्ट्रॉल, बीपी या शुगर के मरीजों को अगले महीने 2 दिन पहले ऑटो-अलर्ट जाएगा
                  </span>
                </div>
              </label>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                enableRefillReminder ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {enableRefillReminder ? 'Reminder ON' : 'Off'}
              </span>
            </div>

            {enableRefillReminder && (
              <div className="pt-3 border-t border-teal-100 space-y-3.5 text-xs">
                {/* Condition Category */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    बीमारी / कंडीशन चुनें:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {(['Thyroid', 'Cholesterol', 'Blood Pressure', 'Diabetes', 'Heart', 'General'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setRefillCategory(cat);
                          if (!refillMedicineName || refillMedicineName.includes('दवा')) {
                            if (cat === 'Thyroid') setRefillMedicineName('Thyronorm 50mcg (थायराइड दवा)');
                            if (cat === 'Cholesterol') setRefillMedicineName('Atorvastatin 10mg (कोलेस्ट्रॉल दवा)');
                            if (cat === 'Blood Pressure') setRefillMedicineName('Telma 40 (बीपी दवा)');
                            if (cat === 'Diabetes') setRefillMedicineName('Glycomet GP 1mg (शुगर दवा)');
                          }
                        }}
                        className={`py-1.5 px-1.5 rounded-lg border font-semibold text-[11px] text-center transition-colors cursor-pointer ${
                          refillCategory === cat
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine Name & Course Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      दवा का नाम व डोज़ (Medicine Name) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Thyronorm 50mcg / Atorvastatin 10mg"
                      value={refillMedicineName}
                      onChange={(e) => setRefillMedicineName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      कोर्स अवधि (सप्लाई)
                    </label>
                    <select
                      value={refillDays}
                      onChange={(e) => setRefillDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white"
                    >
                      <option value={30}>30 दिन (1 माह)</option>
                      <option value={15}>15 दिन</option>
                      <option value={45}>45 दिन</option>
                      <option value={60}>60 दिन (2 माह)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg flex items-center justify-between text-[11px] text-teal-900">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      दवा खत्म होने से <strong>2 दिन पहले</strong> मेडिकल स्टोर पोर्टल पर अलर्ट दिखेगा और 1-क्लिक में हिंदी WhatsApp जाएगा।
                    </span>
                  </div>
                  <span className="font-bold font-mono shrink-0 ml-2">
                    Due in {refillDays} Days
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Summary & WhatsApp Dispatch (4-5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 sticky top-22">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Bill & Points Summary
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Kul Samaan):</span>
                <span className="font-bold text-slate-900 font-mono text-sm tabular-nums">
                  {store.currencySymbol}{subtotal.toFixed(2)}
                </span>
              </div>

              {/* Tab wise summary */}
              {items.filter(i => i.amount > 0).map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px] text-slate-500 pl-2 border-l-2 border-slate-200">
                  <span>{it.tabName}:</span>
                  <span className="font-mono">
                    ₹{it.amount} {it.isLoyaltyEligible ? `(+${it.pointsEarned} pts)` : '(0 pts)'}
                  </span>
                </div>
              ))}

              {/* Points Earned on this bill */}
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
                <div className="flex justify-between items-center text-emerald-950 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Loyalty Points Mile:</span>
                  </span>
                  <span className="text-base font-mono text-emerald-700">
                    +{pointsEarnedThisBill} Points
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Is bill par customer ko ₹{pointsEarnedThisBill * store.pointValueInRs} ka loyalty bonus mila!
                </p>
              </div>

              {/* Redemption Section */}
              {redeemedDiscount > 0 ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex justify-between items-center text-amber-950">
                  <div>
                    <span className="font-bold block text-xs">
                      Points Redeemed ({redeemedPoints} pts)
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveRedeem}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      Remove Discount
                    </button>
                  </div>
                  <span className="text-sm font-bold font-mono text-amber-800">
                    -{store.currencySymbol}{redeemedDiscount.toFixed(2)}
                  </span>
                </div>
              ) : isRedeemEligible ? (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">50+ Points Available</span>
                    <span className="text-[11px] text-slate-500">Aap discount de sakte hain</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRedeemOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Redeem</span>
                  </button>
                </div>
              ) : null}

              {/* 50 Points Milestone Upsell Alert Banner (जब ग्राहक के पॉइंट्स 45 से 49 के बीच हों) */}
              {isNearFifty && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl space-y-2 animate-in fade-in duration-200 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="p-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-xs shrink-0 mt-0.5">
                        50 Pts
                      </span>
                      <div>
                        <span className="text-xs font-bold text-amber-950 block">
                          ग्राहक के {currentEvaluatingPoints} पॉइंट्स हो रहे हैं!
                        </span>
                        <span className="text-[11px] text-amber-800">
                          50 पॉइंट्स पूरे होने में मात्र <strong>{pointsShortOfFifty} पॉइंट्स</strong> बाकी हैं!
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUpsellModal(true)}
                      className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-md shrink-0 cursor-pointer shadow-xs"
                    >
                      हिंट स्क्रिप्ट
                    </button>
                  </div>
                  <div className="text-[11px] text-amber-900 bg-white/80 p-2 rounded-lg border border-amber-200">
                    💡 <strong>दुकानदार के लिए हिंट:</strong> ग्राहक को ₹{amountNeededForFifty} की दवा या सामान और लेने को कहें ताकि थोड़ी ज़्यादा सेल हो और ग्राहक को ₹{store.minRedeemPoints * store.pointValueInRs} का डिस्काउंट मिल सके!
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoAddUpsell}
                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>+ ₹{amountNeededForFifty} दवा में जोड़ें (50 Pts हिट करें)</span>
                  </button>
                </div>
              )}

              {/* Final Amount Payable */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Final Bill (Payable):</span>
                <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {store.currencySymbol}{finalAmount.toFixed(2)}
                </span>
              </div>

              {/* Projected Points Balance */}
              <div className="text-[11px] text-slate-600 pt-1 flex justify-between">
                <span>Customer Ka Naya Balance:</span>
                <span className="font-bold font-mono text-emerald-700">
                  {projectedBalance} Points (Worth ₹{projectedBalance * store.pointValueInRs})
                </span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Payment Mode (भुगतान का तरीका)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['UPI', 'Cash', 'Card', 'Credit'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                      paymentMode === mode
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit & WhatsApp CTA */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={subtotal <= 0 || !customerMobile}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Save Bill & Send WhatsApp</span>
              </button>

              <p className="text-[11px] text-center text-slate-500">
                Click karte hi bill save ho jayega aur WhatsApp receipt open ho jayegi!
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Modals */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        bill={lastGeneratedBill}
        customer={lastCustomer}
        store={store}
      />

      {matchedCustomer && (
        <RedeemModal
          isOpen={isRedeemOpen}
          onClose={() => setIsRedeemOpen(false)}
          customer={matchedCustomer}
          currentBillAmount={subtotal}
          store={store}
          onConfirmRedeem={handleConfirmRedeem}
        />
      )}

      {/* 50 Points Milestone Upsell Modal Popup */}
      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-lg shadow-xs">
                  50
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight leading-tight">
                    50 Points Upsell Alert (मालिक के लिए संकेत)
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-950/80">
                    ग्राहक को 50 पॉइंट्स के लिए हिंट दें और थोड़ी ज़्यादा सेल करें!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissUpsell}
                className="p-1 rounded-lg text-slate-950/70 hover:text-slate-950 hover:bg-black/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Customer Status Banner */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-semibold">
                    ग्राहक: <strong className="text-slate-950">{customerName || 'ग्राहक'}</strong> ({customerMobile})
                  </span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded text-[11px]">
                    {currentEvaluatingPoints} / 50 Pts
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentEvaluatingPoints / 50) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-bold text-amber-950 pt-0.5">
                  <span>वर्तमान बैलेंस: {currentEvaluatingPoints} पॉइंट्स</span>
                  <span className="text-rose-700">सिर्फ {pointsShortOfFifty} पॉइंट्स कम हैं!</span>
                </div>
              </div>

              {/* Exact Sales Script for Owner */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-2 text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>दुकानदार के लिए बोलचाल (Customer Hint Script):</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-emerald-200 text-slate-800 text-xs leading-relaxed italic">
                  "सर/मैडम, आपके 50 पॉइंट्स पूरे होने में मात्र <strong>{pointsShortOfFifty} पॉइंट्स</strong> बाकी हैं! आप सिर्फ <strong>₹{amountNeededForFifty}</strong> की कोई भी नियमित दवा, बाम, डेटॉल, ओआरएस, टूथपेस्ट, विक्स या प्रोटीन पाउडर और ले लीजिए—तुरंत आपके 50 पॉइंट्स पूरे हो जाएंगे और अगली बार सीधे <strong>₹{store.minRedeemPoints * store.pointValueInRs} का डिस्काउंट</strong> मिलेगा!"
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  💡 <strong>फ़ायदा:</strong> थोड़ी ज़्यादा सेल होगी + ग्राहक को ₹{store.minRedeemPoints * store.pointValueInRs} की छूट का आकर्षण मिलेगा!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleAutoAddUpsell}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ ₹{amountNeededForFifty} बिल में जोड़ें (Hit 50 Pts & Unlock Discount)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismissUpsell}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ग्राहक को बोल दिया / समझ गया (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
