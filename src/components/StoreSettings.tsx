import React, { useState } from 'react';
import { StoreProfile } from '../types';
import { 
  Settings, 
  Store, 
  ShieldCheck, 
  MessageSquare, 
  Database, 
  Download, 
  Upload, 
  RotateCcw,
  Check,
  AlertTriangle,
  Copy,
  Building2,
  ExternalLink,
  Cloud,
  Sparkles,
  X
} from 'lucide-react';
import { 
  resetAllDataToDefault, 
  resetStoreData,
  exportSingleStore, 
  exportAllStores, 
  importStorePackage, 
  getAllStores,
  getActiveStoreId,
  DEFAULT_STORE 
} from '../utils/storage';

interface StoreSettingsProps {
  store: StoreProfile;
  onSaveStore: (store: StoreProfile) => void;
  onRefreshAllData: () => void;
  onOpenStoreManager?: () => void;
}

export const StoreSettings: React.FC<StoreSettingsProps> = ({
  store,
  onSaveStore,
  onRefreshAllData,
  onOpenStoreManager,
}) => {
  const [formData, setFormData] = useState<StoreProfile>({ ...store });
  const [saved, setSaved] = useState(false);
  const [activeFieldInfo, setActiveFieldInfo] = useState<{ label: string; value: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStore(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, fieldLabel?: string) => {
    if ('select' in e.target && typeof (e.target as HTMLInputElement).select === 'function') {
      (e.target as HTMLInputElement).select();
    }
    if (fieldLabel) {
      setActiveFieldInfo({ label: fieldLabel, value: e.target.value });
    }
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleInputBlur = () => {
    // slight delay so clicking helper buttons doesn't immediately dismiss
    setTimeout(() => setActiveFieldInfo(null), 300);
  };

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleCopyDirectLink = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const url = `${origin}${path}?store=${formData.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      showFeedback('सीधा स्टोर लिंक कॉपी हो गया! इसे WhatsApp पर शेयर करें।');
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      showFeedback('लिंक कॉपी नहीं हो सका।', 'error');
    });
  };

  const handleExportThisStore = () => {
    const jsonStr = exportSingleStore(formData.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.storeName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback(`"${formData.storeName}" का बैकअप डाउनलोड हो गया!`);
  };

  const handleExportAllStores = () => {
    const jsonStr = exportAllStores();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medpoints_all_stores_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('सभी स्टोर्स का कम्प्लीट बैकअप डाउनलोड हो गया!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importStorePackage(event.target?.result as string);
      if (res.success) {
        showFeedback(res.message);
        onRefreshAllData();
      } else {
        showFeedback(res.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    resetAllDataToDefault();
    onRefreshAllData();
    setShowResetConfirm(false);
    showFeedback('डेमो डेटा सफलतापूर्वक रीस्टोर हो गया!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-72 sm:pb-12">
      {/* Mobile Active Typing Live Helper Strip */}
      {activeFieldInfo && (
        <div className="sm:hidden sticky top-12 z-30 -mx-3 px-4 py-2 bg-slate-900 text-white text-xs flex items-center justify-between shadow-md border-b border-emerald-500 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-bold text-emerald-300 shrink-0">{activeFieldInfo.label}:</span>
            <span className="truncate text-slate-100 font-medium">"{activeFieldInfo.value || 'टाइप करें...'}"</span>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0 ml-2">Editing</span>
        </div>
      )}

      {/* In-Page Toast Feedback */}
      {feedbackMessage && (
        <div className={`px-4 py-3 text-xs font-semibold rounded-xl flex items-center justify-between gap-2 shadow-xs transition-all ${
          feedbackMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </span>
          <button onClick={() => setFeedbackMessage(null)} className="p-0.5 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Multi-Store SaaS Distribution & Direct Access Card (Option 1) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Multi-Store SaaS Hub (मल्टी-स्टोर डिस्ट्रीब्यूशन)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Option 1 Active
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                वर्तमान में खुला स्टोर: <strong className="text-white">{formData.storeName}</strong> (ID: <code className="font-mono text-emerald-300">{formData.id}</code>)
              </p>
            </div>
          </div>

          {onOpenStoreManager && (
            <button
              type="button"
              onClick={onOpenStoreManager}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Store className="w-4 h-4" />
              <span>स्टोर बदलें / नया स्टोर जोड़ें</span>
            </button>
          )}
        </div>

        {/* Direct Link Share Row */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>इस स्टोर का सीधा लिंक (Direct Link for this Pharmacy):</span>
            </div>
            <div className="text-[11px] font-mono text-indigo-300 truncate select-all">
              {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?store=${formData.id}` : `?store=${formData.id}`}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyDirectLink}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              copiedLink 
                ? 'bg-emerald-500 text-slate-950' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'लिंक कॉपीड!' : 'सीधा लिंक कॉपी करें'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>Store Profile & Loyalty Configuration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Shop details, redemption thresholds, WhatsApp notification templates and data backups
          </p>
        </div>

        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Check className="w-4 h-4" />
            <span>Saved Successfully!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Store Registration */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>1. Medical Store Information (दुकान का विवरण)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onFocus={(e) => handleInputFocus(e, 'दुकान का नाम')}
                onBlur={handleInputBlur}
                onChange={(e) => {
                  setFormData({ ...formData, storeName: e.target.value });
                  setActiveFieldInfo({ label: 'दुकान का नाम', value: e.target.value });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 text-base sm:text-xs scroll-mt-28"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Owner / Pharmacist Name *
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onFocus={(e) => handleInputFocus(e, 'मालिक का नाम')}
                onBlur={handleInputBlur}
                onChange={(e) => {
                  setFormData({ ...formData, ownerName: e.target.value });
                  setActiveFieldInfo({ label: 'मालिक का नाम', value: e.target.value });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 text-base sm:text-xs scroll-mt-28"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store WhatsApp / Mobile Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onFocus={(e) => handleInputFocus(e, 'मोबाइल नंबर')}
                onBlur={handleInputBlur}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setActiveFieldInfo({ label: 'मोबाइल नंबर', value: e.target.value });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-slate-900 text-base sm:text-xs scroll-mt-28"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Drug License (D.L.) No.
              </label>
              <input
                type="text"
                value={formData.dlNumber || ''}
                onFocus={(e) => handleInputFocus(e, 'ड्रग लाइसेंस')}
                onBlur={handleInputBlur}
                onChange={(e) => {
                  setFormData({ ...formData, dlNumber: e.target.value });
                  setActiveFieldInfo({ label: 'ड्रग लाइसेंस', value: e.target.value });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 text-base sm:text-xs scroll-mt-28"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Shop Address (Printed on Receipt & WhatsApp)
              </label>
              <input
                type="text"
                value={formData.address}
                onFocus={(e) => handleInputFocus(e, 'दुकान का पता')}
                onBlur={handleInputBlur}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  setActiveFieldInfo({ label: 'दुकान का पता', value: e.target.value });
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 text-base sm:text-xs scroll-mt-28"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Loyalty Program Core Rules */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>2. Loyalty Points & Redemption Rules (पॉइंट्स नियम)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="block font-bold text-slate-800">
                Minimum Points Required To Redeem
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, minRedeemPoints: Math.max(10, (formData.minRedeemPoints || 50) - 10) })}
                    className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold border-r border-slate-200 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={10}
                    step={5}
                    placeholder="50"
                    value={formData.minRedeemPoints === 0 ? '' : formData.minRedeemPoints}
                    onFocus={handleInputFocus}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                      setFormData({ ...formData, minRedeemPoints: clean === '' ? 0 : parseInt(clean, 10) });
                    }}
                    onBlur={() => {
                      if (!formData.minRedeemPoints || formData.minRedeemPoints < 10) {
                        setFormData({ ...formData, minRedeemPoints: 50 });
                      }
                    }}
                    className="w-16 py-1.5 text-center font-mono font-bold text-base text-slate-900 focus:outline-none scroll-mt-28"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, minRedeemPoints: (formData.minRedeemPoints || 50) + 10 })}
                    className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold border-l border-slate-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="font-semibold text-slate-700">Points (Default: 50)</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {[25, 50, 100].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => setFormData({ ...formData, minRedeemPoints: pts })}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                      formData.minRedeemPoints === pts
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {pts} Pts
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Customer ke account me kam se kam itne points jama hone par hi unhe chhut (discount) milegi.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="block font-bold text-slate-800">
                1 Point Ki Value (₹ Me - Fix Digit: 1, 2, 3...)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-base">₹</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pointValueInRs: Math.max(1, (formData.pointValueInRs || 1) - 1) })}
                    className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold border-r border-slate-200 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="1"
                    value={formData.pointValueInRs === 0 ? '' : formData.pointValueInRs}
                    onFocus={handleInputFocus}
                    onChange={(e) => {
                      // Fix: Clean leading zeros so 1 or 2 never becomes 01 or 02
                      const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                      setFormData({ ...formData, pointValueInRs: clean === '' ? 0 : parseInt(clean, 10) });
                    }}
                    onBlur={() => {
                      if (!formData.pointValueInRs || formData.pointValueInRs < 1) {
                        setFormData({ ...formData, pointValueInRs: 1 });
                      }
                    }}
                    className="w-14 py-1.5 text-center font-mono font-bold text-base text-slate-900 focus:outline-none scroll-mt-28"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pointValueInRs: (formData.pointValueInRs || 1) + 1 })}
                    className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold border-l border-slate-200 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="font-semibold text-slate-700">Rupees (Fixed 1 या 2)</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData({ ...formData, pointValueInRs: val })}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                      formData.pointValueInRs === val
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                1 Point = ₹{formData.pointValueInRs || 1} discount on bill. (Fixed digits: 1 ya 2, no decimals).
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: WhatsApp Message Templates (तीनों संदेश शुद्ध हिंदी में) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>3. WhatsApp Message Templates (तीनों संदेश शुद्ध हिंदी में)</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  whatsappMessageTemplate: DEFAULT_STORE.whatsappMessageTemplate,
                  redeemMessageTemplate: DEFAULT_STORE.redeemMessageTemplate,
                  medicineReminderTemplate: DEFAULT_STORE.medicineReminderTemplate,
                });
              }}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 cursor-pointer"
            >
              तीनों मैसेज हिंदी में रीसेट करें
            </button>
          </div>

          <div className="space-y-5">
            {/* Template 1: Points Earned */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-900 text-xs">
                  १. बिल व नए लॉयल्टी पॉइंट्स का संदेश (Bill & Points Earned):
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, whatsappMessageTemplate: DEFAULT_STORE.whatsappMessageTemplate })}
                  className="text-[10px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  हिंदी फॉर्मेट लोड करें
                </button>
              </div>
              <textarea
                rows={7}
                value={formData.whatsappMessageTemplate}
                onFocus={(e) => handleInputFocus(e, 'पॉइंट्स मैसेज')}
                onBlur={handleInputBlur}
                onChange={(e) => {
                  setFormData({ ...formData, whatsappMessageTemplate: e.target.value });
                  setActiveFieldInfo({ label: 'पॉइंट्स मैसेज', value: e.target.value.slice(0, 30) });
                }}
                className="w-full p-3 font-mono text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 leading-relaxed bg-slate-900 text-emerald-300"
              />
              <p className="text-[11px] text-slate-500">
                उपलब्ध टैग्स: <code className="text-emerald-700 font-mono text-[10px]">{`{STORE_NAME}, {CUSTOMER_NAME}, {BILL_NUMBER}, {TOTAL_BILL}, {POINTS_EARNED}, {POINTS_BALANCE}, {POINTS_VALUE}, {POINTS_REDEEM_INFO}`}</code>
              </p>
            </div>

            {/* Template 2: Points Redeemed */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-900 text-xs">
                  २. पॉइंट्स डिस्काउंट / रिडीम का संदेश (Points Redeemed):
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, redeemMessageTemplate: DEFAULT_STORE.redeemMessageTemplate })}
                  className="text-[10px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  हिंदी फॉर्मेट लोड करें
                </button>
              </div>
              <textarea
                rows={6}
                value={formData.redeemMessageTemplate}
                onFocus={(e) => handleInputFocus(e, 'रिडीम मैसेज')}
                onBlur={handleInputBlur}
                onChange={(e) => {
                  setFormData({ ...formData, redeemMessageTemplate: e.target.value });
                  setActiveFieldInfo({ label: 'रिडीम मैसेज', value: e.target.value.slice(0, 30) });
                }}
                className="w-full p-3 font-mono text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 leading-relaxed bg-slate-900 text-emerald-300"
              />
              <p className="text-[11px] text-slate-500">
                उपलब्ध टैग्स: <code className="text-emerald-700 font-mono text-[10px]">{`{STORE_NAME}, {CUSTOMER_NAME}, {BILL_NUMBER}, {FINAL_BILL}, {POINTS_REDEEMED}, {DISCOUNT_AMOUNT}, {POINTS_BALANCE}`}</code>
              </p>
            </div>

            {/* Template 3: Medicine Refill Reminder */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-900 text-xs">
                  ३. मासिक दवा रिफिल रिमाइंडर (शुद्ध हिंदी WhatsApp संदेश):
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, medicineReminderTemplate: DEFAULT_STORE.medicineReminderTemplate })}
                  className="text-[10px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  हिंदी फॉर्मेट लोड करें
                </button>
              </div>
              <textarea
                rows={7}
                value={formData.medicineReminderTemplate}
                onFocus={(e) => handleInputFocus(e, 'दवा रिमाइंडर मैसेज')}
                onBlur={handleInputBlur}
                onChange={(e) => {
                  setFormData({ ...formData, medicineReminderTemplate: e.target.value });
                  setActiveFieldInfo({ label: 'दवा रिमाइंडर मैसेज', value: e.target.value.slice(0, 30) });
                }}
                className="w-full p-3 font-mono text-base sm:text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 leading-relaxed bg-slate-900 text-emerald-300"
              />
              <p className="text-[11px] text-slate-500">
                उपलब्ध टैग्स: <code className="text-emerald-700 font-mono text-[10px]">{`{STORE_NAME}, {CUSTOMER_NAME}, {MEDICINE_NAME}, {DUE_DATE}, {POINTS_BALANCE}, {STORE_PHONE}, {STORE_ADDRESS}`}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Settings Save Karein</span>
          </button>
        </div>
      </form>

      {/* Section 4: Data Management & Multi-Store Backup */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-4 h-4 text-emerald-600" />
          <span>4. Data Backup, Multi-Store Export & Reset</span>
        </h2>

        <p className="text-xs text-slate-600">
          आपका डेटा आपके डिवाइस में पूरी तरह सुरक्षित और प्राइवेट रहता है। आप केवल वर्तमान स्टोर का बैकअप ले सकते हैं या सभी मेडिकल स्टोर्स का पूरा पैकेज डाउनलोड कर सकते हैं।
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportThisStore}
            title="वर्तमान मेडिकल स्टोर का डेटा डाउनलोड करें"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>इस स्टोर का बैकअप ({formData.storeName})</span>
          </button>

          <button
            type="button"
            onClick={handleExportAllStores}
            title="सभी पंजीकृत मेडिकल स्टोर्स का डेटा एक साथ डाउनलोड करें"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>सभी स्टोर्स का कम्प्लीट सिस्टम बैकअप</span>
          </button>

          {/* 1-Click Source Code ZIP Download for GitHub & Vercel */}
          <a
            href="/medpoints-code.zip"
            download="medpoints-code.zip"
            title="Vercel और GitHub पर अपलोड करने के लिए पूरी प्रोजेक्ट सोर्स कोड ज़िप फ़ाइल"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            <span>📦 प्रोजेक्ट कोड ZIP डाउनलोड करें (Vercel / GitHub हेतु)</span>
          </a>

          <label className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-300 text-xs cursor-pointer shadow-xs transition-colors">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>बैकअप फ़ाइल रीस्टोर करें (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg border border-rose-200 text-xs cursor-pointer ml-auto transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>डेमो डेटा में रीसेट करें</span>
          </button>
        </div>
      </div>

      {/* In-App Confirmation Modal for Reset (No window.confirm) */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">डेमो डेटा रीसेट की पुष्टि</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                क्या आप वाकई सभी ग्राहकों, बिलों और सेटिंग्स को शुरुआती डिफ़ॉल्ट डेमो डेटा में रीसेट करना चाहते हैं?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                नहीं, रद्द करें
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                हाँ, रीसेट करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
