import React from 'react';
import { LabLogEntry } from '../types';
import { BookOpen, Award, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface LabNotebookProps {
  logs: LabLogEntry[];
  earnedBadges: string[];
}

export const LabNotebook: React.FC<LabNotebookProps> = ({ logs, earnedBadges }) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-5 text-slate-100 shadow-2xl max-w-4xl mx-auto">
      {/* Notebook Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Autodidact Laboratory Notebook
            </h2>
            <p className="text-xs text-slate-400">Recorded chemical observations, enthalpy calculations, & mastery badges</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-xs font-mono text-amber-300 border border-slate-700">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Badges Earned: {earnedBadges.length}</span>
        </div>
      </div>

      {/* Earned Mastery Badges */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase text-amber-400 font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Chemistry Mastery Badges</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Safety Ace Champion', 'Spectroscopy Ace', 'Titration Ace', 'Master Distiller', 'Separation Ace', 'Master Enthalpy Ace'].map(
            (badge, idx) => {
              const isUnlocked = earnedBadges.includes(badge);
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                    isUnlocked
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-lg shadow-amber-950/40'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                  }`}
                >
                  <Award className={`w-5 h-5 shrink-0 ${isUnlocked ? 'text-amber-400' : 'text-slate-600'}`} />
                  <div>
                    <div className="text-xs font-semibold">{badge}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Real-time Reaction Log History */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase text-cyan-400 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Recorded Observation Logs</span>
        </div>

        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.length === 0 ? (
            <div className="text-center p-6 text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No reaction logs recorded yet. Begin an experiment or combine reagents in the 3D lab stage!
            </div>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3 text-xs"
              >
                <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0 font-mono text-[10px]">
                  {log.timestamp}
                </div>
                <div>
                  <div className="font-semibold text-slate-200">{log.title}</div>
                  <div className="text-slate-400 mt-0.5">{log.details}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
