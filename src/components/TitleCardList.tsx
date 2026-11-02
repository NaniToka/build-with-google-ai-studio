import React, { useState } from 'react';
import { TitleIdea } from '../types';
import { Copy, Check, Bookmark, Sparkles, TrendingUp, Info, Eye, ExternalLink } from 'lucide-react';

interface TitleCardListProps {
  titles: TitleIdea[];
  topic: string;
  onSaveTitle: (title: TitleIdea) => void;
  isTitleSaved: (titleStr: string) => boolean;
  onSendToThumbnailStudio?: (titleText: string) => void;
}

export const TitleCardList: React.FC<TitleCardListProps> = ({
  titles,
  topic,
  onSaveTitle,
  isTitleSaved,
  onSendToThumbnailStudio,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const fullText = titles.map((t, idx) => `${idx + 1}. ${t.title} [${t.style}]`).join('\n');
    navigator.clipboard.writeText(fullText);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2200);
  };

  // Unique filter styles
  const filterStyles = ['all', ...Array.from(new Set(titles.map((t) => t.style)))];

  const filteredTitles = selectedFilter === 'all'
    ? titles
    : titles.filter((t) => t.style === selectedFilter);

  return (
    <section id="titles-section" className="py-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
              High CTR Formula
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Topic: <span className="text-white font-bold">{topic}</span>
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400" />
            10 Catchy YouTube Titles
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Engineered for high click-through rates, curiosity, and YouTube algorithm ranking.
          </p>
        </div>

        {/* Global Action: Copy All */}
        <button
          onClick={handleCopyAll}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold transition shadow-sm"
        >
          {allCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>All 10 Titles Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-amber-400" />
              <span>Copy All 10 Titles</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Chips */}
      {filterStyles.length > 2 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-400 mr-1">Filter Angle:</span>
          {filterStyles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedFilter(style)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition ${
                selectedFilter === style
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {style === 'all' ? 'All 10 Titles' : style}
            </button>
          ))}
        </div>
      )}

      {/* 10 Titles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTitles.map((titleItem, index) => {
          const isSaved = isTitleSaved(titleItem.title);
          const isOptimalLength = titleItem.characterCount <= 65;

          return (
            <div
              key={index}
              className="group relative rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-rose-500/50 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20 flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Rank & Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                      #{index + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-800 text-slate-300 border border-slate-700/60">
                      {titleItem.style}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                      <TrendingUp className="w-3 h-3" />
                      {titleItem.estimatedCtr}
                    </span>
                  </div>
                </div>

                {/* The Title Headline */}
                <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {titleItem.title}
                </h3>

                {/* Character Count & Mobile Preview Metric */}
                <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono">
                    {titleItem.characterCount} chars
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isOptimalLength
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}
                  >
                    {isOptimalLength ? '✓ 100% Mobile Safe' : '⚠️ Long Title (May Truncate)'}
                  </span>
                </div>

                {/* Why It Works Psychology Box */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-amber-300">CTR Psychology:</strong> {titleItem.whyItWorks}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Test in Thumbnail Studio */}
                  {onSendToThumbnailStudio && (
                    <button
                      type="button"
                      onClick={() => onSendToThumbnailStudio(titleItem.title)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition"
                      title="Preview this title in the Thumbnail Studio"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Preview In Studio</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Save to Favorites */}
                  <button
                    type="button"
                    onClick={() => onSaveTitle(titleItem)}
                    className={`p-2 rounded-lg border transition ${
                      isSaved
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                    }`}
                    title={isSaved ? 'Saved in Sparks' : 'Save Title'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(titleItem.title, index)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                      copiedIndex === index
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-rose-600/20'
                    }`}
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
