/**
 * Type definitions for mumath module
 */

// Use a simpler approach with default exports for the main functions
export function clamp(value: number, min?: number, max?: number): number;
export function almost(a: number, b: number, precision?: number): boolean;
export function len(x: number, y: number): number;
export function lerp(a: number, b: number, t: number): number;
export function mod(a: number, b: number): number;
export function round(value: number, precision?: number): number;
export function range(start: number, end: number, step?: number): number[];
export function order(value: number): number;
export function normalize(value: number, min: number, max: number): number;
export function lg(value: number): number;
export function isMultiple(value: number, multiple: number, precision?: number): boolean;
export function scale(minStep: number, srcSteps: number[]): number;
export function pad(value: string | number, length: number, char?: string): string;
export function parseUnit(value: string | number): [number, string];
export function toPx(value: string | number, base?: number): number;
export function isObj(value: any): boolean;