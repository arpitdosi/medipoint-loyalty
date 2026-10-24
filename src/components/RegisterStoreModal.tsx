import React, { useState } from 'react';
import { StoreProfile } from '../types';
import { Store, X, Check, ShieldCheck } from 'lucide-react';

interface RegisterStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreProfile;
  onSaveStore: (updated: StoreProfile) => void;
}

export const RegisterStoreModal: React.FC<RegisterStoreModalProps> = ({
  isOpen,
  onClose,
  store,
  onSaveStore,
}) => {
  const [formData, setFormData] = useState<StoreProfile>({ ...store });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStore(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  // Helper to ensure input stays in view when mobile virtual keyboard opens without pushing tabs away
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden">
      <div className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] max-w-lg bg-white sm:rounded-xl shadow-2xl border-0 sm:border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Modal Top Header - Always visible */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                Medical Store Profile (दुकान का विवरण)
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Aapki shop details & loyalty points rules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body with ample padding for mobile virtual keyboard */}
        <form 
          onSubmit={handleSubmit} 
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3.5 text-xs pb-44 sm:pb-6 scroll-py-8"
        >
          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg flex items-center gap-2 font-medium text-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Medical Store details safaltapoorvak save ho gayi hain!</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Medical Store / Shop Ka Naam *
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onFocus={handleInputFocus}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g. Sanjeevani Medicos & Healthcare"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 text-base sm:text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Owner / Pharmacist Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onFocus={handleInputFocus}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shop WhatsApp / Mobile No. *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onFocus={handleInputFocus}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9829012345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-900 text-base sm:text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shop Address (Pura Pata) *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onFocus={handleInputFocus}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Shop No. 12, Main Market, Civil Lines"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-base sm:text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Drug License (D.L.) No. (Optional)
                </label>
                <input
                  type="text"
                  value={formData.dlNumber || ''}
                  onFocus={handleInputFocus}
                  onChange={(e) => setFormData({ ...formData, dlNumber: e.target.value })}
                  placeholder="e.g. RJ-JP-2024-4982"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onFocus={handleInputFocus}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="e.g. 08AAAAA0000A1Z5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono text-base sm:text-xs"
                />
              </div>
            </div>

            {/* Loyalty Rules on Registration */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Loyalty Points Rules (Aapke Niyam)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Redemption Limit (Kam Se Kam Points)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, minRedeemPoints: Math.max(10, (formData.minRedeemPoints || 50) - 10) })}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold border-r border-slate-200 cursor-pointer"
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
                        className="w-14 py-1 text-center font-mono font-bold text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, minRedeemPoints: (formData.minRedeemPoints || 50) + 10 })}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold border-l border-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-slate-500 font-semibold shrink-0">Points</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
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
                  <p className="text-[10px] text-slate-500 mt-1">
                    ग्राहक के पास कम से कम इतने पॉइंट्स होने पर ही छूट मिलेगी।
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    1 Point Ki Value (₹ me - Fix Digit: 1, 2, 3...)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">₹</span>
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pointValueInRs: Math.max(1, (formData.pointValueInRs || 1) - 1) })}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold border-r border-slate-200 cursor-pointer"
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
                          // Strip leading zeros so 1 or 2 never becomes 01 or 02
                          const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                          setFormData({ ...formData, pointValueInRs: clean === '' ? 0 : parseInt(clean, 10) });
                        }}
                        onBlur={() => {
                          if (!formData.pointValueInRs || formData.pointValueInRs < 1) {
                            setFormData({ ...formData, pointValueInRs: 1 });
                          }
                        }}
                        className="w-12 py-1 text-center font-mono font-bold text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pointValueInRs: (formData.pointValueInRs || 1) + 1 })}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold border-l border-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-slate-500 font-semibold text-xs">Rupees</span>
                  </div>
                  {/* Preset quick buttons for 1, 2, 3, 5 */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[1, 2, 3, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData({ ...formData, pointValueInRs: val })}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                          formData.pointValueInRs === val
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    1 Point = ₹{formData.pointValueInRs || 1} की छूट (Fixed 1 या 2 रुपये, कोई दशमलव नहीं)।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Modal Bottom Footer - Never gets pushed away */}
        <div className="shrink-0 flex items-center justify-end gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Save & Register Shop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
