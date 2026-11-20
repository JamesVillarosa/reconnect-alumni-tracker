import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

// https://vite.dev/config/
// local HTTPS certs are optional (they are not committed); BASE_PATH lets static hosts serve from a subpath
const key = path.resolve(__dirname, "localhost+2-key.pem");
const cert = path.resolve(__dirname, "localhost+2.pem");
const https = fs.existsSync(key) && fs.existsSync(cert) ? { key: fs.readFileSync(key), cert: fs.readFileSync(cert) } : undefined;

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  server: {
    https,
    port: 5173,
  },
  plugins: [react(), tailwindcss()],
});
