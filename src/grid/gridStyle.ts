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
    // Calculate step size for grid lines
    const step = (state as any).step = scale(coord.distance * coord.zoom, coord.steps);
    
    return range(
      Math.floor(state.offset / step) * step,
      Math.ceil((state.offset + state.range) / step + 1) * step,
      step
    );
  },

  lineColor: (state: GridState): (string | null)[] | undefined => {
    if (!state.lines) return undefined;
    const coord = state.coordinate;

    const light = alpha(coord.color, 0.1);
    const heavy = alpha(coord.color, 0.3);

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
    const step = scale(scale((state as any).step * 1.1, coord.steps) * 1.1, coord.steps);
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

    const step = scale(scale((state as any).step * 1.1, coord.steps) * 1.1, coord.steps);
    const eps = step / 100;

    return state.lines.map(v => {
      if (!isMultiple(v, step, eps)) return null;
      if (almost(v, 0, eps)) return coord.orientation === 'y' ? null : '0';
      const value = Number((v / 100).toFixed(2));
      return coord.format(value);
    });
  }
};

export default gridStyle;
