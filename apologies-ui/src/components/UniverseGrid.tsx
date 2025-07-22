import React from 'react';
import { SimulationState } from '../engine/simulation';
import { GameBoardView } from './GameBoardView';

const CONTAINER_SIZE = 512;

interface UniverseGridProps {
  universes: SimulationState[];
}

export const UniverseGrid: React.FC<UniverseGridProps> = ({ universes }) => {
  const boardCount = universes.length;
  const N = Math.sqrt(boardCount);
  const cellSize = CONTAINER_SIZE / N;

  return (
    <div
      style={{
        width: CONTAINER_SIZE,
        height: CONTAINER_SIZE,
        display: 'grid',
        gridTemplateColumns: `repeat(${N}, 1fr)`,
        gridTemplateRows: `repeat(${N}, 1fr)`,
        gap: 0,
        boxSizing: 'border-box',
      }}
    >
      {universes.map((boardState, idx) => (
        <div
          key={idx}
          style={{
            width: cellSize,
            height: cellSize,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GameBoardView
            board={boardState.board}
            cellSize={Math.max(cellSize / (boardState.board.size || 8)*0.9, 8)}
            currentPlayer={boardState.currentPlayer}
            rngValue={boardState.rngValue}
          />
        </div>
      ))}
    </div>
  );
}; 