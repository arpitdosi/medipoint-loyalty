import React, { useState } from 'react';
import { CategoryTab } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  Layers, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { DEFAULT_TABS } from '../utils/storage';
import { CategoryVisualArt } from './CategoryVisualArt';
import { getCategoryTheme } from '../utils/categoryTheme';

interface TabManagerProps {
  tabs: CategoryTab[];
  onSaveTabs: (tabs: CategoryTab[]) => void;
  onGoToBilling: () => void;
}

export const TabManager: React.FC<TabManagerProps> = ({
  tabs,
  onSaveTabs,
  onGoToBilling,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New tab form state
  const [newTabName, setNewTabName] = useState('');
  const [newTabHindiName, setNewTabHindiName] = useState('');
  const [newTabDesc, setNewTabDesc] = useState('');
  const [newTabEligible, setNewTabEligible] = useState(true);
  const [newTabRate, setNewTabRate] = useState(1);
  const [newTabColor, setNewTabColor] = useState<CategoryTab['color']>('emerald');

  const handleToggleLoyalty = (id: string) => {
    const updated = tabs.map((t) => {
      if (t.id === id) {
        const nextEligible = !t.isLoyaltyEligible;
        return {
          ...t,
          isLoyaltyEligible: nextEligible,
          // if toggled on and rate was 0, default to 1 point per 100
          pointsPerHundred: nextEligible && t.pointsPerHundred === 0 ? 1 : t.pointsPerHundred,
        };
      }
      return t;
    });
    onSaveTabs(updated);
  };

  const handleUpdateRate = (id: string, rate: number) => {
    const updated = tabs.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          pointsPerHundred: Math.max(0, rate),
          isLoyaltyEligible: rate > 0,
        };
      }
      return t;
    });
    onSaveTabs(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = tabs.map((t) => {
      if (t.id === id) {
        return { ...t, active: !t.active };
      }
      return t;
    });
    onSaveTabs(updated);
  };

  const handleDeleteTab = (id: string) => {
    if (tabs.length <= 1) {
      alert('Kam se kam 1 tab hona zaroori hai.');
      return;
    }
    if (confirm('Kya aap sach me is tab ko delete karna chahte hain?')) {
      const updated = tabs.filter((t) => t.id !== id);
      onSaveTabs(updated);
    }
  };

  const handleAddTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabName.trim()) return;

    const newTab: CategoryTab = {
      id: `tab_${Date.now()}`,
      name: newTabName.trim(),
      hindiName: newTabHindiName.trim() || undefined,
      description: newTabDesc.trim() || `${newTabName} category items`,
      isLoyaltyEligible: newTabEligible,
      pointsPerHundred: newTabEligible ? Number(newTabRate) : 0,
      color: newTabColor,
      icon: 'Tag',
      order: tabs.length + 1,
      active: true,
    };

    onSaveTabs([...tabs, newTab]);
    setNewTabName('');
    setNewTabHindiName('');
    setNewTabDesc('');
    setNewTabEligible(true);
    setNewTabRate(1);
    setShowAddForm(false);
  };

  const handleResetDefaults = () => {
    if (confirm('Kya aap sabhi tabs ko default (Medicine + General Store etc.) me reset karna chahte hain?')) {
      onSaveTabs(DEFAULT_TABS);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title & Explanation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Custom Tabs & Loyalty Rules Manager
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Yaha aap apni shop ke anusar alag-alag tabs (jaise Medicine, General Item, Surgical, Ayurvedic) bana sakte hain.
            Aap tay kar sakte hain ki <strong>har 100 Rs. par kitne loyalty points milenge</strong> aur <strong>kon se tab par loyalty points count honge</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Naya Tab Banayein</span>
          </button>
          <button
            onClick={handleResetDefaults}
            title="Reset to initial tabs"
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Tab Form Modal / Inline Box */}
      {showAddForm && (
        <form onSubmit={handleAddTab} className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Naya Tab Add Karein</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tab Ka Naam (English) *
              </label>
              <input
                type="text"
                required
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                placeholder="e.g. Generic Medicine, Cosmetics"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hindi / Local Naam (Optional)
              </label>
              <input
                type="text"
                value={newTabHindiName}
                onChange={(e) => setNewTabHindiName(e.target.value)}
                placeholder="e.g. जेनरिक दवाइयाँ"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Description / Note
              </label>
              <input
                type="text"
                value={newTabDesc}
                onChange={(e) => setNewTabDesc(e.target.value)}
                placeholder="e.g. 5% extra discount category"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <input
                type="checkbox"
                id="newTabEligible"
                checked={newTabEligible}
                onChange={(e) => setNewTabEligible(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
              <label htmlFor="newTabEligible" className="cursor-pointer">
                <span className="font-bold text-slate-900 block">Is Tab Par Loyalty Points Milenge?</span>
                <span className="text-[11px] text-slate-500">
                  {newTabEligible ? 'Haan, customer ko points milenge' : 'Nahi, points count nahi honge (e.g. General Store)'}
                </span>
              </label>
            </div>

            {newTabEligible && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 block">Har ₹100 Par Points (Fix Digit)</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">1, 2, 3 Points (No decimals)</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Preset fix digit buttons */}
                  {[1, 2, 3, 5].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setNewTabRate(pts)}
                      className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                        newTabRate === pts
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {pts} Pt
                    </button>
                  ))}

                  {/* Fix digit stepper and input */}
                  <div className="flex items-center ml-auto border border-slate-300 rounded-lg overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setNewTabRate(Math.max(1, newTabRate - 1))}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold border-r border-slate-200 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="1"
                      value={newTabRate === 0 ? '' : newTabRate}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        // Strip leading zeros so 1 or 2 never becomes 01 or 02
                        const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                        setNewTabRate(clean === '' ? 0 : parseInt(clean, 10));
                      }}
                      onBlur={() => {
                        if (newTabRate < 1) setNewTabRate(1);
                      }}
                      className="w-12 py-1 text-center font-bold text-sm font-mono text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewTabRate(newTabRate + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold border-l border-slate-200 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save & Add Tab</span>
            </button>
          </div>
        </form>
      )}

      {/* Tabs List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Aapki Dukan Ke Active Tabs ({tabs.length} Tabs)
          </div>
          <div className="text-xs text-slate-500">
            Billing screen par ye tabs input box ke roop me dikhenge
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {tabs.map((tab, index) => {
            return (
              <div
                key={tab.id}
                className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  tab.active ? 'bg-white' : 'bg-slate-50/70 opacity-60'
                }`}
              >
                {/* Left: Tab info with CategoryVisualArt */}
                <div className="flex items-start gap-3.5">
                  <CategoryVisualArt
                    tabId={tab.id}
                    tabName={tab.name}
                    color={tab.color}
                    size="sm"
                    className="shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900">
                        {tab.name}
                      </span>
                      {tab.hindiName && (
                        <span className="text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold">
                          {tab.hindiName}
                        </span>
                      )}
                      {!tab.active && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                          Inactive (बंद)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tab.description}
                    </p>

                    {/* Product items preview */}
                    <div className="flex flex-wrap items-center gap-1 mt-1 text-[11px] text-slate-600">
                      {getCategoryTheme(tab).productExamples.map((ex, i) => (
                        <span key={i} className="inline-flex items-center">
                          <span className="font-medium">{ex}</span>
                          {i < getCategoryTheme(tab).productExamples.length - 1 && (
                            <span className="mx-1 text-slate-300">·</span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Example simulation preview */}
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-mono">
                      <span className="text-slate-500">Udaharan:</span>
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        ₹500 ki kharidari ={' '}
                        <strong className={tab.isLoyaltyEligible ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                          {tab.isLoyaltyEligible 
                            ? `+${((500 / 100) * tab.pointsPerHundred).toFixed(0)} Points`
                            : '0 Points (No Loyalty)'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Rules & controls */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Loyalty Eligible Toggle */}
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-xs font-semibold text-slate-700">Points Count:</span>
                    <button
                      type="button"
                      onClick={() => handleToggleLoyalty(tab.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        tab.isLoyaltyEligible
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {tab.isLoyaltyEligible ? 'YES (Points On)' : 'NO (Points Off)'}
                    </button>
                  </div>

                  {/* Points per ₹100 selector - Fix digits only */}
                  {tab.isLoyaltyEligible ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-200 text-xs">
                      <span className="text-slate-700 font-medium text-[11px] hidden sm:inline">Har ₹100 par:</span>
                      
                      {/* Quick fix buttons 1, 2, 3 */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => handleUpdateRate(tab.id, rate)}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                              tab.pointsPerHundred === rate
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            {rate} Pt
                          </button>
                        ))}
                      </div>

                      {/* Stepper with leading zero elimination */}
                      <div className="flex items-center border border-emerald-300 rounded overflow-hidden bg-white ml-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateRate(tab.id, Math.max(1, tab.pointsPerHundred - 1))}
                          className="px-1.5 py-0.5 text-emerald-900 hover:bg-emerald-50 font-bold border-r border-emerald-200 cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          placeholder="1"
                          value={tab.pointsPerHundred === 0 ? '' : tab.pointsPerHundred}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                            const rate = clean === '' ? 0 : parseInt(clean, 10);
                            handleUpdateRate(tab.id, rate);
                          }}
                          onBlur={() => {
                            if (tab.pointsPerHundred < 1) handleUpdateRate(tab.id, 1);
                          }}
                          className="w-9 py-0.5 bg-white text-center font-bold font-mono text-emerald-900 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateRate(tab.id, tab.pointsPerHundred + 1)}
                          className="px-1.5 py-0.5 text-emerald-900 hover:bg-emerald-50 font-bold border-l border-emerald-200 cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-emerald-800 text-[11px]">Pt</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      General item (0 Points)
                    </div>
                  )}

                  {/* Active / Inactive switch */}
                  <button
                    onClick={() => handleToggleActive(tab.id)}
                    title={tab.active ? 'Hide tab from billing' : 'Show tab in billing'}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {tab.active ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteTab(tab.id)}
                    title="Delete tab"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helper guide box */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Aapke Sawal Ka Jawab (Loyalty Points Calculation):</p>
          <p className="text-blue-800 leading-relaxed">
            Maan lo aapne <strong>Medicine</strong> par <strong>100 Rs. par 1 Point</strong> rakha, aur <strong>General Store</strong> par points OFF rakhe. 
            Jab customer ₹500 ki Medicine aur ₹300 ka General Store lega, to system automatically sirf ₹500 par <strong>5 Points</strong> calculate karega, aur total bill ₹800 banega.
            Customer ke account me turant 5 points jama ho jayenge aur WhatsApp message chala jayega!
          </p>
          <div className="pt-2">
            <button
              onClick={onGoToBilling}
              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2 cursor-pointer"
            >
              Abhi Billing Counter par jaakar live bill banayein →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
