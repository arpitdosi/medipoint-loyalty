import { StoreProfile, Bill, Customer, MedicineReminder } from '../types';

export function formatWhatsAppLoyaltyMessage(
  store: StoreProfile,
  bill: Bill,
  customer: Customer
): string {
  let template = store.whatsappMessageTemplate;

  const pointsValue = (customer.currentPoints * store.pointValueInRs).toFixed(0);
  const remainingForRedeem = store.minRedeemPoints - customer.currentPoints;

  let redeemInfo = '';
  if (customer.currentPoints >= store.minRedeemPoints) {
    redeemInfo = `🎉 बधाई हो! आपके खाते में ${customer.currentPoints} पॉइंट्स पूरे हो गए हैं! अगली बार बिल पर ₹${pointsValue} की छूट (डिस्काउंट) ले सकते हैं।`;
  } else {
    redeemInfo = `अगली बार ₹${store.minRedeemPoints * store.pointValueInRs} की छूट पाने के लिए सिर्फ ${remainingForRedeem} पॉइंट्स और चाहिए (न्यूनतम ${store.minRedeemPoints} पॉइंट्स)।`;
  }

  const replacements: Record<string, string> = {
    '{STORE_NAME}': store.storeName,
    '{STORE_PHONE}': store.phone,
    '{STORE_ADDRESS}': store.address,
    '{CUSTOMER_NAME}': customer.name || 'Grahak',
    '{CUSTOMER_MOBILE}': customer.mobile,
    '{BILL_NUMBER}': bill.billNumber,
    '{TOTAL_BILL}': bill.subtotal.toFixed(0),
    '{FINAL_BILL}': bill.finalAmount.toFixed(0),
    '{POINTS_EARNED}': bill.pointsEarned.toFixed(0),
    '{POINTS_BALANCE}': customer.currentPoints.toFixed(0),
    '{POINTS_VALUE}': pointsValue,
    '{POINTS_REDEEM_INFO}': redeemInfo,
    '{POINTS_REDEEMED}': (bill.pointsRedeemed || 0).toFixed(0),
    '{DISCOUNT_AMOUNT}': (bill.discountFromPoints || 0).toFixed(0),
  };

  for (const [key, val] of Object.entries(replacements)) {
    template = template.replaceAll(key, val);
  }

  return template;
}

export function formatWhatsAppRedeemMessage(
  store: StoreProfile,
  bill: Bill,
  customer: Customer,
  pointsRedeemed: number,
  discountAmount: number
): string {
  let template = store.redeemMessageTemplate;

  const replacements: Record<string, string> = {
    '{STORE_NAME}': store.storeName,
    '{STORE_PHONE}': store.phone,
    '{STORE_ADDRESS}': store.address,
    '{CUSTOMER_NAME}': customer.name || 'Grahak',
    '{CUSTOMER_MOBILE}': customer.mobile,
    '{BILL_NUMBER}': bill.billNumber,
    '{TOTAL_BILL}': bill.subtotal.toFixed(0),
    '{FINAL_BILL}': bill.finalAmount.toFixed(0),
    '{POINTS_REDEEMED}': pointsRedeemed.toFixed(0),
    '{DISCOUNT_AMOUNT}': discountAmount.toFixed(0),
    '{POINTS_BALANCE}': customer.currentPoints.toFixed(0),
  };

  for (const [key, val] of Object.entries(replacements)) {
    template = template.replaceAll(key, val);
  }

  return template;
}

export function formatWhatsAppMedicineReminderMessage(
  store: StoreProfile,
  reminder: MedicineReminder,
  customerPoints: number
): string {
  let template = store.medicineReminderTemplate || `🏥 *{STORE_NAME}*
📍 {STORE_ADDRESS}
📞 {STORE_PHONE}
---------------------------------
सादर नमस्ते *{CUSTOMER_NAME}* जी! 🙏

आशा है आपका स्वास्थ्य उत्तम होगा।

💊 आपकी नियमित दवा (*{MEDICINE_NAME}*) का मासिक कोर्स समाप्त होने वाला है ({DUE_DATE})।

दवाइयों का क्रम नियमित बना रहे, इसके लिए आप समय पर अपनी दवाइयाँ हमारे स्टोर से प्राप्त कर सकते हैं या होम डिलीवरी हेतु हमें बता सकते हैं।

⭐️ आपके खाते में *{POINTS_BALANCE} लॉयल्टी पॉइंट्स* भी सुरक्षित हैं, जिनका डिस्काउंट आप इस बिल पर ले सकते हैं!

दवाइयाँ मंगवाने हेतु संपर्क करें:
📞 कॉल / व्हाट्सएप: *{STORE_PHONE}*

धन्यवाद! आपका स्वास्थ्य, हमारा संकल्प।`;

  const dueDateFormatted = new Date(reminder.nextDueDate).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const replacements: Record<string, string> = {
    '{STORE_NAME}': store.storeName,
    '{STORE_PHONE}': store.phone,
    '{STORE_ADDRESS}': store.address,
    '{CUSTOMER_NAME}': reminder.customerName || 'ग्राहक',
    '{CUSTOMER_MOBILE}': reminder.customerMobile,
    '{MEDICINE_NAME}': reminder.medicineName,
    '{DUE_DATE}': dueDateFormatted,
    '{POINTS_BALANCE}': customerPoints.toFixed(0),
    '{POINTS_VALUE}': (customerPoints * store.pointValueInRs).toFixed(0),
  };

  for (const [key, val] of Object.entries(replacements)) {
    template = template.replaceAll(key, val);
  }

  return template;
}

export function cleanIndianMobile(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

export function getWhatsAppUrl(mobile: string, message: string): string {
  const sanitized = cleanIndianMobile(mobile);
  return `https://api.whatsapp.com/send?phone=${sanitized}&text=${encodeURIComponent(message)}`;
}
