import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main'
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload'
    }
  },
  renderer: {
    plugins: [react(), vue()],
    build: {
      outDir: 'out/render',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          react: resolve(__dirname, 'src/renderer/react-entry.html'),
          vue: resolve(__dirname, 'src/renderer/vue-entry.html')
        }
      }
    },
    resolve: {
      alias: {
        '@assets': resolve('src/renderer/assets')
      }
    },
    define: {
      global: 'globalThis',
      'process.env': {}
    },
    server: {
      fs: {
        strict: false
      }
    }
  }
})
