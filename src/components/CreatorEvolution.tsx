import React, { useState } from 'react';
import { TimeMachineData } from '../types';
import { History, Sparkles, Tv, Smartphone, Cpu, Video, Clock, DollarSign, Globe, Award, ArrowRight, Zap, Play } from 'lucide-react';

interface CreatorEvolutionProps {
  timeMachineData?: TimeMachineData;
  topic?: string;
}

export const CreatorEvolution: React.FC<CreatorEvolutionProps> = ({
  timeMachineData,
  topic = 'Viral Video Creation',
}) => {
  const [selectedEra, setSelectedEra] = useState<'1996' | '2026' | '2056'>('2026');
  const [viewMode, setViewMode] = useState<'slider' | 'matrix'>('slider');

  // Fallback era data if not loaded from generator yet
  const era1996 = timeMachineData?.year1996 || {
    era: '30 Years Ago (1996)',
    title: 'Analog Broadcast & VHS Era',
    tagline: 'Analog camcorders, physical cassettes & broadcast gatekeepers',
    howItWasMade: 'Shot on bulky VHS-C or Hi8 shoulder camcorders. Editing required two physical VCR decks connected by RCA cables. Every cut and transition had to be performed in real time with tape degeneration.',
    distribution: 'Mailing physical cassettes to public-access cable stations, community bulletin boards, or local TV producers. Getting your work seen by 500 local households was considered a major triumph.',
    audienceReach: 'Local & Regional (Tens to hundreds of viewers)',
    monetization: 'Local bakery or car dealership commercials, or selling VHS mail-order tapes for $19.95 via toll-free 1-800 numbers.',
    aiRole: 'Pure science fiction. Every title had to be literally hand-drawn or generated letter-by-letter on mechanical 8-bit character titlers.',
  };

  const era2026 = timeMachineData?.year2026 || {
    era: 'Today (2026)',
    title: 'The AI-Powered Creator Playground',
    tagline: 'YouTube, smartphones, CreatorSpark AI & instant global algorithms',
    howItWasMade: 'Shot in crisp 4K HDR on a pocket smartphone. Automated AI jump-cut detection, instant ideation with CreatorSpark AI, multi-cam cloud sync, and algorithmic audio cleanup in seconds.',
    distribution: 'Instant one-tap publishing to YouTube, Shorts, and global feeds. Algorithmic recommendations deliver your video to millions worldwide within hours.',
    audienceReach: 'Global (Millions of viewers in hours without any studio gatekeeper)',
    monetization: 'YouTube Partner Program ad-share, brand sponsorships, digital subscriptions, super chats, and integrated ecommerce.',
    aiRole: 'CreatorSpark AI acts as your personal viral director: generating 10 catchy titles, thumbnail psychology, retention hooks, and descriptions in 2 seconds.',
  };

  const era2056 = timeMachineData?.year2056 || {
    era: '30 Years Ahead (2056)',
    title: 'Neural Thought-to-Video & Living Narratives',
    tagline: 'Brain-computer interfaces, spatial holograms & infinite personalized branches',
    howItWasMade: 'Direct neural imagination. You imagine the emotions, camera perspectives, and storytelling beats; quantum AI synthesizes cinematic 16K spatial video in real time.',
    distribution: 'Multi-sensory immersive holographic streams. Audiences step inside your video, with branching storylines tailored dynamically to each viewer\'s curiosities.',
    audienceReach: 'Universal & Interplanetary (Frictionless instant translation across languages and dimensions)',
    monetization: 'Real-time neural micro-transactions and shared collaborative story universe tokens.',
    aiRole: 'Symbiotic creative partner that instantly manifests complex visual dreams at the speed of thought, eliminating all technical friction.',
  };

  const eras = {
    '1996': {
      data: era1996,
      badge: '1996 • 30 Years Ago',
      icon: Tv,
      color: 'amber',
      accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      activeTabClass: 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25',
      glow: 'from-amber-600/20 via-orange-900/10 to-transparent',
      vibe: 'Retro Analog Scanlines',
      containerClass: 'crt-lines border-amber-500/40 bg-slate-950/95',
      gearCost: '$12,000+ (Camcorder, Dual VCR decks, Color monitors)',
      editingTime: '40–60 hours per 10-minute tape',
      gatekeeper: 'TV Executives, Broadcast Regulators, Mail Delivery',
    },
    '2026': {
      data: era2026,
      badge: '2026 • Today (Modern Era)',
      icon: Smartphone,
      color: 'rose',
      accentBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      activeTabClass: 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-lg shadow-rose-600/30',
      glow: 'from-rose-600/20 via-red-600/10 to-transparent',
      vibe: 'High-Speed AI Creator Economy',
      containerClass: 'border-rose-500/50 bg-slate-900/90 shadow-2xl shadow-rose-950/30',
      gearCost: '$800 (Smartphone + Free CreatorSpark AI)',
      editingTime: '1–3 hours with AI assist & automated cuts',
      gatekeeper: 'None! Open YouTube algorithm based on viewer value',
    },
    '2056': {
      data: era2056,
      badge: '2056 • 30 Years Ahead',
      icon: Cpu,
      color: 'cyan',
      accentBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      activeTabClass: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30',
      glow: 'from-cyan-600/20 via-indigo-600/10 to-transparent',
      vibe: 'Neural Thought-to-Hologram',
      containerClass: 'cyber-grid border-cyan-500/40 bg-slate-950/90 shadow-2xl shadow-cyan-950/30',
      gearCost: 'Universal Brain-Interface Node (Accessible to all)',
      editingTime: 'Real-time (Generated at the speed of thought)',
      gatekeeper: 'Zero barrier. Every human imagination is a studio',
    },
  };

  const currentEraConfig = eras[selectedEra];
  const currentData = currentEraConfig.data;
  const EraIcon = currentEraConfig.icon;

  return (
    <section id="evolution-section" className="py-12 border-t border-slate-800">
      {/* Section Headline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 mb-2">
            <History className="w-3.5 h-3.5" />
            Interactive 30-Year Timeline
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white">
            Creator Evolution:{' '}
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 bg-clip-text text-transparent">
              Then vs Now vs Future
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
            See how content creation evolved over 30 years—from 1996 cassette tapes to 2026 AI assistants to 2056 neural holograms.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'slider'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Era Experience
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'matrix'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side Matrix
          </button>
        </div>
      </div>

      {/* Era Navigation Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
        {(['1996', '2026', '2056'] as const).map((eraKey) => {
          const item = eras[eraKey];
          const isSelected = selectedEra === eraKey;
          const Icon = item.icon;

          return (
            <button
              key={eraKey}
              onClick={() => setSelectedEra(eraKey)}
              className={`p-3.5 sm:p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? `${item.activeTabClass} border-transparent ring-2 ring-white/20`
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2">
                <span className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${isSelected ? 'text-inherit opacity-90' : 'text-slate-400'}`}>
                  {eraKey === '1996' ? '30 Years Ago' : eraKey === '2026' ? 'Today' : '30 Years Ahead'}
                </span>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isSelected ? 'text-inherit' : 'text-slate-500'}`} />
              </div>
              <div className={`font-display font-black text-lg sm:text-2xl ${isSelected ? 'text-inherit' : 'text-white'}`}>
                {eraKey}
              </div>
              <div className={`text-[11px] sm:text-xs truncate mt-0.5 ${isSelected ? 'text-inherit opacity-90 font-medium' : 'text-slate-400'}`}>
                {item.vibe}
              </div>
            </button>
          );
        })}
      </div>

      {/* MODE 1: Interactive Era Explorer */}
      {viewMode === 'slider' && (
        <div className={`rounded-3xl border-2 p-6 sm:p-8 transition-all duration-500 relative overflow-hidden ${currentEraConfig.containerClass}`}>
          {/* Subtle Ambient Radial Lighting */}
          <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br ${currentEraConfig.glow} blur-[90px] pointer-events-none`} />

          <div className="relative z-10">
            {/* Era Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${currentEraConfig.accentBg}`}>
                  <EraIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                      {currentData.title}
                    </h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${currentEraConfig.accentBg}`}>
                      {currentData.era}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-300 mt-1">
                    {currentData.tagline}
                  </p>
                </div>
              </div>

              {/* Topic Simulation Badge */}
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400">Topic Reimagined: </span>
                <span className="text-white font-bold underline decoration-amber-400">"{topic}"</span>
              </div>
            </div>

            {/* Topic Scenario Narrative */}
            <div className="my-6 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                How you would create "{topic}" in {selectedEra}:
              </h4>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                {selectedEra === '1996' && (
                  <>
                    In 1996, creating a video on <strong>"{topic}"</strong> required buying $20 blank VHS tapes, carrying a 12-pound camcorder, and spending three grueling weeks in a windowless community studio manually copying tape-to-tape with dual VCR decks. To get anyone to watch, you had to personally pitch the tape to your local public-access TV station director or send cassette mailers. Reaching 300 viewers was a monumental triumph.
                  </>
                )}
                {selectedEra === '2026' && (
                  <>
                    Today in 2026, you pull out your phone, speak your idea into <strong>CreatorSpark AI</strong>, and instantly receive 10 high-CTR title variations, 3 thumbnail text concepts, and retention hooks in 2 seconds. You record in 4K, auto-cut silences with automated tools, and publish directly to YouTube. Within hours, the global recommendation algorithm puts your story on millions of screens worldwide.
                  </>
                )}
                {selectedEra === '2056' && (
                  <>
                    In 2056, you simply think through the creative narrative of <strong>"{topic}"</strong> using a neural creative interface. Quantum AI models render cinematic 16K multi-sensory holographic worlds in real time. Viewers don't just "watch" on flat screens—they step directly inside your world, while the video dynamically personalizes its storyline to each viewer's questions and subconscious interests.
                  </>
                )}
              </p>
            </div>

            {/* Detailed 4-Pillar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1: Production Method */}
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Video className="w-4 h-4 text-red-400" />
                  <span>Production & Editing Workflow:</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentData.howItWasMade}
                </p>
              </div>

              {/* Pillar 2: Distribution & Algorithm */}
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Distribution & Reach:</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentData.distribution}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-xs font-semibold text-emerald-400">
                  Estimated Reach: {currentData.audienceReach}
                </div>
              </div>

              {/* Pillar 3: Monetization */}
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Creator Monetization:</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentData.monetization}
                </p>
              </div>

              {/* Pillar 4: Role of AI */}
              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Role of AI & Automation:</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentData.aiRole}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] font-bold uppercase text-slate-400">Gear Cost to Create</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{currentEraConfig.gearCost}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] font-bold uppercase text-slate-400">Average Editing Time</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{currentEraConfig.editingTime}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] font-bold uppercase text-slate-400">Gatekeeper Level</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{currentEraConfig.gatekeeper}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Side-by-Side 30-Year Matrix */}
      {viewMode === 'matrix' && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 pr-4 w-1/4">Comparison Dimension</th>
                <th className="py-4 px-4 w-1/4 text-amber-400">📼 1996 (30 Years Ago)</th>
                <th className="py-4 px-4 w-1/4 text-rose-400">⚡ 2026 (Today)</th>
                <th className="py-4 pl-4 w-1/4 text-cyan-400">🚀 2056 (30 Years Ahead)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
              <tr>
                <td className="py-4 pr-4 font-bold text-slate-300">Camera & Capture</td>
                <td className="py-4 px-4 text-slate-400">Bulky VHS-C/Hi8 shoulder camcorders, 240p analog resolution</td>
                <td className="py-4 px-4 text-slate-200 font-medium">Pocket 4K/8K smartphones with optical stabilization</td>
                <td className="py-4 pl-4 text-cyan-300">Neural imagination renderers, spatial volumetric lightfields</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-bold text-slate-300">Editing Workflow</td>
                <td className="py-4 px-4 text-slate-400">Tape-to-tape linear decks, physical RCA cables, no digital undo</td>
                <td className="py-4 px-4 text-slate-200 font-medium">Timeline NLEs, auto-cut silence, automated caption sync</td>
                <td className="py-4 pl-4 text-cyan-300">Thought-speed real-time generation, zero manual rendering</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-bold text-slate-300">Ideation & Titles</td>
                <td className="py-4 px-4 text-slate-400">Guesswork, physical notepads, 8-bit character titler machines</td>
                <td className="py-4 px-4 text-slate-200 font-medium">
                  <span className="text-amber-400 font-bold">CreatorSpark AI:</span> 10 viral titles & thumbnail hooks in 2s
                </td>
                <td className="py-4 pl-4 text-cyan-300">Symbiotic neural co-pilot testing infinite audience emotional branches</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-bold text-slate-300">Distribution Channel</td>
                <td className="py-4 px-4 text-slate-400">Mailing tapes to local cable stations or community libraries</td>
                <td className="py-4 px-4 text-slate-200 font-medium">YouTube, Shorts, TikTok algorithmic feed recommendations</td>
                <td className="py-4 pl-4 text-cyan-300">Personalized holographic spatial metaverse feeds</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-bold text-slate-300">Audience Scale</td>
                <td className="py-4 px-4 text-slate-400">Dozens to hundreds (strictly geographic)</td>
                <td className="py-4 px-4 text-slate-200 font-medium">Thousands to 100M+ viewers across 190 countries</td>
                <td className="py-4 pl-4 text-cyan-300">Universal accessibility across dimensions & languages</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 font-bold text-slate-300">Role of AI</td>
                <td className="py-4 px-4 text-slate-400">Non-existent (Pure science-fiction movie trope)</td>
                <td className="py-4 px-4 text-rose-300 font-bold">Creative co-pilot accelerating thumbnail, title & script creation</td>
                <td className="py-4 pl-4 text-cyan-300 font-bold">Autonomous hyper-personalized reality generation partner</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Inspirational Conclusion Banner */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-display font-bold text-base sm:text-lg text-white">
            The Moral of the 30-Year Evolution:
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Technology and AI don't replace human creativity—they eliminate the tedious technical friction so that <strong>anyone with an idea can become a creator</strong>.
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Supercharge your 2026 ideas</span>
        </div>
      </div>
    </section>
  );
};
