import React from 'react';
import { motion } from 'motion/react';
import { Keyboard, X, Sparkles, Command, ShieldCheck, Flame, Waves, Trash2, Scale } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

const SHORTCUTS = [
  { key: '1', desc: 'Switch to 3D Virtual Lab Workbench', cat: 'Navigation' },
  { key: '2', desc: 'Switch to Guided Modules & Boss Levels', cat: 'Navigation' },
  { key: '3', desc: 'Switch to Safety Station & PPE Equipment', cat: 'Navigation' },
  { key: '4', desc: 'Switch to AI Chemistry Professor', cat: 'Navigation' },
  { key: '5', desc: 'Switch to Lab Notebook & Badges', cat: 'Navigation' },
  { key: 'S', desc: 'Toggle Safety Gear & PPE Station', cat: 'Lab Action' },
  { key: 'H', desc: 'Toggle Bunsen Burner Flame (Heat)', cat: 'Lab Action' },
  { key: 'M', desc: 'Toggle Magnetic Stirrer (Vortex)', cat: 'Lab Action' },
  { key: 'C', desc: 'Clean & Reset Current Vessel', cat: 'Lab Action' },
  { key: 'R', desc: 'Toggle Atomic Ratio Stoichiometry Tool', cat: 'Lab Action' },
  { key: '?', desc: 'Open this Keyboard Shortcuts Guide', cat: 'General' },
  { key: 'Esc', desc: 'Close any open modal or dialog', cat: 'General' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  isDark = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-slate-950 font-bold shadow-md shadow-cyan-950/40">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-1.5">
                <span>Power User Keyboard Shortcuts</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Rapid laboratory navigation and equipment control hotkeys
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {s.desc}
              </span>
              <kbd className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-sm border shrink-0 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                  : 'bg-white border-slate-300 text-cyan-700 shadow-slate-200'
              }`}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className={`p-4 border-t text-center text-xs font-mono ${
          isDark ? 'border-slate-800 bg-slate-950/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}>
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[10px]">?</kbd> anywhere to reopen this quick reference guide.
        </div>
      </motion.div>
    </div>
  );
};
