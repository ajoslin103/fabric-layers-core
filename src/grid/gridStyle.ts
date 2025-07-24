import alpha from '../lib/color-alpha';
import {
  range, almost, scale, isMultiple, lg
} from '../lib/mumath/index';
import { GridState } from './Grid';

export interface GridStyleConfig {
  steps: number[];
  distance: number;
  unit: number;
  lines: (state: GridState) => number[];
  lineColor: (state: GridState) => (string | null)[] | undefined;
  ticks: (state: GridState) => (number | null)[] | undefined;
  labels: (state: GridState) => (string | null)[] | undefined;
}

const gridStyle: GridStyleConfig = {
  steps: [1, 2, 5],
  distance: 20,
  unit: 10,

  lines: (state: GridState): number[] => {
    const coord = state.coordinate;
    // Use default values for potentially undefined properties
    const distance = coord.distance ?? 20;
    const steps = coord.steps ?? [1, 2, 5];
    // Calculate step size for grid lines
    const step = (state as any).step = scale(distance * coord.zoom, steps);
    
    return range(
      Math.floor(state.offset / step) * step,
      Math.ceil((state.offset + state.range) / step + 1) * step,
      step
    );
  },

  lineColor: (state: GridState): (string | null)[] | undefined => {
    if (!state.lines) return undefined;
    const coord = state.coordinate;

    // Use default color value if undefined
    const defaultColor = '#000000';
    const color = typeof coord.color === 'string' ? coord.color : defaultColor;
    
    const light = alpha(color, 0.1);
    const heavy = alpha(color, 0.3);

    const step = (state as any).step as number;
    const power = Math.ceil(lg(step));
    const tenStep = 10 ** power;
    const nextStep = 10 ** (power + 1);
    const eps = step / 10;

    return state.lines.map(v => {
      if (isMultiple(v, nextStep, eps)) return heavy;
      if (isMultiple(v, tenStep, eps)) return light;
      return null;
    });
  },

  ticks: (state: GridState): (number | null)[] | undefined => {
    if (!state.lines) return undefined;
    const coord = state.coordinate;
    // Use default values for potentially undefined properties
    const steps = coord.steps ?? [1, 2, 5];
    // Use null coalescing for step calculation
    const baseStep = (state as any).step ?? 1;
    const step = scale(scale(baseStep * 1.1, steps) * 1.1, steps);
    const eps = step / 10;
    const tickWidth = state.axisWidth * 4;

    return state.lines.map(v => {
      if (!isMultiple(v, step, eps)) return null;
      if (almost(v, 0, eps)) return null;
      return tickWidth;
    });
  },

  labels: (state: GridState): (string | null)[] | undefined => {
    if (!state.lines) return undefined;
    const coord = state.coordinate;

    // Use default values for potentially undefined properties
    const steps = coord.steps ?? [1, 2, 5];
    // Use null coalescing for step calculation
    const baseStep = (state as any).step ?? 1;
    const step = scale(scale(baseStep * 1.1, steps) * 1.1, steps);
    const eps = step / 100;

    return state.lines.map(v => {
      if (!isMultiple(v, step, eps)) return null;
      if (almost(v, 0, eps)) return coord.orientation === 'y' ? null : '0';
      const value = Number((v / 100).toFixed(2));
      // Format the value using a default formatter if none exists on coordinate
      const formatter = (coord as any).format ?? ((val: number) => val.toString());
      return formatter(value);
    });
  }
};

export default gridStyle;
