import React from 'react';
import { ExperimentModule, VesselState, SafetyGearState } from '../types';
import { EXPERIMENT_MODULES } from '../lib/experimentModules';
import { 
  CheckCircle2, 
  Circle, 
  Lightbulb, 
  Trophy, 
  ArrowRight, 
  Award, 
  Lock, 
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../lib/soundEngine';

interface ExperimentGuideProps {
  activeModuleId: string;
  vessel: VesselState;
  safetyGear: SafetyGearState;
  labHistory: string[];
  onSelectModule: (id: string) => void;
  onStepComplete?: (stepId: string) => void;
  isDark?: boolean;
  isSafetyCertified?: boolean;
  onOpenSafetyCertification?: () => void;
}

export const ExperimentGuide: React.FC<ExperimentGuideProps> = ({
  activeModuleId,
  vessel,
  safetyGear,
  labHistory,
  onSelectModule,
  isDark = true,
  isSafetyCertified = false,
  onOpenSafetyCertification,
}) => {
  const currentModule = EXPERIMENT_MODULES.find((m) => m.id === activeModuleId) || EXPERIMENT_MODULES[0];
  const isBossModule = currentModule.id.startsWith('boss_');
  const isCurrentModuleLocked = isBossModule && !isSafetyCertified;

  const handleModuleChange = (id: string) => {
    const isTargetBoss = id.startsWith('boss_');
    if (isTargetBoss && !isSafetyCertified) {
      soundEngine.playHazardSiren();
      if (onOpenSafetyCertification) {
        onOpenSafetyCertification();
      }
      return;
    }

    soundEngine.playScaleBeep();
    onSelectModule(id);
  };

  const triggerConfetti = () => {
    soundEngine.playSuccessChime();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className={`backdrop-blur-md border rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-2xl transition-all ${
      isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300'
    }`}>
      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {EXPERIMENT_MODULES.map((mod, idx) => {
          const isActive = mod.id === activeModuleId;
          const isBoss = mod.id.startsWith('boss_');
          const isLocked = isBoss && !isSafetyCertified;

          return (
            <motion.button
              key={mod.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleModuleChange(mod.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? isBoss
                    ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/60'
                    : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                  : isBoss
                  ? isLocked
                    ? 'bg-slate-900/80 border-slate-800 text-slate-500 hover:border-amber-500/40'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300/80 hover:bg-amber-900/40'
                  : isDark
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={`font-mono text-[10px] ${isBoss ? 'text-amber-400 font-bold' : 'text-cyan-400'}`}>
                {isBoss ? (isLocked ? '🔒' : '👑') : `M${idx + 1}`}
              </span>
              <span>{mod.title}</span>
              {isLocked && <Lock className="w-3 h-3 text-amber-500/70" />}
            </motion.button>
          );
        })}
      </div>

      {/* Safety Certification Callout Header (if not certified) */}
      {!isSafetyCertified && (
        <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
          isDark ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">OSHA Safety Protocol Exam Required: </span>
              <span>Pass the certification quiz to unlock all 3 Boss Level synthesis challenges.</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenSafetyCertification}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Take Certification Exam</span>
          </motion.button>
        </div>
      )}

      {/* Module Title Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isBossModule
          ? 'bg-gradient-to-r from-amber-950/40 via-slate-950/80 to-amber-950/40 border-amber-500/50'
          : isDark
          ? 'bg-slate-950/80 border-slate-800/80'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase">
            <span className={isBossModule ? 'text-amber-400 font-bold' : 'text-cyan-400'}>{currentModule.difficulty} Level</span>
            <span>•</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Est. {currentModule.estimatedMinutes} mins</span>
          </div>
          <h3 className={`text-lg font-bold mt-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{currentModule.subtitle}</h3>
          <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{currentModule.description}</p>
        </div>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono shrink-0 ${
          isBossModule
            ? 'bg-amber-900/40 border-amber-500 text-amber-300 shadow-md'
            : isDark
            ? 'bg-slate-900 border-slate-700 text-amber-400'
            : 'bg-white border-slate-200 text-amber-600'
        }`}>
          <Award className="w-4 h-4" />
          <span>Badge: {currentModule.badgeName}</span>
        </div>
      </div>

      {/* Gated Locked State for Boss Module */}
      {isCurrentModuleLocked ? (
        <div className={`p-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 ${
          isDark ? 'bg-slate-950/70 border-amber-500/30' : 'bg-slate-50 border-amber-200'
        }`}>
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
            <Lock className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h4 className="font-bold text-base text-amber-400">Boss Level Protocol Gated</h4>
            <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              This advanced synthesis requires verified proficiency in acid dilution, volatile solvent venting, and thermal glassware handling.
            </p>
          </div>
          <button
            onClick={onOpenSafetyCertification}
            className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pass Safety Certification to Unlock</span>
          </button>
        </div>
      ) : (
        /* Step Validation List */
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center justify-between">
            <span>Protocol Verification Steps ({currentModule.steps.length})</span>
            <span className="text-[11px] text-cyan-400">Dynamic 3D State Evaluator</span>
          </div>

          <div className="space-y-2.5">
            {currentModule.steps.map((step, idx) => {
              const isPassed = step.validationCheck(vessel, safetyGear, labHistory);

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isPassed
                      ? isDark
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : isDark
                      ? 'bg-slate-950/50 border-slate-800 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                      )}

                      <div>
                        <div className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {idx + 1}. {step.title}
                        </div>
                        <div className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{step.instruction}</div>
                      </div>
                    </div>

                    {isPassed && (
                      <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shrink-0 font-bold">
                        PASSED
                      </span>
                    )}
                  </div>

                  {!isPassed && (
                    <div className={`mt-2.5 pt-2 border-t flex items-center gap-2 text-[11px] italic ${
                      isDark ? 'border-slate-800/80 text-cyan-300/80' : 'border-slate-200 text-cyan-700'
                    }`}>
                      <Lightbulb className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span>Hint: {step.hint}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Victory Celebration & Badge Claim Button */}
      <div className="flex justify-end">
        <button
          onClick={triggerConfetti}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
        >
          <span>Claim Module Badge & Victory Celebration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
