import React from 'react';
import './App.css';
import { runSimulation, createBoard, simulateTurn, Board, SimulationState } from './engine/simulation';
import { GameBoardView } from './components/GameBoardView';
import { ScoreArea } from './components/ScoreArea';
import { ColorSelector } from './components/ColorSelector';
import { UniverseGrid } from './components/UniverseGrid';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const SIZE = 8;
const BASE_ANIMATION_DELAY = 300; // ms
const SPEEDUP_INTERVAL = 5000; // ms
const UNIVERSE_OPTIONS = [1, 4, 16, 64, 256];
const AUTO_NEXT_DELAY = 5000; // ms
const MAX_UNIVERSES = 256;

// Add a retro board game font (Google Fonts)
const boardGameFont = `'Luckiest Guy', 'Comic Sans MS', cursive, sans-serif`;

function getInitialState(): SimulationState {
  const board = createBoard(SIZE, COLORS);
  const startPlayer = Math.floor(Math.random() * COLORS.length);
  return {
    board,
    turn: 0,
    isFinished: false,
    currentPlayer: startPlayer,
    rngValue: 0,
  };
}

function getScoreForStreak(streak: number) {
  // 1, 2, 4, 8, ...
  return Math.pow(2, streak - 1);
}

function App() {
  const [selectedColor, setSelectedColor] = React.useState(COLORS[0]);
  const [lockedColor, setLockedColor] = React.useState<string | null>(null);
  const [gridSize, setGridSize] = React.useState(1); // N
  const boardCount = gridSize * gridSize;
  // Always create N*N universes
  const [universes, setUniverses] = React.useState<SimulationState[]>(() => Array.from({ length: boardCount }, getInitialState));
  const [isRunning, setIsRunning] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [animationDelay, setAnimationDelay] = React.useState(BASE_ANIMATION_DELAY);
  const [autoNext, setAutoNext] = React.useState(false);
  const [autoNextCountdown, setAutoNextCountdown] = React.useState(AUTO_NEXT_DELAY / 1000);
  const [lastWins, setLastWins] = React.useState(0);
  // Remove pan/zoom logic and state

  // Track elapsed time while running
  React.useEffect(() => {
    if (!isRunning) return;
    setElapsed(0);
    setAnimationDelay(BASE_ANIMATION_DELAY);
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Speed up every SPEEDUP_INTERVAL ms
  React.useEffect(() => {
    if (!isRunning) return;
    const speedups = Math.floor(elapsed / SPEEDUP_INTERVAL);
    setAnimationDelay(BASE_ANIMATION_DELAY / Math.pow(2, speedups));
  }, [elapsed, isRunning]);

  // Animate all universes step by step
  React.useEffect(() => {
    if (isRunning && universes.some(u => !u.isFinished)) {
      const timeout = setTimeout(() => {
        setUniverses(prev => prev.map(u => (u.isFinished ? u : simulateTurn(u))));
      }, animationDelay);
      return () => clearTimeout(timeout);
    } else if (isRunning && universes.every(u => u.isFinished)) {
      setIsRunning(false);
      setShowResult(true);
      // Scoring: count how many universes the guess won
      const wins = universes.filter(u => u.board.winner === lockedColor).length;
      setLastWins(wins);
      if (wins > 0) {
        setStreak((prev) => prev + 1);
        setScore((prev) => prev + getScoreForStreak(streak + 1) * wins);
      } else {
        setStreak(0);
      }
      // Auto next game logic
      if (autoNext) {
        setAutoNextCountdown(AUTO_NEXT_DELAY / 1000);
      }
    }
  }, [isRunning, universes, lockedColor, streak, animationDelay, autoNext]);

  // Auto next game countdown
  React.useEffect(() => {
    if (!autoNext || !showResult) return;
    if (autoNextCountdown <= 0) {
      handleNextGame();
      return;
    }
    const timer = setTimeout(() => {
      setAutoNextCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoNext, showResult, autoNextCountdown]);

  // Auto next game effect: if enabled, immediately start next game after result
  React.useEffect(() => {
    if (autoNext && showResult) {
      // Start next game after a short delay (e.g., 300ms for UI update)
      const timer = setTimeout(() => {
        handleNextGame();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoNext, showResult]);

  // When autoNext is enabled, immediately start the simulation if not running
  React.useEffect(() => {
    if (autoNext && !isRunning && !lockedColor && !showResult) {
      setLockedColor(selectedColor);
      setUniverses(Array.from({ length: boardCount }, () => getInitialState()));
      setShowResult(false);
      setIsRunning(true);
      setElapsed(0);
      setAnimationDelay(BASE_ANIMATION_DELAY);
    }
  }, [autoNext, isRunning, lockedColor, showResult, selectedColor, boardCount]);

  // When gridSize changes, reset universes
  React.useEffect(() => {
    setUniverses(Array.from({ length: boardCount }, getInitialState));
  }, [gridSize, boardCount]);

  function handleStart() {
    setUniverses(Array.from({ length: boardCount }, () => getInitialState()));
    setShowResult(false);
    setIsRunning(true);
    setElapsed(0);
    setAnimationDelay(BASE_ANIMATION_DELAY);
    setLockedColor(selectedColor); // Lock in the guess
  }

  function handleColorSelect(color: string) {
    if (!isRunning && !lockedColor) {
      setSelectedColor(color);
    }
  }

  function handleNextGame() {
    const userWon = universes.some(u => u.board.winner === lockedColor);
    setGridSize(userWon ? 1 : gridSize + 1);
    setShowResult(false);
    setLockedColor(null);
    setIsRunning(false);
    setElapsed(0);
    setAnimationDelay(BASE_ANIMATION_DELAY);
  }

  function handleReset() {
    setGridSize(1);
    setShowResult(false);
    setLockedColor(null);
    setIsRunning(false);
    setElapsed(0);
    setAnimationDelay(BASE_ANIMATION_DELAY);
  }

  // For demonstration, let's assume boardsPerUniverse is a fixed value or comes from state
  const boardsPerUniverse = 2; // Replace with your logic for N

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'repeating-linear-gradient(135deg, #f9e7c2 0 40px, #f5d88c 40px 80px)',
        fontFamily: boardGameFont,
        padding: 0,
        margin: 0,
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet" />
      <header
        style={{
          textAlign: 'center',
          fontFamily: boardGameFont,
          fontSize: 44,
          color: '#b22222',
          letterSpacing: 2,
          textShadow: '2px 2px 0 #fff, 4px 4px 0 #b22222',
          margin: '32px 0 12px 0',
          userSelect: 'none',
        }}
      >
        APOLOGIES!
      </header>
      <div
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 24,
          boxShadow: '0 4px 24px #0002',
          padding: 24,
          maxWidth: 700,
          margin: '0 auto 24px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <ScoreArea score={score} streak={streak} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
          <ColorSelector
            colors={COLORS}
            selected={selectedColor}
            onSelect={handleColorSelect}
            locked={!!lockedColor || isRunning || autoNext}
          />
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 16 }}>
            <label style={{ fontWeight: 'bold', fontSize: 18, marginRight: 8 }}>Auto Next Game</label>
            <span style={{ position: 'relative', display: 'inline-block', width: 48, height: 28 }}>
              <input
                type="checkbox"
                checked={autoNext}
                onChange={e => setAutoNext(e.target.checked)}
                disabled={isRunning}
                style={{ opacity: 0, width: 48, height: 28, position: 'absolute', left: 0, top: 0, margin: 0, cursor: isRunning ? 'not-allowed' : 'pointer' }}
              />
              <span
                style={{
                  display: 'block',
                  width: 48,
                  height: 28,
                  background: autoNext ? '#4caf50' : '#bbb',
                  borderRadius: 14,
                  transition: 'background 0.2s',
                  boxShadow: autoNext ? '0 0 8px #4caf50' : '0 0 4px #bbb',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: autoNext ? 24 : 2,
                  top: 2,
                  width: 24,
                  height: 24,
                  background: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px #0002',
                  transition: 'left 0.2s',
                  border: '2px solid #888',
                }}
              />
            </span>
          </div>
        </div>
        <button
          onClick={handleStart}
          disabled={isRunning || !!lockedColor || autoNext}
          style={{
            marginBottom: 24,
            padding: '0.5rem 2rem',
            fontSize: 22,
            borderRadius: 12,
            border: '2px solid #b22222',
            background: isRunning || lockedColor || autoNext ? '#bbb' : '#f5d88c',
            color: '#b22222',
            cursor: isRunning || lockedColor || autoNext ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px #0002',
            letterSpacing: 1,
            transition: 'background 0.2s',
            display: autoNext ? 'none' : undefined,
          }}
        >
          {isRunning ? 'Simulating...' : lockedColor ? `Guess Locked: ${lockedColor}` : 'Start Simulation'}
        </button>
        <div
          style={{
            width: 512,
            height: 512,
            maxWidth: 512,
            maxHeight: 512,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#222',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 24px #0004',
            position: 'relative',
          }}
        >
          <UniverseGrid universes={universes} />
        </div>
        {showResult && (
          <>
            <div style={{ marginTop: 24, fontSize: 26, fontWeight: 'bold', color: lockedColor || '#b22222', textShadow: '1px 1px 0 #fff' }}>
              {universes.filter(u => u.board.winner === lockedColor).length > 0
                ? `You guessed correctly in ${universes.filter(u => u.board.winner === lockedColor).length} universe(s)!`
                : `No wins for ${lockedColor}.`}
            </div>
            {!autoNext && (
              <button
                onClick={handleNextGame}
                style={{
                  marginTop: 16,
                  padding: '0.5rem 2rem',
                  fontSize: 20,
                  borderRadius: 10,
                  border: '2px solid #b22222',
                  background: '#f5d88c',
                  color: '#b22222',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px #0002',
                  letterSpacing: 1,
                }}
              >
                Next Game
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
