import { StoreProfile, CategoryTab, Customer, Bill, PointTransaction, MedicineReminder, StoreSummary } from '../types';

export const STORE_KEY = 'medpoints_store_profile';
export const TABS_KEY = 'medpoints_category_tabs';
export const CUSTOMERS_KEY = 'medpoints_customers';
export const BILLS_KEY = 'medpoints_bills';
export const TRANSACTIONS_KEY = 'medpoints_transactions';
export const REMINDERS_KEY = 'medpoints_reminders';

// Multi-Store Registry Keys (Option 1 Architecture & Option 2 Ready)
export const STORES_REGISTRY_KEY = 'medpoints_stores_registry';
export const ACTIVE_STORE_ID_KEY = 'medpoints_active_store_id';

export const DEFAULT_STORE: StoreProfile = {
  id: 'store_001',
  storeName: 'Sanjeevani Medicos & Healthcare',
  ownerName: 'Dr. Rajesh Sharma',
  phone: '9829012345',
  email: 'sanjeevani.medicos@gmail.com',
  address: 'Shop No. 12, Main Market, Civil Lines, Jaipur (Raj.)',
  dlNumber: 'RJ-JP-2024-4982',
  gstin: '08AAAAA0000A1Z5',
  minRedeemPoints: 50,
  pointValueInRs: 1, // 1 Point = ₹1
  currencySymbol: '₹',
  registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  adminPin: '1234',
  pin: '1234',
  status: 'active',
  whatsappMessageTemplate: `🏥 *{STORE_NAME}*
📍 {STORE_ADDRESS}
📞 {STORE_PHONE}
---------------------------------
सादर नमस्ते *{CUSTOMER_NAME}* जी! 🙏

*{STORE_NAME}* से खरीदारी के लिए धन्यवाद!

🧾 बिल नंबर: #{BILL_NUMBER}
💰 कुल बिल: ₹{TOTAL_BILL}
🎉 आज के लॉयल्टी पॉइंट्स मिले: *+{POINTS_EARNED} पॉइंट्स*
⭐️ *कुल पॉइंट बैलेंस: {POINTS_BALANCE} पॉइंट्स* (मूल्य: ₹{POINTS_VALUE})

💡 *ऑफर सूचना:* {POINTS_REDEEM_INFO}
पुनः पधारें! स्वस्थ रहें, सुरक्षित रहें।`,
  redeemMessageTemplate: `🏥 *{STORE_NAME}*
---------------------------------
सादर नमस्ते *{CUSTOMER_NAME}* जी! 🙏

🎉 *बधाई हो!* आपने आज लॉयल्टी पॉइंट्स रिडीम (छूट) किए हैं:
🎁 रिडीम पॉइंट्स: *{POINTS_REDEEMED} पॉइंट्स* (₹{DISCOUNT_AMOUNT} की छूट)
🧾 बिल नंबर: #{BILL_NUMBER}
💵 अंतिम भुगतान: ₹{FINAL_BILL}
⭐️ शेष पॉइंट बैलेंस: *{POINTS_BALANCE} पॉइंट्स*

हमारे साथ जुड़े रहने के लिए आभार!`,
  medicineReminderTemplate: `🏥 *{STORE_NAME}*
📍 {STORE_ADDRESS}
📞 {STORE_PHONE}
---------------------------------
सादर नमस्ते *{CUSTOMER_NAME}* जी! 🙏

आशा है आपका स्वास्थ्य उत्तम होगा।

💊 आपकी नियमित दवा (*{MEDICINE_NAME}*) का मासिक कोर्स लगभग 2 दिन में समाप्त होने वाला है ({DUE_DATE})।

दवाइयों का क्रम नियमित बना रहे, इसके लिए आप समय पर अपनी दवाइयाँ हमारे स्टोर से प्राप्त कर सकते हैं या होम डिलीवरी हेतु हमें इसी नंबर पर बता सकते हैं।

⭐️ आपके खाते में *{POINTS_BALANCE} लॉयल्टी पॉइंट्स* भी सुरक्षित हैं, जिनका डिस्काउंट आप इस बिल पर ले सकते हैं!

दवाइयाँ मंगवाने हेतु संपर्क करें:
📞 कॉल / व्हाट्सएप: *{STORE_PHONE}*

धन्यवाद! आपका स्वास्थ्य, हमारा संकल्प।`,
};

export const DEFAULT_TABS: CategoryTab[] = [
  {
    id: 'tab_medicine',
    name: 'Medicine',
    hindiName: 'दवाइयाँ',
    description: 'All ethical, generic & OTC medicines with loyalty bonus',
    isLoyaltyEligible: true,
    pointsPerHundred: 1, // 1 Point on every ₹100
    color: 'emerald',
    icon: 'Pill',
    order: 1,
    active: true,
  },
  {
    id: 'tab_general',
    name: 'General Store',
    hindiName: 'जनरल व कॉस्मेटिक्स',
    description: 'Soaps, shampoos, cosmetics, daily items (No points by default)',
    isLoyaltyEligible: false,
    pointsPerHundred: 0,
    color: 'blue',
    icon: 'ShoppingBag',
    order: 2,
    active: true,
  },
  {
    id: 'tab_devices',
    name: 'Surgical & Devices',
    hindiName: 'सर्जिकल व मेडिकल उपकरण',
    description: 'BP monitor, glucometer, bandages, belts, thermometer',
    isLoyaltyEligible: true,
    pointsPerHundred: 2, // 2 Points on every ₹100
    color: 'purple',
    icon: 'Stethoscope',
    order: 3,
    active: true,
  },
  {
    id: 'tab_babycare',
    name: 'Baby Care & Nutrition',
    hindiName: 'बेबी केयर व न्यूट्रिशन',
    description: 'Baby milk powders, diapers, cerelac, health drinks',
    isLoyaltyEligible: true,
    pointsPerHundred: 1,
    color: 'amber',
    icon: 'HeartHandshake',
    order: 4,
    active: true,
  },
  {
    id: 'tab_ayurvedic',
    name: 'Ayurvedic & Herbal',
    hindiName: 'आयुर्वेदिक व हर्बल',
    description: 'Patanjali, Dabur, Baidyanath, herbal supplements',
    isLoyaltyEligible: true,
    pointsPerHundred: 1,
    color: 'teal',
    icon: 'Sparkles',
    order: 5,
    active: true,
  },
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust_001',
    name: 'Ramesh Patel',
    mobile: '9876543210',
    currentPoints: 45, // Exactly 45 points, so user test of +5 reaches 50!
    totalPointsEarned: 45,
    totalPointsRedeemed: 0,
    totalSpent: 4500,
    totalBills: 4,
    firstVisit: new Date(Date.now() - 20 * 86400000).toISOString(),
    lastVisit: new Date(Date.now() - 3 * 86400000).toISOString(),
    notes: 'Regular BP and Diabetes medicine customer',
  },
  {
    id: 'cust_002',
    name: 'Sunita Verma',
    mobile: '9811223344',
    currentPoints: 85, // Ready to redeem!
    totalPointsEarned: 135,
    totalPointsRedeemed: 50,
    totalSpent: 12400,
    totalBills: 8,
    firstVisit: new Date(Date.now() - 45 * 86400000).toISOString(),
    lastVisit: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'VIP Family account',
  },
  {
    id: 'cust_003',
    name: 'Amitabh Joshi',
    mobile: '9822334455',
    currentPoints: 20,
    totalPointsEarned: 20,
    totalPointsRedeemed: 0,
    totalSpent: 2000,
    totalBills: 2,
    firstVisit: new Date(Date.now() - 12 * 86400000).toISOString(),
    lastVisit: new Date(Date.now() - 6 * 86400000).toISOString(),
    notes: '',
  },
];

export const DEFAULT_BILLS: Bill[] = [
  {
    id: 'bill_demo_1',
    billNumber: 'INV-2026-101',
    customerId: 'cust_001',
    customerName: 'Ramesh Patel',
    customerMobile: '9876543210',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    items: [
      {
        tabId: 'tab_medicine',
        tabName: 'Medicine (दवाइयाँ)',
        amount: 1500,
        isLoyaltyEligible: true,
        pointsPerHundred: 1,
        pointsEarned: 15,
      },
      {
        tabId: 'tab_general',
        tabName: 'General Store',
        amount: 250,
        isLoyaltyEligible: false,
        pointsPerHundred: 0,
        pointsEarned: 0,
      },
    ],
    subtotal: 1750,
    pointsRedeemed: 0,
    discountFromPoints: 0,
    finalAmount: 1750,
    pointsEarned: 15,
    pointsBalanceAfter: 45,
    paymentMode: 'UPI',
    notes: 'Prescription refill',
  },
];

export const DEFAULT_TRANSACTIONS: PointTransaction[] = [
  {
    id: 'txn_001',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    customerId: 'cust_001',
    customerName: 'Ramesh Patel',
    customerMobile: '9876543210',
    type: 'EARNED',
    points: 15,
    billId: 'bill_demo_1',
    billNumber: 'INV-2026-101',
    notes: 'Earned on ₹1500 Medicine bill',
    balanceAfter: 45,
  },
];

// Multi-Store ID Resolution Helper
export function getActiveStoreId(): string {
  try {
    // 1. Check if URL has ?store=xyz or ?storeId=xyz for direct store access
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const urlStoreId = params.get('store') || params.get('storeId');
      if (urlStoreId) {
        localStorage.setItem(ACTIVE_STORE_ID_KEY, urlStoreId);
        return urlStoreId;
      }
    }
    const saved = localStorage.getItem(ACTIVE_STORE_ID_KEY);
    if (saved) return saved;
  } catch (e) {
    console.error('Error reading active store id', e);
  }
  return DEFAULT_STORE.id;
}

export function setActiveStoreId(storeId: string): void {
  try {
    localStorage.setItem(ACTIVE_STORE_ID_KEY, storeId);
    // Sync store profile to STORE_KEY for instant compatibility
    const store = getStoreProfile(storeId);
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to set active store id', e);
  }
}

// Stores Registry
export function getAllStores(): StoreProfile[] {
  try {
    const raw = localStorage.getItem(STORES_REGISTRY_KEY);
    if (!raw) {
      // Initialize registry with default or existing profile
      const existingRaw = localStorage.getItem(STORE_KEY);
      const initialStore = existingRaw ? JSON.parse(existingRaw) : DEFAULT_STORE;
      const initialList = [initialStore];
      localStorage.setItem(STORES_REGISTRY_KEY, JSON.stringify(initialList));
      return initialList;
    }
    const list: StoreProfile[] = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      const initialList = [DEFAULT_STORE];
      localStorage.setItem(STORES_REGISTRY_KEY, JSON.stringify(initialList));
      return initialList;
    }
    return list;
  } catch {
    return [DEFAULT_STORE];
  }
}

export function saveAllStores(stores: StoreProfile[]): void {
  try {
    localStorage.setItem(STORES_REGISTRY_KEY, JSON.stringify(stores));
  } catch (err) {
    console.error('Failed to save stores registry', err);
  }
}

// Helper to upgrade templates if outdated
function upgradeStoreTemplates(parsed: StoreProfile): StoreProfile {
  let modified = false;
  if (!parsed.whatsappMessageTemplate || parsed.whatsappMessageTemplate.includes('Thank you') || parsed.whatsappMessageTemplate.includes('Total Bill:')) {
    parsed.whatsappMessageTemplate = DEFAULT_STORE.whatsappMessageTemplate;
    modified = true;
  }
  if (!parsed.redeemMessageTemplate || parsed.redeemMessageTemplate.includes('Congratulations') || parsed.redeemMessageTemplate.includes('Total Bill:')) {
    parsed.redeemMessageTemplate = DEFAULT_STORE.redeemMessageTemplate;
    modified = true;
  }
  if (!parsed.medicineReminderTemplate || parsed.medicineReminderTemplate.includes('monthly course is expiring')) {
    parsed.medicineReminderTemplate = DEFAULT_STORE.medicineReminderTemplate;
    modified = true;
  }
  if (!parsed.cloudStatus) {
    parsed.cloudStatus = 'local';
    modified = true;
  }
  if (!parsed.planType) {
    parsed.planType = 'Trial';
    modified = true;
  }
  if (modified) {
    saveStoreProfile(parsed);
  }
  return parsed;
}

// Store Profile Getter (Store-Aware)
export function getStoreProfile(storeId?: string): StoreProfile {
  const targetId = storeId || getActiveStoreId();
  try {
    // 1. Try store-specific key
    const scopedRaw = localStorage.getItem(`medpoints_store_${targetId}_profile`);
    if (scopedRaw) {
      const parsed = JSON.parse(scopedRaw);
      return upgradeStoreTemplates(parsed);
    }

    // 2. Try stores list registry
    const stores = getAllStores();
    const found = stores.find(s => s.id === targetId);
    if (found) {
      return upgradeStoreTemplates(found);
    }

    // 3. Fallback to legacy STORE_KEY
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      return upgradeStoreTemplates(JSON.parse(raw));
    }
    return DEFAULT_STORE;
  } catch {
    return DEFAULT_STORE;
  }
}

export function saveStoreProfile(profile: StoreProfile): void {
  try {
    // 1. Save to store-specific key
    localStorage.setItem(`medpoints_store_${profile.id}_profile`, JSON.stringify(profile));

    // 2. Update in all stores list
    const stores = getAllStores();
    const index = stores.findIndex(s => s.id === profile.id);
    if (index >= 0) {
      stores[index] = profile;
    } else {
      stores.push(profile);
    }
    saveAllStores(stores);

    // 3. If currently active, sync to legacy STORE_KEY
    if (profile.id === getActiveStoreId()) {
      localStorage.setItem(STORE_KEY, JSON.stringify(profile));
    }
  } catch (err) {
    console.error('Failed to save store profile', err);
  }
}

// Create New Store (For Multi-Store / Giving to another medical store)
export function createNewStore(
  data: {
    storeName: string;
    ownerName: string;
    phone: string;
    email?: string;
    address: string;
    dlNumber?: string;
    gstin?: string;
    minRedeemPoints?: number;
    pointValueInRs?: number;
    adminPin?: string;
    pin?: string;
  },
  options?: {
    cloneDefaultTabs?: boolean;
    seedSampleData?: boolean;
  }
): StoreProfile {
  const allStores = getAllStores();
  const cleanSlug = data.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 16)
    .replace(/^_+|_+$/g, '') || 'pharmacy';
  
  const newId = `store_${cleanSlug}_${Date.now().toString().slice(-4)}`;
  const storeCode = `MED-${(allStores.length + 1).toString().padStart(2, '0')}`;
  const assignedPin = data.pin || data.adminPin || '1234';

  const newStore: StoreProfile = {
    ...DEFAULT_STORE,
    id: newId,
    storeName: data.storeName.trim(),
    ownerName: data.ownerName.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || '',
    address: data.address?.trim() || '',
    dlNumber: data.dlNumber?.trim() || '',
    gstin: data.gstin?.trim() || '',
    minRedeemPoints: data.minRedeemPoints ?? 50,
    pointValueInRs: data.pointValueInRs ?? 1,
    adminPin: assignedPin,
    pin: assignedPin,
    status: 'active',
    registeredAt: new Date().toISOString(),
    cloudStatus: 'local',
    planType: 'Trial',
    storeCode,
    whatsappMessageTemplate: DEFAULT_STORE.whatsappMessageTemplate.replace(/Sanjeevani Medicos & Healthcare/g, data.storeName.trim()),
    redeemMessageTemplate: DEFAULT_STORE.redeemMessageTemplate.replace(/Sanjeevani Medicos & Healthcare/g, data.storeName.trim()),
    medicineReminderTemplate: DEFAULT_STORE.medicineReminderTemplate.replace(/Sanjeevani Medicos & Healthcare/g, data.storeName.trim()),
  };

  // Add to store registry
  allStores.push(newStore);
  saveAllStores(allStores);

  // Save profile
  localStorage.setItem(`medpoints_store_${newId}_profile`, JSON.stringify(newStore));

  // Initialize tabs (clone standard categories)
  const tabs = options?.cloneDefaultTabs !== false ? DEFAULT_TABS : [];
  localStorage.setItem(`medpoints_store_${newId}_tabs`, JSON.stringify(tabs));

  // Initialize customers, bills, txns, reminders
  const customers = options?.seedSampleData ? DEFAULT_CUSTOMERS : [];
  const bills = options?.seedSampleData ? DEFAULT_BILLS : [];
  const txns = options?.seedSampleData ? DEFAULT_TRANSACTIONS : [];
  const reminders = options?.seedSampleData ? DEFAULT_REMINDERS : [];

  localStorage.setItem(`medpoints_store_${newId}_customers`, JSON.stringify(customers));
  localStorage.setItem(`medpoints_store_${newId}_bills`, JSON.stringify(bills));
  localStorage.setItem(`medpoints_store_${newId}_txns`, JSON.stringify(txns));
  localStorage.setItem(`medpoints_store_${newId}_reminders`, JSON.stringify(reminders));

  return newStore;
}

// Delete Store
export function deleteStore(storeId: string): boolean {
  const stores = getAllStores();
  if (stores.length <= 1) {
    return false; // Cannot delete the only remaining store
  }

  const remaining = stores.filter(s => s.id !== storeId);
  saveAllStores(remaining);

  // Clean store keys
  localStorage.removeItem(`medpoints_store_${storeId}_profile`);
  localStorage.removeItem(`medpoints_store_${storeId}_tabs`);
  localStorage.removeItem(`medpoints_store_${storeId}_customers`);
  localStorage.removeItem(`medpoints_store_${storeId}_bills`);
  localStorage.removeItem(`medpoints_store_${storeId}_txns`);
  localStorage.removeItem(`medpoints_store_${storeId}_reminders`);

  // If deleted was active, switch to first remaining
  if (getActiveStoreId() === storeId) {
    setActiveStoreId(remaining[0].id);
  }

  return true;
}

// Store Summaries for Store Switcher / Management Modal
export function getStoreSummaries(): StoreSummary[] {
  const stores = getAllStores();
  const activeId = getActiveStoreId();

  return stores.map(st => {
    const custs = getCustomers(st.id);
    const storeBills = getBills(st.id);
    const totalSales = storeBills.reduce((acc, b) => acc + (b.finalAmount || 0), 0);

    return {
      id: st.id,
      storeName: st.storeName,
      ownerName: st.ownerName,
      phone: st.phone,
      address: st.address,
      dlNumber: st.dlNumber,
      customerCount: custs.length,
      billCount: storeBills.length,
      totalSales,
      registeredAt: st.registeredAt,
      isActive: st.id === activeId,
    };
  });
}

// Category Tabs (Store-Scoped)
export function getCategoryTabs(storeId?: string): CategoryTab[] {
  const targetId = storeId || getActiveStoreId();
  try {
    const raw = localStorage.getItem(`medpoints_store_${targetId}_tabs`);
    if (raw) return JSON.parse(raw);

    // Fallback for default store
    if (targetId === DEFAULT_STORE.id) {
      const legacy = localStorage.getItem(TABS_KEY);
      if (legacy) return JSON.parse(legacy);
    }
    return DEFAULT_TABS;
  } catch {
    return DEFAULT_TABS;
  }
}

export function saveCategoryTabs(tabs: CategoryTab[], storeId?: string): void {
  const targetId = storeId || getActiveStoreId();
  try {
    localStorage.setItem(`medpoints_store_${targetId}_tabs`, JSON.stringify(tabs));
    if (targetId === getActiveStoreId()) {
      localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
    }
  } catch (err) {
    console.error('Failed to save category tabs', err);
  }
}

// Customers (Store-Scoped)
export function getCustomers(storeId?: string): Customer[] {
  const targetId = storeId || getActiveStoreId();
  try {
    const raw = localStorage.getItem(`medpoints_store_${targetId}_customers`);
    if (raw) return JSON.parse(raw);

    // Fallback for default store
    if (targetId === DEFAULT_STORE.id) {
      const legacy = localStorage.getItem(CUSTOMERS_KEY);
      if (legacy) return JSON.parse(legacy);
      return DEFAULT_CUSTOMERS;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveCustomers(customers: Customer[], storeId?: string): void {
  const targetId = storeId || getActiveStoreId();
  try {
    localStorage.setItem(`medpoints_store_${targetId}_customers`, JSON.stringify(customers));
    if (targetId === getActiveStoreId()) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    }
  } catch (err) {
    console.error('Failed to save customers', err);
  }
}

// Bills (Store-Scoped)
export function getBills(storeId?: string): Bill[] {
  const targetId = storeId || getActiveStoreId();
  try {
    const raw = localStorage.getItem(`medpoints_store_${targetId}_bills`);
    if (raw) return JSON.parse(raw);

    // Fallback for default store
    if (targetId === DEFAULT_STORE.id) {
      const legacy = localStorage.getItem(BILLS_KEY);
      if (legacy) return JSON.parse(legacy);
      return DEFAULT_BILLS;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveBills(bills: Bill[], storeId?: string): void {
  const targetId = storeId || getActiveStoreId();
  try {
    localStorage.setItem(`medpoints_store_${targetId}_bills`, JSON.stringify(bills));
    if (targetId === getActiveStoreId()) {
      localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
    }
  } catch (err) {
    console.error('Failed to save bills', err);
  }
}

// Transactions (Store-Scoped)
export function getTransactions(storeId?: string): PointTransaction[] {
  const targetId = storeId || getActiveStoreId();
  try {
    const raw = localStorage.getItem(`medpoints_store_${targetId}_txns`);
    if (raw) return JSON.parse(raw);

    // Fallback for default store
    if (targetId === DEFAULT_STORE.id) {
      const legacy = localStorage.getItem(TRANSACTIONS_KEY);
      if (legacy) return JSON.parse(legacy);
      return DEFAULT_TRANSACTIONS;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: PointTransaction[], storeId?: string): void {
  const targetId = storeId || getActiveStoreId();
  try {
    localStorage.setItem(`medpoints_store_${targetId}_txns`, JSON.stringify(transactions));
    if (targetId === getActiveStoreId()) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    }
  } catch (err) {
    console.error('Failed to save transactions', err);
  }
}

export const DEFAULT_REMINDERS: MedicineReminder[] = [
  {
    id: 'rem_001',
    customerId: 'cust_002',
    customerName: 'Sunita Verma',
    customerMobile: '9811223344',
    medicineName: 'Thyronorm 50mcg (थायराइड दवा - 1 महीना)',
    category: 'Thyroid',
    daysSupply: 30,
    startDate: new Date(Date.now() - 28 * 86400000).toISOString(),
    nextDueDate: new Date(Date.now() + 2 * 86400000).toISOString(), // Exactly 2 days remaining!
    alertBeforeDays: 2,
    status: 'DUE',
    reminderCount: 0,
    notes: 'Daily 1 tablet empty stomach in the morning',
  },
  {
    id: 'rem_002',
    customerId: 'cust_001',
    customerName: 'Ramesh Patel',
    customerMobile: '9876543210',
    medicineName: 'Atorvastatin 10mg + Telma 40 (कोलेस्ट्रॉल व बीपी)',
    category: 'Cholesterol',
    daysSupply: 30,
    startDate: new Date(Date.now() - 29 * 86400000).toISOString(),
    nextDueDate: new Date(Date.now() + 1 * 86400000).toISOString(), // 1 day remaining!
    alertBeforeDays: 2,
    status: 'DUE',
    reminderCount: 0,
    notes: 'Regular BP and cholesterol refill patient',
  },
  {
    id: 'rem_003',
    customerId: 'cust_003',
    customerName: 'Amitabh Joshi',
    customerMobile: '9822334455',
    medicineName: 'Glycomet GP 1mg (शुगर/डायबिटीज)',
    category: 'Diabetes',
    daysSupply: 30,
    startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    nextDueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    alertBeforeDays: 2,
    status: 'ACTIVE',
    reminderCount: 0,
    notes: '',
  },
];

export function getReminders(storeId?: string): MedicineReminder[] {
  const targetId = storeId || getActiveStoreId();
  try {
    const raw = localStorage.getItem(`medpoints_store_${targetId}_reminders`);
    if (raw) return JSON.parse(raw);

    // Fallback for default store
    if (targetId === DEFAULT_STORE.id) {
      const legacy = localStorage.getItem(REMINDERS_KEY);
      if (legacy) return JSON.parse(legacy);
      return DEFAULT_REMINDERS;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveReminders(reminders: MedicineReminder[], storeId?: string): void {
  const targetId = storeId || getActiveStoreId();
  try {
    localStorage.setItem(`medpoints_store_${targetId}_reminders`, JSON.stringify(reminders));
    if (targetId === getActiveStoreId()) {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    }
  } catch (err) {
    console.error('Failed to save reminders', err);
  }
}

// Reset single store
export function resetStoreData(storeId: string): void {
  if (storeId === DEFAULT_STORE.id) {
    resetAllDataToDefault();
    return;
  }
  localStorage.setItem(`medpoints_store_${storeId}_tabs`, JSON.stringify(DEFAULT_TABS));
  localStorage.setItem(`medpoints_store_${storeId}_customers`, JSON.stringify([]));
  localStorage.setItem(`medpoints_store_${storeId}_bills`, JSON.stringify([]));
  localStorage.setItem(`medpoints_store_${storeId}_txns`, JSON.stringify([]));
  localStorage.setItem(`medpoints_store_${storeId}_reminders`, JSON.stringify([]));
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_STORE));
  localStorage.setItem(TABS_KEY, JSON.stringify(DEFAULT_TABS));
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
  localStorage.setItem(BILLS_KEY, JSON.stringify(DEFAULT_BILLS));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(DEFAULT_TRANSACTIONS));
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(DEFAULT_REMINDERS));

  // Also reset scoped keys for store_001
  localStorage.setItem(`medpoints_store_${DEFAULT_STORE.id}_profile`, JSON.stringify(DEFAULT_STORE));
  localStorage.setItem(`medpoints_store_${DEFAULT_STORE.id}_tabs`, JSON.stringify(DEFAULT_TABS));
  localStorage.setItem(`medpoints_store_${DEFAULT_STORE.id}_customers`, JSON.stringify(DEFAULT_CUSTOMERS));
  localStorage.setItem(`medpoints_store_${DEFAULT_STORE.id}_bills`, JSON.stringify(DEFAULT_BILLS));
  localStorage.setItem(`medpoints_store_${DEFAULT_STORE.id}_txns`, JSON.stringify(DEFAULT_TRANSACTIONS));
  localStorage.setItem(`medpoints_store_${DEFAULT_STORE.id}_reminders`, JSON.stringify(DEFAULT_REMINDERS));
}

// Export Single Store Package
export function exportSingleStore(storeId?: string): string {
  const targetId = storeId || getActiveStoreId();
  const store = getStoreProfile(targetId);
  const data = {
    version: '1.0',
    type: 'single_store_backup',
    exportedAt: new Date().toISOString(),
    store,
    tabs: getCategoryTabs(targetId),
    customers: getCustomers(targetId),
    bills: getBills(targetId),
    transactions: getTransactions(targetId),
    reminders: getReminders(targetId),
  };
  return JSON.stringify(data, null, 2);
}

// Export All Stores (Complete System Package)
export function exportAllStores(): string {
  const allStores = getAllStores();
  const storesData = allStores.map(store => ({
    store,
    tabs: getCategoryTabs(store.id),
    customers: getCustomers(store.id),
    bills: getBills(store.id),
    transactions: getTransactions(store.id),
    reminders: getReminders(store.id),
  }));

  const data = {
    version: '1.0',
    type: 'multi_store_full_backup',
    exportedAt: new Date().toISOString(),
    totalStores: allStores.length,
    stores: storesData,
  };
  return JSON.stringify(data, null, 2);
}

// Import Package (Auto-detects Single Store, Multi-Store, or Legacy backup)
export function importStorePackage(jsonString: string): { success: boolean; message: string; storeId?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'फ़ाइल का फॉर्मेट सही नहीं है।' };
    }

    // Case 1: Multi-Store System Backup
    if (parsed.type === 'multi_store_full_backup' && Array.isArray(parsed.stores)) {
      const storesList: StoreProfile[] = [];
      for (const item of parsed.stores) {
        if (item.store && item.store.id) {
          storesList.push(item.store);
          localStorage.setItem(`medpoints_store_${item.store.id}_profile`, JSON.stringify(item.store));
          if (item.tabs) localStorage.setItem(`medpoints_store_${item.store.id}_tabs`, JSON.stringify(item.tabs));
          if (item.customers) localStorage.setItem(`medpoints_store_${item.store.id}_customers`, JSON.stringify(item.customers));
          if (item.bills) localStorage.setItem(`medpoints_store_${item.store.id}_bills`, JSON.stringify(item.bills));
          if (item.transactions) localStorage.setItem(`medpoints_store_${item.store.id}_txns`, JSON.stringify(item.transactions));
          if (item.reminders) localStorage.setItem(`medpoints_store_${item.store.id}_reminders`, JSON.stringify(item.reminders));
        }
      }
      if (storesList.length > 0) {
        saveAllStores(storesList);
        setActiveStoreId(storesList[0].id);
        return { success: true, message: `सफलतापूर्वक ${storesList.length} मेडिकल स्टोर्स का डेटा रीस्टोर हुआ!`, storeId: storesList[0].id };
      }
    }

    // Case 2: Single Store Package
    if (parsed.store && parsed.store.storeName) {
      const storeProfile: StoreProfile = parsed.store;
      const allStores = getAllStores();
      const existingIndex = allStores.findIndex(s => s.id === storeProfile.id);
      
      let targetId = storeProfile.id;
      if (existingIndex >= 0) {
        allStores[existingIndex] = storeProfile;
      } else {
        allStores.push(storeProfile);
      }
      saveAllStores(allStores);

      localStorage.setItem(`medpoints_store_${targetId}_profile`, JSON.stringify(storeProfile));
      if (parsed.tabs) localStorage.setItem(`medpoints_store_${targetId}_tabs`, JSON.stringify(parsed.tabs));
      if (parsed.customers) localStorage.setItem(`medpoints_store_${targetId}_customers`, JSON.stringify(parsed.customers));
      if (parsed.bills) localStorage.setItem(`medpoints_store_${targetId}_bills`, JSON.stringify(parsed.bills));
      if (parsed.transactions) localStorage.setItem(`medpoints_store_${targetId}_txns`, JSON.stringify(parsed.transactions));
      if (parsed.reminders) localStorage.setItem(`medpoints_store_${targetId}_reminders`, JSON.stringify(parsed.reminders));

      setActiveStoreId(targetId);
      return { success: true, message: `"${storeProfile.storeName}" का डेटा सफलतापूर्वक इम्पोर्ट हुआ!`, storeId: targetId };
    }

    // Case 3: Legacy format
    if (parsed.store || parsed.customers) {
      if (parsed.store) localStorage.setItem(STORE_KEY, typeof parsed.store === 'string' ? parsed.store : JSON.stringify(parsed.store));
      if (parsed.tabs) localStorage.setItem(TABS_KEY, typeof parsed.tabs === 'string' ? parsed.tabs : JSON.stringify(parsed.tabs));
      if (parsed.customers) localStorage.setItem(CUSTOMERS_KEY, typeof parsed.customers === 'string' ? parsed.customers : JSON.stringify(parsed.customers));
      if (parsed.bills) localStorage.setItem(BILLS_KEY, typeof parsed.bills === 'string' ? parsed.bills : JSON.stringify(parsed.bills));
      if (parsed.transactions) localStorage.setItem(TRANSACTIONS_KEY, typeof parsed.transactions === 'string' ? parsed.transactions : JSON.stringify(parsed.transactions));
      if (parsed.reminders) localStorage.setItem(REMINDERS_KEY, typeof parsed.reminders === 'string' ? parsed.reminders : JSON.stringify(parsed.reminders));

      return { success: true, message: 'बैकअप डेटा सफलतापूर्वक रीस्टोर हुआ!' };
    }

    return { success: false, message: 'फ़ाइल का डेटा मान्य नहीं है।' };
  } catch (err) {
    return { success: false, message: 'फ़ाइल पढ़ने में त्रुटि हुई।' };
  }
}
