import React from 'react';
import Dial from './Dial';
import { Quantity, convert } from '@vizctrl/core/quantity';

type SpeedUnit = 'ms' | 'kmh' | 'mph' | 'kts';

export interface SpeedControlProps {
  /**
   * Current speed quantity. The numeric value corresponds to the unit.
   */
  value: Quantity<SpeedUnit>;
  /**
   * Called when the speed changes. The unit will match the current
   * `value.unit`.
   */
  onChange: (q: Quantity<SpeedUnit>) => void;
  /** Minimum allowed speed. Defaults to 0. */
  min?: Quantity<SpeedUnit>;
  /** Maximum allowed speed. Defaults depend on unit. */
  max?: Quantity<SpeedUnit>;
  /** Step increment. Defaults depend on unit. */
  step?: number;
  /** Optional presets. Units need not match current. */
  presets?: Array<Quantity<SpeedUnit>>;
  /** Optional label. */
  label?: string;
}

/**
 * Speed selection control. Presents a radial dial with unit switching,
 * numeric entry and presets. Supports metres/second, kilometres/hour,
 * miles/hour and knots.
 */
export function SpeedControl({
  value,
  onChange,
  min,
  max,
  step,
  presets = [],
  label = 'Speed',
}: SpeedControlProps) {
  const unit = value.unit;
  const toCurrent = (q: Quantity<SpeedUnit>) => (q.unit === unit ? q : convert(q, unit));
  const vmin = min ? toCurrent(min).value : 0;
  const vmax = max
    ? toCurrent(max).value
    : unit === 'ms'
    ? 100
    : unit === 'kmh'
    ? 200
    : unit === 'mph'
    ? 125
    : 100; // default maxima per unit
  const stp = step ?? (unit === 'ms' ? 0.5 : unit === 'kmh' ? 5 : unit === 'mph' ? 5 : 5);

  const formatValue = (v: number) => {
    const label = unit === 'ms' ? 'm/s' : unit === 'kmh' ? 'km/h' : unit === 'mph' ? 'mph' : 'kt';
    return `${Math.round(v)} ${label}`;
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Dial
        label={label}
        value={value.value}
        onChange={(n) => onChange({ value: n, unit })}
        min={vmin}
        max={vmax}
        step={stp}
        ticks={{ every: stp * 10, majorEvery: stp * 50 }}
        formatValue={formatValue}
      />
      <div
        style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
      >
        <UnitToggle unit={unit} onChange={(u) => onChange(convert(value, u))} />
        <NumberField
          ariaLabel={`${label} numeric`}
          value={Math.round(value.value)}
          onChange={(n) => onChange({ value: clamp(n, vmin, vmax), unit })}
          step={stp}
        />
      </div>
      {presets.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {presets.map((p, i) => {
            const pv = Math.round(toCurrent(p).value);
            return (
              <button key={i} type="button" onClick={() => onChange({ value: pv, unit })}>
                {formatValue(pv)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UnitToggle({ unit, onChange }: { unit: SpeedUnit; onChange: (u: SpeedUnit) => void }) {
  const units: SpeedUnit[] = ['ms', 'kmh', 'mph', 'kts'];
  const labels: Record<SpeedUnit, string> = { ms: 'm/s', kmh: 'km/h', mph: 'mph', kts: 'kt' };
  return (
    <div
      role="radiogroup"
      aria-label="Speed unit"
      style={{ display: 'inline-flex', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}
    >
      {units.map((u) => (
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
          {labels[u]}
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