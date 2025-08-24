import React from 'react';

export interface DurationInputProps {
  /**
   * Duration in seconds. Always non-negative.
   */
  value: number;
  /**
   * Called when the duration changes.
   */
  onChange: (s: number) => void;
  /** Optional label displayed above the control. */
  label?: string;
}

/**
 * Duration picker allowing editing hours, minutes and seconds. Each
 * segment supports arrow keys and mouse wheel to increment/decrement.
 */
export function DurationInput({ value, onChange, label = 'Duration' }: DurationInputProps) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  const setParts = (h: number, m: number, s: number) => {
    const total = Math.max(0, h * 3600 + m * 60 + s);
    onChange(total);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label>{label}</label>
      <div style={{ display: 'flex', gap: 4 }}>
        <Segment
          label="h"
          value={hours}
          onChange={(n) => setParts(n, minutes, seconds)}
          onIncrement={() => setParts(hours + 1, minutes, seconds)}
          onDecrement={() => setParts(Math.max(0, hours - 1), minutes, seconds)}
        />
        <Segment
          label="m"
          value={minutes}
          onChange={(n) => setParts(hours, n, seconds)}
          onIncrement={() => setParts(hours, (minutes + 1) % 60, seconds)}
          onDecrement={() => setParts(hours, minutes > 0 ? minutes - 1 : 59, seconds)}
        />
        <Segment
          label="s"
          value={seconds}
          onChange={(n) => setParts(hours, minutes, n)}
          onIncrement={() => setParts(hours, minutes, (seconds + 1) % 60)}
          onDecrement={() => setParts(hours, minutes, seconds > 0 ? seconds - 1 : 59)}
        />
      </div>
    </div>
  );
}

function Segment({
  label,
  value,
  onChange,
  onIncrement,
  onDecrement,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button type="button" onClick={onIncrement} aria-label={`Increase ${label}`}>
        ▲
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') onIncrement();
          if (e.key === 'ArrowDown') onDecrement();
        }}
        onWheel={(e) => {
          e.preventDefault();
          if (e.deltaY < 0) onIncrement();
          else onDecrement();
        }}
        style={{ width: 50, textAlign: 'center' }}
      />
      <button type="button" onClick={onDecrement} aria-label={`Decrease ${label}`}>
        ▼
      </button>
    </div>
  );
}