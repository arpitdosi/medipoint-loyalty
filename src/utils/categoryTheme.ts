import { CategoryTab } from '../types';

export interface CategoryTheme {
  // Color identifiers
  accentColor: string;
  // Card container styles
  cardBgInactive: string;
  cardBgActive: string;
  cardBorderInactive: string;
  cardBorderActive: string;
  // Title & Text
  titleText: string;
  hindiTagBg: string;
  hindiTagText: string;
  // Loyalty pill
  loyaltyPillBg: string;
  loyaltyPillText: string;
  loyaltyDotColor: string;
  // Live points tag
  pointsTagActive: string;
  // Input styling
  inputBorder: string;
  inputFocusRing: string;
  inputBg: string;
  currencySymbolColor: string;
  // Product example tags
  productExamples: string[];
}

export function getCategoryTheme(tab: CategoryTab): CategoryTheme {
  const normId = tab.id.toLowerCase();
  const normName = tab.name.toLowerCase();

  // 1. Medicine: Emerald & Medical Teal
  if (normId.includes('med') || normName.includes('med') || normName.includes('दवा') || tab.color === 'emerald') {
    return {
      accentColor: '#059669',
      cardBgInactive: 'bg-gradient-to-r from-emerald-50/50 via-white to-white',
      cardBgActive: 'bg-gradient-to-r from-emerald-100/70 via-teal-50/40 to-white ring-2 ring-emerald-500/30 shadow-xs',
      cardBorderInactive: 'border-emerald-200/90 hover:border-emerald-400',
      cardBorderActive: 'border-emerald-500',
      titleText: 'text-emerald-950',
      hindiTagBg: 'bg-emerald-100/80 border-emerald-200',
      hindiTagText: 'text-emerald-800',
      loyaltyPillBg: 'bg-emerald-100',
      loyaltyPillText: 'text-emerald-800',
      loyaltyDotColor: 'bg-emerald-600',
      pointsTagActive: 'bg-emerald-600 text-white shadow-xs',
      inputBorder: 'border-emerald-300',
      inputFocusRing: 'focus:ring-emerald-500 focus:border-emerald-500',
      inputBg: 'bg-white',
      currencySymbolColor: 'text-emerald-700',
      productExamples: ['कैप्सूल व गोलियां', 'खांसी-बुखार सीरप', 'एंटीबायोटिक्स', 'बीपी-शुगर'],
    };
  }

  // 2. General Store: Royal Blue & Indigo (Daily retail, soaps, shampoos, snacks)
  if (normId.includes('gen') || normName.includes('gen') || normName.includes('जनरल') || tab.color === 'blue') {
    return {
      accentColor: '#2563EB',
      cardBgInactive: 'bg-gradient-to-r from-blue-50/50 via-white to-white',
      cardBgActive: 'bg-gradient-to-r from-blue-100/70 via-indigo-50/40 to-white ring-2 ring-blue-500/30 shadow-xs',
      cardBorderInactive: 'border-blue-200/90 hover:border-blue-400',
      cardBorderActive: 'border-blue-500',
      titleText: 'text-blue-950',
      hindiTagBg: 'bg-blue-100/80 border-blue-200',
      hindiTagText: 'text-blue-800',
      loyaltyPillBg: 'bg-blue-100',
      loyaltyPillText: 'text-blue-800',
      loyaltyDotColor: 'bg-blue-600',
      pointsTagActive: 'bg-blue-600 text-white shadow-xs',
      inputBorder: 'border-blue-300',
      inputFocusRing: 'focus:ring-blue-500 focus:border-blue-500',
      inputBg: 'bg-white',
      currencySymbolColor: 'text-blue-700',
      productExamples: ['नहाने का साबुन', 'शैम्पू व कंडीशनर', 'चिप्स व बिस्कुट', 'टूथपेस्ट व क्रीम'],
    };
  }

  // 3. Surgical & Devices: Regal Purple & Fuchsia (Clinical machines, monitors, bandages)
  if (normId.includes('device') || normId.includes('surg') || normName.includes('surg') || tab.color === 'purple') {
    return {
      accentColor: '#7C3AED',
      cardBgInactive: 'bg-gradient-to-r from-purple-50/50 via-white to-white',
      cardBgActive: 'bg-gradient-to-r from-purple-100/70 via-fuchsia-50/40 to-white ring-2 ring-purple-500/30 shadow-xs',
      cardBorderInactive: 'border-purple-200/90 hover:border-purple-400',
      cardBorderActive: 'border-purple-500',
      titleText: 'text-purple-950',
      hindiTagBg: 'bg-purple-100/80 border-purple-200',
      hindiTagText: 'text-purple-800',
      loyaltyPillBg: 'bg-purple-100',
      loyaltyPillText: 'text-purple-800',
      loyaltyDotColor: 'bg-purple-600',
      pointsTagActive: 'bg-purple-600 text-white shadow-xs',
      inputBorder: 'border-purple-300',
      inputFocusRing: 'focus:ring-purple-500 focus:border-purple-500',
      inputBg: 'bg-white',
      currencySymbolColor: 'text-purple-700',
      productExamples: ['डिजिटल BP मशीन', 'थर्मामीटर', 'ग्लूकोमीटर किट', 'कॉटन व पट्टियां'],
    };
  }

  // 4. Baby Care & Nutrition: Warm Honey Amber & Peach (Diapers, baby oil, baby shampoo, Cerelac)
  if (normId.includes('baby') || normName.includes('baby') || normName.includes('बेबी') || tab.color === 'amber') {
    return {
      accentColor: '#D97706',
      cardBgInactive: 'bg-gradient-to-r from-amber-50/50 via-white to-white',
      cardBgActive: 'bg-gradient-to-r from-amber-100/70 via-orange-50/40 to-white ring-2 ring-amber-500/30 shadow-xs',
      cardBorderInactive: 'border-amber-200/90 hover:border-amber-400',
      cardBorderActive: 'border-amber-500',
      titleText: 'text-amber-950',
      hindiTagBg: 'bg-amber-100/80 border-amber-200',
      hindiTagText: 'text-amber-900',
      loyaltyPillBg: 'bg-amber-100',
      loyaltyPillText: 'text-amber-900',
      loyaltyDotColor: 'bg-amber-600',
      pointsTagActive: 'bg-amber-600 text-white shadow-xs',
      inputBorder: 'border-amber-300',
      inputFocusRing: 'focus:ring-amber-500 focus:border-amber-500',
      inputBg: 'bg-white',
      currencySymbolColor: 'text-amber-800',
      productExamples: ['बेबी डायपर्स (Pants)', 'बेबी हेयर ऑयल', 'जॉनसन बेबी शैम्पू', 'सेरेलक व ग्राइप वाटर'],
    };
  }

  // 5. Ayurvedic & Herbal: Forest Sage & Mint (Dabur, Baidyanath, Patanjali, Churna)
  if (normId.includes('ayur') || normName.includes('ayur') || normName.includes('आयुर्वेद') || tab.color === 'teal') {
    return {
      accentColor: '#0F766E',
      cardBgInactive: 'bg-gradient-to-r from-teal-50/50 via-white to-white',
      cardBgActive: 'bg-gradient-to-r from-teal-100/70 via-emerald-50/40 to-white ring-2 ring-teal-500/30 shadow-xs',
      cardBorderInactive: 'border-teal-200/90 hover:border-teal-400',
      cardBorderActive: 'border-teal-500',
      titleText: 'text-teal-950',
      hindiTagBg: 'bg-teal-100/80 border-teal-200',
      hindiTagText: 'text-teal-900',
      loyaltyPillBg: 'bg-teal-100',
      loyaltyPillText: 'text-teal-900',
      loyaltyDotColor: 'bg-teal-700',
      pointsTagActive: 'bg-teal-700 text-white shadow-xs',
      inputBorder: 'border-teal-300',
      inputFocusRing: 'focus:ring-teal-500 focus:border-teal-500',
      inputBg: 'bg-white',
      currencySymbolColor: 'text-teal-800',
      productExamples: ['डाबर व पतंजलि', 'च्यवनप्राश', 'वैद्यनाथ चूर्ण', 'तुलसी व नीम सिरप'],
    };
  }

  // Fallback for custom tabs (rose, indigo, etc.)
  return {
    accentColor: '#4F46E5',
    cardBgInactive: 'bg-gradient-to-r from-slate-50 via-white to-white',
    cardBgActive: 'bg-gradient-to-r from-indigo-50 via-purple-50/30 to-white ring-2 ring-indigo-500/30 shadow-xs',
    cardBorderInactive: 'border-slate-200 hover:border-slate-400',
    cardBorderActive: 'border-indigo-500',
    titleText: 'text-slate-900',
    hindiTagBg: 'bg-slate-100 border-slate-200',
    hindiTagText: 'text-slate-700',
    loyaltyPillBg: 'bg-indigo-100',
    loyaltyPillText: 'text-indigo-800',
    loyaltyDotColor: 'bg-indigo-600',
    pointsTagActive: 'bg-indigo-600 text-white shadow-xs',
    inputBorder: 'border-slate-300',
    inputFocusRing: 'focus:ring-indigo-500 focus:border-indigo-500',
    inputBg: 'bg-white',
    currencySymbolColor: 'text-slate-600',
    productExamples: [tab.description || 'Custom category items'],
  };
}
