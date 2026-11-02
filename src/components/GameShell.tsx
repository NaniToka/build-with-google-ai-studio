import React, { useState, useEffect } from 'react';
import { GameStats, GameState, GameDifficulty } from '../game/engine';
import { sound } from '../game/audio';
import { fireCreatorConfetti } from '../utils/confetti';
import { Volume2, VolumeX, Play, RotateCcw, Pause, Sparkles, Shield, Zap, Compass, Trophy, Flame } from 'lucide-react';

interface GameShellProps {
  gameState: GameState;
  stats: GameStats;
  onStart: () => void;
  onResume: () => void;
  onTogglePause: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onSelectDifficulty: (diff: GameDifficulty) => void;
}

export const GameShell: React.FC<GameShellProps> = ({
  gameState,
  stats,
  onStart,
  onResume,
  onTogglePause,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
  onSelectDifficulty,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isNewHigh, setIsNewHigh] = useState(false);

  useEffect(() => {
    if (gameState === 'GAMEOVER' && stats.score >= stats.highScore && stats.score > 0) {
      setIsNewHigh(true);
      fireCreatorConfetti();
    } else if (gameState === 'PLAYING') {
      setIsNewHigh(false);
    }
  }, [gameState, stats.score, stats.highScore]);

  const toggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 font-sans">
      {/* 1. PERIMETER IN-GAME HUD (ACTIVE WHEN PLAYING OR PAUSED) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between">
          {/* Top Status Cluster: Score, Coins, Samosas, Distance, Sound Toggle */}
          <div className="flex items-start justify-between gap-4">
            {/* Top-Left: Distance, Speed & Difficulty Badge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/30 text-cyan-300 shadow-lg">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">DIST</span>
                <span className="font-mono-num text-lg font-black tracking-tight text-white">
                  {stats.distance.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-cyan-400">m</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 text-xs font-mono-num">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">{stats.speed} km/h</span>
                <span className={`px-1.5 py-0.2 rounded font-black text-[10px] uppercase ${
                  stats.difficulty === 'HARD' ? 'bg-red-500 text-white' :
                  stats.difficulty === 'MEDIUM' ? 'bg-amber-500 text-slate-950' :
                  'bg-emerald-500 text-slate-950'
                }`}>
                  {stats.difficulty} ({stats.multiplier}X)
                </span>
              </div>
            </div>

            {/* Top-Center: Active Power-up Timer Bar */}
            {stats.activePowerup.type && (
              <div className="flex flex-col items-center gap-1 animate-pulse">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 border shadow-lg ${
                  stats.activePowerup.type === 'samosa'
                    ? 'border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                    : 'border-slate-700 text-white'
                }`}>
                  {stats.activePowerup.type === 'samosa' && <span>🥟</span>}
                  {stats.activePowerup.type === 'shield' && <Shield className="w-4 h-4 text-emerald-400" />}
                  {stats.activePowerup.type === 'magnet' && <Compass className="w-4 h-4 text-blue-400" />}
                  {stats.activePowerup.type === 'boost' && <Zap className="w-4 h-4 text-purple-400" />}
                  {stats.activePowerup.type === 'multiplier' && <Sparkles className="w-4 h-4 text-amber-400" />}
                  <span className="text-xs font-black uppercase tracking-wider">
                    {stats.activePowerup.type === 'samosa' ? 'SAMOSA TURBO' : `${stats.activePowerup.type.toUpperCase()} ACTIVE`}
                  </span>
                  <span className="font-mono-num text-xs font-bold text-white">
                    {stats.activePowerup.remaining.toFixed(1)}s
                  </span>
                </div>
              </div>
            )}

            {/* Top-Right: Score, Coins & Samosas */}
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-end gap-1.5">
                {/* Score */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-950/85 border border-rose-500/30 text-rose-300 shadow-lg">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">SCORE</span>
                  <span className="font-mono-num text-xl sm:text-2xl font-black text-white tracking-tight">
                    {stats.score.toLocaleString()}
                  </span>
                </div>

                {/* Samosas & Coins */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-amber-500/30 text-amber-300 text-xs font-mono-num">
                    <span>🥟</span>
                    <span className="font-extrabold">{stats.samosas}</span>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-amber-500/30 text-amber-300 text-xs font-mono-num">
                    <span>🪙</span>
                    <span className="font-extrabold">{stats.coins}</span>
                  </div>
                </div>
              </div>

              {/* Pause & Mute Action Buttons */}
              <div className="flex flex-col gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={onTogglePause}
                  className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95 shadow-md"
                  title="Pause (Esc)"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95 shadow-md"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom On-Screen Mobile Touch Controls */}
          <div className="md:hidden flex items-end justify-between pointer-events-auto pb-4">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onMoveLeft}
                className="w-14 h-14 rounded-2xl bg-slate-950/85 active:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-black text-xl flex items-center justify-center shadow-xl active:scale-95 transition"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={onMoveRight}
                className="w-14 h-14 rounded-2xl bg-slate-950/85 active:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-black text-xl flex items-center justify-center shadow-xl active:scale-95 transition"
              >
                ▶
              </button>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onSlide}
                className="w-14 h-14 rounded-2xl bg-slate-950/85 active:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-sm uppercase flex items-center justify-center shadow-xl active:scale-95 transition"
              >
                ROLL
              </button>
              <button
                type="button"
                onClick={onJump}
                className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 active:from-red-500 active:to-rose-400 text-white font-black text-base uppercase flex items-center justify-center shadow-xl shadow-rose-950/40 active:scale-95 transition"
              >
                JUMP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TITLE SCREEN (WITH DIFFICULTY SELECTOR & MOTU PATLU HERO SHOWCASE) */}
      {gameState === 'TITLE' && (
        <div className="w-full h-full flex flex-col justify-between items-center p-5 sm:p-8 pointer-events-auto bg-gradient-to-t from-black/95 via-black/50 to-black/30 overflow-y-auto">
          {/* Top Bar: Audio Toggle & High Score */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>HIGH SCORE:</span>
              <span className="font-mono-num font-black text-amber-400">{stats.highScore.toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className="p-2.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white transition"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
          </div>

          {/* Center Lockup: Motu Patlu Samosa Dash Title */}
          <div className="flex flex-col items-center text-center my-auto max-w-xl py-2">
            {/* Inline SVG Title Lockup */}
            <div className="mb-2">
              <svg width="320" height="75" viewBox="0 0 320 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_10px_25px_rgba(239,68,68,0.5)]">
                <defs>
                  <linearGradient id="motuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <text x="160" y="44" textAnchor="middle" fill="url(#motuGrad)" fontSize="38" fontWeight="900" fontFamily="Space Grotesk, sans-serif" letterSpacing="4">
                  MOTU'S RUN
                </text>
                <text x="160" y="66" textAnchor="middle" fill="#ffffff" opacity="0.9" fontSize="12" fontWeight="800" fontFamily="Space Grotesk, sans-serif" letterSpacing="5">
                  FURFURI NAGAR ➔ SUBWAY DASH
                </text>
              </svg>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-bold mb-4">
              <span>🥟 Featuring Motu & Inspector Chingum</span>
            </div>

            {/* DIFFICULTY SELECTOR: EASY / MEDIUM / HARD */}
            <div className="w-full max-w-md mb-6">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Select Level Difficulty:
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {/* EASY */}
                <button
                  type="button"
                  onClick={() => onSelectDifficulty('EASY')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    stats.difficulty === 'EASY'
                      ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
                    <span>EASY</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Furfuri Walk</div>
                  <div className="text-[10px] font-mono text-emerald-300 font-bold mt-1">1.0X SCORE</div>
                </button>

                {/* MEDIUM */}
                <button
                  type="button"
                  onClick={() => onSelectDifficulty('MEDIUM')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    stats.difficulty === 'MEDIUM'
                      ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                    <span>MEDIUM</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Market Dash</div>
                  <div className="text-[10px] font-mono text-amber-300 font-bold mt-1">1.5X SCORE</div>
                </button>

                {/* HARD */}
                <button
                  type="button"
                  onClick={() => onSelectDifficulty('HARD')}
                  className={`p-3 rounded-2xl border text-center transition-all relative overflow-hidden ${
                    stats.difficulty === 'HARD'
                      ? 'bg-red-950/90 border-red-500 ring-2 ring-red-500/50 shadow-xl shadow-red-950/60'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-black text-rose-400 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-rose-500" />
                    <span>HARD</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Chingum Pursuit</div>
                  <div className="text-[10px] font-mono text-rose-300 font-extrabold mt-1">3.0X REWARD</div>
                </button>
              </div>

              {stats.difficulty === 'HARD' && (
                <p className="text-[11px] text-rose-300 font-semibold mt-2">
                  ⚠️ Hard Mode: Ultra-fast speeds (34-56 km/h), rapid obstacles, oncoming trains, and high camera rumble!
                </p>
              )}
            </div>

            {/* Primary Start CTA */}
            <button
              type="button"
              onClick={onStart}
              className="group flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:via-rose-400 hover:to-amber-400 text-white font-black text-lg tracking-wider uppercase transition-all duration-300 shadow-2xl shadow-rose-600/40 hover:scale-105 active:scale-95 border border-white/20"
            >
              <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              <span>START MOTU'S RUN</span>
            </button>

            <span className="text-xs text-slate-400 mt-3 font-mono">
              Press <kbd className="px-2 py-0.5 rounded bg-slate-800 text-white border border-slate-700">SPACE</kbd> or <kbd className="px-2 py-0.5 rounded bg-slate-800 text-white border border-slate-700">ENTER</kbd>
            </span>
          </div>

          {/* Flat Control Hints */}
          <div className="w-full text-center pb-2">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 font-medium">
              <span><strong className="text-white">A / D</strong> or <strong className="text-white">← / →</strong> Switch Lanes</span>
              <span>·</span>
              <span><strong className="text-white">W / Space</strong> Jump</span>
              <span>·</span>
              <span><strong className="text-white">S / ↓</strong> Motu Roll</span>
              <span>·</span>
              <span><strong className="text-white">Esc</strong> Pause</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <div className="w-full h-full flex items-center justify-center p-4 pointer-events-auto bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-8 text-center shadow-2xl shadow-black/80">
            <h2 className="text-3xl font-black text-white tracking-wide uppercase mb-1">
              PAUSED
            </h2>
            <p className="text-xs text-slate-400 mb-6">"Khaali pet mere dimaag ki batti nahi jalti!" — Motu</p>

            <div className="grid grid-cols-3 gap-2.5 mb-6 text-left text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px]">Distance</span>
                <div className="text-base font-mono-num font-black text-cyan-300">{stats.distance} m</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px]">Samosas</span>
                <div className="text-base font-mono-num font-black text-amber-400">🥟 {stats.samosas}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[10px]">Difficulty</span>
                <div className="text-base font-mono-num font-black text-rose-400">{stats.difficulty}</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={onResume}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm uppercase transition shadow-lg shadow-rose-600/30"
              >
                Resume Run (Esc)
              </button>
              <button
                type="button"
                onClick={onStart}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs uppercase transition border border-slate-800"
              >
                Restart Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. GAME OVER SCREEN */}
      {gameState === 'GAMEOVER' && (
        <div className="w-full h-full flex items-center justify-center p-4 pointer-events-auto bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border-2 border-rose-500/40 p-8 text-center shadow-2xl shadow-rose-950/60 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-3">
              BUSTED BY INSPECTOR CHINGUM
            </div>

            <h2 className="text-4xl font-black text-white tracking-tight uppercase mb-2">
              MOTU CRASHED!
            </h2>
            <p className="text-xs text-slate-400 mb-4 italic">
              "Chingum ke chumbak se bachna impossible!"
            </p>

            {isNewHigh && (
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-sm flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>NEW PERSONAL BEST!</span>
              </div>
            )}

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs uppercase font-extrabold text-slate-400">Total Score</span>
                <span className="text-2xl font-mono-num font-black text-white">
                  {stats.score.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Distance Run</span>
                  <div className="text-base font-mono-num font-extrabold text-cyan-300 mt-0.5">
                    {stats.distance.toLocaleString()} m
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Crispy Samosas</span>
                  <div className="text-base font-mono-num font-extrabold text-amber-400 mt-0.5">
                    🥟 {stats.samosas}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={onStart}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:via-rose-400 hover:to-amber-400 text-white font-black text-base uppercase transition-all duration-200 shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>TRY AGAIN (Space / Enter)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
