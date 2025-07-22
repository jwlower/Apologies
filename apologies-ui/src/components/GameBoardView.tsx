import React from 'react';
import { Board } from '../engine/simulation';

interface GameBoardViewProps {
  board: Board;
  cellSize?: number; // px, default 40
  currentPlayer?: number;
  rngValue?: number;
}

const COLORS: Record<string, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#27ae60',
  yellow: '#f1c40f',
  // Add more as needed
};

export const GameBoardView: React.FC<GameBoardViewProps> = ({ board, cellSize = 40, currentPlayer, rngValue }) => {
  const { size, pawns, winner, path } = board;
  const center = {
    x: (size * cellSize) / 2,
    y: (size * cellSize) / 2,
  };
  const circleRadius = cellSize * 1.2;
  const corners = [
    [0, 0],
    [size - 1, 0],
    [size - 1, size - 1],
    [0, size - 1],
  ];

  return (
    <div
      style={{
        display: 'inline-block',
        border: '5px solid #333',
        background: '#fafafa',
        position: 'relative',
        width: size * cellSize,
        height: size * cellSize,
        boxSizing: 'content-box',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Grid lines */}
      {[...Array(size + 1)].map((_, i) => (
        <React.Fragment key={i}>
          {/* Vertical */}
          <div
            style={{
              position: 'absolute',
              left: i * cellSize,
              top: 0,
              width: 1,
              height: size * cellSize,
              background: '#ddd',
            }}
          />
          {/* Horizontal */}
          <div
            style={{
              position: 'absolute',
              top: i * cellSize,
              left: 0,
              height: 1,
              width: size * cellSize,
              background: '#ddd',
            }}
          />
        </React.Fragment>
      ))}
      {/* Path highlight */}
      {path && path.map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x * cellSize + cellSize * 0.35,
            top: y * cellSize + cellSize * 0.35,
            width: cellSize * 0.3,
            height: cellSize * 0.3,
            borderRadius: '50%',
            background: '#eee',
            zIndex: 0,
            opacity: 0.5,
          }}
        />
      ))}
      {/* Corners highlight with lap count */}
      {corners.map(([x, y], i) => {
        // Find the pawn whose home is this corner
        const pawn = pawns.find(p => p.home[0] === x && p.home[1] === y);
        const color = pawn ? (COLORS[pawn.color] || pawn.color) : '#bbb';
        const laps = pawn ? pawn.laps : 0;
        return (
          <div
            key={i + 'corner'}
            style={{
              position: 'absolute',
              left: x * cellSize + cellSize * 0.25,
              top: y * cellSize + cellSize * 0.25,
              width: cellSize * 0.5,
              height: cellSize * 0.5,
              borderRadius: '50%',
              background: color,
              zIndex: 1,
              opacity: 0.85,
              border: '2px solid #888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#fff',
              fontSize: Math.max(cellSize * 0.28, 10),
            }}
          >
            {laps}
          </div>
        );
      })}
      {/* Pawns */}
      {pawns.map((pawn, idx) => (
        <div
          key={pawn.id}
          style={{
            position: 'absolute',
            left: pawn.position[0] * cellSize + cellSize * 0.1,
            top: pawn.position[1] * cellSize + cellSize * 0.1,
            width: cellSize * 0.8,
            height: cellSize * 0.8,
            borderRadius: '50%',
            background: COLORS[pawn.color] || pawn.color,
            border: winner === pawn.color ? '3px solid #222' : '2px solid #fff',
            boxShadow: winner === pawn.color ? '0 0 10px 2px #222' : undefined,
            transition: 'left 0.2s, top 0.2s',
            zIndex: 2,
            outline: currentPlayer === idx ? '3px solid #000' : undefined,
          }}
          title={pawn.color}
        />
      ))}
      {/* Central RNG circle */}
      <div
        style={{
          position: 'absolute',
          left: center.x - circleRadius / 2,
          top: center.y - circleRadius / 2,
          width: circleRadius,
          height: circleRadius,
          borderRadius: '50%',
          background: currentPlayer !== undefined ? (COLORS[pawns[currentPlayer]?.color] || pawns[currentPlayer]?.color) : '#ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 32,
          fontWeight: 'bold',
          border: '4px solid #fff',
          zIndex: 5,
          boxShadow: '0 0 16px 2px #0004',
          transition: 'background 0.2s',
        }}
      >
        {rngValue !== undefined ? rngValue : '?'}
      </div>
      {/* Winner overlay */}
      {winner && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: (COLORS[winner] || winner) + '88',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#222',
            fontSize: Math.max(cellSize * 0.5, 14),
            fontWeight: 'bold',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {winner.toUpperCase()} WINS!
        </div>
      )}
    </div>
  );
}; 