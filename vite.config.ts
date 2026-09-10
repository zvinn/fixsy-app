import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        viteTsconfigPaths(),
        VitePWA({
            registerType: 'prompt',
            devOptions: {
                enabled: true
            },
            includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png', 'apple-touch-icon.png'],
            manifest: {
                short_name: "Fixsy",
                name: "Fixsy - منصة الصيانة المنزلية الذكية",
                description: "احجز فني صيانة محترف بضغطة زر. صيانة منزلية سريعة وموثوقة مع تتبع مباشر ودعم AI",
                categories: ["lifestyle", "utilities", "productivity"],
                dir: "rtl",
                lang: "ar",
                orientation: "portrait-primary",

                icons: [
                    {
                        src: "favicon.ico",
                        sizes: "32x32",
                        type: "image/x-icon"
                    },
                    {
                        src: "logo192.png",
                        type: "image/png",
                        sizes: "192x192",
                        purpose: "any maskable"
                    },
                    {
                        src: "logo512.png",
                        type: "image/png",
                        sizes: "512x512",
                        purpose: "any maskable"
                    },
                    {
                        src: "apple-touch-icon.png",
                        type: "image/png",
                        sizes: "180x180",
                        purpose: "apple touch icon"
                    }
                ],

                start_url: "/",
                scope: "/",
                display: "standalone",
                theme_color: "#0056D2",
                background_color: "#ffffff",

                prefer_related_applications: false
            },

            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            }
        })
    ],
    envPrefix: ['VITE_', 'REACT_APP_'],
    build: {
        outDir: 'build',
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React
                    'react-vendor': ['react', 'react-dom'],
                    // Firebase SDK
                    'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/messaging'],
                    // Charts library
                    'charts': ['recharts'],
                    // Maps library
                    'maps': ['leaflet', 'react-leaflet'],
                    // UI utilities
                    'ui-utils': ['lucide-react', 'react-hot-toast', 'gsap'],
                }
            }
        }
    },
    server: {
        open: true,
        port: 3000,
    },
});
