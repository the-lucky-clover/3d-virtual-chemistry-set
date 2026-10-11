import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Phone, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Sparkles, 
  Check, 
  Copy,
  LifeBuoy,
  MessageSquare
} from 'lucide-react';

interface SupportResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const SupportResourcesModal: React.FC<SupportResourcesModalProps> = ({
  isOpen,
  onClose,
  isDark = true,
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'hotlines' | 'literature' | 'community'>('all');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(label);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  const resources = [
    {
      id: 'ndrcc',
      title: 'SAMHSA National Helpline & NDRCC',
      category: 'hotlines',
      number: '1-800-662-4357',
      altNumber: '1-800-662-HELP (4357)',
      tty: 'TTY: 1-800-487-4889',
      availability: '24/7/365 • Free & Confidential',
      description: 'The Substance Abuse and Mental Health Services Administration (SAMHSA) National Drug & Alcohol Referral Routing Service provides compassionate, confidential treatment referral and information in English and Spanish.',
      url: 'https://www.samhsa.gov/find-help/national-helpline',
      badge: 'Primary 24/7 Helpline',
      color: 'blue',
    },
    {
      id: '988',
      title: '988 Suicide & Crisis Lifeline',
      category: 'hotlines',
      number: '988',
      altNumber: 'Call or Text 988',
      availability: '24/7 • Call, Text, or Chat',
      description: 'Immediate, confidential support for people experiencing emotional distress, substance use crisis, or mental health emergencies.',
      url: 'https://988lifeline.org',
      badge: 'Crisis Support',
      color: 'rose',
    },
    {
      id: 'textline',
      title: 'Crisis Text Line',
      category: 'hotlines',
      number: 'Text HOME to 741741',
      altNumber: 'Text 741741',
      availability: '24/7 • Free SMS Service',
      description: 'Connect with a trained Crisis Volunteer 24/7 via text message for immediate de-escalation and recovery support.',
      url: 'https://www.crisistextline.org',
      badge: 'Text Hotline',
      color: 'cyan',
    },
    {
      id: 'nida',
      title: 'NIDA - Science-Based Addiction Literature',
      category: 'literature',
      description: 'National Institute on Drug Abuse peer-reviewed research, educational pamphlets on brain recovery, neurochemistry of addiction, and evidence-based treatments.',
      url: 'https://nida.nih.gov/publications',
      badge: 'Educational Research',
      color: 'emerald',
    },
    {
      id: 'findtreatment',
      title: 'FindTreatment.gov - Accredited Care Directory',
      category: 'literature',
      description: 'Official US government search tool for state-licensed substance use disorder and mental health treatment facilities across all 50 states.',
      url: 'https://findtreatment.gov',
      badge: 'Facility Locator',
      color: 'amber',
    },
    {
      id: 'smart',
      title: 'SMART Recovery Science-Based Meetings',
      category: 'community',
      description: 'Global science-informed community offering mutual support groups for recovery using cognitive-behavioral tools and self-empowerment.',
      url: 'https://www.smartrecovery.org',
      badge: 'Peer Support',
      color: 'purple',
    },
    {
      id: 'partnership',
      title: 'Partnership to End Addiction (Family Support)',
      category: 'community',
      description: 'Personalized guidance, parent coaching, and peer support for families navigating a loved one’s substance use disorder.',
      url: 'https://drugfree.org',
      badge: 'Family Network',
      color: 'indigo',
    },
  ];

  const filtered = activeCategory === 'all' 
    ? resources 
    : resources.filter((r) => r.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-950/40">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <span>Support, Helplines & Recovery Resources</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Free, confidential 24/7 assistance and evidence-based health guidance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Callout Banner: 1-800-662-4357 */}
        <div className="p-4 sm:p-5 border-b bg-gradient-to-r from-blue-900/40 via-cyan-950/50 to-slate-900/40 border-cyan-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4" />
                <span>NDRCC / SAMHSA National Helpline</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>1-800-662-HELP (4357)</span>
              </div>
              <div className="text-xs text-slate-300">
                24/7/365 confidential treatment referral & information in English and Spanish.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:18006624357"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all shrink-0"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>

              <button
                onClick={() => copyToClipboard('1-800-662-4357', 'samhsa')}
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="Copy phone number"
              >
                {copiedNumber === 'samhsa' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-mono font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline font-mono">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={`px-4 pt-3 pb-1 border-b flex items-center gap-1.5 overflow-x-auto ${
          isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'
        }`}>
          {[
            { id: 'all', label: 'All Resources', icon: BookOpen },
            { id: 'hotlines', label: 'Crisis Hotlines', icon: Phone },
            { id: 'literature', label: 'Recovery Literature', icon: ShieldCheck },
            { id: 'community', label: 'Community Support', icon: Users },
          ].map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border ${
                  active
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                    : isDark
                    ? 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
                    : 'text-slate-600 border-transparent hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Resource List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-100 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {item.badge}
                  </span>
                </div>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Open external resource"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {item.number && (
                <div className="flex flex-wrap items-center gap-2 my-2">
                  <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 font-mono font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{item.number}</span>
                  </div>
                  {item.availability && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.availability}
                    </span>
                  )}
                  {item.tty && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({item.tty})
                    </span>
                  )}
                </div>
              )}

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className={`p-3 sm:p-4 border-t text-center text-[11px] ${
          isDark ? 'border-slate-800 bg-slate-950 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}>
          <span>This laboratory application is dedicated exclusively to legitimate scientific education. </span>
          <span className="font-semibold text-cyan-400">Help is always available. You are not alone.</span>
        </div>
      </div>
    </div>
  );
};
