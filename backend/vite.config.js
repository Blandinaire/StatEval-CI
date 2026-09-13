import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx"],
            refresh: true,
        }),

        react(),
    ],

    server: {
        host: "0.0.0.0",

        port: 5173,

        strictPort: true,

        cors: {
            origin: [
                "http://192.168.100.6:8000",
                "http://localhost:8000",
                "http://127.0.0.1:8000",
            ],
        },

        hmr: {
            host: "192.168.100.6",
            port: 5173,
        },
    },
});