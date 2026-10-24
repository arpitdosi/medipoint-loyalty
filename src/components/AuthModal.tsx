import React, { useState } from 'react';
import { StoreProfile, AuthSession } from '../types';
import { authenticateUser, registerStoreOnline, ADMIN_MOBILE, ADMIN_PASSWORD_PIN } from '../utils/cloudSync';
import { 
  Lock, 
  Phone, 
  Store, 
  User, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle,
  Building2,
  KeyRound
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession, store?: StoreProfile) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  
  // Login Form
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Register Form
  const [regData, setRegData] = useState({
    storeName: '',
    ownerName: '',
    phone: '',
    pin: '',
    confirmPin: '',
    address: '',
    dlNumber: '',
    gstin: '',
  });
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await authenticateUser(loginMobile, loginPin);
      if (res.success && res.session) {
        onLoginSuccess(res.session, res.store);
        onClose();
      } else {
        setErrorMsg(res.error || 'लॉगिन असफल रहा। कृपया पुनः प्रयास करें।');
      }
    } catch (err: any) {
      setErrorMsg('सर्वर से कनेक्ट करने में असमर्थ।');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg(null);

    if (regData.pin !== regData.confirmPin) {
      setRegErrorMsg('दोनों पिन (Password) एक समान होने चाहिए!');
      return;
    }
    if (regData.pin.length !== 4) {
      setRegErrorMsg('पिन ठीक 4 अंकों का होना चाहिए!');
      return;
    }
    if (regData.phone.length < 10) {
      setRegErrorMsg('कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें!');
      return;
    }

    setLoading(true);
    try {
      const res = await registerStoreOnline({
        storeName: regData.storeName,
        ownerName: regData.ownerName,
        phone: regData.phone,
        pin: regData.pin,
        address: regData.address,
        dlNumber: regData.dlNumber,
        gstin: regData.gstin,
      });

      if (res.success && res.session && res.store) {
        onLoginSuccess(res.session, res.store);
        onClose();
      } else {
        setRegErrorMsg(res.error || 'रजिस्ट्रेशन असफल रहा।');
      }
    } catch (err) {
      setRegErrorMsg('नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setLoginMobile(ADMIN_MOBILE);
    setLoginPin(ADMIN_PASSWORD_PIN);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto mb-2 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>

          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {mode === 'login' ? 'मेडिकल स्टोर लॉगिन पोर्टल' : 'नया मेडिकल स्टोर रजिस्टर करें'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {mode === 'login' 
              ? 'अपना मोबाइल नंबर और 4-अंकों का गुप्त पिन डालें' 
              : 'सिर्फ 30 सेकंड में अपनी दुकान का फ्री अकाउंट शुरू करें'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-colors ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            लॉगिन (Login)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setRegErrorMsg(null); }}
            className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition-colors ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            + नया स्टोर रजिस्टर करें
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Login ID (आपका मोबाइल नंबर)</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-base sm:text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Password (4-अंकों का गुप्त पिन)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    placeholder="••••"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-base sm:text-xs font-mono tracking-widest font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Super Admin Quick Autofill Helper */}
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between gap-2">
                <div className="text-[11px] text-indigo-900">
                  <strong className="block font-bold">सुपर एडमिन (Master Admin) लॉगिन:</strong>
                  <span>ID: <code className="font-mono font-bold text-indigo-700">9662076010</code> · PIN: <code className="font-mono font-bold text-indigo-700">0911</code></span>
                </div>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
                >
                  ऑटो-फिल
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>सत्यापित हो रहा है...</span>
                ) : (
                  <>
                    <span>लॉगिन करें (Sign In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setRegErrorMsg(null); }}
                  className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  दुकानदार नया खाता बनाना चाहते हैं? यहाँ क्लिक करें
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              {regErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{regErrorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  मेडिकल स्टोर का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. श्री बालाजी मेडिकोज"
                  value={regData.storeName}
                  onChange={(e) => setRegData({ ...regData, storeName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  मालिक / केमिस्ट का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. डॉ. राजेश कुमार"
                  value={regData.ownerName}
                  onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base sm:text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  मोबाइल नंबर (यह आपकी Login ID होगी) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base sm:text-xs font-mono font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    4-अंकों का पिन (Password) *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="उदा. 1234"
                    value={regData.pin}
                    onChange={(e) => setRegData({ ...regData, pin: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base sm:text-xs font-mono font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    पिन दोबारा दर्ज करें *
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="उदा. 1234"
                    value={regData.confirmPin}
                    onChange={(e) => setRegData({ ...regData, confirmPin: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base sm:text-xs font-mono font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  दुकान का पता (शहर/राज्य)
                </label>
                <input
                  type="text"
                  placeholder="दुकान नंबर, मेन मार्केट, शहर..."
                  value={regData.address}
                  onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base sm:text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ड्रग लाइसेंस नंबर (DL No. - वैकल्पिक)
                </label>
                <input
                  type="text"
                  placeholder="उदा. RJ-JP-2024-5510"
                  value={regData.dlNumber}
                  onChange={(e) => setRegData({ ...regData, dlNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base sm:text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>खाता तैयार हो रहा है...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>रजिस्टर करें और तुरंत शुरू करें</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); }}
                  className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  पहले से खाता है? <strong className="text-emerald-700">लॉगिन करें</strong>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
