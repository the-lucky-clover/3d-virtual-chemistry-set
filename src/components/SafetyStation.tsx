import React, { useState } from 'react';
import { SafetyGearState } from '../types';
import { ShieldCheck, Eye, Hand, Shirt, Wind, Flame, CheckCircle2, AlertTriangle, Award } from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';

interface SafetyStationProps {
  safetyGear: SafetyGearState;
  onUpdateSafety: (updated: SafetyGearState) => void;
}

export const SafetyStation: React.FC<SafetyStationProps> = ({
  safetyGear,
  onUpdateSafety,
}) => {
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const toggleGear = (key: keyof SafetyGearState) => {
    soundEngine.playScaleBeep();
    onUpdateSafety({
      ...safetyGear,
      [key]: !safetyGear[key],
    });
  };

  const safetyQuestions = [
    {
      q: 'When diluting concentrated Hydrochloric Acid (HCl), what is the golden rule?',
      options: [
        'Always add Acid to Water slowly, never Water to Acid.',
        'Add Water to Acid rapidly to cool it down.',
        'Mix both simultaneously in sealed glass.',
      ],
      correct: 0,
      explanation: 'Adding water to concentrated acid can cause intense localized boiling and violent acid splashing due to exothermic hydration enthalpy!',
    },
    {
      q: 'Why must organic solvent vapors (e.g. Ethyl Acetate) be handled in an active Fume Hood?',
      options: [
        'Organic solvents smell like flowers and must be contained.',
        'Volatile organic vapors are flammable and toxic if inhaled.',
        'The fume hood prevents solvents from turning into solid crystals.',
      ],
      correct: 1,
      explanation: 'Fume hoods maintain continuous negative air ventilation to remove hazardous volatile organic compounds (VOCs) and flammable vapors.',
    },
    {
      q: 'How should hot crucibles or hot glass be carried across the laboratory bench?',
      options: [
        'With bare hands using quick movements.',
        'Using insulated Crucible Tongs and placing them on heat-resistant mats.',
        'In a plastic bucket filled with cold tap water.',
      ],
      correct: 1,
      explanation: 'Crucible tongs provide firm metallic grip and distance, preventing thermal skin burns from glass heated above 300°C.',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 max-w-4xl mx-auto shadow-2xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Laboratory Safety Station
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Mandatory PPE protocols, ventilation management, & safety drills
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full text-xs font-mono text-cyan-300 border border-slate-700">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Safety Clearance: {safetyGear.gogglesOn && safetyGear.glovesOn && safetyGear.labCoatOn ? 'PASSED (100%)' : 'PENDING'}</span>
        </div>
      </div>

      {/* PPE Toggle Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Item 1: Splash Goggles */}
        <button
          onClick={() => toggleGear('gogglesOn')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-36 ${
            safetyGear.gogglesOn
              ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start">
            <Eye className={`w-6 h-6 ${safetyGear.gogglesOn ? 'text-cyan-400' : 'text-slate-500'}`} />
            {safetyGear.gogglesOn ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <span className="text-xs text-slate-500">OFF</span>}
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100">Splash Safety Goggles</div>
            <div className="text-xs text-slate-400 mt-1">Protects eyes from corrosive splashes & glass shrapnel.</div>
          </div>
        </button>

        {/* Item 2: Nitrile Gloves */}
        <button
          onClick={() => toggleGear('glovesOn')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-36 ${
            safetyGear.glovesOn
              ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start">
            <Hand className={`w-6 h-6 ${safetyGear.glovesOn ? 'text-cyan-400' : 'text-slate-500'}`} />
            {safetyGear.glovesOn ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <span className="text-xs text-slate-500">OFF</span>}
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100">Nitrile Lab Gloves</div>
            <div className="text-xs text-slate-400 mt-1">Chemical barrier against acids, caustics, and stain reagents.</div>
          </div>
        </button>

        {/* Item 3: Lab Coat */}
        <button
          onClick={() => toggleGear('labCoatOn')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-36 ${
            safetyGear.labCoatOn
              ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-950/50'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start">
            <Shirt className={`w-6 h-6 ${safetyGear.labCoatOn ? 'text-cyan-400' : 'text-slate-500'}`} />
            {safetyGear.labCoatOn ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <span className="text-xs text-slate-500">OFF</span>}
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100">Flame-Resistant Lab Coat</div>
            <div className="text-xs text-slate-400 mt-1">Protects clothing and torso skin against direct chemical spills.</div>
          </div>
        </button>

        {/* Item 4: Active Fume Hood */}
        <button
          onClick={() => toggleGear('fumeHoodActive')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-36 ${
            safetyGear.fumeHoodActive
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start">
            <Wind className={`w-6 h-6 ${safetyGear.fumeHoodActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            {safetyGear.fumeHoodActive ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <span className="text-xs text-slate-500">INACTIVE</span>}
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-100">Fume Hood Exhaust</div>
            <div className="text-xs text-slate-400 mt-1">Negative air extraction ventilation for volatile organic vapors.</div>
          </div>
        </button>
      </div>

      {/* Crucible Tongs & Handling Gear */}
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">Crucible Tongs & Hot Apparatus Tool</div>
            <div className="text-xs text-slate-400">Always use articulated metallic tongs when moving vessels heated above 60°C.</div>
          </div>
        </div>

        <button
          onClick={() => toggleGear('tongsHeld')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all border ${
            safetyGear.tongsHeld
              ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
              : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
          }`}
        >
          {safetyGear.tongsHeld ? 'HOLDING TONGS' : 'EQUIP TONGS'}
        </button>
      </div>

      {/* Interactive Safety Quiz */}
      <div className="bg-slate-950/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>Interactive Safety Drill & Chemical Knowledge Check</span>
        </div>

        {safetyQuestions.map((qItem, idx) => (
          <div key={idx} className="space-y-2 border-t border-slate-800/80 pt-3">
            <p className="text-sm font-medium text-slate-200">
              {idx + 1}. {qItem.q}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {qItem.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => {
                    setQuizAnswer(oIdx);
                    if (oIdx === qItem.correct) {
                      soundEngine.playSuccessChime();
                      setQuizScore((prev) => Math.min(3, prev + 1));
                    } else {
                      soundEngine.playSafetyAlarm();
                    }
                  }}
                  className={`p-2.5 rounded-lg text-xs text-left transition-all border ${
                    quizAnswer === oIdx
                      ? oIdx === qItem.correct
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quizAnswer !== null && (
              <p className="text-xs text-cyan-300/90 italic bg-cyan-950/20 p-2 rounded border border-cyan-500/20">
                {qItem.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* National Helplines & Health Support Resources */}
      <div className="bg-blue-950/40 border border-blue-500/30 p-4 sm:p-5 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-blue-400 text-sm font-bold">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span>National Substance Abuse & Health Support Resources</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This virtual laboratory is strictly dedicated to legitimate, safe, educational science (titrations, flame spectroscopy, natural product extractions, and thermodynamics). For anyone seeking support, confidential information, or treatment referral for substance use or mental health:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <span className="font-bold text-cyan-300">SAMHSA National Helpline</span>
            <span className="text-slate-200 font-mono text-sm">1-800-662-HELP (4357)</span>
            <span className="text-[11px] text-slate-400">Free, confidential 24/7 treatment referral & information service.</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-1">
            <span className="font-bold text-cyan-300">Suicide & Crisis Lifeline</span>
            <span className="text-slate-200 font-mono text-sm">Call or Text 988</span>
            <span className="text-[11px] text-slate-400">Immediate 24/7 support for mental health challenges or distress.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
