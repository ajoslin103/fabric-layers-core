import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const banner = `/* @preserve\n * fabric-layers-core ${pkg.version}, a fabric.js coordinate-plane (grid) & layers library. ${pkg.homepage}\n * (c) ${new Date().getFullYear()} ${pkg.author || 'fabric-layers-core contributors'}\n * License: ${pkg.license}\n */\n`;

// Shared configuration for all builds
const baseConfig = {
  // Using compiled JavaScript file as input
  input: 'dist/index.js',
  external: ['fabric', 'eventemitter2', 'fabric-pure-browser'],
  plugins: [
    nodeResolve({ 
      browser: true,
      extensions: ['.js']
    }),
    commonjs(),
    json()
  ]
};

export default [
  // UMD build
  {
    ...baseConfig,
    output: {
      name: 'FabricLayers',
      file: pkg.unpkg,
      format: 'umd',
      sourcemap: true,
      banner,
      globals: {
        'fabric': 'fabric',
        'fabric-pure-browser': 'fabric',
        'eventemitter2': 'EventEmitter2'
      }
    },
    plugins: [
      ...baseConfig.plugins,
      terser()
    ]
  },
  
  // CommonJS build
  {
    ...baseConfig,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      banner,
      exports: 'named'
    }
  },
  
  // ES Module build
  {
    ...baseConfig,
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      banner
    }
  }
];
