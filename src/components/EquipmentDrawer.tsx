import React, { useState } from 'react';
import { VesselState } from '../types';
import { CHEMICAL_REAGENTS } from '../lib/chemicalDatabase';
import { 
  Flame, 
  Trash2, 
  Plus, 
  FlaskConical, 
  Beaker, 
  Waves, 
  ThermometerSun, 
  Sliders, 
  Sparkles,
  Scale,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../lib/soundEngine';
import { AtomicRatioCalculator } from './AtomicRatioCalculator';

interface EquipmentDrawerProps {
  vessel: VesselState;
  onUpdateVessel: (updated: VesselState) => void;
  onAddReagent: (reagentId: string, volumeMl: number) => void;
  isDark?: boolean;
  isAtomicRatioOpen?: boolean;
  onToggleAtomicRatio?: () => void;
}

export const EquipmentDrawer: React.FC<EquipmentDrawerProps> = ({
  vessel,
  onUpdateVessel,
  onAddReagent,
  isDark = true,
  isAtomicRatioOpen = false,
  onToggleAtomicRatio,
}) => {
  const [selectedReagentId, setSelectedReagentId] = useState<string>('h2o');
  const [addVolume, setAddVolume] = useState<number>(25);
  const [internalRatioOpen, setInternalRatioOpen] = useState<boolean>(false);

  const showAtomicRatio = onToggleAtomicRatio ? isAtomicRatioOpen : internalRatioOpen;
  const toggleRatio = onToggleAtomicRatio || (() => setInternalRatioOpen((prev) => !prev));

  const handleVesselTypeChange = (type: VesselState['type'], capacity: number) => {
    soundEngine.playGlassClink();
    onUpdateVessel({
      ...vessel,
      type,
      capacityMl: capacity,
      contents: [], // Reset contents on new vessel type
      isHeating: false,
      isStirring: false,
      temperatureC: 25,
      bubblesRate: 0,
    });
  };

  const handleAdd = () => {
    soundEngine.playLiquidPour();
    onAddReagent(selectedReagentId, addVolume);
  };

  const toggleHeating = () => {
    soundEngine.playBurnerHiss(!vessel.isHeating);
    onUpdateVessel({
      ...vessel,
      isHeating: !vessel.isHeating,
    });
  };

  const toggleStirring = () => {
    soundEngine.playScaleBeep();
    onUpdateVessel({
      ...vessel,
      isStirring: !vessel.isStirring,
    });
  };

  const clearVessel = () => {
    soundEngine.playLiquidPour();
    onUpdateVessel({
      ...vessel,
      contents: [],
      temperatureC: 25,
      isHeating: false,
      isStirring: false,
      bubblesRate: 0,
    });
  };

  const glasswareItems = [
    { type: 'beaker' as const, cap: 250, label: '250mL Beaker', icon: Beaker },
    { type: 'erlenmeyer' as const, cap: 500, label: '500mL Flask', icon: FlaskConical },
    { type: 'sepFunnel' as const, cap: 300, label: 'Sep Funnel', icon: Waves },
    { type: 'liebigCondenser' as const, cap: 400, label: 'Liebig Distill', icon: ThermometerSun },
    { type: 'crucible' as const, cap: 100, label: 'Crucible', icon: Sparkles },
    { type: 'testTube' as const, cap: 50, label: 'Test Tube', icon: Beaker },
  ];

  return (
    <div className={`backdrop-blur-md border rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-2xl transition-all ${
      isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300'
    }`}>
      {/* 1. Vessel Apparatus Selection with Framer Motion Hover Physics */}
      <div>
        <div className="text-xs font-mono uppercase text-cyan-400 mb-2.5 flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            <span>1. Glassware Apparatus</span>
          </div>
          <span className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Active: {vessel.capacityMl}mL {vessel.type}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {glasswareItems.map((item) => {
            const Icon = item.icon;
            const isActive = vessel.type === item.type;
            const isCrucible = item.type === 'crucible';

            return (
              <motion.button
                key={item.type}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => handleVesselTypeChange(item.type, item.cap)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                  isActive
                    ? isCrucible
                      ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/60'
                      : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                    : isDark
                    ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? (isCrucible ? 'text-amber-400' : 'text-cyan-400') : ''}`} />
                <span className="truncate max-w-full text-[11px]">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. Reagent Addition */}
      <div>
        <div className="text-xs font-mono uppercase text-cyan-400 mb-2 flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>2. Add Chemical Reagent</span>
          </div>
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            Pour: {addVolume} mL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <select
            value={selectedReagentId}
            onChange={(e) => setSelectedReagentId(e.target.value)}
            className={`sm:col-span-2 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all font-mono ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-cyan-500' 
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600'
            }`}
          >
            {CHEMICAL_REAGENTS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.formula}) — pH {r.ph}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={addVolume}
              onChange={(e) => setAddVolume(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950/40 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Pour 3D</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* 3. Action Controls: Hotkeys [H], [M], [C], [R] */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bunsen Burner Ignite Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleHeating}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 border transition-all cursor-pointer ${
              vessel.isHeating
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-950 animate-pulse'
                : isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Bunsen Burner Heat [Hotkey: H]"
          >
            <Flame className="w-4 h-4" />
            <span>{vessel.isHeating ? 'BURNER: ON [H]' : 'IGNITE BURNER [H]'}</span>
          </motion.button>

          {/* Magnetic Stirrer Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleStirring}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 border transition-all cursor-pointer ${
              vessel.isStirring
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-950'
                : isDark
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Magnetic Stirrer Vortex [Hotkey: M]"
          >
            <Waves className={`w-4 h-4 ${vessel.isStirring ? 'animate-spin' : ''}`} />
            <span>{vessel.isStirring ? 'STIRRER: ON [M]' : 'STIRRER [M]'}</span>
          </motion.button>

          {/* Atomic Ratio Tool Trigger */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleRatio}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
              showAtomicRatio
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-950/50'
                : isDark
                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
            title="Toggle Atomic Ratio Stoichiometry Tool [Hotkey: R]"
          >
            <Scale className="w-4 h-4" />
            <span>ATOMIC RATIO [R]</span>
            {showAtomicRatio ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </motion.button>
        </div>

        {/* Clean Vessel */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={clearVessel}
          className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/50 hover:text-rose-100 flex items-center gap-1.5 transition-all cursor-pointer"
          title="Clean and flush vessel contents [Hotkey: C]"
        >
          <Trash2 className="w-4 h-4" />
          <span>CLEAN [C]</span>
        </motion.button>
      </div>

      {/* Expandable Atomic Ratio Stoichiometry Component */}
      <AnimatePresence>
        {showAtomicRatio && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pt-2"
          >
            <AtomicRatioCalculator isDark={isDark} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
