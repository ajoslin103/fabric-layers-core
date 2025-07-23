// src/lib/mumath/index.d.ts
declare module '../lib/mumath/index' {
	export function clamp(value: number, min?: number, max?: number): number;
	export function almost(a: number, b: number, precision?: number): boolean;
	export function len(x: number, y: number): number;
	export function parseUnit(value: string | number): [number, string];
	export function toPx(value: string | number): number;
	export function isObj(value: any): boolean;
	// Add other exports as needed
}