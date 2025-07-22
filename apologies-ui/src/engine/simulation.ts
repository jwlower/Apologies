// Simulation engine for Apologies idle game
// Designed for 2D, but easily extensible to 3D/4D

export type Coordinate = number[]; // [x, y] for 2D, [x, y, z] for 3D, etc.

export interface Pawn {
  color: string;
  position: Coordinate;
  home: Coordinate;
  id: number;
  laps: number; // Number of full loops completed
}

export interface Board {
  size: number; // NxN
  pawns: Pawn[];
  winner: string | null;
  path: Coordinate[]; // The path all pawns traverse
}

export interface SimulationState {
  board: Board;
  turn: number;
  isFinished: boolean;
  currentPlayer: number; // index in pawns
  rngValue: number; // last random number rolled
}

// Generate a path that traverses all corners and edges in a clockwise loop
function generatePath(size: number): Coordinate[] {
  const path: Coordinate[] = [];
  // Top row left to right
  for (let x = 0; x < size; x++) path.push([x, 0]);
  // Right column top to bottom (skip first)
  for (let y = 1; y < size; y++) path.push([size - 1, y]);
  // Bottom row right to left (skip first)
  for (let x = size - 2; x >= 0; x--) path.push([x, size - 1]);
  // Left column bottom to top (skip first and last)
  for (let y = size - 2; y > 0; y--) path.push([0, y]);
  return path;
}

// Utility to create a new board with N players/colors, each in a unique corner
export function createBoard(size: number, colors: string[]): Board {
  const corners: Coordinate[] = [
    [0, 0],
    [size - 1, 0],
    [size - 1, size - 1],
    [0, size - 1],
  ];
  const path = generatePath(size);
  const pawns: Pawn[] = colors.map((color, idx) => ({
    color,
    position: corners[idx % corners.length],
    home: corners[idx % corners.length],
    id: idx,
    laps: 0,
  }));
  return {
    size,
    pawns,
    winner: null,
    path,
  };
}

function getPawnPathIndex(pawn: Pawn, path: Coordinate[]): number {
  const index = path.findIndex(([x, y]) => pawn.position[0] === x && pawn.position[1] === y);
  // If not found, return 0 as fallback (shouldn't happen in normal operation)
  return index >= 0 ? index : 0;
}

function isSameCoord(a: Coordinate, b: Coordinate): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function crossesHome(prevIdx: number, newIdx: number, homeIdx: number, pathLen: number): boolean {
  if (prevIdx < 0 || newIdx < 0 || homeIdx < 0) return false;
  if (prevIdx === newIdx) return false;
  if (prevIdx < newIdx) {
    return prevIdx < homeIdx && homeIdx <= newIdx;
  } else {
    // Wrapped around
    return prevIdx < homeIdx || homeIdx <= newIdx;
  }
}

// Simulate a single turn for the current player
export function simulateTurn(state: SimulationState): SimulationState {
  if (state.isFinished) return state;
  const { board, currentPlayer } = state;
  const path = board.path;
  const pawns = [...board.pawns];
  const pawn = pawns[currentPlayer];
  let idx = getPawnPathIndex(pawn, path);
  // Roll random number 0-3
  const rngValue = Math.floor(Math.random() * 4);
  // Move pawn
  let newIdx = (idx + rngValue) % path.length;
  let newPos = path[newIdx];
  let newLaps = pawn.laps;
  const homeIdx = getPawnPathIndex({ ...pawn, position: pawn.home }, path);
  // Only increment laps if pawn crosses home index (not just lands on it)
  if (crossesHome(idx, newIdx, homeIdx, path.length)) {
    newLaps++;
  }
  // Check for collision
  let collisionIdx = pawns.findIndex((p, i) => i !== currentPlayer && isSameCoord(p.position, newPos));
  if (collisionIdx !== -1) {
    // Send the collided pawn back to the last corner it crossed that is not occupied
    const collidedPawn = pawns[collisionIdx];
    // Find last crossed corner (in reverse path order)
    let lastCornerIdx = getPawnPathIndex(collidedPawn, path);
    let found = false;
    for (let i = lastCornerIdx; i >= 0; i--) {
      const coord = path[i];
      if (
        (isSameCoord(coord, collidedPawn.home) ||
          isSameCoord(coord, [0, 0]) ||
          isSameCoord(coord, [board.size - 1, 0]) ||
          isSameCoord(coord, [board.size - 1, board.size - 1]) ||
          isSameCoord(coord, [0, board.size - 1])) &&
        !pawns.some((p) => isSameCoord(p.position, coord))
      ) {
        pawns[collisionIdx] = { ...collidedPawn, position: coord };
        found = true;
        break;
      }
    }
    if (!found) {
      // If no unoccupied corner found, send to home
      pawns[collisionIdx] = { ...collidedPawn, position: collidedPawn.home };
    }
  }
  // Move current pawn
  pawns[currentPlayer] = { ...pawn, position: newPos, laps: newLaps };
  // Check for win: pawn must return to its home after at least one full loop
  let winner: string | null = null;
  if (
    isSameCoord(newPos, pawn.home) &&
    newLaps >= 1
  ) {
    winner = pawn.color;
  }
  return {
    board: {
      ...board,
      pawns,
      winner,
    },
    turn: state.turn + 1,
    isFinished: !!winner,
    currentPlayer: (currentPlayer + 1) % pawns.length,
    rngValue,
  };
}

export function runSimulation(size: number, colors: string[]): SimulationState {
  const board = createBoard(size, colors);
  const startPlayer = Math.floor(Math.random() * colors.length);
  let state: SimulationState = {
    board,
    turn: 0,
    isFinished: false,
    currentPlayer: startPlayer,
    rngValue: 0,
  };
  while (!state.isFinished) {
    state = simulateTurn(state);
  }
  return state;
} 