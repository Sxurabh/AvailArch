// vitest.config.ts — add the @ alias
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),   // ← THIS was missing
            hooks: path.resolve(__dirname, './src/hooks'),
            lib: path.resolve(__dirname, './src/lib'),
            components: path.resolve(__dirname, './src/components'),
            context: path.resolve(__dirname, './src/context'),
        },
    },
})
