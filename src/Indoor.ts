import fabric from 'fabric';

// Allow importing JSON files by using TypeScript type assertions
import pkg from '../package.json';
const { version, name } = pkg as { version: string; name: string };

console.log('fabricJS ', (fabric.version || (window as any).fabric.version));
console.log(`${name} v${version}`);

export { version };

// constants
export * from './core/index';

// geometry
export * from './geometry/index';

// map
export * from './map/index';

// layer
export * from './layer/index';

// Free Drawing Canvas
export * from './paint/index';
