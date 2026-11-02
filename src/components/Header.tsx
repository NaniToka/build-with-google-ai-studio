import React from 'react';
import { Sparkles, Youtube, Bookmark, Zap, Compass, History } from 'lucide-react';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasGenerated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount,
  onOpenSaved,
  activeTab,
  setActiveTab,
  hasGenerated,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Tagline */}
          <div 
            onClick={() => setActiveTab('generator')} 
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-400 p-[2px] shadow-lg shadow-rose-500/25 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-amber-500/20" />
                  <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-0.5 -right-0.5 animate-pulse" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Creator<span className="bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">Spark</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                  AI
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400 hidden sm:block">
                Your Ideas. Our AI. <span className="text-amber-400 font-semibold">Viral Possibilities.</span>
              </p>
            </div>
          </div>

          {/* Navigation Pill Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Generator
            </button>

            {hasGenerated && (
              <>
                <button
                  onClick={() => setActiveTab('titles')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeTab === 'titles'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  10 Titles
                </button>

                <button
                  onClick={() => setActiveTab('thumbnails')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeTab === 'thumbnails'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Thumbnail Studio
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('evolution')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === 'evolution'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              Creator Evolution
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold">
                1996–2056
              </span>
            </button>
          </nav>

          {/* Right Action: Saved Sparks Drawer */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSaved}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold group shadow-sm"
              title="Saved Titles & Sparks"
            >
              <Bookmark className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Saved Sparks</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-400 text-slate-950 rounded-full animate-bounce">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'generator' ? 'text-red-400 font-bold' : 'text-slate-400'}`}
          >
            ⚡ Generator
          </button>
          {hasGenerated && (
            <>
              <button
                onClick={() => setActiveTab('titles')}
                className={`px-3 py-1 rounded-lg ${activeTab === 'titles' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
              >
                🔥 10 Titles
              </button>
              <button
                onClick={() => setActiveTab('thumbnails')}
                className={`px-3 py-1 rounded-lg ${activeTab === 'thumbnails' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
              >
                🎨 Thumbnails
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('evolution')}
            className={`px-3 py-1 rounded-lg ${activeTab === 'evolution' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            ⏳ Evolution
          </button>
        </div>
      </div>
    </header>
  );
};
