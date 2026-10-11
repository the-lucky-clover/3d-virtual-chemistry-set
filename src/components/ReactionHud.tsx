import React from 'react';
import { VesselState, SafetyGearState } from '../types';
import { EXPERIMENT_MODULES } from '../lib/experimentModules';
import { 
  Thermometer, 
  Gauge, 
  Activity, 
  AlertTriangle, 
  Flame, 
  Droplets, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Wind,
  Layers,
  Sparkles,
  Award,
  Circle,
  HelpCircle,
  Keyboard
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReactionHudProps {
  vessel: VesselState;
  safetyGear: SafetyGearState;
  activeLog?: string;
  isDark?: boolean;
  activeModuleId?: string;
  labHistory?: string[];
  onOpenShortcuts?: () => void;
}

export const ReactionHud: React.FC<ReactionHudProps> = ({
  vessel,
  safetyGear,
  activeLog,
  isDark = true,
  activeModuleId = 'm1_density',
  labHistory = [],
  onOpenShortcuts,
}) => {
  const totalVol = vessel.contents.reduce((acc, item) => acc + item.volumeMl, 0);

  // Dynamic Risk Level Calculation (0 to 100%)
  let riskScore = 0;
  const riskViolations: string[] = [];

  // 1. PPE Adherence
  if (!safetyGear.gogglesOn) {
    riskScore += 30;
    riskViolations.push('Missing Eye Protection (Goggles Off)');
  }
  if (!safetyGear.glovesOn) {
    riskScore += 20;
    riskViolations.push('Missing Chemical Gloves');
  }
  if (!safetyGear.labCoatOn) {
    riskScore += 15;
    riskViolations.push('Missing Flame-Resistant Lab Coat');
  }

  // 2. Chemical Vapor & Ventilation Risk
  const hasVolatileSolvent = vessel.contents.some(
    (c) => c.reagentId === 'ethyl_acetate' || c.reagentId === 'hcl' || c.reagentId === 'tea_extract'
  );
  if (hasVolatileSolvent && !safetyGear.fumeHoodActive) {
    riskScore += 35;
    riskViolations.push('Volatile Vapors Active (Fume Hood OFF)');
  }

  // 3. Thermal Risk
  if (vessel.temperatureC > 100) {
    riskScore += 30;
    riskViolations.push('Extreme Boiling Thermal State (>100°C)');
  } else if (vessel.temperatureC > 65) {
    riskScore += 15;
    riskViolations.push('Elevated Solution Temperature (>65°C)');
  }

  // 4. Hot apparatus handling without tongs
  if (vessel.type === 'crucible' && vessel.isHeating && !safetyGear.tongsHeld) {
    riskScore += 25;
    riskViolations.push('Heating Crucible Without Tongs Engaged');
  }

  // 5. Exothermic gas bubbling rate
  if (vessel.bubblesRate && vessel.bubblesRate > 4) {
    riskScore += 20;
    riskViolations.push('High Exothermic Effervescence / Gas Evolution');
  }

  // Bound score 0 to 100
  const normalizedRisk = Math.min(100, Math.max(0, riskScore));

  // Risk Classification
  let riskTier: 'low' | 'moderate' | 'critical' = 'low';
  let riskLabel = 'STABLE & COMPLIANT';
  let riskColorClass = 'text-emerald-400';
  let riskBarBg = 'bg-emerald-500';
  let riskContainerBorder = 'border-emerald-500/30';
  let riskContainerBg = 'bg-emerald-950/20';

  if (normalizedRisk > 60) {
    riskTier = 'critical';
    riskLabel = 'CRITICAL HAZARD LEVEL';
    riskColorClass = 'text-rose-400';
    riskBarBg = 'bg-rose-500';
    riskContainerBorder = 'border-rose-500/50';
    riskContainerBg = 'bg-rose-950/30';
  } else if (normalizedRisk > 25) {
    riskTier = 'moderate';
    riskLabel = 'MODERATE RISK DETECTED';
    riskColorClass = 'text-amber-400';
    riskBarBg = 'bg-amber-500';
    riskContainerBorder = 'border-amber-500/40';
    riskContainerBg = 'bg-amber-950/20';
  }

  // Synthesis Completion Multi-Stage Progress for Current Module
  const currentModule = EXPERIMENT_MODULES.find((m) => m.id === activeModuleId) || EXPERIMENT_MODULES[0];
  const isBossModule = currentModule.id.startsWith('boss_');
  const totalSteps = currentModule.steps.length;
  
  const passedStepsCount = currentModule.steps.filter((s) =>
    s.validationCheck(vessel, safetyGear, labHistory)
  ).length;

  const synthesisPercent = totalSteps > 0 ? Math.round((passedStepsCount / totalSteps) * 100) : 0;
  const isSynthesisComplete = synthesisPercent === 100;

  // pH color calculation for HUD
  const getPhBgColor = (ph: number) => {
    if (ph < 3) return 'from-rose-500 to-red-600';
    if (ph < 6) return 'from-amber-500 to-orange-500';
    if (ph < 8) return 'from-emerald-500 to-green-600';
    if (ph < 11) return 'from-cyan-500 to-blue-600';
    return 'from-purple-500 to-violet-600';
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* 1. Dynamic Risk Meter & Safety Telemetry Header */}
      <div 
        className={`p-3 sm:p-4 rounded-xl border backdrop-blur-md transition-all shadow-xl ${riskContainerBorder} ${riskContainerBg} ${
          isDark ? 'bg-slate-900/90' : 'bg-white/90'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              riskTier === 'critical' 
                ? 'bg-rose-500/20 text-rose-400 animate-ping' 
                : riskTier === 'moderate' 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {riskTier === 'critical' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : riskTier === 'moderate' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <span>Real-Time Reaction Risk Meter</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                  ISO-17025
                </span>
              </div>
              <div className={`text-xs sm:text-sm font-extrabold font-mono tracking-tight ${riskColorClass} flex items-center gap-1.5`}>
                <span>{riskLabel}</span>
                <span>({normalizedRisk}% DANGER INDEX)</span>
              </div>
            </div>
          </div>

          {/* Quick Safety Status Badges & Keyboard Shortcuts Trigger */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono flex-wrap">
            <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
              safetyGear.gogglesOn 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            }`}>
              {safetyGear.gogglesOn ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              <span>GOGGLES</span>
            </span>

            <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
              safetyGear.glovesOn 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {safetyGear.glovesOn ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              <span>GLOVES</span>
            </span>

            <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
              safetyGear.fumeHoodActive 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Wind className="w-3 h-3" />
              <span>HOOD {safetyGear.fumeHoodActive ? 'ON' : 'OFF'}</span>
            </span>

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Keyboard Shortcuts Reference [?]"
              >
                <Keyboard className="w-3 h-3 text-cyan-400" />
                <span className="hidden md:inline">Hotkeys [?]</span>
              </button>
            )}
          </div>
        </div>

        {/* Risk Bar */}
        <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-slate-800/80 flex items-center">
          <div
            className={`h-full transition-all duration-500 rounded-full ${riskBarBg} shadow-lg ${
              riskTier === 'critical' ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.max(5, normalizedRisk)}%` }}
          />
        </div>

        {/* Active Violation Chips */}
        {riskViolations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
            {riskViolations.map((v, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                <span>{v}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. Synthesis Completion Progress Bar (Multi-Stage Boss & Module Tracker) */}
      <div className={`p-3 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
        isBossModule
          ? 'bg-gradient-to-r from-amber-950/30 via-slate-900/90 to-amber-950/30 border-amber-500/40'
          : isDark
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white/90 border-slate-200 shadow-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              isBossModule ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold font-mono ${
                  isBossModule ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {isBossModule ? '👑 BOSS SYNTHESIS PROGRESS' : 'EXPERIMENT SYNTHESIS PROGRESS'}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentModule.title}
                </span>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Stage {passedStepsCount} of {totalSteps} protocol steps completed ({synthesisPercent}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isSynthesisComplete ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1 shadow-sm">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>SYNTHESIS COMPLETE</span>
              </span>
            ) : (
              <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border ${
                isBossModule ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}>
                {synthesisPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Segmented Step Nodes Bar */}
        <div className="flex items-center gap-1.5 w-full">
          {currentModule.steps.map((step, sIdx) => {
            const isStepDone = step.validationCheck(vessel, safetyGear, labHistory);
            return (
              <div key={step.id} className="flex-1 flex flex-col gap-1">
                <div className={`h-2 rounded-full transition-all duration-500 ${
                  isStepDone
                    ? isBossModule
                      ? 'bg-amber-400 shadow-md shadow-amber-950/60'
                      : 'bg-cyan-400 shadow-md shadow-cyan-950/60'
                    : isDark
                    ? 'bg-slate-800'
                    : 'bg-slate-200'
                }`} />
                <div className="flex items-center justify-between text-[9px] font-mono px-0.5">
                  <span className={isStepDone ? 'text-emerald-400 font-bold' : isDark ? 'text-slate-500' : 'text-slate-400'}>
                    S{sIdx + 1}
                  </span>
                  <span className={`truncate max-w-[80px] hidden sm:inline ${
                    isStepDone ? (isDark ? 'text-slate-300' : 'text-slate-700') : (isDark ? 'text-slate-500' : 'text-slate-400')
                  }`}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Sensor Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Temperature Reading */}
        <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-md transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${vessel.temperatureC > 60 ? 'bg-rose-500/10 text-rose-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
              <Thermometer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Temperature</div>
              <div className={`text-sm sm:text-base font-bold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {vessel.temperatureC.toFixed(1)} °C
              </div>
            </div>
          </div>
          {vessel.isHeating && <Flame className="w-4 h-4 text-amber-400 animate-bounce" />}
        </div>

        {/* pH Readout */}
        <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-md transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getPhBgColor(7)} text-white`}>
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">pH Level</div>
              <div className={`text-sm sm:text-base font-bold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                7.0
              </div>
            </div>
          </div>
        </div>

        {/* Liquid Volume */}
        <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-md transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Total Volume</div>
              <div className={`text-sm sm:text-base font-bold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {totalVol} mL
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">/ {vessel.capacityMl}mL</span>
        </div>

        {/* Gas Evolution */}
        <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between shadow-lg backdrop-blur-md transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Effervescence</div>
              <div className={`text-sm sm:text-base font-bold font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {vessel.bubblesRate ? `${vessel.bubblesRate * 10}%` : 'Stable'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Reaction Banner */}
      {activeLog && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 backdrop-blur-md p-3 rounded-xl border border-cyan-500/40 text-xs sm:text-sm font-mono text-cyan-200 flex items-center gap-2 shadow-xl animate-fade-in">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span className="font-semibold text-cyan-400">REACTION ENGINE:</span>
          <span>{activeLog}</span>
        </div>
      )}
    </div>
  );
};
