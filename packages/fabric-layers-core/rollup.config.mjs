import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: "json" };

export default defineConfig([
  // UMD build
  {
    input: 'src/index.ts',
    output: {
      name: 'FabricLayers',
      file: pkg.unpkg,
      format: 'umd',
      sourcemap: true,
      globals: {
        'fabric-pure-browser': 'fabric',
        'eventemitter2': 'EventEmitter2'
      }
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          declaration: false,
        }
      }),
      resolve(),
      commonjs(),
      json(),
      terser()
    ],
    external: ['fabric-pure-browser', 'eventemitter2']
  },
  // CommonJS and ES Module builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          sourceMap: true,
        }
      }),
      resolve(),
      commonjs(),
      json()
    ],
    external: ['fabric-pure-browser', 'eventemitter2']
  }
]);
