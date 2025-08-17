import React, { useCallback, useEffect, useId, useMemo, useRef } from 'react';

/**
 * A radial dial control. Displays a circular track with a draggable
 * thumb and optional tick marks. It is fully accessible via keyboard
 * and screen readers, exposing ARIA slider semantics. Consumers
 * provide a numeric `value` along with `onChange` handler and range
 * constraints. Optional formatting functions customise the textual
 * value readout.
 */
export type DialProps = {
  /** Current numeric value represented by the dial. */
  value: number;
  /** Callback when a new value is selected via drag, wheel or keyboard. */
  onChange: (next: number) => void;
  /** Minimum allowed value. Default 0. */
  min?: number;
  /** Maximum allowed value. Default 100. */
  max?: number;
  /** Step increment when using arrow keys or wheel. Default 1. */
  step?: number;
  /** Diameter of the dial in pixels. Default 160. */
  size?: number;
  /** Start angle (radians) of the track. Default -3/4π. */
  startAngle?: number;
  /** End angle (radians) of the track. Default 3/4π. */
  endAngle?: number;
  /** Visual label rendered above the dial. */
  label?: string;
  /** ARIA label if no visual label is supplied. */
  ariaLabel?: string;
  /** Function to convert the numeric value into a display string. */
  formatValue?: (v: number) => string;
  /** Tick configuration. Draws tick marks every `every` units and major ticks every `majorEvery` units. */
  ticks?: { every: number; majorEvery?: number };
  /** Disable interactions. */
  disabled?: boolean;
};

export default function Dial({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  size = 160,
  startAngle = -Math.PI * 0.75,
  endAngle = Math.PI * 0.75,
  label,
  ariaLabel,
  formatValue = (v) => String(v),
  ticks,
  disabled,
}: DialProps) {
  // internal state for drag operations
  const id = useId();
  const radius = size / 2;
  const stroke = 10;
  const center = { x: radius, y: radius };
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const range = max - min;

  const angleFromValue = useCallback(
    (v: number) => {
      const t = (v - min) / range;
      return startAngle + t * (endAngle - startAngle);
    },
    [min, range, startAngle, endAngle]
  );

  const valueFromAngle = useCallback(
    (ang: number) => {
      let t = (ang - startAngle) / (endAngle - startAngle);
      t = Math.min(1, Math.max(0, t));
      const raw = min + t * range;
      return clamp(round(raw, step));
    },
    [startAngle, endAngle, min, range, step, clamp]
  );

  const round = (v: number, s: number) => {
    const k = Math.round(v / s) * s;
    const d = (s.toString().split('.')[1] || '').length;
    return +k.toFixed(d);
  };

  const angle = angleFromValue(value);

  const polar = (c: { x: number; y: number }, r: number, ang: number) => ({
    x: c.x + r * Math.cos(ang),
    y: c.y + r * Math.sin(ang),
  });

  const describeArc = (from: number, to: number) => {
    const largeArc = to - from > Math.PI ? 1 : 0;
    const a = polar(center, radius - stroke / 2, from);
    const b = polar(center, radius - stroke / 2, to);
    return `M ${a.x} ${a.y} A ${radius - stroke / 2} ${radius - stroke / 2} 0 ${largeArc} 1 ${b.x} ${b.y}`;
  };

  // pointer handling
  const ref = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  const setFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!ref.current) return;
      const box = ref.current.getBoundingClientRect();
      const x = clientX - (box.left + box.width / 2);
      const y = clientY - (box.top + box.height / 2);
      const ang = Math.atan2(y, x);
      onChange(valueFromAngle(ang));
    },
    [onChange, valueFromAngle]
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      setFromPointer(e.clientX, e.clientY);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [setFromPointer]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    dragging.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setFromPointer(e.clientX, e.clientY);
  };

  // keyboard handling
  const coarse = Math.max(step * 10, step);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let next = value;
    const delta = e.shiftKey ? coarse : step;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = clamp(value + delta);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = clamp(value - delta);
        break;
      case 'PageUp':
        next = clamp(value + coarse);
        break;
      case 'PageDown':
        next = clamp(value - coarse);
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    onChange(next);
  };

  // tick generation
  const tickEls = useMemo(() => {
    if (!ticks) return null;
    const { every, majorEvery = every * 5 } = ticks;
    const els: JSX.Element[] = [];
    for (let v = min; v <= max + 1e-9; v += every) {
      const a = angleFromValue(v);
      const inner = radius - stroke - 6;
      const outer = inner + (v % majorEvery === 0 ? 12 : 6);
      const p1 = polar(center, inner, a);
      const p2 = polar(center, outer, a);
      els.push(
        <line
          key={v}
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke="currentColor"
          strokeWidth={1}
          opacity={0.6}
        />
      );
    }
    return els;
  }, [ticks, min, max, radius, stroke, angleFromValue]);

  const valText = formatValue(value);

  return (
    <div
      className="vizctrl-dial"
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {label && <label htmlFor={id} style={{ marginBottom: 8 }}>{label}</label>}
      <svg
        ref={ref}
        id={id}
        width={size}
        height={size}
        role="slider"
        aria-label={ariaLabel || label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valText}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        style={{ touchAction: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {/* track */}
        <path
          d={describeArc(startAngle, endAngle)}
          stroke="#ddd"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        {/* filled arc */}
        <path
          d={describeArc(startAngle, angle)}
          stroke="#555"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        {/* ticks */}
        {tickEls}
        {/* thumb */}
        {(() => {
          const p = polar(center, radius - stroke / 2, angle);
          return <circle cx={p.x} cy={p.y} r={stroke / 2 + 2} fill="#111" />;
        })()}
        {/* value readout */}
        <text
          x={center.x}
          y={center.y + 6}
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontSize="16"
        >
          {valText}
        </text>
      </svg>
    </div>
  );
}