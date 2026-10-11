import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Scale, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  FlaskConical,
  Zap,
  Info
} from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';

// Standard Atomic Weights (g/mol)
const ATOMIC_WEIGHTS: Record<string, { weight: number; name: string; color: string }> = {
  H: { weight: 1.008, name: 'Hydrogen', color: '#e2e8f0' },
  He: { weight: 4.0026, name: 'Helium', color: '#fbcfe8' },
  C: { weight: 12.011, name: 'Carbon', color: '#94a3b8' },
  N: { weight: 14.007, name: 'Nitrogen', color: '#60a5fa' },
  O: { weight: 15.999, name: 'Oxygen', color: '#f87171' },
  F: { weight: 18.998, name: 'Fluorine', color: '#34d399' },
  Na: { weight: 22.990, name: 'Sodium', color: '#fbbf24' },
  Mg: { weight: 24.305, name: 'Magnesium', color: '#a3e635' },
  Al: { weight: 26.982, name: 'Aluminum', color: '#cbd5e1' },
  Si: { weight: 28.085, name: 'Silicon', color: '#a78bfa' },
  P: { weight: 30.974, name: 'Phosphorus', color: '#fb923c' },
  S: { weight: 32.06, name: 'Sulfur', color: '#fde047' },
  Cl: { weight: 35.45, name: 'Chlorine', color: '#4ade80' },
  K: { weight: 39.098, name: 'Potassium', color: '#c084fc' },
  Ca: { weight: 40.078, name: 'Calcium', color: '#f472b6' },
  Fe: { weight: 55.845, name: 'Iron', color: '#ea580c' },
  Cu: { weight: 63.546, name: 'Copper', color: '#38bdf8' },
  Zn: { weight: 65.38, name: 'Zinc', color: '#93c5fd' },
  Br: { weight: 79.904, name: 'Bromine', color: '#b91c1c' },
  Ag: { weight: 107.868, name: 'Silver', color: '#e0e7ff' },
  I: { weight: 126.904, name: 'Iodine', color: '#7e22ce' },
};

// Preset reactions & extraction models
const PRESET_FORMULAS = [
  { label: 'Sodium Bicarbonate', formula: 'NaHCO3', desc: 'Buffer & effervescent neutralizer' },
  { label: 'Hydrochloric Acid', formula: 'HCl', desc: 'Strong inorganic acid' },
  { label: 'Copper(II) Sulfate', formula: 'CuSO4', desc: 'Crystalline hydrate catalyst' },
  { label: 'Sulfuric Acid', formula: 'H2SO4', desc: 'Polyprotic mineral acid' },
  { label: 'Sodium Hydroxide', formula: 'NaOH', desc: 'Strong caustic base' },
  { label: 'Caffeine Molecule', formula: 'C8H10N4O2', desc: 'Organic xanthine alkaloid' },
  { label: 'Ethanol', formula: 'C2H5OH', desc: 'Volatile organic polar solvent' },
  { label: 'Acetic Acid', formula: 'CH3COOH', desc: 'Weak organic carboxylic acid' },
  { label: 'Potassium Permanganate', formula: 'KMnO4', desc: 'Strong stoichiometric oxidizer' },
];

const PRESET_EXTRACTION_RATIOS = [
  {
    title: 'Dual-Phase Caffeine Partitioning',
    aqueous: 'Aqueous Tea Extract (pH 7.0)',
    organic: 'Ethyl Acetate (Organic Phase)',
    kdRatio: '1 : 2.5 Volumetric Ratio (Kd = 4.2)',
    desc: '3-stage counter-current extraction partitions >92% freebase alkaloid into the organic top phase.',
    formulaA: 'C8H10N4O2',
    ratioTip: 'Shake & vent 3x in separatory funnel to relieve CO2 vapor pressure.'
  },
  {
    title: 'Stoichiometric Neutralization',
    aqueous: '1.0 M NaHCO3',
    organic: '1.0 M HCl',
    kdRatio: '1.00 : 1.00 Molar Equivalence',
    desc: 'Exact 1:1 molar equivalence: NaHCO3 + HCl -> NaCl + H2O + CO2↑ (1 mol gas / mol acid).',
    formulaA: 'NaHCO3',
    ratioTip: 'Exothermic heat: ΔH = -28.3 kJ/mol; monitor temperature HUD.'
  },
  {
    title: 'Thermal Calcination Dehydration',
    aqueous: 'CuSO4·5H2O (Blue Hydrate)',
    organic: 'Anhydrous CuSO4 (White Ash)',
    kdRatio: '36.08% Theoretical Water Mass Loss',
    desc: 'CuSO4·5H2O (249.68 g/mol) loses 5 H2O (90.08 g/mol) at >95°C.',
    formulaA: 'CuSO4',
    ratioTip: 'Heat in porcelain crucible using tongs until deep royal blue transitions to pure white ash.'
  },
];

interface ElementCount {
  symbol: string;
  count: number;
  atomicWeight: number;
  totalWeight: number;
  percent: number;
  color: string;
  name: string;
}

export const AtomicRatioCalculator: React.FC<{ isDark?: boolean }> = ({ isDark = true }) => {
  const [formulaInput, setFormulaInput] = useState<string>('NaHCO3');
  const [inputMassGrams, setInputMassGrams] = useState<number>(10);
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);

  // Parse formula string into element counts
  const formulaData = useMemo(() => {
    const clean = formulaInput.replace(/\s+/g, '');
    const regex = /([A-Z][a-z]*)(\d*)/g;
    const counts: Record<string, number> = {};
    let match;

    try {
      while ((match = regex.exec(clean)) !== null) {
        if (!match[1]) continue;
        const symbol = match[1];
        const count = match[2] ? parseInt(match[2], 10) : 1;
        counts[symbol] = (counts[symbol] || 0) + count;
      }

      let totalMolarMass = 0;
      const elements: ElementCount[] = [];

      for (const [sym, count] of Object.entries(counts)) {
        const atomInfo = ATOMIC_WEIGHTS[sym] || { weight: 20.0, name: sym, color: '#38bdf8' };
        const totalW = atomInfo.weight * count;
        totalMolarMass += totalW;
      }

      if (totalMolarMass === 0) totalMolarMass = 1;

      for (const [sym, count] of Object.entries(counts)) {
        const atomInfo = ATOMIC_WEIGHTS[sym] || { weight: 20.0, name: sym, color: '#38bdf8' };
        const totalW = atomInfo.weight * count;
        elements.push({
          symbol: sym,
          count,
          atomicWeight: atomInfo.weight,
          totalWeight: totalW,
          percent: (totalW / totalMolarMass) * 100,
          color: atomInfo.color,
          name: atomInfo.name,
        });
      }

      const moles = inputMassGrams / (totalMolarMass || 1);

      return {
        isValid: elements.length > 0,
        molarMass: totalMolarMass,
        elements,
        moles,
      };
    } catch {
      return { isValid: false, molarMass: 0, elements: [], moles: 0 };
    }
  }, [formulaInput, inputMassGrams]);

  const handleSelectPreset = (f: string) => {
    soundEngine.playScaleBeep();
    setFormulaInput(f);
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col gap-4 shadow-xl transition-all ${
      isDark ? 'bg-slate-950/90 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl text-slate-950 font-bold shadow-md shadow-cyan-950/40">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <span>Atomic Ratio & Stoichiometry Engine</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Automated molar mass, elemental stoichiometry & partition ratios
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
          {formulaData.molarMass.toFixed(3)} g/mol
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-col gap-1.5">
        <label className={`text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Quick Compound Presets
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {PRESET_FORMULAS.map((p) => (
            <motion.button
              key={p.formula}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectPreset(p.formula)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap border transition-all ${
                formulaInput === p.formula
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-950/40'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.formula}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Formula Input & Mass Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className={`text-[11px] font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Chemical Formula (Case-Sensitive, e.g. CuSO4, C8H10N4O2)
          </label>
          <input
            type="text"
            value={formulaInput}
            onChange={(e) => setFormulaInput(e.target.value)}
            placeholder="Enter formula e.g. NaHCO3"
            className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono border focus:outline-none transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-cyan-300 focus:border-cyan-500' 
                : 'bg-slate-50 border-slate-200 text-cyan-700 focus:border-cyan-600'
            }`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Mass: {inputMassGrams}g</span>
            <span className="text-amber-400 font-bold">{formulaData.moles.toFixed(3)} mol</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={inputMassGrams}
            onChange={(e) => setInputMassGrams(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer mt-2"
          />
        </div>
      </div>

      {/* Elemental Ratio Breakdown Chart */}
      <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="font-bold text-cyan-400">Atomic Composition Mass %</span>
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Σ {formulaData.elements.reduce((acc, el) => acc + el.count, 0)} Atoms in Unit Formula
          </span>
        </div>

        {/* Stacked Percent Visual Bar */}
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 mb-3">
          {formulaData.elements.map((el) => (
            <div
              key={el.symbol}
              style={{ width: `${el.percent}%`, backgroundColor: el.color }}
              className="h-full transition-all duration-300 relative group cursor-pointer"
              title={`${el.name} (${el.symbol}): ${el.percent.toFixed(1)}%`}
            />
          ))}
        </div>

        {/* Elements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {formulaData.elements.map((el) => (
            <div
              key={el.symbol}
              className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold font-mono text-sm" style={{ color: el.color }}>
                  {el.symbol}
                </span>
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  ×{el.count}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className={`text-[10px] truncate max-w-[70px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{el.name}</span>
                <span className="font-mono font-bold text-xs">{el.percent.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stoichiometric Extraction & Partition Ratios Model */}
      <div className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
        isDark ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>Complex Extraction Ratios Guide</span>
          </span>
          <span className="text-[10px] font-mono text-indigo-300">Phase Partition Model</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
          {PRESET_EXTRACTION_RATIOS.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                soundEngine.playScaleBeep();
                setActivePresetIndex(idx);
                setFormulaInput(item.formulaA);
              }}
              className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                activePresetIndex === idx
                  ? 'bg-indigo-900/50 border-indigo-400 text-indigo-100 shadow-md'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold text-[11px] text-indigo-300 mb-1">{item.title}</div>
              <div className="text-[10px] font-mono text-cyan-400">{item.kdRatio}</div>
              <p className={`text-[10px] mt-1 leading-snug line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Selected Extraction Ratio Detail Callout */}
        <div className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
          isDark ? 'bg-slate-950/80 border-indigo-500/20 text-slate-300' : 'bg-white border-indigo-100 text-slate-800'
        }`}>
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-indigo-300">
              {PRESET_EXTRACTION_RATIOS[activePresetIndex].title}:{' '}
            </span>
            <span className="text-[11px] leading-relaxed">
              {PRESET_EXTRACTION_RATIOS[activePresetIndex].ratioTip}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
