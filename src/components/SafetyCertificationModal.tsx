import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  X,
  AlertTriangle,
  Lock,
  Unlock,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../lib/soundEngine';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'PPE' | 'Reagent Handling' | 'Thermal Safety' | 'Vapor & Ventilation' | 'Acid-Base';
}

const SAFETY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Acid-Base',
    question: 'When preparing a dilute aqueous acid solution from concentrated stock, what is the golden rule?',
    options: [
      'Always add Water to Acid (AWA) quickly to disperse heat',
      'Always add Acid to Water (AAA) slowly with continuous stirring',
      'Mix both simultaneously in equal volumes in an unsealed container',
      'Heat the acid first to 100°C before adding cold water'
    ],
    correctIndex: 1,
    explanation: 'Always add Acid to Water (AAA). The hydration of concentrated acids is fiercely exothermic. Adding water to acid causes the water to instantaneously boil and violently spit caustic droplets.',
  },
  {
    id: 2,
    category: 'Vapor & Ventilation',
    question: 'When performing a dual-phase extraction using volatile solvents (e.g., Ethyl Acetate or Diethyl Ether) in a Separatory Funnel, what step is vital?',
    options: [
      'Keep the stopper sealed tightly without venting to retain pressure',
      'Invert the separatory funnel and open the stopcock frequently away from faces to vent vapor buildup',
      'Heat the separatory funnel over a naked Bunsen flame while shaking',
      'Use a plastic drinking straw to blow air into the top neck'
    ],
    correctIndex: 1,
    explanation: 'Volatile solvents evaporate rapidly when agitated. You must invert the funnel and vent the stopcock pointed towards the rear of an active fume hood to prevent explosive stopper blowout.',
  },
  {
    id: 3,
    category: 'Thermal Safety',
    question: 'How should you safely handle a porcelain crucible undergoing high-temperature calcination (>90°C)?',
    options: [
      'Pick it up with bare nitrile gloves immediately after turning off the flame',
      'Quench the hot crucible directly into an ice-water bath to cool it quickly',
      'Use heat-resistant stainless steel crucible tongs and place it onto a ceramic wire gauze or desiccator',
      'Blow forcefully on the molten contents with your mouth'
    ],
    correctIndex: 2,
    explanation: 'Nitrile gloves melt upon contact with hot porcelain. Cold water causes catastrophic thermal shock fracturing. Always manipulate with crucible tongs and cool slowly on a ceramic pad.',
  },
  {
    id: 4,
    category: 'PPE',
    question: 'Which piece of Personal Protective Equipment (PPE) provides adequate defense against high-velocity chemical splashes?',
    options: [
      'Standard prescription eyeglasses or sunglasses',
      'Indirectly vented ANSI Z87.1 Chemical Splash Goggles with tight seal',
      'A cotton baseball cap pulled down low',
      'Contact lenses without any outer eyewear'
    ],
    correctIndex: 1,
    explanation: 'Standard glasses leave massive peripheral gaps. Only certified ANSI Z87.1 chemical splash goggles form a liquid-tight seal around the orbital socket to block hazardous aerosols and splashes.',
  },
  {
    id: 5,
    category: 'Reagent Handling',
    question: 'In the event of an accidental mineral acid spill on the lab workbench, what is the appropriate neutralizer?',
    options: [
      'Concentrated 10 M Sodium Hydroxide (NaOH)',
      'Sodium Bicarbonate (NaHCO3) powder or dilute weak base until bubbling ceases',
      'Pour gasoline over it to dissolve the acid',
      'Wipe it dry immediately with standard dry paper towels with bare hands'
    ],
    correctIndex: 1,
    explanation: 'Sodium bicarbonate is an amphoteric, self-buffering neutralizer that safely reacts with acids (yielding CO2 gas and water) without generating runaway alkaline caustic hazard.',
  },
];

interface SafetyCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCertified: boolean;
  onGrantCertification: () => void;
  isDark?: boolean;
}

export const SafetyCertificationModal: React.FC<SafetyCertificationModalProps> = ({
  isOpen,
  onClose,
  isCertified,
  onGrantCertification,
  isDark = true,
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelect = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    soundEngine.playScaleBeep();
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = SAFETY_QUIZ_QUESTIONS.length;

  const score = SAFETY_QUIZ_QUESTIONS.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 80;

  const handleSubmit = () => {
    setSubmitted(true);
    if (passed) {
      soundEngine.playSuccessChime();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
      onGrantCertification();
    } else {
      soundEngine.playHazardSiren();
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-slate-950 font-bold ${
              isCertified || (submitted && passed)
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-950/50 shadow-md'
                : 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-amber-950/50 shadow-md'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">OSHA & ACS Lab Safety Certification</h2>
                {isCertified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    CERTIFIED
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Pass this protocol assessment (≥80%) to unlock Advanced Boss Level Experiments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Status Banner */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                passed
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {passed ? (
                  <Award className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {passed ? 'Safety Certification Granted!' : 'Certification Assessment Not Passed'}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    {passed
                      ? `Score: ${score}/${totalQuestions} (${percentage}%). Boss Level experimental modules are now fully unlocked!`
                      : `Score: ${score}/${totalQuestions} (${percentage}%). Please review the safety guidelines and retry to achieve ≥80%.`}
                  </p>
                </div>
              </div>

              {!passed && (
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Exam</span>
                </button>
              )}
            </motion.div>
          )}

          {/* Question List */}
          <div className="flex flex-col gap-5">
            {SAFETY_QUIZ_QUESTIONS.map((q, qIndex) => {
              const selectedOption = userAnswers[q.id];
              const isCorrect = selectedOption === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      Q{qIndex + 1}. [{q.category}]
                    </span>
                    {submitted && (
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOption === optIdx;
                      const isRealAnswer = q.correctIndex === optIdx;

                      let btnStyle = isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-cyan-500/50'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-cyan-500';

                      if (isChosen && !submitted) {
                        btnStyle = 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold';
                      } else if (submitted) {
                        if (isRealAnswer) {
                          btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                        } else if (isChosen && !isRealAnswer) {
                          btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 line-through';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submitted}
                          onClick={() => handleSelect(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-2.5 ${btnStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Callout upon Submission */}
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`mt-3 pt-2.5 border-t text-xs leading-relaxed ${
                        isDark ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="font-bold text-cyan-400">Scientific Rationale: </span>
                      {q.explanation}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="text-xs font-mono text-slate-400">
            Progress: {answeredCount}/{totalQuestions} Answered
          </div>

          <div className="flex items-center gap-2">
            {!submitted ? (
              <button
                disabled={answeredCount < totalQuestions}
                onClick={handleSubmit}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Submit & Validate Certification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Return to Laboratory</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
