import React, { useState } from 'react';
import { ThumbnailIdea } from '../types';
import { Image, Copy, Check, Sparkles, Layers, Sliders, Play, AlertCircle, RefreshCw } from 'lucide-react';

interface ThumbnailStudioProps {
  thumbnails: ThumbnailIdea[];
  topic: string;
  selectedPreviewTitle?: string;
}

export const ThumbnailStudio: React.FC<ThumbnailStudioProps> = ({
  thumbnails,
  topic,
  selectedPreviewTitle,
}) => {
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [customText, setCustomText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [colorTheme, setColorTheme] = useState<'yellow' | 'red' | 'cyan' | 'purple'>('yellow');
  const [showSticker, setShowSticker] = useState(true);

  const activeThumb = thumbnails[activeThumbIndex] || {
    text: 'NEVER AGAIN',
    visualHook: 'Extreme close up shocked expression with bright contrasting lighting',
    badgeStyle: 'ELECTRIC_YELLOW',
    targetEmotion: 'Urgent Shock',
  };

  const displayText = customText || activeThumb.text;

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyPrompt = (idea: ThumbnailIdea, index: number) => {
    const promptText = `YouTube Thumbnail Concept: High contrast, 8K hyper-detailed YouTube thumbnail for a video titled "${selectedPreviewTitle || topic}". Overlay text: "${idea.text}". Visual composition: ${idea.visualHook}. Vibrant lighting, dramatic expression, viral YouTube style.`;
    navigator.clipboard.writeText(promptText);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  const themeClasses = {
    yellow: {
      text: 'text-amber-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]',
      border: 'border-amber-400',
      bgGlow: 'from-amber-500/20 via-orange-600/10 to-transparent',
      badge: 'bg-amber-400 text-slate-950',
    },
    red: {
      text: 'text-rose-400 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]',
      border: 'border-rose-500',
      bgGlow: 'from-rose-600/20 via-red-600/10 to-transparent',
      badge: 'bg-rose-500 text-white',
    },
    cyan: {
      text: 'text-cyan-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]',
      border: 'border-cyan-400',
      bgGlow: 'from-cyan-500/20 via-blue-600/10 to-transparent',
      badge: 'bg-cyan-400 text-slate-950',
    },
    purple: {
      text: 'text-fuchsia-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]',
      border: 'border-fuchsia-400',
      bgGlow: 'from-fuchsia-500/20 via-purple-600/10 to-transparent',
      badge: 'bg-fuchsia-500 text-white',
    },
  };

  const currentTheme = themeClasses[colorTheme];

  return (
    <section id="thumbnail-studio" className="py-10 border-t border-slate-800/80">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Click Psychology
          </span>
          <span className="text-xs text-slate-400 font-semibold">1-4 Words High Impact Rule</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Image className="w-6 h-6 text-amber-400" />
          3 Thumbnail Text Ideas & Live Mockup Studio
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Thumbnails make or break your video. These 3 short text ideas trigger immediate curiosity when paired with the right visual contrast.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3 Thumbnail Cards */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Select a Thumbnail Hook:</span>
            <span className="text-amber-400">Click to preview live ➔</span>
          </h3>

          {thumbnails.map((idea, index) => {
            const isSelected = activeThumbIndex === index;
            return (
              <div
                key={index}
                onClick={() => {
                  setActiveThumbIndex(index);
                  setCustomText('');
                  if (idea.badgeStyle === 'URGENT_RED') setColorTheme('red');
                  else if (idea.badgeStyle === 'NEON_CYAN') setColorTheme('cyan');
                  else if (idea.badgeStyle === 'VIOLET_MYSTERY') setColorTheme('purple');
                  else setColorTheme('yellow');
                }}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/20'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Active Indicator bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-red-500" />
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-300 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700">
                      {idea.targetEmotion}
                    </span>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyText(idea.text, index);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    title="Copy thumbnail text"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Big Bold Thumbnail Text Preview */}
                <div className="font-display font-black text-2xl tracking-tight text-white group-hover:text-amber-300 transition-colors uppercase">
                  "{idea.text}"
                </div>

                {/* Visual Hook Recommendation */}
                <p className="mt-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <strong className="text-amber-400">Visual Setup:</strong> {idea.visualHook}
                </p>

                {/* Copy AI Prompt Button */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400">
                    {idea.text.split(' ').length} words • High Curiosity
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPrompt(idea, index);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    {copiedPromptIndex === index ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Prompt Copied!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Copy Image Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive YouTube Feed & Thumbnail Mockup */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.bgGlow} pointer-events-none`} />

            <div className="relative z-10">
              {/* Studio Controls Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live YouTube Feed Simulator
                  </span>
                </div>

                {/* Theme Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 mr-1">Vibe:</span>
                  {(['yellow', 'red', 'cyan', 'purple'] as const).map((thm) => (
                    <button
                      key={thm}
                      onClick={() => setColorTheme(thm)}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        thm === 'yellow' ? 'bg-amber-400' :
                        thm === 'red' ? 'bg-rose-500' :
                        thm === 'cyan' ? 'bg-cyan-400' : 'bg-fuchsia-500'
                      } ${colorTheme === thm ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      title={`${thm} theme`}
                    />
                  ))}
                </div>
              </div>

              {/* YouTube Thumbnail 16:9 Canvas */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl group flex flex-col justify-between p-4 sm:p-6 select-none">
                {/* Simulated background scene */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 opacity-90" />
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-rose-600/30 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/25 blur-[60px] rounded-full pointer-events-none" />

                {/* Mock Split Line / Extreme Visual element */}
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-red-500/40 to-transparent -rotate-12 pointer-events-none" />

                {/* Top Overlay: Creator Spark Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-md text-[11px] font-black tracking-widest uppercase bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-lg">
                    {activeThumb.targetEmotion}
                  </span>

                  {showSticker && (
                    <div className="animate-bounce px-2.5 py-1 rounded-lg bg-red-600 text-white font-display font-black text-xs shadow-xl tracking-wider uppercase border border-red-400">
                      NEW 2026
                    </div>
                  )}
                </div>

                {/* Center / Hero Overlay Text: Ultra Bold, Impactful */}
                <div className="relative z-10 my-auto text-center px-4">
                  <h4 className={`font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-tighter uppercase ${currentTheme.text}`}>
                    {displayText}
                  </h4>
                  <div className="mt-1 text-[11px] sm:text-xs font-bold text-slate-300 drop-shadow-md tracking-wider">
                    {activeThumb.visualHook.slice(0, 60)}...
                  </div>
                </div>

                {/* Bottom Overlay: Video Timestamp Pill */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-white border border-white/10">
                    <Play className="w-3 h-3 fill-white text-white" />
                    <span>12:48</span>
                  </div>

                  <span className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded font-mono">
                    16:9 4K HDR
                  </span>
                </div>
              </div>

              {/* YouTube Card Metadata Simulation (Feed View) */}
              <div className="mt-4 flex gap-3 items-start">
                {/* Channel Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center font-bold text-slate-950 font-display flex-shrink-0 shadow-md">
                  CS
                </div>

                {/* Title & Stats */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                    {selectedPreviewTitle || `I Tried ${topic} For 30 Days (It Changed Everything)`}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span className="hover:text-slate-200">CreatorSpark Channel</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">1.4M views</span>
                    <span>•</span>
                    <span>2 hours ago</span>
                  </p>
                </div>
              </div>

              {/* In-Place Text Editor */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="custom-thumb-text" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Customize Thumbnail Overlay Text:
                  </label>
                  {customText && (
                    <button
                      type="button"
                      onClick={() => setCustomText('')}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset to AI Text
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    id="custom-thumb-text"
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={activeThumb.text}
                    maxLength={30}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-bold text-sm uppercase focus:outline-none focus:border-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyText(displayText, 99)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    {copiedIndex === 99 ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedIndex === 99 ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Pro-tip: Keep thumbnail text under 4 words so it remains readable at 80px mobile screen size.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
