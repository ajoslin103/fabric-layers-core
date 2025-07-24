// (c) 2015 Mikola Lysenko. MIT License
// https://github.com/mikolalysenko/to-px

import parseUnit from './parse-unit';

const PIXELS_PER_INCH = 96;

interface UnitDefaults {
  [key: string]: number;
}

const defaults: UnitDefaults = {
  'ch': 8,
  'ex': 7.15625,
  'em': 16,
  'rem': 16,
  'in': PIXELS_PER_INCH,
  'cm': PIXELS_PER_INCH / 2.54,
  'mm': PIXELS_PER_INCH / 25.4,
  'pt': PIXELS_PER_INCH / 72,
  'pc': PIXELS_PER_INCH / 6,
  'px': 1
};

export default function toPX(str: string | number | null | undefined): number | null {
  if (!str) return null;

  if (typeof str === 'string' && defaults[str]) return defaults[str];

  // detect number of units
  const parts = parseUnit(str, [0, '']);
  if (!isNaN(parts[0]) && parts[1]) {
    const px = toPX(parts[1]);
    return typeof px === 'number' ? parts[0] * px : null;
  }

  return null;
}
