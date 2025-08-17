import React from 'react';
import Dial from './Dial';

export interface HeadingControlProps {
  /**
   * Current heading in degrees. Should be between 0 and 359 inclusive.
   */
  value: number;
  /**
   * Called when the heading changes. Provided value will be normalised
   * into the [0, 360) range.
   */
  onChange: (deg: number) => void;
  /** Step increment when using keyboard/wheel. */
  step?: number;
  /** Snap heading to cardinal points (N/E/S/W) when close. */
  snap?: boolean;
  /** Optional label displayed above the dial. */
  label?: string;
}

/**
 * Compass-style heading control. Builds upon the `Dial` primitive to
 * represent a 0–359 degree heading. Optionally snaps to cardinal
 * directions and offers quick-select buttons.
 */
export function HeadingControl({
  value,
  onChange,
  step = 1,
  snap = false,
  label = 'Heading',
}: HeadingControlProps) {
  const handleChange = (v: number) => {
    let deg = ((v % 360) + 360) % 360;
    if (snap) {
      const cardinals = [0, 90, 180, 270];
      const closest = cardinals.reduce((acc, cur) => (Math.abs(cur - deg) < Math.abs(acc - deg) ? cur : acc), cardinals[0]);
      if (Math.abs(closest - deg) < step) deg = closest;
    }
    onChange(deg);
  };

  const formatValue = (v: number) => `${Math.round(((v % 360) + 360) % 360)}°`;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Dial
        value={value}
        onChange={handleChange}
        min={0}
        max={359}
        step={step}
        startAngle={-Math.PI * 0.75}
        endAngle={Math.PI * 0.75}
        label={label}
        formatValue={formatValue}
        ticks={{ every: 10, majorEvery: 90 }}
      />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {['N', 'E', 'S', 'W'].map((d, i) => {
          const deg = i * 90;
          return (
            <button key={d} type="button" onClick={() => onChange(deg)}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}