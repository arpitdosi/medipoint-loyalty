import React, { useState } from 'react';
import { MedicineReminder, Customer, StoreProfile } from '../types';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Pill, 
  X, 
  Check, 
  RotateCcw,
  Sparkles,
  PhoneCall,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { formatWhatsAppMedicineReminderMessage, getWhatsAppUrl } from '../utils/whatsapp';

interface MedicineRemindersProps {
  reminders: MedicineReminder[];
  customers: Customer[];
  store: StoreProfile;
  onSaveReminder: (reminder: MedicineReminder) => void;
  onUpdateReminder: (reminder: MedicineReminder) => void;
  onDeleteReminder: (id: string) => void;
  onGoToBillForCustomer: (customerMobile: string, medicineName: string) => void;
}

export const MedicineReminders: React.FC<MedicineRemindersProps> = ({
  reminders,
  customers,
  store,
  onSaveReminder,
  onUpdateReminder,
  onDeleteReminder,
  onGoToBillForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'due_soon' | 'all' | 'refilled'>('due_soon');
  const [showAddModal, setShowAddModal] = useState(false);

  // Quick WhatsApp preview modal
  const [activePreviewReminder, setActivePreviewReminder] = useState<MedicineReminder | null>(null);

  // New Reminder form state
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newCategory, setNewCategory] = useState<MedicineReminder['category']>('Thyroid');
  const [newDaysSupply, setNewDaysSupply] = useState(30);
  const [newAlertBeforeDays, setNewAlertBeforeDays] = useState(2);
  const [newNotes, setNewNotes] = useState('');

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  // Helper to check days remaining until next refill
  const getDaysRemaining = (dueDateStr: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffMs = due.getTime() - now.getTime();
    return Math.round(diffMs / 86400000);
  };

  // Classify reminder
  const isDueSoon = (rem: MedicineReminder): boolean => {
    if (rem.status === 'REFILLED' || rem.status === 'STOPPED') return false;
    const daysLeft = getDaysRemaining(rem.nextDueDate);
    return daysLeft <= rem.alertBeforeDays;
  };

  const dueSoonList = reminders.filter(isDueSoon);

  // Filter list
  const filteredList = reminders.filter((rem) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      rem.customerName.toLowerCase().includes(term) ||
      rem.customerMobile.includes(term) ||
      rem.medicineName.toLowerCase().includes(term) ||
      rem.category.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (filter === 'due_soon') {
      return isDueSoon(rem);
    }
    if (filter === 'refilled') {
      return rem.status === 'REFILLED';
    }
    return rem.status !== 'STOPPED';
  });

  const handleMobileSelect = (mobile: string) => {
    setNewCustMobile(mobile);
    const found = customers.find((c) => c.mobile === mobile);
    if (found) {
      setNewCustName(found.name);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustMobile || !newMedicineName) return;

    const startDate = new Date();
    const nextDueDate = new Date();
    nextDueDate.setDate(startDate.getDate() + Number(newDaysSupply));

    const newReminder: MedicineReminder = {
      id: `rem_${Date.now()}`,
      customerId: customers.find(c => c.mobile === newCustMobile)?.id || `cust_${Date.now()}`,
      customerName: newCustName || 'ग्राहक',
      customerMobile: newCustMobile,
      medicineName: newMedicineName,
      category: newCategory,
      daysSupply: Number(newDaysSupply),
      startDate: startDate.toISOString(),
      nextDueDate: nextDueDate.toISOString(),
      alertBeforeDays: Number(newAlertBeforeDays),
      status: 'ACTIVE',
      reminderCount: 0,
      notes: newNotes,
    };

    onSaveReminder(newReminder);
    setShowAddModal(false);
    // reset form
    setNewCustMobile('');
    setNewCustName('');
    setNewMedicineName('');
    setNewNotes('');
  };

  // Quick WhatsApp sender in Hindi
  const handleSendWhatsApp = (rem: MedicineReminder) => {
    const cust = customers.find(c => c.mobile === rem.customerMobile);
    const points = cust ? cust.currentPoints : 0;
    const msg = formatWhatsAppMedicineReminderMessage(store, rem, points);
    const url = getWhatsAppUrl(rem.customerMobile, msg);

    // Update reminder sent count & timestamp
    const updated: MedicineReminder = {
      ...rem,
      reminderCount: (rem.reminderCount || 0) + 1,
      lastReminderSentAt: new Date().toISOString(),
    };
    onUpdateReminder(updated);

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Mark refilled and extend for next cycle (e.g. 30 days)
  const handleMarkRefilledAndExtend = (rem: MedicineReminder) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + rem.daysSupply);

    const updated: MedicineReminder = {
      ...rem,
      startDate: new Date().toISOString(),
      nextDueDate: nextDate.toISOString(),
      status: 'ACTIVE',
      reminderCount: 0,
      notes: `${rem.notes ? rem.notes + ' · ' : ''}Refilled on ${new Date().toLocaleDateString('hi-IN')}`,
    };
    onUpdateReminder(updated);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner explaining the 2-days before notification system */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-5 rounded-xl border border-teal-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-lg shrink-0 mt-0.5">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">
                Monthly Medicine Refill Reminders (दवा रिफिल अलर्ट सिस्टम)
              </h1>
              {dueSoonList.length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[11px] animate-pulse">
                  {dueSoonList.length} मरीज संपर्क हेतु तैयार!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              थायराइड, कोलेस्ट्रॉल, बीपी या डायबिटीज जैसे मरीजों की दवा खत्म होने से <strong>2 दिन पहले</strong> मेडिकल स्टोर को तुरंत सूचना मिल जाती है, 
              जिससे आप समय पर ग्राहक को <strong>शुद्ध हिंदी में WhatsApp रिमाइंडर</strong> भेज सकें और उनका इलाज नियमित रहे।
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>नया मासिक मरीज जोड़ें</span>
        </button>
      </div>

      {/* High Priority Alert Box: Due in <= 2 Days */}
      {dueSoonList.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>तुरंत संपर्क करने योग्य मरीज (अगले 2 दिन में दवा समाप्त होने वाली है)</span>
            </div>
            <span className="text-xs font-semibold text-amber-800">
              कुल: {dueSoonList.length} मरीज
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueSoonList.map((rem) => {
              const daysLeft = getDaysRemaining(rem.nextDueDate);
              const cust = customers.find(c => c.mobile === rem.customerMobile);
              const points = cust ? cust.currentPoints : 0;

              return (
                <div 
                  key={rem.id} 
                  className="p-3.5 bg-white border border-amber-200 rounded-lg shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rem.customerName}</span>
                        <span className="text-xs text-slate-500 font-mono">+91 {rem.customerMobile}</span>
                      </div>
                      <div className="text-xs font-semibold text-teal-800 flex items-center gap-1.5 mt-1">
                        <Pill className="w-3.5 h-3.5 text-teal-600" />
                        <span>{rem.medicineName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        बीमारी/कैटेगरी: <strong className="text-slate-700">{rem.category}</strong> · कोर्स: {rem.daysSupply} दिन
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold font-mono ${
                        daysLeft <= 0 
                          ? 'bg-rose-100 text-rose-800' 
                          : daysLeft === 1 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {daysLeft <= 0 ? 'आज समाप्त!' : daysLeft === 1 ? 'कल समाप्त (1 दिन)!' : `${daysLeft} दिन शेष`}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Due: {new Date(rem.nextDueDate).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>

                  {/* Loyalty Points info & Quick Hindi WhatsApp CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-emerald-700 font-medium">
                      Points: <strong>{points} pts</strong> (₹{points * store.pointValueInRs} Off)
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSendWhatsApp(rem)}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
                        title="व्हाट्सएप पर हिंदी में रिमाइंडर भेजें"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp भेजें</span>
                      </button>

                      <button
                        onClick={() => onGoToBillForCustomer(rem.customerMobile, rem.medicineName)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                        title="बिल बनाएं"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>बिल बनाएं</span>
                      </button>

                      <button
                        onClick={() => handleMarkRefilledAndExtend(rem)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                        title="दवा दे दी - अगले महीने के लिए आगे बढ़ाएं"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>+30 दिन</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Reminders Directory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="मरीज का नाम, फोन या दवा खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilter('due_soon')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'due_soon'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              अलर्ट / 2 दिन शेष ({dueSoonList.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              सभी रेगुलर मरीज ({reminders.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">मरीज का नाम व फोन</th>
                <th className="py-3 px-4">नियमित दवा व बीमारी</th>
                <th className="py-3 px-4">कोर्स व शुरू दिनांक</th>
                <th className="py-3 px-4 text-center">अगली रिफिल तारीख</th>
                <th className="py-3 px-4 text-center">स्थिति</th>
                <th className="py-3 px-4 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    कोई रिमाइंडर नहीं मिला। "नया मासिक मरीज जोड़ें" बटन से नया रिमाइंडर सेट करें।
                  </td>
                </tr>
              ) : (
                filteredList.map((rem) => {
                  const daysLeft = getDaysRemaining(rem.nextDueDate);
                  return (
                    <tr key={rem.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{rem.customerName}</div>
                        <div className="font-mono text-slate-500 text-xs">+91 {rem.customerMobile}</div>
                      </td>

                      {/* Medicine */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-teal-800">{rem.medicineName}</div>
                        <span className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                          {rem.category}
                        </span>
                        {rem.notes && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{rem.notes}</div>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 text-slate-600">
                        <div>{rem.daysSupply} दिन (1 माह)</div>
                        <div className="text-[10px] text-slate-400">
                          Started: {new Date(rem.startDate).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>

                      {/* Due Date & Countdown */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-mono font-bold text-slate-900">
                          {new Date(rem.nextDueDate).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          daysLeft <= 0 
                            ? 'bg-rose-100 text-rose-800' 
                            : daysLeft <= 2 
                            ? 'bg-amber-100 text-amber-900 font-bold' 
                            : 'text-slate-500'
                        }`}>
                          {daysLeft <= 0 ? 'समाप्त' : `${daysLeft} दिन शेष`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {daysLeft <= 2 ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            संपर्क करें (Due)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            सक्रिय (Active)
                          </span>
                        )}
                        {rem.reminderCount > 0 && (
                          <div className="text-[10px] text-emerald-700 mt-0.5">
                            {rem.reminderCount} बार भेजा
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleSendWhatsApp(rem)}
                          title="हिंदी में व्हाट्सएप भेजें"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onGoToBillForCustomer(rem.customerMobile, rem.medicineName)}
                          title="दवा का बिल बनाएं"
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleMarkRefilledAndExtend(rem)}
                          title="रिफिल हुआ (अगले 30 दिन के लिए रीसेट)"
                          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start sm:justify-center items-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden">
          <form onSubmit={handleAddSubmit} className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[95dvh] sm:max-h-[88vh] overflow-hidden text-xs">
            {/* Sticky Header */}
            <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-400" />
                <h3 className="font-bold text-xs sm:text-sm">
                  नया मासिक दवा रिमाइंडर जोड़ें (Add Refill Patient)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto overscroll-contain space-y-3.5">
              {/* Customer selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ग्राहक का मोबाइल नंबर *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  maxLength={10}
                  value={newCustMobile}
                  onFocus={handleInputFocus}
                  onChange={(e) => handleMobileSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ग्राहक का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel, Sunita Ji"
                  value={newCustName}
                  onFocus={handleInputFocus}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Disease Category Quick Select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  बीमारी / कंडीशन चुनें:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Thyroid', 'Cholesterol', 'Blood Pressure', 'Diabetes', 'Heart', 'General'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setNewCategory(cat);
                        if (!newMedicineName) {
                          if (cat === 'Thyroid') setNewMedicineName('Thyronorm 50mcg (थायराइड दवा)');
                          if (cat === 'Cholesterol') setNewMedicineName('Atorvastatin 10mg (कोलेस्ट्रॉल दवा)');
                          if (cat === 'Blood Pressure') setNewMedicineName('Telma 40 (बीपी दवा)');
                          if (cat === 'Diabetes') setNewMedicineName('Glycomet GP 1mg (शुगर दवा)');
                        }
                      }}
                      className={`py-1.5 px-2 rounded-lg border font-semibold text-center cursor-pointer ${
                        newCategory === cat
                          ? 'bg-teal-700 text-white border-teal-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medicine Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  दवा का नाम व डोज़ (Medicine Name & Dosage) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thyronorm 50mcg, Atorvastatin 10mg"
                  value={newMedicineName}
                  onFocus={handleInputFocus}
                  onChange={(e) => setNewMedicineName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Course Duration & Alert Timing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    कोर्स की अवधि (सप्लाई)
                  </label>
                  <select
                    value={newDaysSupply}
                    onChange={(e) => setNewDaysSupply(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 bg-white"
                  >
                    <option value={30}>30 दिन (1 माह)</option>
                    <option value={15}>15 दिन</option>
                    <option value={45}>45 दिन</option>
                    <option value={60}>60 दिन (2 माह)</option>
                    <option value={90}>90 दिन (3 माह)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    अलर्ट कब दिखाई दे?
                  </label>
                  <select
                    value={newAlertBeforeDays}
                    onChange={(e) => setNewAlertBeforeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 bg-white"
                  >
                    <option value={2}>2 दिन पहले (Recommended)</option>
                    <option value={1}>1 दिन पहले</option>
                    <option value={3}>3 दिन पहले</option>
                    <option value={5}>5 दिन पहले</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  विशेष निर्देश (Notes / डॉज़)
                </label>
                <input
                  type="text"
                  placeholder="e.g. सुबह भूखे पेट 1 गोली, डॉक्टर की पर्ची संलग्न"
                  value={newNotes}
                  onFocus={handleInputFocus}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="shrink-0 flex items-center justify-end gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-800"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>रिमाइंडर सुरक्षित करें</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
