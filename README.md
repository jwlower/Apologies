# Apologies

A web-based simulation parody of the board game *Sorry!*  
Guess which player will win. Get it wrong? The multiverse doubles.  
Get it right? It collapses... and grows a new dimension.

## Features

- Auto-simulating game logic
- 3D and 4D rendering of simulations (future)
- Exponential punishment for incorrect predictions
- Purely client-side — gamble with your CPU, not your soul

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/apologies.git
   cd apologies
   ```

2. Install dependencies and run the UI:
   ```bash
   cd apologies-ui
   npm install
   npm start
   ```
   This will start the development server at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `apologies-ui/` — React + TypeScript frontend for the Apologies idle game
- `README.md` — Project overview and instructions

## Roadmap

- **NxN Universes:** Expand from single simulations to 2x2, 4x4, 8x8, up to 256x256 universes running in parallel.
- **3D/4D Universes:** Visualize and simulate universes in 3D and 4D space for advanced gameplay and exponential complexity.
- **Modifiers:** Allow players to influence randomness and outcomes.
- **Persistence:** Save user progress, scores, and streaks.

## License

MIT

---

## 1. **Simulation Model Design**

- **Board:** Represented as a grid (2D array), but abstracted so it could be NxN, or even NxNxN (3D) later.
- **Pawn Position:** Store as an array of coordinates, e.g., `[x, y]` for 2D, `[x, y, z]` for 3D.
- **Movement:** Functions should work with coordinate arrays, not just x/y, so they generalize to more dimensions.
- **Game State:** Track pawns, board, current turn, winner, etc.

---

## 2. **Component Structure**

- **GameBoardView:** Renders a single 2D board and pawns.
- **UniverseGrid:** Renders multiple boards (universes) in a grid.
- **Simulation Engine:** Pure logic, no UI, can be reused for 3D/4D.

---

## 3. **Initial Implementation Steps**

1. **Set up the simulation engine** in `apologies-ui/src/engine/simulation.ts`:
    - Board class (NxN, default 8x8 or 16x16)
    - Pawn class (with color, position)
    - Game logic (random moves, win detection)
2. **Create a simple GameBoardView** in React to visualize the board and pawns.
3. **Wire up a single simulation to the UI.**
4. **Keep all coordinate logic as arrays** (e.g., `[x, y]`), so adding a third dimension later is easy.

---

## 4. **Example: Board and Pawn Data Structures**

```ts
// For 2D, but easily extensible to 3D/4D
type Coordinate = number[]; // [x, y] for 2D, [x, y, z] for 3D

interface Pawn {
  color: string;
  position: Coordinate;
  home: Coordinate;
  // ...other properties
}

interface Board {
  size: number; // NxN
  pawns: Pawn[];
  // ...other properties
}
```

---

## 5. **Next Step**

Would you like to:
- Start with the simulation engine (logic only)?
- Or, set up the React component for the board visualization first?

**Recommendation:** Start with the simulation engine, then hook it up to the UI.  
Let me know if you want to proceed this way, and I’ll scaffold the engine and a basic board model for you!
