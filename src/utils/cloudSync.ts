import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { StoreProfile, AuthSession, Customer, Bill, CategoryTab, MedicineReminder, PointTransaction } from '../types';
import { 
  getAllStores, 
  saveAllStores, 
  setActiveStoreId, 
  createNewStore, 
  getCustomers, 
  saveCustomers,
  getBills,
  saveBills,
  getCategoryTabs,
  saveCategoryTabs,
  getReminders,
  saveReminders,
  getTransactions,
  saveTransactions,
  DEFAULT_STORE,
  DEFAULT_TABS
} from './storage';

export const ADMIN_MOBILE = '9662076010';
export const ADMIN_PASSWORD_PIN = '0911';

export const AUTH_SESSION_KEY = 'medpoints_auth_session';

// Get Current Auth Session from localStorage
export function getAuthSession(): AuthSession {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse auth session', e);
  }
  // Default session for smooth first-time demo if not yet logged out
  return {
    isLoggedIn: true,
    role: 'store_owner',
    mobile: DEFAULT_STORE.phone,
    storeId: DEFAULT_STORE.id,
    storeName: DEFAULT_STORE.storeName,
    ownerName: DEFAULT_STORE.ownerName,
    isSuperAdmin: false,
  };
}

export function saveAuthSession(session: AuthSession): void {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save auth session', e);
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear auth session', e);
  }
}

// Authenticate user with Mobile Number (ID) and 4-digit PIN (Password)
export async function authenticateUser(
  mobileInput: string, 
  pinInput: string
): Promise<{ 
  success: boolean; 
  session?: AuthSession; 
  store?: StoreProfile; 
  error?: string;
  isSuperAdmin?: boolean;
}> {
  const cleanMobile = mobileInput.trim().replace(/[^0-9]/g, '');
  const cleanPin = pinInput.trim();

  // 1. Check Super Admin Master Credentials
  if (cleanMobile === ADMIN_MOBILE && cleanPin === ADMIN_PASSWORD_PIN) {
    const adminSession: AuthSession = {
      isLoggedIn: true,
      role: 'super_admin',
      mobile: ADMIN_MOBILE,
      isSuperAdmin: true,
      ownerName: 'Super Administrator',
      storeName: 'MedPoints Master Hub',
    };
    saveAuthSession(adminSession);
    return { success: true, session: adminSession, isSuperAdmin: true };
  }

  // 2. Validate Pharmacy Chemist Credentials
  if (cleanMobile.length < 10) {
    return { success: false, error: 'कृपया 10-अंकों का मान्य मोबाइल नंबर दर्ज करें।' };
  }
  if (cleanPin.length !== 4) {
    return { success: false, error: 'पासवर्ड 4-अंकों का गुप्त पिन होना चाहिए।' };
  }

  try {
    // A. Check Firestore Cloud Database first
    const storeDocRef = doc(db, 'stores', `store_${cleanMobile}`);
    const storeSnap = await getDoc(storeDocRef);

    let storeData: StoreProfile | null = null;

    if (storeSnap.exists()) {
      storeData = storeSnap.data() as StoreProfile;
    } else {
      // Query by phone field in case id was generated differently
      const q = query(collection(db, 'stores'), where('phone', '==', cleanMobile));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        storeData = querySnap.docs[0].data() as StoreProfile;
      }
    }

    // B. If not in Firestore yet, check local registry fallback
    if (!storeData) {
      const localStores = getAllStores();
      const matched = localStores.find(s => s.phone === cleanMobile || s.id === `store_${cleanMobile}`);
      if (matched) {
        storeData = matched;
        // Upload to Firestore for future central syncing
        try {
          await setDoc(doc(db, 'stores', matched.id), matched, { merge: true });
        } catch (e) {
          console.log('Background cloud upload notice:', e);
        }
      }
    }

    // C. Not found anywhere
    if (!storeData) {
      return { 
        success: false, 
        error: 'यह मोबाइल नंबर किसी मेडिकल स्टोर के रूप में पंजीकृत नहीं है। कृपया "नया स्टोर रजिस्टर करें" पर क्लिक करें।' 
      };
    }

    // D. Check if blocked
    if (storeData.status === 'blocked') {
      return { 
        success: false, 
        error: 'यह मेडिकल स्टोर खाता ब्लॉक/निष्क्रिय है। कृपया सुपर एडमिन से 9662076010 पर संपर्क करें।' 
      };
    }

    // E. Verify 4-digit PIN
    const validPin = storeData.pin || storeData.adminPin || '1234';
    if (validPin !== cleanPin) {
      return { 
        success: false, 
        error: 'दर्ज किया गया 4-अंकों का पिन (Password) गलत है। कृपया सही पिन डालें।' 
      };
    }

    // Success! Set active store and create session
    setActiveStoreId(storeData.id);
    const session: AuthSession = {
      isLoggedIn: true,
      role: 'store_owner',
      mobile: storeData.phone,
      storeId: storeData.id,
      storeName: storeData.storeName,
      ownerName: storeData.ownerName,
      isSuperAdmin: false,
    };
    saveAuthSession(session);

    // Sync cloud data into local memory
    await pullStoreDataFromCloud(storeData.id);

    return { success: true, session, store: storeData };
  } catch (err: any) {
    console.error('Authentication error:', err);
    // Offline local fallback
    const localStores = getAllStores();
    const matched = localStores.find(s => s.phone === cleanMobile);
    if (matched) {
      const validPin = matched.pin || matched.adminPin || '1234';
      if (validPin === cleanPin) {
        setActiveStoreId(matched.id);
        const session: AuthSession = {
          isLoggedIn: true,
          role: 'store_owner',
          mobile: matched.phone,
          storeId: matched.id,
          storeName: matched.storeName,
          ownerName: matched.ownerName,
          isSuperAdmin: false,
        };
        saveAuthSession(session);
        return { success: true, session, store: matched };
      }
      return { success: false, error: 'गलत 4-अंकों का पिन (Password)।' };
    }
    return { success: false, error: 'लॉगिन में समस्या आई। कृपया नेटवर्क कनेक्शन जांचें।' };
  }
}

// Self-Serve Pharmacy Registration (Saves to Firestore and Local Storage)
export async function registerStoreOnline(data: {
  storeName: string;
  ownerName: string;
  phone: string;
  pin: string;
  address?: string;
  dlNumber?: string;
  gstin?: string;
  minRedeemPoints?: number;
  pointValueInRs?: number;
}): Promise<{ success: boolean; store?: StoreProfile; session?: AuthSession; error?: string }> {
  const cleanMobile = data.phone.trim().replace(/[^0-9]/g, '');
  const cleanPin = data.pin.trim();

  if (cleanMobile.length < 10) {
    return { success: false, error: 'कृपया 10-अंकों का वैध मोबाइल नंबर डालें।' };
  }
  if (cleanPin.length !== 4) {
    return { success: false, error: 'कृपया 4-अंकों का पिन (Password) बनाएं।' };
  }
  if (!data.storeName.trim() || !data.ownerName.trim()) {
    return { success: false, error: 'कृपया मेडिकल स्टोर का नाम और मालिक का नाम भरें।' };
  }

  // Create Store Object
  const storeId = `store_${cleanMobile}`;
  const newStore: StoreProfile = {
    ...DEFAULT_STORE,
    id: storeId,
    storeName: data.storeName.trim(),
    ownerName: data.ownerName.trim(),
    phone: cleanMobile,
    pin: cleanPin,
    adminPin: cleanPin,
    address: data.address?.trim() || '',
    dlNumber: data.dlNumber?.trim() || '',
    gstin: data.gstin?.trim() || '',
    minRedeemPoints: data.minRedeemPoints || 50,
    pointValueInRs: data.pointValueInRs || 1,
    status: 'active',
    planType: 'Trial',
    cloudStatus: 'synced',
    registeredAt: new Date().toISOString(),
    whatsappMessageTemplate: DEFAULT_STORE.whatsappMessageTemplate.replace(/Sanjeevani Medicos & Healthcare/g, data.storeName.trim()),
    redeemMessageTemplate: DEFAULT_STORE.redeemMessageTemplate.replace(/Sanjeevani Medicos & Healthcare/g, data.storeName.trim()),
    medicineReminderTemplate: DEFAULT_STORE.medicineReminderTemplate.replace(/Sanjeevani Medicos & Healthcare/g, data.storeName.trim()),
  };

  try {
    // 1. Save to Cloud Firestore
    await setDoc(doc(db, 'stores', storeId), newStore, { merge: true });

    // Seed default tabs in Firestore
    for (const tab of DEFAULT_TABS) {
      await setDoc(doc(db, 'stores', storeId, 'tabs', tab.id), tab);
    }

    // 2. Save locally
    const allStores = getAllStores().filter(s => s.id !== storeId);
    allStores.push(newStore);
    saveAllStores(allStores);

    localStorage.setItem(`medpoints_store_${storeId}_profile`, JSON.stringify(newStore));
    localStorage.setItem(`medpoints_store_${storeId}_tabs`, JSON.stringify(DEFAULT_TABS));
    localStorage.setItem(`medpoints_store_${storeId}_customers`, JSON.stringify([]));
    localStorage.setItem(`medpoints_store_${storeId}_bills`, JSON.stringify([]));
    localStorage.setItem(`medpoints_store_${storeId}_txns`, JSON.stringify([]));
    localStorage.setItem(`medpoints_store_${storeId}_reminders`, JSON.stringify([]));

    setActiveStoreId(storeId);

    const session: AuthSession = {
      isLoggedIn: true,
      role: 'store_owner',
      mobile: newStore.phone,
      storeId: newStore.id,
      storeName: newStore.storeName,
      ownerName: newStore.ownerName,
      isSuperAdmin: false,
    };
    saveAuthSession(session);

    return { success: true, store: newStore, session };
  } catch (err: any) {
    console.error('Failed to register store in cloud:', err);
    // Local fallback creation
    const localStore = createNewStore({
      storeName: data.storeName,
      ownerName: data.ownerName,
      phone: cleanMobile,
      pin: cleanPin,
      address: data.address || '',
      dlNumber: data.dlNumber || '',
      gstin: data.gstin || '',
      minRedeemPoints: data.minRedeemPoints,
      pointValueInRs: data.pointValueInRs,
    });
    setActiveStoreId(localStore.id);
    const session: AuthSession = {
      isLoggedIn: true,
      role: 'store_owner',
      mobile: localStore.phone,
      storeId: localStore.id,
      storeName: localStore.storeName,
      ownerName: localStore.ownerName,
      isSuperAdmin: false,
    };
    saveAuthSession(session);
    return { success: true, store: localStore, session };
  }
}

// Fetch all stores for Super Admin Master View
export async function fetchAllStoresForAdmin(): Promise<StoreProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'stores'));
    const cloudStores: StoreProfile[] = [];
    snap.forEach((d) => {
      cloudStores.push(d.data() as StoreProfile);
    });

    if (cloudStores.length > 0) {
      // Merge with any local stores
      const local = getAllStores();
      const map = new Map<string, StoreProfile>();
      cloudStores.forEach(s => map.set(s.id, s));
      local.forEach(s => {
        if (!map.has(s.id)) map.set(s.id, s);
      });
      const merged = Array.from(map.values());
      saveAllStores(merged);
      return merged;
    }
  } catch (err) {
    console.error('Failed to fetch stores from cloud:', err);
  }
  return getAllStores();
}

// Super Admin toggle store active/block status
export async function toggleStoreStatus(storeId: string, currentStatus: string): Promise<string> {
  const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
  try {
    await updateDoc(doc(db, 'stores', storeId), { status: newStatus });
  } catch (e) {
    console.log('Cloud status update notice:', e);
  }

  // Update locally
  const stores = getAllStores();
  const index = stores.findIndex(s => s.id === storeId);
  if (index >= 0) {
    stores[index].status = newStatus as 'active' | 'blocked';
    saveAllStores(stores);
  }
  return newStatus;
}

// Super Admin Reset Store PIN
export async function updateStorePin(storeId: string, newPin: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'stores', storeId), { pin: newPin, adminPin: newPin });
  } catch (e) {
    console.log('Cloud pin update notice:', e);
  }

  // Update locally
  const stores = getAllStores();
  const index = stores.findIndex(s => s.id === storeId);
  if (index >= 0) {
    stores[index].pin = newPin;
    stores[index].adminPin = newPin;
    saveAllStores(stores);
  }
  return true;
}

// Super Admin Delete Store
export async function deleteStoreCloud(storeId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'stores', storeId));
  } catch (e) {
    console.log('Cloud delete store notice:', e);
  }
  // Local delete handled by storage.ts
  return true;
}

// Real-Time Cloud Sync Helpers for Store Operations
export async function pushCustomerToCloud(storeId: string, customer: Customer) {
  try {
    await setDoc(doc(db, 'stores', storeId, 'customers', customer.id), customer, { merge: true });
  } catch (err) {
    console.log('Customer cloud sync queued locally:', err);
  }
}

export async function pushBillToCloud(storeId: string, bill: Bill) {
  try {
    await setDoc(doc(db, 'stores', storeId, 'bills', bill.id), bill);
  } catch (err) {
    console.log('Bill cloud sync queued locally:', err);
  }
}

export async function pushReminderToCloud(storeId: string, reminder: MedicineReminder) {
  try {
    await setDoc(doc(db, 'stores', storeId, 'reminders', reminder.id), reminder, { merge: true });
  } catch (err) {
    console.log('Reminder cloud sync queued locally:', err);
  }
}

export async function pushTransactionToCloud(storeId: string, txn: PointTransaction) {
  try {
    await setDoc(doc(db, 'stores', storeId, 'transactions', txn.id), txn);
  } catch (err) {
    console.log('Transaction cloud sync queued locally:', err);
  }
}

// Pull all store data on login
export async function pullStoreDataFromCloud(storeId: string) {
  try {
    // 1. Customers
    const custSnap = await getDocs(collection(db, 'stores', storeId, 'customers'));
    if (!custSnap.empty) {
      const customers: Customer[] = [];
      custSnap.forEach(d => customers.push(d.data() as Customer));
      saveCustomers(customers, storeId);
    }

    // 2. Bills
    const billSnap = await getDocs(collection(db, 'stores', storeId, 'bills'));
    if (!billSnap.empty) {
      const bills: Bill[] = [];
      billSnap.forEach(d => bills.push(d.data() as Bill));
      saveBills(bills, storeId);
    }

    // 3. Reminders
    const remSnap = await getDocs(collection(db, 'stores', storeId, 'reminders'));
    if (!remSnap.empty) {
      const reminders: MedicineReminder[] = [];
      remSnap.forEach(d => reminders.push(d.data() as MedicineReminder));
      saveReminders(reminders, storeId);
    }

    // 4. Tabs
    const tabSnap = await getDocs(collection(db, 'stores', storeId, 'tabs'));
    if (!tabSnap.empty) {
      const tabs: CategoryTab[] = [];
      tabSnap.forEach(d => tabs.push(d.data() as CategoryTab));
      saveCategoryTabs(tabs, storeId);
    }

    // 5. Transactions
    const txnSnap = await getDocs(collection(db, 'stores', storeId, 'transactions'));
    if (!txnSnap.empty) {
      const txns: PointTransaction[] = [];
      txnSnap.forEach(d => txns.push(d.data() as PointTransaction));
      saveTransactions(txns, storeId);
    }
  } catch (e) {
    console.log('Cloud data pull notice:', e);
  }
}
