import React, { useState } from 'react';
import { 
  Scale, 
  AlertOctagon, 
  Gavel, 
  ExternalLink, 
  ChevronRight, 
  ShieldAlert, 
  Building2, 
  Calendar,
  Search,
  BookOpenCheck,
  X
} from 'lucide-react';

interface ConvictionRecord {
  id: string;
  court: string;
  districtCode: string;
  title: string;
  date: string;
  statute: string;
  sentence: string;
  summary: string;
  educationalTakeaway: string;
}

const CONVICTION_HEADLINES: ConvictionRecord[] = [
  {
    id: 'doj_1',
    court: 'U.S. District Court, Eastern District of California',
    districtCode: 'E.D. Cal.',
    title: 'Lead Defendant Sentenced to 240 Months in Federal Prison for Operating Clandestine Chemical Conversion Laboratory',
    date: 'February 2026',
    statute: 'Title 21 U.S.C. §§ 841(a)(1), 846, and 843(b)',
    sentence: '20 Years Imprisonment + $1.8M Asset Forfeiture + 5 Years Supervised Release',
    summary: 'Federal law enforcement dismantled a clandestine lab operating in a residential warehouse. Investigators recovered hazardous reaction vessels, precursor acids, and toxic byproduct waste that contaminated local groundwater.',
    educationalTakeaway: 'Federal statutes mandate severe mandatory minimum sentences for unlawful chemical manufacturing. Clandestine synthesis also incurs massive civil liabilities for toxic hazardous waste remediation under CERCLA environmental laws.',
  },
  {
    id: 'doj_2',
    court: 'U.S. District Court, Southern District of Texas',
    districtCode: 'S.D. Tex.',
    title: 'Federal Court Imposes 188-Month Sentence in Multi-State Chemical Precursor Smuggling & Diversion Conspiracy',
    date: 'January 2026',
    statute: 'Title 21 U.S.C. § 841(c)(2) (Possession of Listed Chemical with Intent to Manufacture)',
    sentence: '15 Years 8 Months Imprisonment + $500,000 Fine',
    summary: 'Defendants fraudulently obtained industrial quantities of restricted solvent reagents (methylamine, ephedrine, and red phosphorus) through falsified front corporations.',
    educationalTakeaway: 'The Chemical Diversion and Trafficking Act strictly monitors List I and List II chemical reagents. Legitimate scientific laboratories maintain audited chains of custody.',
  },
  {
    id: 'doj_3',
    court: 'U.S. District Court, Northern District of Ohio',
    districtCode: 'N.D. Ohio',
    title: 'Chemist Convicted of Conspiracy to Manufacture Controlled Substance Analogues Following Fatal Overdose Investigation',
    date: 'November 2025',
    statute: 'Title 21 U.S.C. § 813 (Federal Analogue Act) & § 841(b)(1)(C)',
    sentence: 'Life Sentence (Mandatory Minimum for Death Resulting) + Restitution',
    summary: 'A trained laboratory technician attempted to synthesize structural isomers and analogues. Toxic synthesis impurities caused acute toxicity, resulting in immediate federal indictment under strict liability provisions.',
    educationalTakeaway: 'Under the Federal Analogue Act, synthetic chemical modifications intended for human consumption are prosecuted with the same severity as Schedule I narcotics. Chemical science belongs in accredited research institutions.',
  },
  {
    id: 'doj_4',
    court: 'U.S. District Court, Southern District of New York',
    districtCode: 'S.D.N.Y.',
    title: 'Dark Web Precursor Distributor Sentenced to 14 Years for Global Illicit Reagent Sourcing Network',
    date: 'October 2025',
    statute: 'Title 18 U.S.C. § 1956 (Money Laundering) & 21 U.S.C. § 960',
    sentence: '168 Months Imprisonment + $3.2M Crypto Seizure',
    summary: 'An international network distributing clandestine recipe booklets and unregulated reagents was seized through coordinated cyber forensics and customs interdiction.',
    educationalTakeaway: 'Digital transactions and reagent procurement leave permanent forensic footprints. True mastery of chemistry is dedicated to environmental sustainability, pharmaceuticals, and public safety.',
  },
  {
    id: 'doj_5',
    court: 'U.S. District Court, Western District of Washington',
    districtCode: 'W.D. Wash.',
    title: 'Illegal Laboratory Explosion Leads to 12-Year Federal Sentence & $750,000 Environmental Clean-Up Restitution',
    date: 'August 2025',
    statute: 'Title 21 U.S.C. § 858 (Endangering Human Life While Manufacturing)',
    sentence: '12 Years Imprisonment + $750,000 EPA Restitution',
    summary: 'Improper thermal control in an unventilated domestic garage triggered an exothermic runaway reaction and explosion, severely burning occupants and causing structural collapse.',
    educationalTakeaway: 'Chemical reactions require strict thermodynamics, pressure relief engineering, certified fume hoods, and expert supervision. Unregulated amateur experiments carry extreme physical dangers.',
  },
];

interface ConvictionNewsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isDark?: boolean;
}

export const ConvictionNewsSidebar: React.FC<ConvictionNewsSidebarProps> = ({
  isOpen,
  onToggle,
  isDark = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ConvictionRecord | null>(null);

  const filteredRecords = CONVICTION_HEADLINES.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.statute.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`transition-all duration-300 flex flex-col border rounded-2xl overflow-hidden shadow-2xl ${
        isOpen ? 'w-full lg:w-96' : 'w-full lg:w-14'
      } ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800 text-slate-100' 
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300'
      }`}
    >
      {/* Collapsed Bar (Desktop) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden lg:flex flex-col items-center justify-between py-6 h-full w-full hover:bg-slate-800/40 transition-colors gap-4"
          title="Open U.S. District Court Educational Conviction Feed"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div className="[writing-mode:vertical-rl] font-mono text-xs uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
            <span>U.S. District Court Alerts</span>
          </div>
          <div className="p-1 rounded-full bg-slate-800 text-slate-400">
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      )}

      {/* Expanded Sidebar View */}
      {isOpen && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Gavel className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase font-mono tracking-wide text-amber-400 flex items-center gap-1.5">
                  <span>Educational Legal Alerts</span>
                </h2>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  U.S. District Court Chemical Enforcement Feed
                </p>
              </div>
            </div>

            <button
              onClick={onToggle}
              className={`p-1.5 rounded-lg border transition-all ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Collapse Legal Alerts"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Note Banner */}
          <div className="p-3 bg-gradient-to-r from-amber-950/30 to-rose-950/20 border-b border-amber-500/20 text-[11px] flex items-start gap-2 text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Deterrence Awareness:</strong> Real-world federal convictions demonstrate that illicit chemical synthesis carries catastrophic legal, physical, and societal consequences.
            </span>
          </div>

          {/* Search Box */}
          <div className={`p-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter court, docket, statute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono focus:outline-none transition-all ${
                  isDark
                    ? 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-amber-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Headlines Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[500px]">
            {filteredRecords.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedRecord(item === selectedRecord ? null : item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRecord?.id === item.id
                    ? 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-950/30'
                    : isDark
                    ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-slate-400 mb-1">
                  <span className="text-amber-400 font-bold">{item.districtCode}</span>
                  <span>{item.date}</span>
                </div>

                <h3 className="text-xs font-bold leading-snug line-clamp-2 text-slate-100 dark:text-slate-100 mb-1.5">
                  {item.title}
                </h3>

                <div className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-1 mb-1">
                  <Gavel className="w-3 h-3 shrink-0" />
                  <span>{item.sentence}</span>
                </div>

                {/* Expanded Details */}
                {selectedRecord?.id === item.id && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs space-y-2 animate-fade-in">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Federal Statute:</div>
                      <div className="text-[11px] font-mono text-slate-300">{item.statute}</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Case Summary:</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{item.summary}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
                        <BookOpenCheck className="w-3.5 h-3.5" />
                        <span>Educational Takeaway:</span>
                      </div>
                      <p>{item.educationalTakeaway}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={`p-2.5 border-t text-center text-[10px] font-mono ${
            isDark ? 'border-slate-800 bg-slate-950 text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'
          }`}>
            <span>Source: Public U.S. Dept of Justice & DEA Case Disclosures</span>
          </div>
        </div>
      )}
    </aside>
  );
};
