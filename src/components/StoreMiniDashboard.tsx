import React, { useState, useMemo } from 'react';
import { StoreProfile, CategoryTab, Customer, Bill, MedicineReminder } from '../types';
import { 
  Store, 
  Users, 
  IndianRupee, 
  Sparkles, 
  Bell, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  TrendingUp,
  Layers,
  Calendar,
  Gift,
  CheckCircle2
} from 'lucide-react';
import { getCategoryTheme } from '../utils/categoryTheme';
import { CategoryVisualArt } from './CategoryVisualArt';

interface StoreMiniDashboardProps {
  store: StoreProfile;
  tabs: CategoryTab[];
  customers: Customer[];
  bills: Bill[];
  reminders: MedicineReminder[];
  onGoToReminders?: () => void;
  onGoToCustomers?: () => void;
  onAutoFillTestScenario?: () => void;
}

export const StoreMiniDashboard: React.FC<StoreMiniDashboardProps> = ({
  store,
  tabs,
  customers,
  bills,
  reminders,
  onGoToReminders,
  onGoToCustomers,
  onAutoFillTestScenario,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'all'>('today');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Today Date helper
  const isDateToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  // Next 10 days reminder helper
  const upcomingTenDaysReminders = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const maxFuture = new Date(now);
    maxFuture.setDate(maxFuture.getDate() + 10);
    maxFuture.setHours(23, 59, 59, 999);

    return reminders.filter((r) => {
      const d = new Date(r.nextDueDate);
      return d >= now && d <= maxFuture;
    });
  }, [reminders]);

  // Filtered Bills by Today or All Time
  const activeBills = useMemo(() => {
    if (timeFilter === 'all') return bills;
    return bills.filter((b) => isDateToday(b.date));
  }, [bills, timeFilter]);

  // Total Business (GMV)
  const totalBusiness = useMemo(() => {
    return activeBills.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
  }, [activeBills]);

  // Total Points Distributed
  const totalPointsDistributed = useMemo(() => {
    return activeBills.reduce((sum, b) => sum + (b.pointsEarned || 0), 0);
  }, [activeBills]);

  // Total Points Redeemed / Savings Given
  const totalPointsRedeemed = useMemo(() => {
    return activeBills.reduce((sum, b) => sum + (b.pointsRedeemed || 0), 0);
  }, [activeBills]);

  // Customer Count for the period
  const customerCountDisplay = useMemo(() => {
    if (timeFilter === 'all') {
      return {
        main: customers.length,
        label: 'कुल रजिस्टर्ड ग्राहक',
        sub: `${bills.length} कुल बिल बने`,
      };
    }
    // Today: count customers who visited today or were added today
    const todayVisitors = customers.filter((c) => isDateToday(c.lastVisit));
    const todayNew = customers.filter((c) => isDateToday(c.firstVisit));
    return {
      main: todayVisitors.length,
      label: 'आज आए ग्राहक',
      sub: `+${todayNew.length} नए ग्राहक जुड़े`,
    };
  }, [customers, bills, timeFilter]);

  // Category-wise Breakdown Calculation
  const categorySales = useMemo(() => {
    const salesMap: Record<string, { tab: CategoryTab; amount: number }> = {};

    // Initialize all active tabs with 0
    tabs.forEach((tab) => {
      if (tab.active) {
        salesMap[tab.id] = { tab, amount: 0 };
      }
    });

    // Accumulate from active bills
    activeBills.forEach((b) => {
      if (b.items && Array.isArray(b.items)) {
        b.items.forEach((item) => {
          if (salesMap[item.tabId]) {
            salesMap[item.tabId].amount += item.amount || 0;
          } else {
            // Find tab or create fallback
            const foundTab = tabs.find((t) => t.id === item.tabId) || {
              id: item.tabId,
              name: item.tabName || 'Other',
              description: '',
              isLoyaltyEligible: item.isLoyaltyEligible,
              pointsPerHundred: item.pointsPerHundred || 1,
              color: 'emerald' as const,
              icon: 'Layers',
              order: 99,
              active: true,
            };
            salesMap[item.tabId] = {
              tab: foundTab,
              amount: item.amount || 0,
            };
          }
        });
      }
    });

    return Object.values(salesMap).sort((a, b) => b.amount - a.amount);
  }, [tabs, activeBills]);

  // Today label
  const todayFormatted = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200">
      {/* Top Header Strip: Store Identity & Time Toggle */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Store Name & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-sm sm:text-base text-white truncate">
                {store.storeName}
              </h2>
              <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                Active Store
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate">
              {store.ownerName} · Mob: {store.phone} {store.dlNumber ? `· DL: ${store.dlNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Today vs All-Time Switch + Collapse Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Segmented Filter Switch */}
          <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/15 text-xs font-semibold backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                timeFilter === 'today'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>आज ({todayFormatted})</span>
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                timeFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>कुल व्यापार (All-Time)</span>
            </button>
          </div>

          {/* Quick collapse/expand button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? 'डैशबोर्ड विस्तार करें' : 'डैशबोर्ड सिकोड़ें'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsed State Quick Strip */}
      {isCollapsed ? (
        <div className="p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-900">
              {timeFilter === 'today' ? 'आज की बिक्री:' : 'कुल व्यापार:'}{' '}
              <span className="text-emerald-700 font-mono text-sm">₹{totalBusiness.toLocaleString('en-IN')}</span>
            </span>
            <span className="text-slate-500">
              {customerCountDisplay.label}: <strong className="text-slate-800">{customerCountDisplay.main}</strong>
            </span>
            <span className="text-slate-500">
              लॉयल्टी पॉइंट्स: <strong className="text-emerald-700">+{totalPointsDistributed} Pts</strong>
            </span>
            {upcomingTenDaysReminders.length > 0 && (
              <span className="text-teal-700 font-bold flex items-center gap-1">
                <Bell className="w-3 h-3 text-teal-600" />
                {upcomingTenDaysReminders.length} रिफिल ग्राहक
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            विस्तार से देखें ▾
          </button>
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Row 1: 4 Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Customers KPI */}
            <div 
              onClick={onGoToCustomers}
              className="p-3.5 rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-white hover:border-blue-300 transition-all cursor-pointer group"
              title="ग्राहक लेजर देखें"
            >
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{customerCountDisplay.label}</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums">
                {customerCountDisplay.main}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {customerCountDisplay.sub}
              </p>
            </div>

            {/* 2. Total Business (Sales / GMV) */}
            <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-white">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span>{timeFilter === 'today' ? 'आज की कुल बिक्री' : 'कुल व्यापार (GMV)'}</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  {activeBills.length} बिल
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums">
                ₹{totalBusiness.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {timeFilter === 'today' ? 'आज सुबह से कटा कुल बिल' : 'सभी रिकॉर्ड्स की कुल बिक्री'}
              </p>
            </div>

            {/* 3. Loyalty Points Distributed */}
            <div className="p-3.5 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-white">
              <div className="flex items-center justify-between text-amber-900 mb-1">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>बांटे गए लॉयल्टी पॉइंट्स</span>
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                  1 Pt = ₹{store.pointValueInRs}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 font-mono tabular-nums">
                +{totalPointsDistributed.toLocaleString('en-IN')} Pts
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                ग्राहकों ने ₹{totalPointsRedeemed * store.pointValueInRs} का डिस्काउंट पाया
              </p>
            </div>

            {/* 4. Upcoming 10-Days Medicine Refill Customers */}
            <div 
              onClick={onGoToReminders}
              className="p-3.5 rounded-xl border border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-white to-white hover:border-teal-300 transition-all cursor-pointer group"
              title="रिफिल रिमाइंडर लिस्ट देखें"
            >
              <div className="flex items-center justify-between text-teal-900 mb-1">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-teal-600 animate-bounce" />
                  <span>अगले 10 दिन के रिफिल</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-700" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-teal-950 font-mono tabular-nums">
                {upcomingTenDaysReminders.length} ग्राहक
              </div>
              <p className="text-[11px] text-teal-800 font-semibold mt-0.5 flex items-center gap-1 truncate">
                <span>दवा खत्म होने वाली है</span>
                <span className="underline ml-auto font-bold text-[10px]">रिमाइंडर भेजें →</span>
              </p>
            </div>
          </div>

          {/* Row 2: Category-Wise Sales Breakdown (Medicine, General, Surgical, Baby Care, Ayurvedic, etc.) */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  कैटेगरी वाइज बिक्री (Sales by Tab Category) — {timeFilter === 'today' ? 'आज का दिन' : 'कुल व्यापार'}
                </h3>
              </div>
              {onAutoFillTestScenario && (
                <button
                  type="button"
                  onClick={onAutoFillTestScenario}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>टेस्ट बिल ऑटो-फिल (₹500 दवा + ₹300 जनरल)</span>
                </button>
              )}
            </div>

            {/* Category Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {categorySales.map(({ tab, amount }) => {
                const theme = getCategoryTheme(tab);
                const percent = totalBusiness > 0 ? Math.round((amount / totalBusiness) * 100) : 0;

                return (
                  <div
                    key={tab.id}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      amount > 0
                        ? `${theme.cardBgInactive} ${theme.cardBorderInactive} shadow-2xs`
                        : 'bg-white border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <CategoryVisualArt
                        tabId={tab.id}
                        tabName={tab.name}
                        color={tab.color}
                        size="sm"
                        className="w-7 h-7 sm:w-8 sm:h-8"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-slate-900 block truncate">
                          {tab.name}
                        </span>
                        {tab.hindiName && (
                          <span className="text-[10px] text-slate-500 block truncate">
                            {tab.hindiName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-200/60 flex items-baseline justify-between">
                      <span className="text-sm font-black text-slate-900 font-mono tabular-nums">
                        ₹{amount.toLocaleString('en-IN')}
                      </span>
                      {totalBusiness > 0 && amount > 0 && (
                        <span className={`text-[10px] font-bold font-mono px-1 rounded ${theme.hindiTagBg} ${theme.hindiTagText}`}>
                          {percent}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
