import {defineConfig} from "vite";
import {fileURLToPath, URL} from "url";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig(async () => {
    return {
        plugins: [react()],

        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: fileURLToPath(new URL('./src', import.meta.url))
                }
            ]
        },

        // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
        // prevent vite from obscuring rust errors
        clearScreen: false,
        // Tauri expects a fixed port, fail if that port is not available
        server: {
            port: 3000,
            strictPort: true,
        },
        // to access the Tauri environment variables set by the CLI with information about the current target
        envPrefix: ['VITE_', 'TAURI_PLATFORM', 'TAURI_ARCH', 'TAURI_FAMILY', 'TAURI_PLATFORM_VERSION', 'TAURI_PLATFORM_TYPE', 'TAURI_DEBUG'],

        build: {
            // Tauri supports es2021
            target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
            // don't minify for debug builds
            minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
            // produce sourcemaps for debug builds
            sourcemap: !!process.env.TAURI_DEBUG,
        }
    }
});
