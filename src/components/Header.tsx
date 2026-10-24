import React, { useRef, useEffect } from 'react';
import { StoreProfile, AuthSession } from '../types';
import { 
  ReceiptText, 
  Layers, 
  Users, 
  History, 
  Settings, 
  Sparkles,
  Store,
  Phone,
  Bell,
  Pill,
  ChevronDown,
  Building2,
  LogOut,
  User,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface HeaderProps {
  store: StoreProfile;
  activeTab: 'pos' | 'tabs' | 'customers' | 'reminders' | 'history' | 'settings';
  setActiveTab: (tab: 'pos' | 'tabs' | 'customers' | 'reminders' | 'history' | 'settings') => void;
  dueRemindersCount: number;
  totalStoresCount: number;
  session: AuthSession;
  onQuickScenario: () => void;
  onOpenStoreModal: () => void;
  onOpenStoreManager: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onBackToAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  store,
  activeTab,
  setActiveTab,
  dueRemindersCount,
  totalStoresCount,
  session,
  onQuickScenario,
  onOpenStoreModal,
  onOpenStoreManager,
  onOpenAuthModal,
  onLogout,
  onBackToAdmin,
}) => {
  const navRef = useRef<HTMLElement>(null);

  // Keep active tab centered in mobile horizontal scroll so user always sees the active tab
  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Super Admin Preview Notice Banner */}
      {onBackToAdmin && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 truncate">
            <span className="text-base">👑</span>
            <span className="truncate">सुपर एडमिन व्यू: आप वर्तमान में "{store.storeName}" के डेटा में लॉगिन हैं।</span>
          </div>
          <button
            type="button"
            onClick={onBackToAdmin}
            className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>वापस एडमिन पैनल जाएँ</span>
          </button>
        </div>
      )}

      {/* Top Banner for pharmacy info & quick scenario - Desktop only */}
      <div className="hidden sm:flex bg-slate-900 text-slate-100 text-xs px-4 sm:px-6 py-1.5 items-center justify-between gap-3">
        <div className="flex items-center gap-3 truncate">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <Store className="w-3.5 h-3.5" />
            <span className="truncate">{store.storeName}</span>
          </span>
          <span className="hidden md:inline text-slate-400">·</span>
          <span className="hidden md:inline text-slate-300">Admin: {store.ownerName}</span>
          <span className="hidden lg:inline text-slate-400">·</span>
          <span className="hidden lg:flex items-center gap-1 text-slate-300">
            <Phone className="w-3 h-3 text-emerald-400" />
            {store.phone}
          </span>
          <span className="hidden xl:inline text-slate-400">·</span>
          <span className="hidden xl:inline text-emerald-300 font-mono">
            Redeem at: {store.minRedeemPoints} pts (1 pt = {store.currencySymbol}{store.pointValueInRs})
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onQuickScenario}
            title="Auto-fill ₹500 Medicine + ₹300 General scenario"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-[11px] transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3 h-3" />
            <span>Test Example</span>
          </button>

          <button
            onClick={onOpenStoreManager}
            title="विभिन्न मेडिकल स्टोर्स जोड़ें व बदलें"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-xs"
          >
            <Building2 className="w-3 h-3" />
            <span>स्टोर्स ({totalStoresCount})</span>
          </button>

          <button
            onClick={onOpenStoreModal}
            className="text-slate-300 hover:text-white text-[11px] underline underline-offset-2 transition-colors cursor-pointer"
          >
            Edit Shop
          </button>

          {/* User Account / Login Pill */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <span className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{session.isSuperAdmin ? 'Admin (9662076010)' : store.phone}</span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              title="लॉगआउट करें"
              className="px-2 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Ultra-compact on mobile so it doesn't eat screen space */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 h-12 sm:h-14">
        {/* Zone 1: Wordmark & Store Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div 
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-xs">
              M+
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">
                MedPoints
              </div>
            </div>
          </div>

          {/* Quick Store Switcher Pill */}
          <button
            type="button"
            onClick={onOpenStoreManager}
            title="क्लिक करके स्टोर बदलें या नया स्टोर जोड़ें"
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 hover:text-emerald-900 rounded-lg text-[11px] font-semibold border border-slate-200 transition-all cursor-pointer max-w-[120px] sm:max-w-[180px] shadow-2xs"
          >
            <Store className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{store.storeName}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Zone 2: Navigation Links - Single line horizontal scroll without wrapping */}
        <nav ref={navRef} className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none touch-pan-x">
          <button
            onClick={() => setActiveTab('pos')}
            data-active={activeTab === 'pos'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ReceiptText className="w-4 h-4 text-emerald-600" />
            <span>Quick Bill & Points</span>
          </button>

          <button
            onClick={() => setActiveTab('tabs')}
            data-active={activeTab === 'tabs'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'tabs'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Custom Tabs & Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            data-active={activeTab === 'customers'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Customers & Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            data-active={activeTab === 'reminders'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reminders'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4 text-teal-600" />
            <span>दवा रिमाइंडर (Refills)</span>
            {dueRemindersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full animate-pulse">
                {dueRemindersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            data-active={activeTab === 'history'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>Bill History</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            data-active={activeTab === 'settings'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Store Settings</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAuthModal}
            title="लॉगिन करें या नया खाता बनाएं"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">खाता / लॉगिन</span>
            <span className="sm:hidden">लॉगिन</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="लॉगआउट"
            className="sm:hidden p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
