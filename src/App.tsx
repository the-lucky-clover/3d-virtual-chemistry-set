import React, { useState, useEffect } from 'react';
import { VesselState, SafetyGearState, LabLogEntry } from './types';
import { processVesselReaction, getReagentById } from './lib/chemicalDatabase';
import { ThreeCanvas } from './components/ThreeCanvas';
import { ReactionHud } from './components/ReactionHud';
import { EquipmentDrawer } from './components/EquipmentDrawer';
import { SafetyStation } from './components/SafetyStation';
import { ExperimentGuide } from './components/ExperimentGuide';
import { AiChemistryAssistant } from './components/AiChemistryAssistant';
import { LabNotebook } from './components/LabNotebook';
import { SupportResourcesModal } from './components/SupportResourcesModal';
import { ConvictionNewsSidebar } from './components/ConvictionNewsSidebar';
import { EXPERIMENT_MODULES } from './lib/experimentModules';
import { 
  FlaskConical, 
  ShieldCheck, 
  BookOpen, 
  Bot, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Layers, 
  LifeBuoy, 
  Sun, 
  Moon, 
  Scale,
  ChevronRight
} from 'lucide-react';
import { soundEngine } from './lib/soundEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'3d-lab' | 'guided-modules' | 'safety-station' | 'ai-professor' | 'notebook'>('3d-lab');
  const [isMuted, setIsMuted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isConvictionSidebarOpen, setIsConvictionSidebarOpen] = useState(false);

  const isDark = theme === 'dark';

  // Core Lab Workbench State
  const [vessel, setVessel] = useState<VesselState>({
    id: 'vessel_1',
    type: 'beaker',
    capacityMl: 250,
    contents: [{ reagentId: 'h2o', volumeMl: 50 }],
    temperatureC: 25.0,
    isHeating: false,
    isStirring: false,
    bubblesRate: 0,
  });

  const [safetyGear, setSafetyGear] = useState<SafetyGearState>({
    gogglesOn: true,
    glovesOn: true,
    labCoatOn: true,
    fumeHoodActive: false,
    tongsHeld: false,
    eyeWashTested: true,
  });

  const [activeModuleId, setActiveModuleId] = useState<string>(EXPERIMENT_MODULES[0].id);
  const [logs, setLogs] = useState<LabLogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Virtual Lab Initialization',
      details: '3D WebGL Workbench, Borosilicate Glassware & Safety Station mounted.',
      type: 'info',
    },
  ]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>(['Safety Ace Champion']);
  const [activeReactionLog, setActiveReactionLog] = useState<string | undefined>();
  const [lastAddedReagent, setLastAddedReagent] = useState<{ id: string; volumeMl: number; timestamp: number } | null>(null);

  // Toggle Theme
  const toggleTheme = () => {
    soundEngine.playScaleBeep();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Continuous Chemical Simulation Loop (Tick every 1 sec)
  useEffect(() => {
    const interval = setInterval(() => {
      setVessel((prevVessel) => {
        const { updatedVessel, reactionOccurred, logMessage } = processVesselReaction(prevVessel);

        if (reactionOccurred && logMessage && logMessage !== activeReactionLog) {
          setActiveReactionLog(logMessage);

          // Add to logbook
          setLogs((prev) => [
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: 'Reaction Engine Triggered',
              details: logMessage,
              type: 'reaction',
            },
            ...prev,
          ]);

          if (updatedVessel.bubblesRate && updatedVessel.bubblesRate > 3) {
            soundEngine.playBoilingBubbles();
          }
        }

        return updatedVessel;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReactionLog]);

  // Check module completion step validations
  useEffect(() => {
    const currentModule = EXPERIMENT_MODULES.find((m) => m.id === activeModuleId);
    if (currentModule) {
      const allPassed = currentModule.steps.every((step) =>
        step.validationCheck(vessel, safetyGear, logs.map((l) => l.details))
      );

      if (allPassed && !earnedBadges.includes(currentModule.badgeName)) {
        setEarnedBadges((prev) => [...prev, currentModule.badgeName]);
        soundEngine.playSuccessChime();
      }
    }
  }, [vessel, safetyGear, activeModuleId, logs, earnedBadges]);

  // Add Reagent Handler
  const handleAddReagent = (reagentId: string, volumeMl: number) => {
    const reg = getReagentById(reagentId);
    if (!reg) return;

    setLastAddedReagent({ id: reagentId, volumeMl, timestamp: Date.now() });

    setVessel((prev) => {
      const existing = [...prev.contents];
      const foundIdx = existing.findIndex((c) => c.reagentId === reagentId);

      if (foundIdx >= 0) {
        existing[foundIdx] = {
          ...existing[foundIdx],
          volumeMl: existing[foundIdx].volumeMl + volumeMl,
        };
      } else {
        existing.push({ reagentId, volumeMl });
      }

      return {
        ...prev,
        contents: existing,
      };
    });

    setLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: 'Reagent Added',
        details: `Poured ${volumeMl} mL of ${reg.name} (${reg.formula}) into ${vessel.type}.`,
        type: 'info',
      },
      ...prev,
    ]);
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 selection:bg-cyan-500 selection:text-slate-950 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* App Top Navigation Bar */}
      <header className={`backdrop-blur-lg border-b sticky top-0 z-40 px-3 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        {/* Brand Wordmark with Animated Beaker Bubbles & Radial Gradient Infill */}
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 text-slate-950 rounded-xl font-bold shadow-lg shadow-cyan-950/40 overflow-hidden flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6 z-10 relative text-slate-950" />
            
            {/* Animated rising bubbles inside beaker badge */}
            <span className="absolute w-2 h-2 rounded-full bg-white/70 animate-beaker-bubble-1 bottom-1 left-2 pointer-events-none" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200/80 animate-beaker-bubble-2 bottom-1.5 right-2.5 pointer-events-none" />
            <span className="absolute w-1 h-1 rounded-full bg-white/90 animate-beaker-bubble-1 bottom-2 left-4 pointer-events-none" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent animate-radial-wordmark">
              3D Virtual Chemistry Set
            </h1>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Safety-First Interactive WebGL Chemistry & Stoichiometry Lab
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => {
              soundEngine.playScaleBeep();
              setActiveTab('3d-lab');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeTab === '3d-lab'
                ? isDark
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                  : 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                : isDark
                ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span className="hidden md:inline">3D Workbench</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playScaleBeep();
              setActiveTab('guided-modules');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeTab === 'guided-modules'
                ? isDark
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                  : 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                : isDark
                ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="hidden md:inline">Guided Modules</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playScaleBeep();
              setActiveTab('safety-station');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeTab === 'safety-station'
                ? isDark
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                  : 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                : isDark
                ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden md:inline">Safety Gear</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playScaleBeep();
              setActiveTab('ai-professor');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeTab === 'ai-professor'
                ? isDark
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                  : 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                : isDark
                ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">AI Professor</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playScaleBeep();
              setActiveTab('notebook');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeTab === 'notebook'
                ? isDark
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                  : 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                : isDark
                ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Notebook</span>
          </button>

          {/* Legal Alerts Feed Toggle */}
          <button
            onClick={() => setIsConvictionSidebarOpen(!isConvictionSidebarOpen)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isConvictionSidebarOpen
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : isDark
                ? 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700/60'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="Toggle U.S. District Court Conviction Alerts Feed"
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline">Legal Alerts</span>
          </button>

          {/* Support & NDRCC Resources Modal Button */}
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all active:scale-95"
            title="Open Support & Helplines (NDRCC 1-800-662-4357)"
          >
            <LifeBuoy className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline font-mono">1-800-662-4357</span>
          </button>

          {/* Light / Dark Theme Animated Toggle (Immediately to the left of sound button) */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all relative overflow-hidden ${
              isDark 
                ? 'bg-slate-800/80 text-amber-400 hover:text-amber-300 border-slate-700/60' 
                : 'bg-slate-100 text-blue-600 hover:text-blue-700 border-slate-200 shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-800/80 text-slate-300 hover:text-slate-100 border-slate-700/60'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-sm'
            }`}
            title="Toggle Sound Effects"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </nav>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {activeTab === '3d-lab' && (
          <div className="flex flex-col lg:flex-row gap-4 h-full">
            {/* Main 3D Lab Area + Reaction HUD */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 3D WebGL Canvas & Telemetry HUD */}
              <div className="lg:col-span-2 flex flex-col gap-3 min-h-[440px]">
                <ReactionHud 
                  vessel={vessel} 
                  safetyGear={safetyGear} 
                  activeLog={activeReactionLog} 
                  isDark={isDark} 
                />
                <div className="flex-1 min-h-[380px]">
                  <ThreeCanvas 
                    vessel={vessel} 
                    safetyGear={safetyGear} 
                    lastAddedReagent={lastAddedReagent} 
                  />
                </div>
              </div>

              {/* Equipment Drawer Panel */}
              <div className="flex flex-col gap-3">
                <EquipmentDrawer
                  vessel={vessel}
                  onUpdateVessel={setVessel}
                  onAddReagent={handleAddReagent}
                />
                <ExperimentGuide
                  activeModuleId={activeModuleId}
                  vessel={vessel}
                  safetyGear={safetyGear}
                  labHistory={logs.map((l) => l.details)}
                  onSelectModule={setActiveModuleId}
                  isDark={isDark}
                />
              </div>
            </div>

            {/* Optional Collapsible Legal Alerts Sidebar */}
            {isConvictionSidebarOpen && (
              <div className="w-full lg:w-96 shrink-0 animate-fade-in">
                <ConvictionNewsSidebar
                  isOpen={isConvictionSidebarOpen}
                  onToggle={() => setIsConvictionSidebarOpen(false)}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'guided-modules' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <ExperimentGuide
                activeModuleId={activeModuleId}
                vessel={vessel}
                safetyGear={safetyGear}
                labHistory={logs.map((l) => l.details)}
                onSelectModule={setActiveModuleId}
                isDark={isDark}
              />
            </div>
            {isConvictionSidebarOpen && (
              <div className="w-full lg:w-96 shrink-0">
                <ConvictionNewsSidebar
                  isOpen={isConvictionSidebarOpen}
                  onToggle={() => setIsConvictionSidebarOpen(false)}
                  isDark={isDark}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'safety-station' && (
          <SafetyStation safetyGear={safetyGear} onUpdateSafety={setSafetyGear} />
        )}

        {activeTab === 'ai-professor' && <AiChemistryAssistant vessel={vessel} />}

        {activeTab === 'notebook' && <LabNotebook logs={logs} earnedBadges={earnedBadges} />}
      </main>

      {/* Floating Always-Accessible Support & Resources Quick Button */}
      <button
        onClick={() => setIsSupportModalOpen(true)}
        className="fixed bottom-4 left-4 z-40 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-2xl shadow-blue-950 border border-blue-400/40 hover:scale-105 transition-all cursor-pointer group"
      >
        <LifeBuoy className="w-4 h-4 animate-pulse group-hover:rotate-45 transition-transform" />
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-blue-200 uppercase font-mono leading-none">Support Hotline</span>
          <span className="font-mono text-xs leading-tight">1-800-662-4357</span>
        </div>
      </button>

      {/* Support & Recovery Resources Modal */}
      <SupportResourcesModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        isDark={isDark}
      />

      {/* Footer */}
      <footer className={`border-t py-3 text-center text-xs font-mono transition-colors ${
        isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>3D Educational Virtual Chemistry Set • Safety-First Interactive Stoichiometry</span>
          <span>•</span>
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="text-cyan-500 hover:underline cursor-pointer"
          >
            NDRCC Helpline: 1-800-662-4357
          </button>
        </div>
      </footer>
    </div>
  );
}
