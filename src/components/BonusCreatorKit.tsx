import React, { useState } from 'react';
import { VideoHook } from '../types';
import { Sparkles, Copy, Check, FileText, Hash, Key, MessageSquare, Clock, Zap } from 'lucide-react';

interface BonusCreatorKitProps {
  hooks: VideoHook[];
  description: string;
  hashtags: string[];
  seoKeywords: string[];
  topic: string;
}

export const BonusCreatorKit: React.FC<BonusCreatorKitProps> = ({
  hooks,
  description,
  hashtags,
  seoKeywords,
  topic,
}) => {
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);
  const [copiedDescription, setCopiedDescription] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedTagIndex, setCopiedTagIndex] = useState<number | null>(null);

  const handleCopyHook = (script: string, index: number) => {
    navigator.clipboard.writeText(script);
    setCopiedHookIndex(index);
    setTimeout(() => setCopiedHookIndex(null), 2000);
  };

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(description);
    setCopiedDescription(true);
    setTimeout(() => setCopiedDescription(false), 2200);
  };

  const handleCopyAllHashtags = () => {
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2200);
  };

  const handleCopySingleTag = (tag: string, index: number) => {
    navigator.clipboard.writeText(tag);
    setCopiedTagIndex(index);
    setTimeout(() => setCopiedTagIndex(null), 1500);
  };

  return (
    <section id="bonus-kit" className="py-10 border-t border-slate-800/80">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Retention & SEO
          </span>
          <span className="text-xs text-slate-400 font-semibold">Bonus Creative Toolkit</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-rose-500" />
          Bonus Creator Ideas: Hooks, Description & SEO
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          The first 5 seconds dictate 80% of your retention. Pair your video with tested opening scripts and search-optimized metadata.
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. Opening Retention Hooks (0:00 - 0:10) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>3 Viral Video Hooks (First 5–10 Seconds)</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Pick the tone that matches your edit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hooks.map((hook, index) => (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase bg-rose-950/70 text-rose-300 border border-rose-800/60">
                      {hook.style}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold font-mono">
                      High Retention
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 italic mb-3">
                    "{hook.description}"
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-medium">
                    {hook.script}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopyHook(hook.script, index)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    {copiedHookIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Hook Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Structured YouTube Description & Timestamps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-500" />
                  <h3 className="font-display font-bold text-lg text-white">
                    Ready-to-Paste YouTube Description
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleCopyDescription}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition shadow-md shadow-red-600/20"
                >
                  {copiedDescription ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied Description!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white" />
                      <span>Copy Full Description</span>
                    </>
                  )}
                </button>
              </div>

              {/* Description Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto selection:bg-rose-500/30">
                {description}
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Includes algorithm synopsis, timestamp outline, comment prompt, and CTA.</span>
              </div>
            </div>
          </div>

          {/* 3. Hashtags & SEO Keywords Cloud */}
          <div className="lg:col-span-5 space-y-6">
            {/* Hashtags Card */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-amber-400" />
                  <h4 className="font-display font-bold text-base text-white">
                    Viral Hashtags ({hashtags.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAllHashtags}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  {copiedHashtags ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">All Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCopySingleTag(tag, idx)}
                    className="group px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1"
                    title="Click to copy single hashtag"
                  >
                    <span>{tag}</span>
                    {copiedTagIndex === idx ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* SEO Keywords Card */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-cyan-400" />
                <h4 className="font-display font-bold text-base text-white">
                  Target Search Terms (SEO)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Include these phrases in your script speech and video tags for YouTube search traffic:
              </p>
              <div className="flex flex-wrap gap-2">
                {seoKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-950 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-medium"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
