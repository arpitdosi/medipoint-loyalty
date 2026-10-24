import React, { useState, useEffect } from 'react';
import { StoreProfile, StoreSummary } from '../types';
import {
  getAllStores,
  getActiveStoreId,
  setActiveStoreId,
  createNewStore,
  deleteStore,
  getStoreSummaries,
  exportSingleStore,
  exportAllStores,
  importStorePackage,
  resetStoreData,
  DEFAULT_STORE
} from '../utils/storage';
import {
  Store,
  Plus,
  ArrowRight,
  Download,
  Upload,
  Copy,
  Check,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck,
  Cloud,
  Layers,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface StoreManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreSwitched: (newStore: StoreProfile) => void;
}

export const StoreManagerModal: React.FC<StoreManagerModalProps> = ({
  isOpen,
  onClose,
  onStoreSwitched,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'backup' | 'saas'>('list');
  const [storeSummaries, setStoreSummaries] = useState<StoreSummary[]>([]);
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Store Form State
  const [newStoreData, setNewStoreData] = useState({
    storeName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    dlNumber: '',
    gstin: '',
    minRedeemPoints: 50,
    pointValueInRs: 1,
    adminPin: '1234',
    cloneDefaultTabs: true,
    seedSampleData: false,
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadStores = () => {
    setStoreSummaries(getStoreSummaries());
  };

  useEffect(() => {
    if (isOpen) {
      loadStores();
    }
  }, [isOpen]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!isOpen) return null;

  const handleSwitchStore = (storeId: string) => {
    setActiveStoreId(storeId);
    const all = getAllStores();
    const target = all.find(s => s.id === storeId) || DEFAULT_STORE;
    showToast(`सफलतापूर्वक "${target.storeName}" में स्विच किया गया!`);
    loadStores();
    onStoreSwitched(target);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreData.storeName.trim() || !newStoreData.ownerName.trim() || !newStoreData.phone.trim()) {
      showToast('कृपया दुकान का नाम, मालिक का नाम और फोन नंबर दर्ज करें।', 'error');
      return;
    }

    const created = createNewStore(
      {
        storeName: newStoreData.storeName,
        ownerName: newStoreData.ownerName,
        phone: newStoreData.phone,
        email: newStoreData.email,
        address: newStoreData.address,
        dlNumber: newStoreData.dlNumber,
        gstin: newStoreData.gstin,
        minRedeemPoints: Number(newStoreData.minRedeemPoints) || 50,
        pointValueInRs: Number(newStoreData.pointValueInRs) || 1,
        adminPin: newStoreData.adminPin || '1234',
        pin: newStoreData.adminPin || '1234',
      },
      {
        cloneDefaultTabs: newStoreData.cloneDefaultTabs,
        seedSampleData: newStoreData.seedSampleData,
      }
    );

    showToast(`नया स्टोर "${created.storeName}" सफलतापूर्वक रजिस्टर हो गया!`);
    loadStores();
    setActiveStoreId(created.id);
    onStoreSwitched(created);

    // Reset form
    setNewStoreData({
      storeName: '',
      ownerName: '',
      phone: '',
      email: '',
      address: '',
      dlNumber: '',
      gstin: '',
      minRedeemPoints: 50,
      pointValueInRs: 1,
      adminPin: '1234',
      cloneDefaultTabs: true,
      seedSampleData: false,
    });

    setActiveTab('list');
  };

  const handleCopyLink = (storeId: string) => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const directUrl = `${origin}${path}?store=${storeId}`;

    navigator.clipboard.writeText(directUrl).then(() => {
      setCopiedStoreId(storeId);
      showToast('सीधा स्टोर लिंक कॉपी हो गया! इसे WhatsApp या ईमेल पर शेयर करें।');
      setTimeout(() => setCopiedStoreId(null), 2500);
    }).catch(() => {
      showToast('लिंक कॉपी करने में असमर्थ।', 'error');
    });
  };

  const handleDownloadSingleStore = (storeId: string, storeName: string) => {
    const jsonStr = exportSingleStore(storeId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`"${storeName}" का बैकअप डाउनलोड हो गया!`);
  };

  const handleDownloadAllStores = () => {
    const jsonStr = exportAllStores();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medpoints_all_stores_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('सभी मेडिकल स्टोर्स का कम्प्लीट बैकअप डाउनलोड हो गया!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importStorePackage(content);
      if (res.success) {
        showToast(res.message);
        loadStores();
        if (res.storeId) {
          const all = getAllStores();
          const target = all.find(s => s.id === res.storeId);
          if (target) onStoreSwitched(target);
        }
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteStore = (storeId: string) => {
    const success = deleteStore(storeId);
    if (success) {
      showToast('स्टोर सफलतापूर्वक हटा दिया गया।');
      loadStores();
      const currentActiveId = getActiveStoreId();
      const all = getAllStores();
      const current = all.find(s => s.id === currentActiveId) || DEFAULT_STORE;
      onStoreSwitched(current);
    } else {
      showToast('कम से कम एक मेडिकल स्टोर होना अनिवार्य है। इसे डिलीट नहीं किया जा सकता।', 'error');
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-hidden">
      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] max-w-4xl bg-white sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Sticky Modal Top Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  Multi-Store Manager (मल्टी-स्टोर प्रबंधन)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                  Option 1 Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                अलग-अलग मेडिकल स्टोर्स को अलग डेटा व प्रोफाइल के साथ चलाएं या लिंक शेयर करें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* In-Modal Toast Banner */}
        {toastMessage && (
          <div className={`px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{toastMessage.text}</span>
            </span>
            <button onClick={() => setToastMessage(null)} className="p-0.5 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="shrink-0 flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>सभी मेडिकल स्टोर्स ({storeSummaries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'add'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ नया स्टोर जोड़ें (New Store)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>डेटा एक्सपोर्ट / इम्पोर्ट</span>
          </button>

          <button
            onClick={() => setActiveTab('saas')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors flex items-center gap-1.5 shrink-0 border-b-2 cursor-pointer ml-auto ${
              activeTab === 'saas'
                ? 'bg-white text-indigo-800 border-indigo-600 shadow-xs'
                : 'text-indigo-600 hover:text-indigo-900 border-transparent'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-indigo-500" />
            <span>Option 2 (Cloud Upgrade) Preview</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: LIST OF STORES */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    पंजीकृत मेडिकल स्टोर्स (Registered Pharmacies)
                  </h3>
                  <p className="text-xs text-slate-500">
                    जिस स्टोर पर काम करना चाहते हैं उस पर क्लिक करें। प्रत्येक स्टोर का डेटा (कस्टमर्स, बिल, पॉइंट्स) अलग और निजी रहता है।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>नया स्टोर जोड़ें</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storeSummaries.map((st) => (
                  <div
                    key={st.id}
                    className={`rounded-xl border p-4 transition-all relative ${
                      st.isActive
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Header line of store card */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                          st.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {st.storeName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {st.storeName}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>मालिक: {st.ownerName}</span>
                            <span>·</span>
                            <span className="font-mono text-emerald-700 font-semibold">{st.phone}</span>
                          </div>
                        </div>
                      </div>

                      {st.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 shadow-xs">
                          <Check className="w-3 h-3" />
                          <span>सक्रिय स्टोर</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSwitchStore(st.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-600 text-white text-[11px] font-semibold rounded-md shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>खोलें</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Address & Drug License */}
                    <div className="text-[11px] text-slate-600 space-y-1 mb-3 bg-white/70 p-2 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{st.address || 'Address not set'}</span>
                      </div>
                      {st.dlNumber && (
                        <div className="flex items-center gap-1.5 truncate text-[10px] font-mono text-slate-500">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>DL No: {st.dlNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Isolated Data Metrics */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-lg text-center border border-slate-200/60 mb-3">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">कुल ग्राहक</div>
                        <div className="text-xs font-bold text-slate-900">{st.customerCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">कुल बिल</div>
                        <div className="text-xs font-bold text-slate-900">{st.billCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">कुल बिक्री</div>
                        <div className="text-xs font-bold text-emerald-700">₹{st.totalSales.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(st.id)}
                          title="इस स्टोर का सीधा लिंक कॉपी करें (WhatsApp पर भेजें)"
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            copiedStoreId === st.id
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {copiedStoreId === st.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                          <span>{copiedStoreId === st.id ? 'लिंक कॉपीड' : 'स्टोर लिंक कॉपी'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadSingleStore(st.id, st.storeName)}
                          title="इस स्टोर का पूरा बैकअप डाउनलोड करें"
                          className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>बैकअप</span>
                        </button>
                      </div>

                      {/* Delete button (with confirm) */}
                      {storeSummaries.length > 1 && (
                        <div>
                          {confirmDeleteId === st.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteStore(st.id)}
                                className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                              >
                                पक्का डिलीट
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-1 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                              >
                                रद्द
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(st.id)}
                              title="स्टोर हटाएं"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Distribution Help Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>दूसरे मेडिकल स्टोर वाले को सॉफ्टवेयर कैसे दें? (Option 1 Workflow)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  १. <strong>"+ नया स्टोर जोड़ें"</strong> टैब में उस मेडिकल स्टोर की जानकारी (नाम, मालिक, फोन) डालें।<br />
                  २. फिर उस कार्ड पर <strong>"स्टोर लिंक कॉपी"</strong> बटन दबाएं।<br />
                  ३. वह लिंक सीधे उस मेडिकल स्टोर मालिक को WhatsApp कर दें। जब वे अपने कंप्यूटर या मोबाइल ब्राउज़र में वह लिंक खोलेंगे, तो उनका अपना स्टोर लोड हो जाएगा और वे तुरंत ग्राहकों को पॉइंट्स देना शुरू कर सकते हैं!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW STORE */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateStore} className="space-y-5 max-w-2xl mx-auto">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>नए मेडिकल स्टोर का विवरण दर्ज करें</span>
                </h3>
                <p className="text-xs text-slate-500">
                  इस नए स्टोर के लिए एक अलग, स्वतंत्र डेटाबेस (Private Isolated Space) तैयार किया जाएगा।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    मेडिकल स्टोर / फार्मेसी का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. श्री बालाजी मेडिकोज, अपोलो फार्मेसी..."
                    value={newStoreData.storeName}
                    onChange={(e) => setNewStoreData({ ...newStoreData, storeName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    मालिक / केमिस्ट का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. डॉ. अमित शर्मा, राहुल गुप्ता..."
                    value={newStoreData.ownerName}
                    onChange={(e) => setNewStoreData({ ...newStoreData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    व्हाट्सएप / संपर्क मोबाइल नंबर *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="उदा. 9829012345"
                    value={newStoreData.phone}
                    onChange={(e) => setNewStoreData({ ...newStoreData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    दुकान का पूरा पता
                  </label>
                  <input
                    type="text"
                    placeholder="दुकान नंबर, मार्केट का नाम, शहर, राज्य..."
                    value={newStoreData.address}
                    onChange={(e) => setNewStoreData({ ...newStoreData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ड्रग लाइसेंस नंबर (DL No.)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. RJ-JP-2024-5510"
                    value={newStoreData.dlNumber}
                    onChange={(e) => setNewStoreData({ ...newStoreData, dlNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    GSTIN नंबर (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="08AAAAA0000A1Z5"
                    value={newStoreData.gstin}
                    onChange={(e) => setNewStoreData({ ...newStoreData, gstin: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    रिडीम करने हेतु न्यूनतम पॉइंट्स
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={newStoreData.minRedeemPoints}
                    onChange={(e) => setNewStoreData({ ...newStoreData, minRedeemPoints: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500">डिफ़ॉल्ट 50 पॉइंट्स</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1 पॉइंट का रुपया मूल्य (₹)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newStoreData.pointValueInRs}
                    onChange={(e) => setNewStoreData({ ...newStoreData, pointValueInRs: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500">डिफ़ॉल्ट 1 पॉइंट = ₹1</span>
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={newStoreData.cloneDefaultTabs}
                    onChange={(e) => setNewStoreData({ ...newStoreData, cloneDefaultTabs: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>डिफ़ॉल्ट कैटेगरी टैब्स लोड करें (दवाइयाँ 1%, सर्जिकल 1%, जनरल 0%)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={newStoreData.seedSampleData}
                    onChange={(e) => setNewStoreData({ ...newStoreData, seedSampleData: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>टेस्टिंग के लिए 1-2 सैंपल कस्टमर व बिल भी शामिल करें (अन्यथा खाली शुरू होगा)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>स्टोर रजिस्टर करें व तुरंत खोलें</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BACKUP & DATA DISTRIBUTION */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  डेटा बैकअप, एक्सपोर्ट व रीस्टोर
                </h3>
                <p className="text-xs text-slate-500">
                  प्रत्येक स्टोर का डेटा अलग से डाउनलोड करें या एक साथ पूरे सिस्टम का बैकअप लें।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Download All Stores */}
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                      <Download className="w-4 h-4" />
                      <span>Full Multi-Store System Backup</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      आपके सभी {storeSummaries.length} मेडिकल स्टोर्स का पूरा डेटा (कस्टमर्स, बिल, सेटिंग्स) एक ही JSON फ़ाइल में सुरक्षित डाउनलोड करें।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadAllStores}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    सभी स्टोर्स का बैकअप डाउनलोड करें
                  </button>
                </div>

                {/* Import Backup */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold mb-1">
                      <Upload className="w-4 h-4 text-emerald-700" />
                      <span>Backup File Restore / Import</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      किसी भी पहले से डाउनलोड की गई बैकअप फ़ाइल (.json) को अपलोड करके किसी नए कंप्यूटर या डिवाइस पर शुरू करें।
                    </p>
                  </div>
                  <label className="w-full py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold text-center transition-colors cursor-pointer shadow-xs block">
                    <span>फ़ाइल चुनें (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Individual Store Backups list */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">
                  व्यक्तिगत स्टोर बैकअप (Single Store Downloads)
                </h4>
                <div className="divide-y divide-slate-100">
                  {storeSummaries.map(st => (
                    <div key={st.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{st.storeName}</span>
                        <span className="text-slate-400 ml-2">({st.customerCount} ग्राहक, {st.billCount} बिल)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingleStore(st.id, st.storeName)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>JSON डाउनलोड</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPTION 2 CLOUD UPGRADE ROADMAP */}
          {activeTab === 'saas' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Cloud className="w-5 h-5 text-indigo-600" />
                  <span>Option 2 (Central Cloud Database & Super-Admin) की तैयारी</span>
                </div>
                <p className="text-xs text-indigo-950 leading-relaxed">
                  आप अभी <strong>Option 1 (मल्टी-स्टोर आर्किटेक्चर)</strong> पर सुरक्षित रूप से काम कर रहे हैं। जब भी आप चाहें, इसमें बिना किसी पुराने डेटा को खोए Option 2 जोड़ दिया जाएगा!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Option 2 जुड़ने पर क्या-क्या सुविधाएं मिलेंगी:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>1. सेंट्रलाइज्ड सुपर-एडमिन पैनल</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      एक ही मास्टर डैशबोर्ड से आप देख पाएंगे कि किस मेडिकल स्टोर ने आज कितने बिल बनाए और कितने पॉइंट्स दिए।
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-blue-600" />
                      <span>2. ऑटो क्लाउड बैकअप</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      अगर किसी दुकानदार का फोन या कंप्यूटर खराब भी हो जाए, तो क्लाउड लॉगिन करते ही 1 सेकंड में सारा डेटा वापस मिल जाएगा।
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>3. मंथली सब्सक्रिप्शन लाइसेंस</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      आप हर मेडिकल स्टोर से ₹500 या ₹1000 प्रति महीना चार्ज कर सकते हैं और उनका एक्सेस 1-क्लिक में रिन्यू कर सकते हैं।
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-indigo-600" />
                      <span>4. जीरो डेटा लॉस माइग्रेशन</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      अभी का बनाया गया प्रत्येक स्टोर का डेटा (कस्टमर्स व बिल) अपने आप उस स्टोर के अकाउंट में सुरक्षित अपलोड हो जाएगा।
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-emerald-400">
                    Option 2 जोड़ने के लिए तैयार हैं?
                  </div>
                  <div className="text-[11px] text-slate-300">
                    जब भी आप चाहें, बस हमें बताएं और हम क्लाउड डेटाबेस (Firebase / Cloud SQL) कनेक्ट कर देंगे।
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  अभी Option 1 से काम जारी रखें
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px]">
            सक्रिय स्टोर ID: <code className="font-mono text-emerald-800 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded">{getActiveStoreId()}</code>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition-colors"
          >
            बंद करें (Done)
          </button>
        </div>

      </div>
    </div>
  );
};
