import {defineConfig} from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig(({mode}) => ({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src")
    }
  },
  define: {
    global: "globalThis",
    process: JSON.stringify({env: {NODE_ENV: mode}}),
    "process.env": JSON.stringify({
      NODE_ENV: mode
    })
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: false
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  },
  build: {
    chunkSizeWarningLimit: 5000
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts"
  }
}))
