/**
 * Quantity types and conversion utilities.
 *
 * A `Quantity` couples a numeric value with a unit tag. You can convert
 * between compatible units using the `convert` function. Helper
 * functions provide rounding and simple formatting for display.
 */

export type Unit = 'm' | 'ft' | 'ms' | 'kmh' | 'mph' | 'kts';

export interface Quantity<U extends Unit = Unit> {
  /**
   * The numeric magnitude in the unit specified by `unit`.
   */
  value: number;
  /**
   * Unit identifier. The same as those used in the `Unit` union.
   */
  unit: U;
}

// canonical factors for each unit. These values convert a given
// quantity to its SI base unit. For length we use metres. For
// speed we use metres per second. Changing the canonical units
// requires adjusting downstream conversion factors.
const factors: Record<Unit, number> = {
  m: 1,
  ft: 0.3048,
  ms: 1,
  kmh: 1000 / 3600,
  mph: 1609.344 / 3600,
  kts: 1852 / 3600,
};

/**
 * Convert a quantity from one unit into another. Conversion happens via
 * the canonical unit for the dimension. Unsupported conversions will
 * throw at runtime.
 */
export function convert<U1 extends Unit, U2 extends Unit>(
  qty: Quantity<U1>,
  to: U2
): Quantity<U2> {
  const fromFactor = factors[qty.unit as Unit];
  const toFactor = factors[to];
  if (fromFactor === undefined || toFactor === undefined) {
    throw new Error(`Cannot convert from ${qty.unit} to ${to}`);
  }
  // convert to canonical value then to target
  const canonical = qty.value * fromFactor;
  return { value: canonical / toFactor, unit: to };
}

/**
 * Round a numeric value to the nearest step. Uses the number of
 * decimal places present in `step` to determine precision of rounding.
 */
export function roundToStep(v: number, step: number): number {
  const k = Math.round(v / step);
  const r = +(k * step).toFixed(decimals(step));
  return Number.isFinite(r) ? r : v;
}

/**
 * Count the number of decimal places in a decimal number. Used
 * internally by `roundToStep` for rounding precision.
 */
function decimals(n: number): number {
  const s = n.toString();
  if (!s.includes('.')) return 0;
  return s.split('.')[1].length;
}

// Simple formatters. These return short strings appropriate for
// display. They can be swapped out for `Intl` formatting later.
export const format = {
  length(q: Quantity<'m' | 'ft'>) {
    const v = q.value;
    return q.unit === 'ft' ? `${v.toFixed(0)} ft` : `${v.toFixed(0)} m`;
  },
  speed(q: Quantity<'ms' | 'kmh' | 'mph' | 'kts'>) {
    const unit = { ms: 'm/s', kmh: 'km/h', mph: 'mph', kts: 'kt' }[q.unit];
    return `${vtrim(vround(q.value))} ${unit}`;
  },
};

function vround(n: number) {
  return Math.round(n * 100) / 100;
}

function vtrim(n: number) {
  return Number.isInteger(n) ? n.toFixed(0) : n.toString();
}