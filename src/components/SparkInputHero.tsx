import React, { useState } from 'react';
import { Sparkles, Flame, Wand2, Lightbulb, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

interface SparkInputHeroProps {
  onGenerate: (topic: string, style: string, format: string, tone: string) => void;
  isLoading: boolean;
  currentTopic: string;
}

const PRESET_TOPICS = [
  { label: 'Surviving 100 Hours in a Bunker', style: 'viral', icon: '🏕️' },
  { label: '$1 vs $50,000 Gaming Setup', style: 'contrast', icon: '🎮' },
  { label: 'How I Built a $10K/mo AI App in College', style: 'authority', icon: '💻' },
  { label: 'Why Everyone Is Quitting Social Media in 2026', style: 'curiosity', icon: '📱' },
  { label: 'I Trained Like an Olympic Athlete for 30 Days', style: 'challenge', icon: '⚡' },
  { label: 'Cooking Gordon Ramsay\'s Hardest Steak', style: 'challenge', icon: '🥩' },
];

const STYLE_OPTIONS = [
  { id: 'viral', name: '🔥 MrBeast Viral Hype', desc: 'Extreme stakes & huge energy' },
  { id: 'curiosity', name: '🕵️ Curiosity Gap', desc: 'Deep mystery & secrets revealed' },
  { id: 'challenge', name: '⏱️ 30-Day Challenge', desc: 'Personal transformation & trials' },
  { id: 'authority', name: '🎓 Masterclass Guide', desc: 'High search volume & authority' },
  { id: 'warning', name: '⚠️ Warning & Mistakes', desc: 'Loss aversion & FOMO' },
  { id: 'chaos', name: '⚡ Gen Z Chaos & Humor', desc: 'Witty, unhinged & relatable' },
];

const FORMAT_OPTIONS = [
  { id: 'video', name: 'Long-Form Video', badge: '10-20 Min' },
  { id: 'shorts', name: 'YouTube Shorts', badge: '< 60 Sec' },
  { id: 'documentary', name: 'Video Essay / Doc', badge: 'Deep Dive' },
];

export const SparkInputHero: React.FC<SparkInputHeroProps> = ({
  onGenerate,
  isLoading,
  currentTopic,
}) => {
  const [topic, setTopic] = useState(currentTopic || '');
  const [selectedStyle, setSelectedStyle] = useState('viral');
  const [selectedFormat, setSelectedFormat] = useState('video');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    onGenerate(topic.trim(), selectedStyle, selectedFormat, 'energetic');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16">
      {/* Background radial glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-red-600/20 via-pink-600/15 to-amber-500/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -top-10 right-10 w-72 h-72 bg-rose-500/10 blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Playful Tagline Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 via-amber-500/10 to-rose-500/10 border border-red-500/30 backdrop-blur-md shadow-inner">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-xs font-bold text-slate-200">
              The #1 Creative Playground for YouTubers
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
          </div>
        </div>

        {/* Hero Headlines */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Turn Any Topic Into a{' '}
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent underline decoration-amber-400/40 decoration-wavy decoration-2">
              Viral YouTube Hit
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            <span className="text-white font-bold">"Your Ideas. Our AI. Viral Possibilities."</span>{' '}
            Instantly unlock 10 click-magnet titles, 3 high-contrast thumbnail ideas, retention hooks, and full descriptions.
          </p>
        </div>

        {/* Interactive Topic Generator Card */}
        <div className="rounded-3xl bg-slate-900/90 border-2 border-slate-800/90 shadow-2xl shadow-rose-950/40 backdrop-blur-xl p-5 sm:p-7 transition-all duration-300 hover:border-slate-700/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Topic Input Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="topic-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  What is your video about?
                </label>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">⌘+Enter</kbd> to generate
                </span>
              </div>

              <div className="relative group">
                <input
                  id="topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. I quit caffeine for 30 days, Building a tiny house, iPhone 17 leak..."
                  className="w-full px-5 py-4 sm:py-4.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-white placeholder-slate-500 font-medium text-base sm:text-lg focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all shadow-inner"
                  autoFocus
                />
                {topic && (
                  <button
                    type="button"
                    onClick={() => setTopic('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded-md text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Presets Inspiration Chips */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
                <Wand2 className="w-3 h-3 text-red-400" />
                <span>Need inspiration? Try these creator sparks:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_TOPICS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(preset.label);
                      setSelectedStyle(preset.style);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition-all group"
                  >
                    <span>{preset.icon}</span>
                    <span className="group-hover:text-amber-300 transition-colors">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Style & Angle Selection */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Viral Angle / Style:
                </span>
                <span className="text-[11px] text-slate-400">
                  Tailors title psychology & hooks
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedStyle(opt.id)}
                    className={`p-2.5 text-left rounded-xl border transition-all ${
                      selectedStyle === opt.id
                        ? 'bg-gradient-to-r from-red-950/70 to-rose-950/70 border-red-500/80 text-white shadow-md shadow-red-950/50'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold truncate text-slate-100">{opt.name}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Target Format:
                </span>
                <div className="flex items-center gap-1.5">
                  {FORMAT_OPTIONS.map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        selectedFormat === fmt.id
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {fmt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Generate Button */}
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className={`w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-display font-extrabold text-base transition-all duration-300 shadow-xl ${
                  isLoading || !topic.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:via-rose-400 hover:to-amber-400 text-white shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sparking Viral Magic...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                    <span>Spark Viral Magic</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feature Highlights Pills under the card */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            10 Catchy Titles with CTR Scores
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            3 High-Contrast Thumbnail Text Ideas
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Retention Hooks & Full Descriptions
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            30-Year Creator Evolution (1996–2056)
          </span>
        </div>
      </div>
    </div>
  );
};
