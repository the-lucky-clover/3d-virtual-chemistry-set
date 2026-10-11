import React, { useState } from 'react';
import { VesselState } from '../types';
import { Bot, Send, Sparkles, User, RefreshCw, HelpCircle, BookOpen, Atom, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { soundEngine } from '../lib/soundEngine';

interface AiChemistryAssistantProps {
  vessel: VesselState;
  isDark?: boolean;
}

const SAMPLE_QUESTIONS = [
  'Explain the stoichiometric neutralization between NaHCO3 and HCl.',
  'Why does adding water to concentrated acid cause violent spitting?',
  'How does a Liebig condenser use counter-current cooling?',
  'What is the partition coefficient (Kd) in dual-phase caffeine extraction?',
  'Explain the chemical change during CuSO4·5H2O thermal calcination.'
];

export const AiChemistryAssistant: React.FC<AiChemistryAssistantProps> = ({ vessel, isDark = true }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Greetings, Chemist! I am your AI Virtual Laboratory Professor powered by Gemini Flash. Ask me about chemical reaction mechanisms, thermodynamics (ΔH & ΔS), stoichiometric ratios, green synthesis, or lab safety protocols!',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    soundEngine.playScaleBeep();
    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chemistry-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          currentReagents: vessel.contents,
          currentTemp: vessel.temperatureC,
          currentPh: 7.0,
          labContext: `${vessel.capacityMl}mL ${vessel.type}`,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: data.answer || 'Analysis complete!' }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Exothermic check: Reaction kinetic model offline. Always observe laboratory safety protocols (PPE), verify stoichiometric balances, and ensure proper ventilation!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`backdrop-blur-md border rounded-2xl p-4 sm:p-5 flex flex-col h-[560px] shadow-2xl transition-all ${
      isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-3 mb-3 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-slate-950 font-bold shadow-md shadow-cyan-950/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              <span>AI Laboratory Professor</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Powered by Gemini 2.5 Flash Server-Side AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono">
          <Atom className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Vessel Context: {vessel.type} ({vessel.temperatureC.toFixed(1)}°C)</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {SAMPLE_QUESTIONS.map((sq, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSend(sq)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap border shrink-0 transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-cyan-500 hover:bg-slate-200'
            }`}
          >
            {sq}
          </motion.button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                m.sender === 'user'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : isDark
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'bg-slate-100 text-cyan-600 border border-slate-300'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed whitespace-pre-line ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white font-medium shadow-md'
                  : isDark
                  ? 'bg-slate-950/80 text-slate-200 border border-slate-800'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 shadow-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono italic p-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Analyzing molecular kinetics & reaction thermodynamics via Gemini AI...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className={`border-t pt-3 mt-3 flex items-center gap-2 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a chemistry question (e.g., Explain stoichiometry of buffer systems...)"
          className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all ${
            isDark 
              ? 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-cyan-500' 
              : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-600'
          }`}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSend()}
          disabled={isLoading}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-950/40 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};
