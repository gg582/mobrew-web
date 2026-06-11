import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
            { name: 'brew-log', test: /\/src\/features\/brewLog\// },
            { name: 'inventory', test: /\/src\/features\/inventory\// },
            { name: 'timer', test: /\/src\/features\/timer\// },
            { name: 'presets', test: /\/src\/features\/presets\// },
            { name: 'trophy', test: /\/src\/features\/trophy\// },
            { name: 'curve', test: /\/src\/features\/curve\// },
            { name: 'community', test: /\/src\/features\/community\// },
            { name: 'auth', test: /\/src\/features\/auth\// },
            { name: 'services-export', test: /\/src\/services\/exportService/ },
            { name: 'services-badge', test: /\/src\/services\/badgeEngine/ },
            { name: 'services-calc', test: /\/src\/services\/calculationMachine/ },
            { name: 'services-recipe', test: /\/src\/services\/recipeHash/ },
            { name: 'services-curve', test: /\/src\/services\/curvePlayback/ },
            { name: 'pdf-lib', test: /jspdf/ },
          ],
        },
      },
    },
  },
})
