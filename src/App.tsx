import React, { useEffect, useRef, useState } from 'react';
import { RunnerEngine, GameState, GameStats } from './game/engine';
import { GameShell } from './components/GameShell';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<RunnerEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    coins: 0,
    samosas: 0,
    distance: 0,
    multiplier: 1.5,
    speed: 0,
    difficulty: 'MEDIUM',
    activePowerup: {
      type: null,
      remaining: 0,
    },
    highScore: 0,
  });

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize 3D Runner Engine
    const engine = new RunnerEngine(mountRef.current);
    engineRef.current = engine;

    engine.onStateChange = (state) => {
      setGameState(state);
    };

    engine.onStatsUpdate = (newStats) => {
      setStats(newStats);
    };

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleStart = () => {
    engineRef.current?.startRun();
  };

  const handleResume = () => {
    engineRef.current?.resumeRun();
  };

  const handleTogglePause = () => {
    engineRef.current?.togglePause();
  };

  const handleMoveLeft = () => {
    engineRef.current?.moveLeft();
  };

  const handleMoveRight = () => {
    engineRef.current?.moveRight();
  };

  const handleJump = () => {
    engineRef.current?.jump();
  };

  const handleSlide = () => {
    engineRef.current?.slide();
  };

  const handleSelectDifficulty = (diff: import('./game/engine').GameDifficulty) => {
    engineRef.current?.setDifficulty(diff);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none touch-none">
      {/* Isolated Three.js WebGL Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Low-Occlusion Game Shell Overlay */}
      <GameShell
        gameState={gameState}
        stats={stats}
        onStart={handleStart}
        onResume={handleResume}
        onTogglePause={handleTogglePause}
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
        onJump={handleJump}
        onSlide={handleSlide}
        onSelectDifficulty={handleSelectDifficulty}
      />
    </div>
  );
}
