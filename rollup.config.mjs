// Rollup configuration for fabric-layers library (ESM, Node 22+ compatible)
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import fs from 'node:fs';
const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const banner = `/* @preserve\n * fabric-layers ${pkg.version}, a fabric.js coordinate-plane (grid) & layers library. ${pkg.homepage}\n * (c) ${new Date().getFullYear()} ${pkg.author || 'fabric-layers contributors'}\n * License: ${pkg.license}\n */\n`;

const outputConfig = (format) => ({
  sourcemap: true,
  banner,
  format
});

const babelConfig = {
  babelHelpers: 'runtime',
  exclude: 'node_modules/**',
  plugins: ['@babel/plugin-transform-runtime'],
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      modules: false
    }]
  ]
};

const commonPlugins = [
  nodeResolve({
    browser: true,
    preferBuiltins: true
  }),
  commonjs(),
  json(),
  babel(babelConfig)
];

export default [
  // UMD build for browsers
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.unpkg.replace('.js', '.min.js'),
        format: 'umd',
        name: 'FabricLayers',
        ...outputConfig('umd'),
        sourcemap: false,
        plugins: [terser()]
      },
      {
        file: pkg.unpkg,
        format: 'umd',
        name: 'FabricLayers',
        ...outputConfig('umd')
      }
    ],
    plugins: commonPlugins,
    external: [/@babel\/runtime/]
  },

  // ESM build for modern bundlers
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'es',
      ...outputConfig('es')
    },
    plugins: commonPlugins,
    external: [/@babel\/runtime/]
  },

  // CommonJS build for Node.js/npm
  {
    input: 'src/index.js',
    output: {
      file: pkg.main,
      format: 'cjs',
      ...outputConfig('cjs')
    },
    plugins: commonPlugins,
    external: [/@babel\/runtime/]
  }
];