import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/trivia': 'http://localhost:3000'
        }
    }
});
