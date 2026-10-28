import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const entry = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    lib: {
      entry: { index: entry('./src/index.ts') },
      formats: ['es'],
    },
    rollupOptions: {
      // `themes` is only ever imported for its types, and its stylesheet is
      // the page's to load once, so neither belongs in this bundle.
      external: ['vue', /^themes(\/|$)/],
      output: { assetFileNames: 'style.css' },
    },
  },
})
