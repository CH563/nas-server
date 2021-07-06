import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    root: './src/www',
    base: './',
    plugins: [vue()],
    build: {
        emptyOutDir: true,
        outDir: '../../dist/www'
    }
});
