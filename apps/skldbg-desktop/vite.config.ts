import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const productionCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const developmentCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' http://127.0.0.1:5173 ws://127.0.0.1:5173",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

export default defineConfig(({ command }) => ({
  base: "./",
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "skldbg-csp",
      transformIndexHtml() {
        return [
          {
            tag: "meta",
            attrs: {
              "http-equiv": "Content-Security-Policy",
              content: command === "serve" ? developmentCsp : productionCsp,
            },
            injectTo: "head",
          },
        ];
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    strictPort: true,
    headers: {
      "Content-Security-Policy": developmentCsp,
    },
  },
  preview: {
    host: "127.0.0.1",
    strictPort: true,
    headers: {
      "Content-Security-Policy": productionCsp,
    },
  },
}));
