import React from 'react';

interface ScoreAreaProps {
  score: number;
  streak: number;
}

export const ScoreArea: React.FC<ScoreAreaProps> = ({ score, streak }) => (
  <div style={{
    background: '#222',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 180,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    boxShadow: '0 2px 8px #0002',
  }}>
    <div>Score: {score}</div>
    <div>Streak: {streak}</div>
  </div>
); 