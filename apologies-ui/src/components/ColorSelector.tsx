import React from 'react';

interface ColorSelectorProps {
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
  locked?: boolean;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ colors, selected, onSelect, locked }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: 'center' }}>
    {colors.map((color) => {
      const isSelected = selected === color;
      return (
        <button
          key={color}
          onClick={() => onSelect(color)}
          disabled={locked}
          style={{
            background: locked && !isSelected ? '#bbb' : color,
            border: isSelected ? '3px solid #222' : '2px solid #fff',
            borderRadius: '50%',
            width: 36,
            height: 36,
            cursor: locked ? 'not-allowed' : 'pointer',
            outline: 'none',
            boxShadow: isSelected ? '0 0 8px 2px #222' : undefined,
            position: 'relative',
            opacity: locked && !isSelected ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
          aria-label={`Select ${color}`}
        >
          {locked && !isSelected && (
            <span style={{ position: 'absolute', fontSize: 16, color: '#444' }}>🔒</span>
          )}
        </button>
      );
    })}
  </div>
); 