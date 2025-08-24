import React from 'react';
import Dial from './Dial';
import { Quantity, convert } from '@vizctrl/core';

type AltUnit = 'ft' | 'm';

export interface AltitudeControlProps {
  /**
   * Current altitude quantity. Value must correspond to the unit.
   */
  value: Quantity<AltUnit>;
  /**
   * Called when the altitude changes. The unit will match the current
   * `value.unit`.
   */
  onChange: (q: Quantity<AltUnit>) => void;
  /** Minimum allowable altitude in the current unit. Defaults to 0. */
  min?: Quantity<AltUnit>;
  /** Maximum allowable altitude in the current unit. Defaults to ~60k ft or ~18k m. */
  max?: Quantity<AltUnit>;
  /** Step increment, expressed in the current unit. */
  step?: number;
  /** Optional preset altitudes. Units need not match the current value. */
  presets?: Array<Quantity<AltUnit>>;
  /** Optional label shown above the dial. */
  label?: string;
}

/**
 * Altitude selection control built on top of the `Dial` primitive. Allows
 * switching between feet and metres, direct numeric entry and preset
 * buttons. Presets are converted into the current unit automatically.
 */
export function AltitudeControl({
  value,
  onChange,
  min,
  max,
  step,
  presets = [],
  label = 'Altitude',
}: AltitudeControlProps) {
  const u = value.unit;
  const toCurrent = (q: Quantity<AltUnit>) => (q.unit === u ? q : convert(q, u));

  const vmin = min ? toCurrent(min).value : 0;
  const vmax = max
    ? toCurrent(max).value
    : u === 'ft'
    ? 60000
    : 18288; // ~60k ft in metres
  const stp = step ?? (u === 'ft' ? 10 : 5);

  const formatValue = (v: number) => (u === 'ft' ? `${Math.round(v)} ft` : `${Math.round(v)} m`);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Dial
        label={label}
        value={value.value}
        onChange={(n) => onChange({ value: n, unit: u })}
        min={vmin}
        max={vmax}
        step={stp}
        ticks={{ every: u === 'ft' ? 500 : 100, majorEvery: u === 'ft' ? 2000 : 500 }}
        formatValue={formatValue}
      />
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <UnitToggle unit={u} onChange={(nu) => onChange(convert(value, nu))} />
        <NumberField
          ariaLabel={`${label} numeric`}
          value={Math.round(value.value)}
          onChange={(n) => onChange({ value: clamp(n, vmin, vmax), unit: u })}
          step={stp}
        />
      </div>
      {presets.length > 0 && (
        <div
          style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {presets.map((p, i) => {
            const pv = Math.round(toCurrent(p).value);
            return (
              <button key={i} type="button" onClick={() => onChange({ value: pv, unit: u })}>
                {formatValue(pv)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UnitToggle({ unit, onChange }: { unit: AltUnit; onChange: (u: AltUnit) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Altitude unit"
      style={{ display: 'inline-flex', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}
    >
      {(['ft', 'm'] as const).map((u) => (
        <button
          key={u}
          type="button"
          role="radio"
          aria-checked={unit === u}
          onClick={() => onChange(u)}
          style={{
            padding: '6px 10px',
            background: unit === u ? '#111' : 'white',
            color: unit === u ? 'white' : 'black',
            border: 'none',
          }}
        >
          {u}
        </button>
      ))}
    </div>
  );
}

function NumberField({ value, onChange, step, ariaLabel }: { value: number; onChange: (n: number) => void; step: number; ariaLabel?: string }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') onChange(value + step);
        if (e.key === 'ArrowDown') onChange(value - step);
      }}
      style={{ width: 100 }}
    />
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}