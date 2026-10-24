import React, { useState, useEffect } from 'react';
import { StoreProfile, AuthSession } from '../types';
import { 
  fetchAllStoresForAdmin, 
  toggleStoreStatus, 
  updateStorePin, 
  deleteStoreCloud,
  ADMIN_MOBILE 
} from '../utils/cloudSync';
import { 
  getCustomers, 
  getBills, 
  DEFAULT_STORE,
  setActiveStoreId
} from '../utils/storage';
import { 
  ShieldCheck, 
  Store, 
  Users, 
  ReceiptText, 
  Search, 
  LogOut, 
  KeyRound, 
  Check, 
  X, 
  AlertTriangle, 
  ArrowRight, 
  Lock, 
  Copy, 
  ExternalLink,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Plus,
  Download
} from 'lucide-react';

interface SuperAdminDashboardProps {
  session: AuthSession;
  onLogout: () => void;
  onEnterStoreView: (store: StoreProfile) => void;
  onOpenRegisterModal: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  session,
  onLogout,
  onEnterStoreView,
  onOpenRegisterModal,
}) => {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reset PIN modal state
  const [resetPinStore, setResetPinStore] = useState<StoreProfile | null>(null);
  const [newPinValue, setNewPinValue] = useState('');

  const loadStores = async () => {
    setLoading(true);
    const list = await fetchAllStoresForAdmin();
    setStores(list);
    setLoading(false);
  };

  useEffect(() => {
    loadStores();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = async (st: StoreProfile) => {
    const currentStatus = st.status || 'active';
    const updatedStatus = await toggleStoreStatus(st.id, currentStatus);
    showToast(`स्टोर "${st.storeName}" अब ${updatedStatus === 'active' ? 'सक्रिय (Active)' : 'ब्लॉक (Blocked)'} कर दिया गया है।`);
    loadStores();
  };

  const handleSaveNewPin = async () => {
    if (!resetPinStore || newPinValue.length !== 4) return;
    await updateStorePin(resetPinStore.id, newPinValue);
    showToast(`"${resetPinStore.storeName}" का नया पिन "${newPinValue}" सेट कर दिया गया!`);
    setResetPinStore(null);
    setNewPinValue('');
    loadStores();
  };

  const handleCopyLink = (storeId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?store=${storeId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedStoreId(storeId);
      showToast('सीधा स्टोर लिंक कॉपी हो गया!');
      setTimeout(() => setCopiedStoreId(null), 2000);
    });
  };

  // Filter stores by search query
  const filteredStores = stores.filter(st => {
    const q = searchQuery.toLowerCase();
    return (
      st.storeName.toLowerCase().includes(q) ||
      st.ownerName.toLowerCase().includes(q) ||
      st.phone.includes(q) ||
      (st.address && st.address.toLowerCase().includes(q))
    );
  });

  // Calculate platform statistics
  let totalCustomers = 0;
  let totalBills = 0;
  let totalTurnover = 0;

  stores.forEach(st => {
    const custs = getCustomers(st.id);
    const bills = getBills(st.id);
    totalCustomers += custs.length;
    totalBills += bills.length;
    totalTurnover += bills.reduce((acc, b) => acc + (b.finalAmount || 0), 0);
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Super Admin Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                MedPoints Super-Admin Master Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                Master Control
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Logged in as Super Admin: <span className="font-mono text-emerald-400 font-bold">{ADMIN_MOBILE}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/medpoints-code.zip"
            download="medpoints-code.zip"
            title="GitHub / Vercel पर अपलोड करने के लिए पूरी प्रोजेक्ट सोर्स कोड ज़िप डाउनलोड करें"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">📦 कोड ZIP डाउनलोड</span>
          </a>

          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ नया स्टोर रजिस्टर करें</span>
            <span className="sm:hidden">+ स्टोर</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
        </div>
      </header>

      {/* In-Page Notification Toast */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Global Platform Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">कुल मेडिकल स्टोर्स</span>
              <Store className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {stores.length}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>{stores.filter(s => s.status !== 'blocked').length} सक्रिय स्टोर्स</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">कुल ग्राहक (Customers)</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {totalCustomers}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              पूरे नेटवर्क में जुड़े मरीज व ग्राहक
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">कुल बिल (Invoices)</span>
              <ReceiptText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {totalBills}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              लॉयल्टी पॉइंट्स के साथ जारी किए गए बिल
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">कुल सेल्स टर्नओवर (GMV)</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              ₹{totalTurnover.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-400/80 mt-1">
              सभी स्टोर्स की कुल बिलिंग वैल्यू
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="दुकान, मालिक या मोबाइल से खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={loadStores}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-medium cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Stores Directory Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>सभी रजिस्टर्ड मेडिकल स्टोर्स ({filteredStores.length})</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              एडमिन के रूप में आप किसी भी स्टोर में प्रवेश कर सकते हैं और उनका पासवर्ड देख/बदल सकते हैं।
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map((st) => {
              const custCount = getCustomers(st.id).length;
              const storeBills = getBills(st.id);
              const storeSales = storeBills.reduce((acc, b) => acc + (b.finalAmount || 0), 0);
              const isBlocked = st.status === 'blocked';
              const currentPin = st.pin || st.adminPin || '1234';

              return (
                <div
                  key={st.id}
                  className={`bg-slate-800/90 border rounded-2xl p-4 flex flex-col justify-between transition-all relative ${
                    isBlocked 
                      ? 'border-rose-900/60 bg-rose-950/20 opacity-80' 
                      : 'border-slate-700 hover:border-slate-600 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white truncate">
                            {st.storeName}
                          </h3>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          मालिक: <span className="text-slate-200 font-medium">{st.ownerName}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isBlocked 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {isBlocked ? 'ब्लॉक (Blocked)' : 'सक्रिय (Active)'}
                      </span>
                    </div>

                    {/* Mobile & PIN Box */}
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700/60 space-y-1.5 mb-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Login ID:</span>
                        </span>
                        <span className="font-mono font-bold text-white">{st.phone}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span>4-अंकों का PIN:</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-amber-300 tracking-wider bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            {currentPin}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setResetPinStore(st); setNewPinValue(currentPin); }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                          >
                            पिन बदलें
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Address & DL Info */}
                    <div className="text-[11px] text-slate-400 space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{st.address || 'Address not added'}</span>
                      </div>
                      {st.dlNumber && (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                          <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>DL: {st.dlNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/60 rounded-xl text-center border border-slate-700/40 mb-3 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">ग्राहक</div>
                        <div className="font-bold text-slate-200">{custCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">बिल</div>
                        <div className="font-bold text-slate-200">{storeBills.length}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">टर्नओवर</div>
                        <div className="font-bold text-emerald-400">₹{storeSales.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/80">
                    <button
                      type="button"
                      onClick={() => onEnterStoreView(st)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>स्टोर में प्रवेश करें (Login As Store)</span>
                    </button>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(st.id)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          copiedStoreId === st.id
                            ? 'bg-emerald-900/60 text-emerald-300'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        {copiedStoreId === st.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedStoreId === st.id ? 'लिंक कॉपीड' : 'स्टोर लिंक कॉपी'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(st)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          isBlocked
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                        }`}
                      >
                        {isBlocked ? 'सक्रिय करें' : 'ब्लॉक करें'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Reset PIN Modal */}
      {resetPinStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>पिन रीसेट करें</span>
              </h3>
              <button onClick={() => setResetPinStore(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              स्टोर: <strong className="text-white">{resetPinStore.storeName}</strong> ({resetPinStore.phone})
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">
                नया 4-अंकों का पिन (New PIN):
              </label>
              <input
                type="text"
                maxLength={4}
                value={newPinValue}
                onChange={(e) => setNewPinValue(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-base font-mono font-bold tracking-widest text-center text-amber-300 focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetPinStore(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSaveNewPin}
                disabled={newPinValue.length !== 4}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs disabled:opacity-50 cursor-pointer shadow-xs"
              >
                पिन सेव करें
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
