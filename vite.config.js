import { defineConfig } from "vite";

// Configuration Vite — build statique optimisé pour la rapidité.
// - base relative : déployable à la racine comme dans un sous-dossier.
// - esbuild minifie le JS, lightningcss/esbuild minifie le CSS.
// - les assets (JS/CSS/polices) sont hashés → cache immuable long terme.
export default defineConfig({
  base: "./",
  build: {
    target: "es2020",
    cssMinify: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Isole les grosses libs dans un chunk vendor partagé et cacheable.
        manualChunks: {
          three: ["three"],
          motion: ["gsap", "gsap/ScrollTrigger", "lenis"],
        },
      },
    },
  },
});
