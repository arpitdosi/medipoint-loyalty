import React from 'react';

interface CategoryVisualArtProps {
  tabId: string;
  tabName?: string;
  color?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryVisualArt: React.FC<CategoryVisualArtProps> = ({
  tabId,
  tabName = '',
  color = 'emerald',
  className = '',
  size = 'md',
}) => {
  const normId = tabId.toLowerCase();
  const normName = tabName.toLowerCase();

  const isMedicine = normId.includes('med') || normName.includes('med') || normName.includes('दवा');
  const isGeneral = normId.includes('gen') || normName.includes('gen') || normName.includes('जनरल') || normName.includes('cosmet');
  const isSurgical = normId.includes('device') || normId.includes('surg') || normName.includes('surg') || normName.includes('सर्जिकल') || normName.includes('उपकरण');
  const isBaby = normId.includes('baby') || normName.includes('baby') || normName.includes('बेबी') || normName.includes('child');
  const isAyurvedic = normId.includes('ayur') || normName.includes('ayur') || normName.includes('आयुर्वेद') || normName.includes('herbal');

  const dimensionClasses = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-14 h-14 sm:w-16 sm:h-16';

  // 1. Medicine: Blister pack, capsules & syrup bottle
  if (isMedicine) {
    return (
      <div
        className={`relative ${dimensionClasses} shrink-0 rounded-xl overflow-hidden shadow-xs border border-emerald-200 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center p-1 ${className}`}
        title="Medicine (दवाइयाँ)"
      >
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Background subtle glow */}
          <circle cx="40" cy="40" r="34" fill="white" fillOpacity="0.12" />

          {/* Syrup Bottle */}
          <rect x="12" y="32" width="22" height="36" rx="4" fill="#064E3B" stroke="#A7F3D0" strokeWidth="1.5" />
          <rect x="17" y="24" width="12" height="8" rx="2" fill="#D1FAE5" />
          <rect x="15" y="20" width="16" height="5" rx="1.5" fill="#10B981" />
          {/* Bottle label */}
          <rect x="15" y="40" width="16" height="18" rx="2" fill="#FFFFFF" />
          <path d="M23 44V54M18 49H28" stroke="#059669" strokeWidth="2" strokeLinecap="round" />

          {/* Tablet Blister Pack */}
          <rect x="36" y="16" width="34" height="48" rx="4" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="1.5" />
          {/* Pills in blister */}
          <rect x="41" y="22" width="10" height="7" rx="3.5" fill="#EF4444" />
          <rect x="55" y="22" width="10" height="7" rx="3.5" fill="#3B82F6" />
          <rect x="41" y="34" width="10" height="7" rx="3.5" fill="#F59E0B" />
          <rect x="55" y="34" width="10" height="7" rx="3.5" fill="#10B981" />
          <rect x="41" y="46" width="10" height="7" rx="3.5" fill="#8B5CF6" />
          <rect x="55" y="46" width="10" height="7" rx="3.5" fill="#EC4899" />

          {/* Capsule in foreground */}
          <g transform="rotate(-30 46 62)">
            <rect x="32" y="58" width="22" height="10" rx="5" fill="#DC2626" />
            <path d="M43 58H49C51.76 58 54 60.24 54 63C54 65.76 51.76 68 49 68H43V58Z" fill="#FBBF24" />
            <line x1="43" y1="58" x2="43" y2="68" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.8" />
          </g>

          {/* Rx Badge */}
          <circle cx="64" cy="18" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <text x="64" y="22" textAnchor="middle" fill="#78350F" fontSize="9" fontWeight="900" fontFamily="sans-serif">Rx</text>
        </svg>
      </div>
    );
  }

  // 2. General Store: Bath soap bar, shampoo bottle, chips packet & cosmetics
  if (isGeneral) {
    return (
      <div
        className={`relative ${dimensionClasses} shrink-0 rounded-xl overflow-hidden shadow-xs border border-blue-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 flex items-center justify-center p-1 ${className}`}
        title="General Store & FMCG (जनरल व कॉस्मेटिक्स)"
      >
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <circle cx="40" cy="40" r="34" fill="white" fillOpacity="0.12" />

          {/* Shampoo Bottle with pump */}
          <rect x="12" y="28" width="18" height="42" rx="4" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.5" />
          <rect x="16" y="22" width="10" height="7" rx="1.5" fill="#F0F9FF" />
          {/* Pump nozzle */}
          <path d="M21 22V15H29" stroke="#F0F9FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="15" y="38" width="12" height="18" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
          <line x1="17" y1="44" x2="25" y2="44" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="48" x2="23" y2="48" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />

          {/* Chips / Snack Packet (Red/Gold pouch) */}
          <path d="M34 20L40 16L60 20L58 56L36 56L34 20Z" fill="#EF4444" stroke="#FEF08A" strokeWidth="1.5" />
          <path d="M36 26L40 23L58 26" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          {/* Zigzag edges on snack packet */}
          <path d="M36 56L38 53L40 56L42 53L44 56L46 53L48 56L50 53L52 56L54 53L56 56" stroke="#FEF08A" strokeWidth="1" />
          <circle cx="48" cy="38" r="6" fill="#FBBF24" />
          <path d="M46 36Q48 34 50 36Q48 40 46 36Z" fill="#DC2626" />

          {/* Bath Soap Bar with Bubbles */}
          <g transform="rotate(-10 38 64)">
            <rect x="30" y="52" width="32" height="18" rx="5" fill="#F472B6" stroke="#FCE7F3" strokeWidth="1.5" />
            <ellipse cx="46" cy="61" rx="8" ry="4" fill="#FDF2F8" />
            {/* Lather bubbles */}
            <circle cx="28" cy="50" r="3.5" fill="#E0F2FE" fillOpacity="0.9" stroke="#38BDF8" strokeWidth="0.8" />
            <circle cx="34" cy="46" r="2.5" fill="#E0F2FE" fillOpacity="0.9" stroke="#38BDF8" strokeWidth="0.8" />
            <circle cx="64" cy="54" r="3" fill="#E0F2FE" fillOpacity="0.9" stroke="#38BDF8" strokeWidth="0.8" />
          </g>
        </svg>
      </div>
    );
  }

  // 3. Surgical & Devices: Digital BP monitor, Glucometer, Thermometer, Bandages
  if (isSurgical) {
    return (
      <div
        className={`relative ${dimensionClasses} shrink-0 rounded-xl overflow-hidden shadow-xs border border-purple-200 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-indigo-700 flex items-center justify-center p-1 ${className}`}
        title="Surgical & Devices (सर्जिकल व मेडिकल उपकरण)"
      >
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <circle cx="40" cy="40" r="34" fill="white" fillOpacity="0.12" />

          {/* Digital Blood Pressure Monitor */}
          <rect x="10" y="24" width="38" height="46" rx="6" fill="#FAF5FF" stroke="#D8B4FE" strokeWidth="1.5" />
          {/* LCD Screen with 120/80 */}
          <rect x="15" y="30" width="28" height="22" rx="3" fill="#1E1B4B" />
          <text x="29" y="42" textAnchor="middle" fill="#4ADE80" fontSize="8" fontWeight="800" fontFamily="monospace">120/80</text>
          <text x="29" y="49" textAnchor="middle" fill="#38BDF8" fontSize="5" fontWeight="600" fontFamily="monospace">PULSE 72</text>
          {/* Blue START button */}
          <rect x="16" y="56" width="12" height="9" rx="2" fill="#7C3AED" />
          <rect x="31" y="58" width="11" height="5" rx="1.5" fill="#9CA3AF" />

          {/* Digital Clinical Thermometer */}
          <g transform="rotate(28 54 36)">
            <rect x="46" y="14" width="10" height="50" rx="4" fill="#FFFFFF" stroke="#C084FC" strokeWidth="1.5" />
            {/* Metal sensor tip */}
            <path d="M46 18C46 15 50 12 51 12C52 12 56 15 56 18V22H46V18Z" fill="#94A3B8" />
            {/* Thermometer mini LCD */}
            <rect x="48" y="34" width="6" height="12" rx="1" fill="#E0E7FF" />
            <text x="51" y="42" textAnchor="middle" fill="#4338CA" fontSize="4.5" fontWeight="900" fontFamily="monospace">98.6</text>
            <circle cx="51" cy="54" r="2.5" fill="#EF4444" />
          </g>

          {/* Bandage Roll */}
          <circle cx="64" cy="58" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="64" cy="58" r="4" fill="#D97706" />
          <path d="M58 64C62 66 68 64 74 65" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 4. Baby Care & Nutrition: Diapers, Feeding bottle, Baby hair oil & shampoo
  if (isBaby) {
    return (
      <div
        className={`relative ${dimensionClasses} shrink-0 rounded-xl overflow-hidden shadow-xs border border-amber-200 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center p-1 ${className}`}
        title="Baby Care & Nutrition (बेबी केयर व न्यूट्रिशन)"
      >
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <circle cx="40" cy="40" r="34" fill="white" fillOpacity="0.12" />

          {/* Soft Baby Diaper Pack */}
          <rect x="36" y="22" width="34" height="46" rx="6" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
          {/* Diaper brand header */}
          <rect x="36" y="22" width="34" height="12" rx="4" fill="#F59E0B" />
          <text x="53" y="31" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="900" fontFamily="sans-serif">DIAPERS</text>
          {/* Baby teddy / heart graphic */}
          <circle cx="53" cy="46" r="6" fill="#FDE047" />
          <circle cx="49" cy="42" r="2.5" fill="#F59E0B" />
          <circle cx="57" cy="42" r="2.5" fill="#F59E0B" />
          <circle cx="53" cy="46" r="2" fill="#B45309" />
          <text x="53" y="60" textAnchor="middle" fill="#D97706" fontSize="5.5" fontWeight="700">Pants M</text>

          {/* Baby Feeding Milk Bottle */}
          <rect x="12" y="34" width="20" height="36" rx="5" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1.5" />
          {/* Nipple & Cap */}
          <rect x="16" y="26" width="12" height="9" rx="2" fill="#F97316" />
          <path d="M19 26C19 21 21 19 22 19C23 19 25 21 25 26H19Z" fill="#FDBA74" />
          {/* Measuring marks on milk bottle */}
          <line x1="15" y1="42" x2="20" y2="42" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="48" x2="22" y2="48" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="54" x2="20" y2="54" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="60" x2="22" y2="60" stroke="#FB923C" strokeWidth="1.5" strokeLinecap="round" />

          {/* Baby Oil / Shampoo bottle (mini) */}
          <rect x="25" y="48" width="14" height="22" rx="3" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="32" cy="56" r="3" fill="#FFFBEB" />
          <path d="M32 54C32 54 30.5 56 30.5 57C30.5 57.8 31.2 58.5 32 58.5C32.8 58.5 33.5 57.8 33.5 57C33.5 56 32 54 32 54Z" fill="#F59E0B" />
        </svg>
      </div>
    );
  }

  // 5. Ayurvedic & Herbal: Tulsi/Neem green leaves, Ayurvedic Arishta bottle, Herbs
  if (isAyurvedic) {
    return (
      <div
        className={`relative ${dimensionClasses} shrink-0 rounded-xl overflow-hidden shadow-xs border border-teal-200 bg-gradient-to-br from-teal-700 via-emerald-700 to-green-800 flex items-center justify-center p-1 ${className}`}
        title="Ayurvedic & Herbal (आयुर्वेदिक व हर्बल)"
      >
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <circle cx="40" cy="40" r="34" fill="white" fillOpacity="0.12" />

          {/* Traditional Amber Glass Herbal Medicine Bottle */}
          <rect x="14" y="28" width="24" height="42" rx="4" fill="#78350F" stroke="#FDE68A" strokeWidth="1.5" />
          <rect x="20" y="20" width="12" height="9" rx="2" fill="#FBBF24" />
          <rect x="18" y="16" width="16" height="5" rx="1.5" fill="#D97706" />
          {/* Label with Herb emblem */}
          <rect x="17" y="36" width="18" height="24" rx="2" fill="#FEF3C7" />
          <circle cx="26" cy="45" r="5" fill="#047857" />
          <path d="M26 42C24 45 28 46 26 48" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
          <text x="26" y="56" textAnchor="middle" fill="#92400E" fontSize="5" fontWeight="900">DABUR</text>

          {/* Fresh Green Herbal Leaves (Tulsi & Neem) */}
          <g transform="translate(10, 0)">
            {/* Big Leaf */}
            <path d="M42 56C42 36 62 20 62 20C62 20 66 44 48 56C44 58.5 42 56 42 56Z" fill="#34D399" stroke="#065F46" strokeWidth="1.5" />
            <path d="M43 54C48 42 56 30 60 22" stroke="#065F46" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M48 45Q52 42 55 45" stroke="#065F46" strokeWidth="1" strokeLinecap="round" />
            <path d="M45 49Q49 48 52 50" stroke="#065F46" strokeWidth="1" strokeLinecap="round" />

            {/* Second Leaf */}
            <path d="M38 58C36 44 48 34 48 34C48 34 54 48 42 58Z" fill="#10B981" stroke="#064E3B" strokeWidth="1.2" />
          </g>

          {/* Golden Seal of Pure Ayurveda */}
          <circle cx="64" cy="56" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
          <path d="M64 50L66 54L70 54L67 57L68 61L64 58L60 61L61 57L58 54L62 54Z" fill="#B45309" />
        </svg>
      </div>
    );
  }

  // 6. Generic / Custom Category Fallback with dynamic color palette
  const bgGradient =
    color === 'purple'
      ? 'from-purple-500 to-indigo-600'
      : color === 'blue'
      ? 'from-blue-500 to-sky-600'
      : color === 'amber'
      ? 'from-amber-500 to-orange-600'
      : color === 'rose'
      ? 'from-rose-500 to-pink-600'
      : color === 'teal'
      ? 'from-teal-500 to-emerald-600'
      : color === 'indigo'
      ? 'from-indigo-600 to-purple-700'
      : 'from-emerald-500 to-teal-600';

  return (
    <div
      className={`relative ${dimensionClasses} shrink-0 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-gradient-to-br ${bgGradient} flex items-center justify-center p-2 ${className}`}
      title={tabName}
    >
      <div className="w-full h-full flex flex-col items-center justify-center text-white text-center">
        <span className="text-xl font-bold font-mono">
          {tabName.slice(0, 2).toUpperCase()}
        </span>
      </div>
    </div>
  );
};
